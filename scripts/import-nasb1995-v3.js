import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');
const INPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v2.txt');
const LOG_FILE = path.join(__dirname, 'import-nasb1995-v3.log');

// Book names in order with their IDs
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
        FOREIGN KEY (book_id) REFERENCES bible_books(id),
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
    // Check if the input file exists
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error(`Input file not found: ${INPUT_FILE}`);
    }
    
    log(`Starting import from: ${INPUT_FILE}`);
    
    // Clear existing verses
    await db.exec('DELETE FROM t_nasb1995');
    log('Cleared existing verses from t_nasb1995 table');
    
    // Prepare the insert statement
    const insertStmt = await db.prepare(
      'INSERT OR IGNORE INTO t_nasb1995 (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)'
    );
    
    // Read the file line by line
    const fileStream = fs.createReadStream(INPUT_FILE, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    let lineNumber = 0;
    let importedCount = 0;
    let errorCount = 0;
    
    // Process each line
    for await (const line of rl) {
      lineNumber++;
      
      // Log progress
      if (lineNumber % 1000 === 0) {
        log(`Processed ${lineNumber} lines, imported ${importedCount} verses`);
      }
      
      // Skip empty lines
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Parse the line: BOOK|CHAPTER|VERSE|TEXT
      const parts = trimmedLine.split('|');
      if (parts.length < 4) {
        log(`Skipping malformed line ${lineNumber}: ${trimmedLine.substring(0, 50)}...`);
        errorCount++;
        continue;
      }
      
      const [bookName, chapterStr, verseStr, ...textParts] = parts;
      const text = textParts.join('|'); // In case the text contains | characters
      
      // Convert chapter and verse to numbers
      const chapter = parseInt(chapterStr, 10);
      const verse = parseInt(verseStr, 10);
      
      // Skip if chapter or verse is not a valid number
      if (isNaN(chapter) || isNaN(verse)) {
        log(`Skipping line with invalid chapter/verse: ${trimmedLine.substring(0, 50)}...`);
        errorCount++;
        continue;
      }
      
      // Find the book ID
      const bookIndex = BOOK_NAMES.findIndex(name => name === bookName);
      if (bookIndex === -1) {
        log(`Skipping unknown book: ${bookName}`);
        errorCount++;
        continue;
      }
      
      const bookId = bookIndex + 1; // Books are 1-based in the database
      
      try {
        // Insert the verse
        await insertStmt.run(bookId, chapter, verse, text);
        importedCount++;
      } catch (error) {
        log(`Error inserting verse ${bookName} ${chapter}:${verse}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Finalize the statement
    await insertStmt.finalize();
    
    log(`Import complete!`);
    log(`Total lines processed: ${lineNumber}`);
    log(`Verses imported: ${importedCount}`);
    log(`Errors encountered: ${errorCount}`);
    
    return { imported: importedCount, errors: errorCount };
    
  } catch (error) {
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
