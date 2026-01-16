// Create a new SQLite database with Bible versions
const fs = require('fs');
const path = require('path');
const sqlite3 = require('better-sqlite3');

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

// Copy version-specific tables
console.log('\nCopying version-specific tables...');
const versionsToCopy = [
  { id: 'kjv', name: 'King James Version', table: 't_king_james_bible' },
  { id: 'asv', name: 'American Standard Version', table: 't_american_standard_version' },
  { id: 'erv', name: 'English Revised Version', table: 't_english_revised_version' },
  { id: 'web', name: 'World English Bible', table: 't_world_english_bible' }
];

for (const version of versionsToCopy) {
  console.log(`\nProcessing ${version.name} (${version.id})...`);
  copyTable(sourceDb, targetDb, version.table);
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

// Insert our translations
const insertTranslation = targetDb.prepare(
  'INSERT INTO Translation (id, name, table_name, abbreviation) VALUES (?, ?, ?, ?)'
);

for (const t of translations) {
  insertTranslation.run(t.id, t.name, t.table, t.id);
  console.log(`  Added translation: ${t.name} (${t.id}) -> ${t.table}`);
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
