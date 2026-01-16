import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');
const INPUT_FILE = path.join(__dirname, 'NASB1995_cleaned.txt');
const LOG_FILE = path.join(__dirname, 'import-nasb1995-clean.log');

// Book names and their IDs
const BOOK_NAMES = [
  'GENESIS', 'EXODUS', 'LEVITICUS', 'NUMBERS', 'DEUTERONOMY', 'JOSHUA', 'JUDGES', 'RUTH',
  '1 SAMUEL', '2 SAMUEL', '1 KINGS', '2 KINGS', '1 CHRONICLES', '2 CHRONICLES', 'EZRA', 'NEHEMIAH',
  'ESTHER', 'JOB', 'PSALMS', 'PROVERBS', 'ECCLESIASTES', 'SONG OF SOLOMON', 'ISAIAH', 'JEREMIAH',
  'LAMENTATIONS', 'EZEKIEL', 'DANIEL', 'HOSEA', 'JOEL', 'AMOS', 'OBADIAH', 'JONAH', 'MICAH',
  'NAHUM', 'HABAKKUK', 'ZEPHANIAH', 'HAGGAI', 'ZECHARIAH', 'MALACHI', 'MATTHEW', 'MARK', 'LUKE',
  'JOHN', 'ACTS', 'ROMANS', '1 CORINTHIANS', '2 CORINTHIANS', 'GALATIANS', 'EPHESIANS',
  'PHILIPPIANS', 'COLOSSIANS', '1 THESSALONIANS', '2 THESSALONIANS', '1 TIMOTHY', '2 TIMOTHY',
  'TITUS', 'PHILEMON', 'HEBREWS', 'JAMES', '1 PETER', '2 PETER', '1 JOHN', '2 JOHN', '3 JOHN',
  'JUDE', 'REVELATION'
];

// Initialize log file
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });

function log(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  logStream.write(logMessage);
  console.log(`[${timestamp}] ${message}`);
}

async function createTables(db) {
  try {
    // Create the books table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bible_books (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        testament TEXT,
        chapters INTEGER
      )`);
    
    // Create the verses table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS t_nasb1995 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        UNIQUE(book_id, chapter, verse)
      )`);
    
    // Create an index for faster lookups
    await db.exec('CREATE INDEX IF NOT EXISTS idx_nasb1995_book_chapter_verse ON t_nasb1995(book_id, chapter, verse)');
    
    log('Database tables created or verified');
    return true;
  } catch (error) {
    log('Error creating tables:', error.message);
    throw error;
  }
}

async function populateBooks(db) {
  try {
    // Check if books are already populated
    const count = await db.get('SELECT COUNT(*) as count FROM bible_books');
    
    if (count && count.count > 0) {
      log('Books table already populated');
      return true;
    }
    
    // Insert books into the database
    const stmt = await db.prepare('INSERT INTO bible_books (id, name, testament) VALUES (?, ?, ?)');
    
    // Insert Old Testament books (1-39)
    for (let i = 0; i < 39; i++) {
      await stmt.run(i + 1, BOOK_NAMES[i], 'OT');
    }
    
    // Insert New Testament books (40-66)
    for (let i = 39; i < BOOK_NAMES.length; i++) {
      await stmt.run(i + 1, BOOK_NAMES[i], 'NT');
    }
    
    await stmt.finalize();
    log(`Inserted ${BOOK_NAMES.length} books into bible_books table`);
    return true;
  } catch (error) {
    log('Error populating books:', error.message);
    throw error;
  }
}

