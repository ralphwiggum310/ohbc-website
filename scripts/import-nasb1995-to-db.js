import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995_chunked.txt');
const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');
const LOG_FILE = path.join(__dirname, 'import-nasb1995-log.txt');

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

// Book name to ID mapping (you may need to adjust this based on your database schema)
const BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
  'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

async function importBible() {
  let db;
  let currentBook = '';
  let currentChapter = 0;
  let verseBuffer = [];
  let lineCount = 0;
  let verseCount = 0;
  
  try {
    log('Starting NASB1995 import to database...');
    
    // Open the database
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
    
    log(`Connected to database: ${DB_FILE}`);
    
    // Read the input file
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const lines = content.split('\n');
    log(`Read ${lines.length} lines from input file`);
    
    // Process each line
    for (const line of lines) {
      lineCount++;
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      // Check for book header
      if (trimmedLine.startsWith('#')) {
        currentBook = trimmedLine.substring(1).trim();
        log(`Processing book: ${currentBook}`);
        continue;
      }
      
      // Check for chapter header
      const chapterMatch = trimmedLine.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        currentChapter = parseInt(chapterMatch[1], 10);
        log(`  Chapter ${currentChapter}`);
        continue;
      }
      
      // Process verse line
      const verseMatch = trimmedLine.match(/^(\d+)\s+(.+)/);
      if (verseMatch) {
        const verseNum = parseInt(verseMatch[1], 10);
        const verseText = verseMatch[2].trim();
        
        // Find book ID (1-based index)
        const bookId = BOOK_NAMES.findIndex(name => 
          name.toLowerCase() === currentBook.toLowerCase()
        ) + 1;
        
        if (bookId === 0) {
          log(`  Warning: Book not found: ${currentBook}`, { line: lineCount });
          continue;
        }
        
        // Insert into database
        try {
          await db.run(
            'INSERT OR REPLACE INTO t_nasb1995 (book, chapter, verse, text) VALUES (?, ?, ?, ?)',
            [bookId, currentChapter, verseNum, verseText]
          );
          verseCount++;
          
          // Log progress
          if (verseCount % 100 === 0) {
            log(`  Inserted ${verseCount} verses...`);
          }
          
        } catch (error) {
          log(`Error inserting verse ${bookId} ${currentChapter}:${verseNum}`, error.message);
        }
      }
    }
    
    log('Import completed successfully!');
    log(`Total verses imported: ${verseCount}`);
    
  } catch (error) {
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
