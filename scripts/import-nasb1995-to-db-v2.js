import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995_chunked.txt');
const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');
const LOG_FILE = path.join(__dirname, 'import-nasb1995-log-v2.txt');

// Clear previous log file
if (fs.existsSync(LOG_FILE)) {
  fs.unlinkSync(LOG_FILE);
}

const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  console.log(`[${timestamp}] ${message}`);
  logStream.write(logMessage);
}

// Book name to ID mapping with common variations
const BOOK_NAMES = {
  'GENESIS': 1, 'EXODUS': 2, 'LEVITICUS': 3, 'NUMBERS': 4, 'DEUTERONOMY': 5,
  'JOSHUA': 6, 'JUDGES': 7, 'RUTH': 8, '1 SAMUEL': 9, '2 SAMUEL': 10,
  '1 KINGS': 11, '2 KINGS': 12, '1 CHRONICLES': 13, '2 CHRONICLES': 14,
  'EZRA': 15, 'NEHEMIAH': 16, 'ESTHER': 17, 'JOB': 18, 'PSALM': 19, 'PSALMS': 19,
  'PROVERBS': 20, 'ECCLESIASTES': 21, 'SONG OF SOLOMON': 22, 'SONG OF SONGS': 22,
  'ISAIAH': 23, 'JEREMIAH': 24, 'LAMENTATIONS': 25, 'EZEKIEL': 26, 'DANIEL': 27,
  'HOSEA': 28, 'JOEL': 29, 'AMOS': 30, 'OBADIAH': 31, 'JONAH': 32, 'MICAH': 33,
  'NAHUM': 34, 'HABAKKUK': 35, 'ZEPHANIAH': 36, 'HAGGAI': 37, 'ZECHARIAH': 38,
  'MALACHI': 39, 'MATTHEW': 40, 'MARK': 41, 'LUKE': 42, 'JOHN': 43, 'ACTS': 44,
  'ROMANS': 45, '1 CORINTHIANS': 46, '2 CORINTHIANS': 47, 'GALATIANS': 48,
  'EPHESIANS': 49, 'PHILIPPIANS': 50, 'COLOSSIANS': 51, '1 THESSALONIANS': 52,
  '2 THESSALONIANS': 53, '1 TIMOTHY': 54, '2 TIMOTHY': 55, 'TITUS': 56,
  'PHILEMON': 57, 'HEBREWS': 58, 'JAMES': 59, '1 PETER': 60, '2 PETER': 61,
  '1 JOHN': 62, '2 JOHN': 63, '3 JOHN': 64, 'JUDE': 65, 'REVELATION': 66
};

