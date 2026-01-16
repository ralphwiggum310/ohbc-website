import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_PATH = path.join(__dirname, '..', 'Bible api', 'bible.eng.db');
const NASB_FILE = path.join(__dirname, 'NASB1995_cleaned.txt');

// Book name to ID mapping (from key_english table)
const BOOK_IDS = {
  'GENESIS': 1, 'EXODUS': 2, 'LEVITICUS': 3, 'NUMBERS': 4, 'DEUTERONOMY': 5,
  'JOSHUA': 6, 'JUDGES': 7, 'RUTH': 8, '1 SAMUEL': 9, '2 SAMUEL': 10,
  '1 KINGS': 11, '2 KINGS': 12, '1 CHRONICLES': 13, '2 CHRONICLES': 14, 'EZRA': 15,
  'NEHEMIAH': 16, 'ESTHER': 17, 'JOB': 18, 'PSALM': 19, 'PROVERBS': 20,
  'ECCLESIASTES': 21, 'SONG OF SOLOMON': 22, 'ISAIAH': 23, 'JEREMIAH': 24,
  'LAMENTATIONS': 25, 'EZEKIEL': 26, 'DANIEL': 27, 'HOSEA': 28, 'JOEL': 29,
  'AMOS': 30, 'OBADIAH': 31, 'JONAH': 32, 'MICAH': 33, 'NAHUM': 34,
  'HABAKKUK': 35, 'ZEPHANIAH': 36, 'HAGGAI': 37, 'ZECHARIAH': 38, 'MALACHI': 39,
  'MATTHEW': 40, 'MARK': 41, 'LUKE': 42, 'JOHN': 43, 'ACTS': 44,
  'ROMANS': 45, '1 CORINTHIANS': 46, '2 CORINTHIANS': 47, 'GALATIANS': 48,
  'EPHESIANS': 49, 'PHILIPPIANS': 50, 'COLOSSIANS': 51, '1 THESSALONIANS': 52,
  '2 THESSALONIANS': 53, '1 TIMOTHY': 54, '2 TIMOTHY': 55, 'TITUS': 56,
  'PHILEMON': 57, 'HEBREWS': 58, 'JAMES': 59, '1 PETER': 60, '2 PETER': 61,
  '1 JOHN': 62, '2 JOHN': 63, '3 JOHN': 64, 'JUDE': 65, 'REVELATION': 66
};

async function createTable(db) {
  console.log('Creating t_nasb1995 table if it does not exist...');
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS t_nasb1995 (
      id INTEGER PRIMARY KEY,
      book INTEGER,
      chapter INTEGER,
      verse INTEGER,
      text TEXT,
      FOREIGN KEY (book) REFERENCES key_english (id)
    );
  `);
  
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_t_nasb1995_ref 
    ON t_nasb1995 (book, chapter, verse);
  `);
  
  // Clear existing data to avoid duplicates
  await db.run('DELETE FROM t_nasb1995;');
}

async function importVerses(db) {
  console.log('Reading NASB1995 text file...');
  const content = fs.readFileSync(NASB_FILE, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  let currentBook = '';
  let currentChapter = 0;
  let verseCount = 0;
  
  console.log('Starting import...');
  
  // Use a transaction for better performance
  await db.exec('BEGIN TRANSACTION;');
  
  try {
    for (const line of lines) {
      // Check for book header (e.g., "# GENESIS")
      if (line.startsWith('#')) {
        currentBook = line.substring(2).trim().toUpperCase();
        console.log(`\nProcessing book: ${currentBook}`);
        continue;
      }
      
      // Check for chapter line (e.g., "Chapter 1")
      const chapterMatch = line.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        currentChapter = parseInt(chapterMatch[1], 10);
        process.stdout.write(`  Chapter ${currentChapter}... `);
        continue;
      }
      
      // Skip chapter titles (lines that don't start with a number)
      if (!/^\d+\s/.test(line)) {
        continue;
      }
      
      // Process verse line (e.g., "1 In the beginning...")
      const verseMatch = line.match(/^(\d+)\s+(.*)/);
      if (verseMatch && currentBook && currentChapter > 0) {
        const verseNum = parseInt(verseMatch[1], 10);
        const verseText = verseMatch[2].trim();
        const bookId = BOOK_IDS[currentBook];
        
        if (!bookId) {
          console.error(`\nError: Unknown book: ${currentBook}`);
          continue;
        }
        
        await db.run(
          'INSERT INTO t_nasb1995 (book, chapter, verse, text) VALUES (?, ?, ?, ?)',
          [bookId, currentChapter, verseNum, verseText]
        );
        
        verseCount++;
        if (verseCount % 100 === 0) process.stdout.write('.');
      }
    }
    
    // Commit the transaction
    await db.exec('COMMIT;');
    console.log('\n\nImport completed successfully!');
    console.log(`Total verses imported: ${verseCount}`);
    
  } catch (error) {
    // Rollback on error
    await db.exec('ROLLBACK;');
    console.error('\nError during import:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting NASB1995 import...');
    
    // Open the database
    console.log(`Opening database: ${DB_PATH}`);
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    // Create the table if it doesn't exist
    await createTable(db);
    
    // Import the verses
    await importVerses(db);
    
    // Close the database
    await db.close();
    
    console.log('All done!');
    
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
