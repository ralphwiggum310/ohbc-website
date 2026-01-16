import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard 66 books of the Bible with their names, abbreviations, and chapter counts
const BIBLE_BOOKS = [
  { id: 1, name: 'Genesis', abbreviation: 'gen', chapters: 50 },
  { id: 2, name: 'Exodus', abbreviation: 'exo', chapters: 40 },
  { id: 3, name: 'Leviticus', abbreviation: 'lev', chapters: 27 },
  { id: 4, name: 'Numbers', abbreviation: 'num', chapters: 36 },
  { id: 5, name: 'Deuteronomy', abbreviation: 'deu', chapters: 34 },
  { id: 6, name: 'Joshua', abbreviation: 'jos', chapters: 24 },
  { id: 7, name: 'Judges', abbreviation: 'jdg', chapters: 21 },
  { id: 8, name: 'Ruth', abbreviation: 'rut', chapters: 4 },
  { id: 9, name: '1 Samuel', abbreviation: '1sa', chapters: 31 },
  { id: 10, name: '2 Samuel', abbreviation: '2sa', chapters: 24 },
  { id: 11, name: '1 Kings', abbreviation: '1ki', chapters: 22 },
  { id: 12, name: '2 Kings', abbreviation: '2ki', chapters: 25 },
  { id: 13, name: '1 Chronicles', abbreviation: '1ch', chapters: 29 },
  { id: 14, name: '2 Chronicles', abbreviation: '2ch', chapters: 36 },
  { id: 15, name: 'Ezra', abbreviation: 'ezr', chapters: 10 },
  { id: 16, name: 'Nehemiah', abbreviation: 'neh', chapters: 13 },
  { id: 17, name: 'Esther', abbreviation: 'est', chapters: 10 },
  { id: 18, name: 'Job', abbreviation: 'job', chapters: 42 },
  { id: 19, name: 'Psalms', abbreviation: 'psa', chapters: 150 },
  { id: 20, name: 'Proverbs', abbreviation: 'pro', chapters: 31 },
  { id: 21, name: 'Ecclesiastes', abbreviation: 'ecc', chapters: 12 },
  { id: 22, name: 'Song of Solomon', abbreviation: 'sng', chapters: 8 },
  { id: 23, name: 'Isaiah', abbreviation: 'isa', chapters: 66 },
  { id: 24, name: 'Jeremiah', abbreviation: 'jer', chapters: 52 },
  { id: 25, name: 'Lamentations', abbreviation: 'lam', chapters: 5 },
  { id: 26, name: 'Ezekiel', abbreviation: 'ezk', chapters: 48 },
  { id: 27, name: 'Daniel', abbreviation: 'dan', chapters: 12 },
  { id: 28, name: 'Hosea', abbreviation: 'hos', chapters: 14 },
  { id: 29, name: 'Joel', abbreviation: 'jol', chapters: 3 },
  { id: 30, name: 'Amos', abbreviation: 'amo', chapters: 9 },
  { id: 31, name: 'Obadiah', abbreviation: 'oba', chapters: 1 },
  { id: 32, name: 'Jonah', abbreviation: 'jon', chapters: 4 },
  { id: 33, name: 'Micah', abbreviation: 'mic', chapters: 7 },
  { id: 34, name: 'Nahum', abbreviation: 'nam', chapters: 3 },
  { id: 35, name: 'Habakkuk', abbreviation: 'hab', chapters: 3 },
  { id: 36, name: 'Zephaniah', abbreviation: 'zep', chapters: 3 },
  { id: 37, name: 'Haggai', abbreviation: 'hag', chapters: 2 },
  { id: 38, name: 'Zechariah', abbreviation: 'zec', chapters: 14 },
  { id: 39, name: 'Malachi', abbreviation: 'mal', chapters: 4 },
  { id: 40, name: 'Matthew', abbreviation: 'mat', chapters: 28 },
  { id: 41, name: 'Mark', abbreviation: 'mrk', chapters: 16 },
  { id: 42, name: 'Luke', abbreviation: 'luk', chapters: 24 },
  { id: 43, name: 'John', abbreviation: 'jhn', chapters: 21 },
  { id: 44, name: 'Acts', abbreviation: 'act', chapters: 28 },
  { id: 45, name: 'Romans', abbreviation: 'rom', chapters: 16 },
  { id: 46, name: '1 Corinthians', abbreviation: '1co', chapters: 16 },
  { id: 47, name: '2 Corinthians', abbreviation: '2co', chapters: 13 },
  { id: 48, name: 'Galatians', abbreviation: 'gal', chapters: 6 },
  { id: 49, name: 'Ephesians', abbreviation: 'eph', chapters: 6 },
  { id: 50, name: 'Philippians', abbreviation: 'php', chapters: 4 },
  { id: 51, name: 'Colossians', abbreviation: 'col', chapters: 4 },
  { id: 52, name: '1 Thessalonians', abbreviation: '1th', chapters: 5 },
  { id: 53, name: '2 Thessalonians', abbreviation: '2th', chapters: 3 },
  { id: 54, name: '1 Timothy', abbreviation: '1ti', chapters: 6 },
  { id: 55, name: '2 Timothy', abbreviation: '2ti', chapters: 4 },
  { id: 56, name: 'Titus', abbreviation: 'tit', chapters: 3 },
  { id: 57, name: 'Philemon', abbreviation: 'phm', chapters: 1 },
  { id: 58, name: 'Hebrews', abbreviation: 'heb', chapters: 13 },
  { id: 59, name: 'James', abbreviation: 'jas', chapters: 5 },
  { id: 60, name: '1 Peter', abbreviation: '1pe', chapters: 5 },
  { id: 61, name: '2 Peter', abbreviation: '2pe', chapters: 3 },
  { id: 62, name: '1 John', abbreviation: '1jn', chapters: 5 },
  { id: 63, name: '2 John', abbreviation: '2jn', chapters: 1 },
  { id: 64, name: '3 John', abbreviation: '3jn', chapters: 1 },
  { id: 65, name: 'Jude', abbreviation: 'jud', chapters: 1 },
  { id: 66, name: 'Revelation', abbreviation: 'rev', chapters: 22 }
];