async function setupDatabase(db) {
  // Create the table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS t_nasb1995 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      UNIQUE(book, chapter, verse)
    )
  `);
  
  // Create indexes for faster lookups
  await db.exec('CREATE INDEX IF NOT EXISTS idx_nasb1995_book ON t_nasb1995(book)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_nasb1995_chapter ON t_nasb1995(chapter)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_nasb1995_verse ON t_nasb1995(verse)');
  
  log('Database setup complete');
}

function cleanBookName(name) {
  // Remove any non-alphabetic characters and trim whitespace
  return name.replace(/[^A-Z\s]/gi, '').trim().toUpperCase();
}

function getBookId(bookName) {
  const cleanName = cleanBookName(bookName);
  
  // Try exact match first
  if (BOOK_NAMES[cleanName]) {
    return BOOK_NAMES[cleanName];
  }
  
  // Try to handle variations (e.g., '1SAMUEL' vs '1 SAMUEL')
  const normalized = cleanName.replace(/\s+/g, ' ');
  for (const [name, id] of Object.entries(BOOK_NAMES)) {
    if (name.replace(/\s+/g, '') === normalized.replace(/\s+/g, '')) {
      return id;
    }
  }
  
  return null;
}

async function importBible() {
  let db;
  let currentBook = '';
  let currentBookId = 0;
  let currentChapter = 0;
  let verseCount = 0;
  let skippedVerses = [];
  
  try {
    log('Starting NASB1995 import to database (v2)...');
    
    // Open the database
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
    
    log(`Connected to database: ${DB_FILE}`);
    
    // Setup database (create table if needed)
    await setupDatabase(db);
    
    // Read the input file
    log(`Reading input file: ${INPUT_FILE}`);
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const lines = content.split('\n');
    log(`Read ${lines.length} lines from input file`);
    
    // Begin transaction for better performance
    await db.exec('BEGIN TRANSACTION');
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check for book header (e.g., "# GENESIS")
      if (line.startsWith('#')) {
        currentBook = line.substring(1).trim();
        currentBookId = getBookId(currentBook);
        
        if (currentBookId) {
          log(`Processing book: ${currentBook} (ID: ${currentBookId})`);
        } else {
          log(`Warning: Unknown book name: "${currentBook}"`, { line: i + 1 });
        }
        continue;
      }
      
      // Check for chapter header (e.g., "Chapter 1")
      const chapterMatch = line.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        currentChapter = parseInt(chapterMatch[1], 10);
        log(`  Chapter ${currentChapter}`);
        continue;
      }
      
      // Skip if we don't have a valid book and chapter
      if (!currentBookId || !currentChapter) {
        continue;
      }
      
      // Process verse line (e.g., "1 In the beginning...")
      const verseMatch = line.match(/^(\d+)\s+(.+)/);
      if (verseMatch) {
        const verseNum = parseInt(verseMatch[1], 10);
        const verseText = verseMatch[2].trim();
        
        try {
          await db.run(
            'INSERT OR REPLACE INTO t_nasb1995 (book, chapter, verse, text) VALUES (?, ?, ?, ?)',
            [currentBookId, currentChapter, verseNum, verseText]
          );
          verseCount++;
          
          // Log progress
          if (verseCount % 100 === 0) {
            log(`  Inserted ${verseCount} verses...`);
          }
          
        } catch (error) {
          skippedVerses.push({
            book: currentBook,
            chapter: currentChapter,
            verse: verseNum,
            error: error.message
          });
          log(`Error inserting verse ${currentBook} ${currentChapter}:${verseNum}`, error.message);
        }
      }
    }
    
    // Commit the transaction
    await db.exec('COMMIT');
    
    // Log summary
    log('\nImport completed!');
    log(`Total verses imported: ${verseCount}`);
    
    if (skippedVerses.length > 0) {
      log(`\nSkipped ${skippedVerses.length} verses due to errors:`);
      skippedVerses.slice(0, 10).forEach((v, i) => {
        log(`  ${i + 1}. ${v.book} ${v.chapter}:${v.verse} - ${v.error}`);
      });
      if (skippedVerses.length > 10) {
        log(`  ... and ${skippedVerses.length - 10} more`);
      }
    }
    
    // Verify counts
    try {
      const result = await db.get('SELECT COUNT(*) as count FROM t_nasb1995');
      log(`\nTotal verses in database: ${result.count}`);
      
      // Get book counts
      const bookCounts = await db.all(`
        SELECT b.name, COUNT(*) as count 
        FROM t_nasb1995 v
        JOIN bible_books b ON v.book = b.book_number
        GROUP BY v.book
        ORDER BY v.book
      `);
      
      log('\nVerse counts by book:');
      bookCounts.forEach(b => {
        log(`  ${b.name.padEnd(20)}: ${b.count}`);
      });
      
    } catch (error) {
      log('Error verifying database counts:', error.message);
    }
    
  } catch (error) {
    if (db) {
      await db.exec('ROLLBACK');
    }
    log('An error occurred during import:', error);
  } finally {
    if (db) {
      await db.close();
      log('Database connection closed');
    }
    logStream.end();
  }
}

// Run the import
importBible().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
