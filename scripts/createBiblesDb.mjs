// Create a new SQLite database with Bible versions
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'better-sqlite3';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const projectRoot = __dirname;
const sourceDbPath = path.join(projectRoot, '../Bible api/bible.eng.db');
const targetDbPath = path.join(projectRoot, '../Bible api/Bibles.db');

// Check if source database exists
if (!fs.existsSync(sourceDbPath)) {
  console.error(`Source database not found at: ${sourceDbPath}`);
  process.exit(1);
}

// Remove target database if it exists
if (fs.existsSync(targetDbPath)) {
  console.log(`Removing existing database at: ${targetDbPath}`);
  fs.unlinkSync(targetDbPath);
}

console.log('Creating new database...');
const targetDb = sqlite3(targetDbPath);
const sourceDb = sqlite3(sourceDbPath, { readonly: true });

targetDb.pragma('journal_mode = WAL');

// Function to copy table structure and data
function copyTable(source, target, tableName) {
  console.log(`Copying table: ${tableName}`);
  
  // Get table structure
  const createTableSql = source
    .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`)
    .get(tableName)?.sql;
    
  if (!createTableSql) {
    console.warn(`Table ${tableName} not found in source database`);
    return;
  }
  
  // Create the table in the target database
  target.exec(createTableSql);
  
  // Skip data copy for empty tables we're creating
  if (!['t_new_international_version', 't_new_american_standard_bible'].includes(tableName)) {
    const count = source.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
    console.log(`  Copying ${count} rows`);
    
    // Use a transaction for better performance
    target.transaction(() => {
      const insert = target.prepare(`INSERT INTO ${tableName} SELECT * FROM main.${tableName}`);
      insert.run();
    })();
  }
}

// Function to create an empty table like another
function createEmptyTableLike(source, target, sourceTable, targetTable) {
  console.log(`Creating empty table: ${targetTable} (based on ${sourceTable})`);
  
  // Get source table structure
  const createTableSql = source
    .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`)
    .get(sourceTable)?.sql;
    
  if (!createTableSql) {
    console.warn(`Source table ${sourceTable} not found`);
    return;
  }
  
  // Replace the table name in the CREATE TABLE statement
  const newCreateTableSql = createTableSql.replace(
    new RegExp(`\\b${sourceTable}\\b`, 'g'),
    targetTable
  );
  
  // Create the empty table in the target database
  target.exec(newCreateTableSql);
}

// List of tables to copy directly
const commonTables = [
  'key_english',
  'Chapter',
  'ChapterAudioUrl',
  'ChapterFootnote',
  'ChapterVerse',
  'Commentary',
  'CommentaryBook',
  'CommentaryChapter',
  'CommentaryChapterVerse',
  'Dataset',
  'DatasetBook',
  'DatasetChapter',
  'DatasetChapterVerse',
  'DatasetReference',
  'Translation'
];

// Copy common tables
console.log('\nCopying common tables...');
for (const table of commonTables) {
  copyTable(sourceDb, targetDb, table);
}

// Function to verify verse count for a version
function verifyVerseCount(db, tableName, versionName) {
  try {
    // Get the total verse count
    const verseCount = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
    
    // Get the book and chapter distribution
    const bookChapterStats = db.prepare(`
      SELECT book, COUNT(DISTINCT chapter) as chapters, COUNT(*) as verses 
      FROM ${tableName} 
      GROUP BY book
      ORDER BY book
    `).all();
    
    // Get the total number of books and chapters
    const bookCount = bookChapterStats.length;
    const chapterCount = bookChapterStats.reduce((sum, book) => sum + book.chapters, 0);
    
    console.log(`  ${versionName}:`);
    console.log(`    Books: ${bookCount}, Chapters: ${chapterCount}, Verses: ${verseCount}`);
    
    // Log any potential issues
    if (bookCount < 66) {
      console.warn(`    WARNING: Only ${bookCount} books found (expected 66)`);
    }
    
    if (verseCount < 31000) {  // Roughly the number of verses in most Bibles
      console.warn(`    WARNING: Only ${verseCount} verses found (expected ~31,000+)`);
    }
    
    return { books: bookCount, chapters: chapterCount, verses: verseCount };
  } catch (error) {
    console.error(`  Error verifying ${versionName}:`, error.message);
    return { books: 0, chapters: 0, verses: 0 };
  }
}

// Copy version-specific tables and verify data
console.log('\nCopying and verifying version-specific tables...');
const versionsToCopy = [
  { id: 'kjv', name: 'King James Version', table: 't_king_james_bible' },
  { id: 'asv', name: 'American Standard Version', table: 't_american_standard_version' },
  { id: 'erv', name: 'English Revised Version', table: 't_english_revised_version' },
  { id: 'web', name: 'World English Bible', table: 't_world_english_bible' }
];

// Track verification results
const verificationResults = {};