async function importVerses(db) {
  try {
    // Read the cleaned file
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentBook = null;
    let currentChapter = null;
    let verseCount = 0;
    let insertedCount = 0;
    
    // Prepare the insert statement
    const insertStmt = await db.prepare(
      'INSERT OR IGNORE INTO t_nasb1995 (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)'
    );
    
    // Start a transaction for better performance
    await db.exec('BEGIN TRANSACTION');
    
    for (const line of lines) {
      // Check for book header
      if (line.startsWith('#')) {
        const bookName = line.substring(1).trim();
        currentBook = BOOK_NAMES.indexOf(bookName) + 1;
        log(`Processing book: ${bookName} (ID: ${currentBook})`);
        continue;
      }
      
      // Check for chapter header
      if (line.startsWith('Chapter ')) {
        currentChapter = parseInt(line.substring(8).trim(), 10);
        log(`  Chapter ${currentChapter}`);
        continue;
      }
      
      // Process verse line (format: "1 In the beginning...")
      const verseMatch = line.match(/^(\d+)\s+(.+)$/);
      if (verseMatch && currentBook && currentChapter) {
        const verseNum = parseInt(verseMatch[1], 10);
        const verseText = verseMatch[2].trim();
        
        try {
          await insertStmt.run(currentBook, currentChapter, verseNum, verseText);
          insertedCount++;
          verseCount++;
          
          // Log progress
          if (verseCount % 1000 === 0) {
            log(`  Processed ${verseCount} verses...`);
          }
        } catch (error) {
          log(`Error inserting verse ${currentBook}:${currentChapter}:${verseNum}:`, error.message);
        }
      }
    }
    
    // Commit the transaction
    await db.exec('COMMIT');
    await insertStmt.finalize();
    
    log(`\nImport complete! Inserted ${insertedCount} verses.`);
    return insertedCount;
  } catch (error) {
    await db.exec('ROLLBACK');
    log('Error importing verses:', error.message);
    throw error;
  }
}

async function verifyImport(db) {
  try {
    // Get total verse count
    const totalVerses = await db.get('SELECT COUNT(*) as count FROM t_nasb1995');
    log(`\n=== VERIFICATION ===`);
    log(`Total verses in database: ${totalVerses.count}`);
    
    // Get verse counts by book
    log('\nVerses by book:');
    const bookCounts = await db.all(`
      SELECT b.name, COUNT(v.id) as count
      FROM bible_books b
      LEFT JOIN t_nasb1995 v ON b.id = v.book_id
      GROUP BY b.id, b.name
      ORDER BY b.id
    `);
    
    bookCounts.forEach(book => {
      log(`  ${book.name.padEnd(15)}: ${book.count.toString().padStart(5)}`);
    });
    
    // Check for missing books
    const missingBooks = [];
    for (let i = 0; i < BOOK_NAMES.length; i++) {
      const bookName = BOOK_NAMES[i];
      const bookData = bookCounts.find(b => b.name === bookName);
      if (!bookData || bookData.count === 0) {
        missingBooks.push(bookName);
      }
    }
    
    if (missingBooks.length > 0) {
      log(`\nWARNING: ${missingBooks.length} books have no verses:`);
      log(missingBooks.join(', '));
    } else {
      log('\nAll books have at least one verse.');
    }
    
    // Sample some verses
    log('\nSample verses:');
    const sampleVerses = [
      { book: 'GENESIS', chapter: 1, verse: 1 },
      { book: 'PSALMS', chapter: 23, verse: 1 },
      { book: 'MATTHEW', chapter: 1, verse: 1 },
      { book: 'JOHN', chapter: 3, verse: 16 },
      { book: 'REVELATION', chapter: 22, verse: 21 }
    ];
    
    for (const sv of sampleVerses) {
      const verse = await db.get(`
        SELECT v.*, b.name as book_name
        FROM t_nasb1995 v
        JOIN bible_books b ON v.book_id = b.id
        WHERE b.name = ? AND v.chapter = ? AND v.verse = ?
      `, [sv.book, sv.chapter, sv.verse]);
      
      if (verse) {
        log(`${verse.book_name} ${verse.chapter}:${verse.verse} - "${verse.text}"`);
      } else {
        log(`${sv.book} ${sv.chapter}:${sv.verse} - NOT FOUND`);
      }
    }
    
  } catch (error) {
    log('Error during verification:', error.message);
    throw error;
  }
}

async function main() {
  let db;
  
  try {
    // Open the database
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
    
    // Set up the database
    await createTables(db);
    await populateBooks(db);
    
    // Import the verses
    await importVerses(db);
    
    // Verify the import
    await verifyImport(db);
    
  } catch (error) {
    log('Fatal error:', error.message);
    process.exit(1);
  } finally {
    if (db) {
      await db.close();
    }
    logStream.end();
    log('Done.');
  }
}

// Run the import
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