async function fixBibleDatabase() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
  console.log(`Fixing Bible database at: ${dbPath}`);
  
  // Open the database in read-write mode
  const db = sqlite3(dbPath);
  
  try {
    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');
    
    // Begin a transaction
    const transaction = db.transaction(() => {
      // 1. Check if key_english table exists and has the correct schema
      console.log('\n=== Checking key_english table ===');
      
      // Get the current table info
      const tableInfo = db.prepare("PRAGMA table_info(key_english)").all();
      
      if (tableInfo.length === 0) {
        // Table doesn't exist, create it
        console.log('Creating key_english table...');
        db.prepare(`
          CREATE TABLE key_english (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            abbreviation TEXT NOT NULL,
            chapters INTEGER NOT NULL
          )
        `).run();
        console.log('Created key_english table');
      } else {
        console.log('key_english table exists, checking schema...');
        const columnNames = tableInfo.map(col => col.name);
        const requiredColumns = ['id', 'name', 'abbreviation', 'chapters'];
        
        // Check if all required columns exist
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0) {
          console.log(`Missing columns in key_english: ${missingColumns.join(', ')}`);
          console.log('Recreating key_english table...');
          
          // Create a backup of the old table
          db.prepare('DROP TABLE IF EXISTS key_english_old').run();
          db.prepare('ALTER TABLE key_english RENAME TO key_english_old').run();
          
          // Create the new table
          db.prepare(`
            CREATE TABLE key_english (
              id INTEGER PRIMARY KEY,
              name TEXT NOT NULL,
              abbreviation TEXT NOT NULL,
              chapters INTEGER NOT NULL
            )
          `).run();
          
          // Try to copy data from the old table if possible
          try {
            const columnsToCopy = ['id', 'name', 'abbreviation', 'chapters']
              .filter(col => columnNames.includes(col));
              
            if (columnsToCopy.length > 0) {
              const insertCols = columnsToCopy.join(', ');
              const selectCols = columnsToCopy.join(', ');
              db.prepare(`
                INSERT INTO key_english (${insertCols})
                SELECT ${selectCols} FROM key_english_old
              `).run();
              console.log(`Migrated ${db.prepare('SELECT COUNT(*) as count FROM key_english').get().count} rows from old table`);
            }
            
            // Drop the old table
            db.prepare('DROP TABLE key_english_old').run();
            console.log('Recreated key_english table with correct schema');
          } catch (migrateError) {
            console.error('Error migrating data from old table:', migrateError);
            console.log('Proceeding with empty table');
          }
        } else {
          console.log('key_english table schema is correct');
        }
      }
      
      // 2. Populate the key_english table
      console.log('\n=== Populating key_english table ===');
      
      // Delete existing data
      db.prepare('DELETE FROM key_english').run();
      
      // Insert the books
      const insertStmt = db.prepare('INSERT INTO key_english (id, name, abbreviation, chapters) VALUES (?, ?, ?, ?)');
      
      for (const book of BIBLE_BOOKS) {
        insertStmt.run(book.id, book.name, book.abbreviation, book.chapters);
      }
      
      const insertedCount = db.prepare('SELECT COUNT(*) as count FROM key_english').get().count;
      console.log(`Inserted ${insertedCount} books into key_english`);
      
      // 3. Verify verse tables
      console.log('\n=== Checking verse tables ===');
      
      // Get all verse tables (t_*)
      const verseTables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%'"
      ).all();
      
      console.log(`Found ${verseTables.length} verse tables`);
      
      for (const { name: tableName } of verseTables) {
        console.log(`\nTable: ${tableName}`);
        
        // Check table structure
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const columnNames = columns.map(col => col.name);
        
        // Check for required columns
        const requiredColumns = ['book', 'chapter', 'verse', 'text'];
        const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0) {
          console.error(`❌ Missing columns in ${tableName}: ${missingColumns.join(', ')}`);
          console.error('This table may not be compatible with the Bible reader');
        } else {
          console.log('✅ Table structure is valid');
        }
        
        // Count verses
        const verseCount = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
        console.log(`Total verses: ${verseCount.toLocaleString()}`);
        
        // Count books
        const bookCount = db.prepare(`SELECT COUNT(DISTINCT book) as count FROM ${tableName}`).get().count;
        console.log(`Books with verses: ${bookCount}`);
        
        // Show sample data
        if (verseCount > 0) {
          const sample = db.prepare(`
            SELECT * FROM ${tableName} 
            WHERE book = 1 AND chapter = 1 
            LIMIT 1
          `).get();
          
          if (sample) {
            console.log('Sample verse (Genesis 1:1):', 
              Object.entries(sample)
                .filter(([key]) => ['book', 'chapter', 'verse', 'text'].includes(key))
                .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {})
            );
          } else {
            console.log('No sample verse found for Genesis 1:1');
          }
        }
      }
      
      console.log('\n=== Database fix complete ===');
    });
    
    // Execute the transaction
    transaction();
    
  } catch (error) {
    console.error('Error fixing Bible database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the fix
fixBibleDatabase();