// Copy and verify each version
for (const version of versionsToCopy) {
  console.log(`\nProcessing ${version.name} (${version.id})...`);
  
  // Copy the table
  copyTable(sourceDb, targetDb, version.table);
  
  // Verify the data was copied correctly
  console.log(`Verifying ${version.name} data...`);
  const sourceStats = verifyVerseCount(sourceDb, version.table, 'Source DB');
  const targetStats = verifyVerseCount(targetDb, version.table, 'Target DB');
  
  // Compare source and target
  if (sourceStats.verses !== targetStats.verses) {
    console.warn(`  WARNING: Verse count mismatch for ${version.name}:`);
    console.warn(`    Source: ${sourceStats.verses} verses`);
    console.warn(`    Target: ${targetStats.verses} verses`);
  }
  
  verificationResults[version.id] = {
    source: sourceStats,
    target: targetStats,
    verified: sourceStats.verses === targetStats.verses && sourceStats.verses > 0
  };
}

// Create empty tables for NIV and NASB
console.log('\nCreating empty tables for future versions...');
createEmptyTableLike(
  sourceDb, 
  targetDb, 
  't_king_james_bible', 
  't_new_international_version'
);

createEmptyTableLike(
  sourceDb, 
  targetDb, 
  't_king_james_bible', 
  't_new_american_standard_bible'
);

// Update the Translation table with our versions
console.log('\nUpdating Translation table...');

// First, check the structure of the Translation table
let translationColumns = [];
try {
  const tableInfo = targetDb.prepare("PRAGMA table_info(Translation)").all();
  translationColumns = tableInfo.map(col => col.name);
  console.log('Translation table columns:', translationColumns.join(', '));
} catch (error) {
  console.error('Error getting Translation table info:', error.message);
}

const translations = [
  { id: 'KJV', name: 'King James Version', table: 't_king_james_bible' },
  { id: 'ASV', name: 'American Standard Version', table: 't_american_standard_version' },
  { id: 'ERV', name: 'English Revised Version', table: 't_english_revised_version' },
  { id: 'WEB', name: 'World English Bible', table: 't_world_english_bible' },
  { id: 'NIV', name: 'New International Version', table: 't_new_international_version' },
  { id: 'NASB', name: 'New American Standard Bible 1995', table: 't_new_american_standard_bible' }
];

// Clear existing translations
targetDb.prepare('DELETE FROM Translation').run();

// Function to safely insert a translation
function insertTranslation(translation) {
  const columns = ['id', 'name'];
  const placeholders = ['?', '?'];
  const values = [translation.id, translation.name];
  
  // Add other columns that exist in the table
  const otherColumns = [
    'website', 'licenseUrl', 'shortName', 'englishName', 
    'language', 'textDirection', 'sha256', 'licenseNotes'
  ];
  
  for (const col of otherColumns) {
    if (translationColumns.includes(col)) {
      columns.push(col);
      placeholders.push('?');
      // Add default values for required columns
      switch(col) {
        case 'language':
          values.push('en');
          break;
        case 'textDirection':
          values.push('ltr');
          break;
        case 'shortName':
          values.push(translation.id);
          break;
        case 'englishName':
          values.push(translation.name);
          break;
        default:
          values.push('');
      }
    }
  }
  
  // Add the table name if the column exists
  if (translationColumns.includes('table_name')) {
    columns.push('table_name');
    placeholders.push('?');
    values.push(translation.table);
  }
  
  const sql = `INSERT INTO Translation (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
  
  try {
    targetDb.prepare(sql).run(...values);
    console.log(`  Added translation: ${translation.name} (${translation.id})`);
    if (translationColumns.includes('table_name')) {
      console.log(`    Table: ${translation.table}`);
    }
  } catch (error) {
    console.error(`Error inserting ${translation.id}:`, error.message);
    console.error('SQL:', sql);
    console.error('Values:', values);
    throw error;
  }
}

// Insert all translations
console.log('Inserting translations...');
for (const t of translations) {
  insertTranslation(t);
}

// Create indexes for better performance
console.log('\nCreating indexes...');
targetDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_verse_book_chapter_verse ON t_king_james_bible(book, chapter, verse);
  CREATE INDEX IF NOT EXISTS idx_verse_book_chapter_verse ON t_american_standard_version(book, chapter, verse);
  CREATE INDEX IF NOT EXISTS idx_verse_book_chapter_verse ON t_english_revised_version(book, chapter, verse);
  CREATE INDEX IF NOT EXISTS idx_verse_book_chapter_verse ON t_world_english_bible(book, chapter, verse);
  CREATE INDEX IF NOT EXISTS idx_verse_book_chapter_verse ON t_new_international_version(book, chapter, verse);
  CREATE INDEX IF NOT EXISTS idx_verse_book_chapter_verse ON t_new_american_standard_bible(book, chapter, verse);
`);

// Clean up
sourceDb.close();
targetDb.close();

console.log('\nDatabase creation complete!');
console.log(`New database created at: ${targetDbPath}`);
console.log('Versions included:');
console.log('  - King James Version (KJV) - Copied with data');
console.log('  - American Standard Version (ASV) - Copied with data');
console.log('  - English Revised Version (ERV) - Copied with data');
console.log('  - World English Bible (WEB) - Copied with data');
console.log('  - New International Version (NIV) - Empty table created');
console.log('  - New American Standard Bible 1995 (NASB) - Empty table created');
