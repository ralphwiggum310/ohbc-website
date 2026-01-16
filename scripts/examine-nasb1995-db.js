import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');
const OUTPUT_FILE = path.join(__dirname, 'nasb1995-db-analysis.txt');

async function analyzeDatabase() {
  const output = createWriteStream(OUTPUT_FILE);
  
  function log(message, data) {
    const line = `${new Date().toISOString()} - ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    console.log(line);
    output.write(line);
  }

  let db;
  
  try {
    log('Starting analysis of NASB1995 database...');
    
    // Open the database
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
    
    // Check if table exists
    const tableInfo = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='t_nasb1995'");
    
    if (!tableInfo) {
      log('Error: t_nasb1995 table does not exist in the database');
      return;
    }
    
    // Get table schema
    const schema = await db.all("PRAGMA table_info(t_nasb1995)");
    log('Table schema:', schema);
    
    // Get total verse count
    const totalVerses = await db.get('SELECT COUNT(*) as count FROM t_nasb1995');
    log(`\nTotal verses in database: ${totalVerses.count}`);
    
    // Get verse counts by book
    log('\nVerse counts by book:');
    const bookCounts = await db.all(`
      SELECT book, COUNT(*) as count 
      FROM t_nasb1995 
      GROUP BY book 
      ORDER BY book
    `);
    
    // Book names for reference
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
    
    bookCounts.forEach(row => {
      const bookName = BOOK_NAMES[row.book - 1] || `Book ${row.book}`;
      log(`  ${bookName.padEnd(20)}: ${row.count} verses`);
    });
    
    // Check for missing books
    const missingBooks = [];
    for (let i = 1; i <= 66; i++) {
      if (!bookCounts.some(b => b.book === i)) {
        missingBooks.push(i);
      }
    }
    
    if (missingBooks.length > 0) {
      log('\nMissing books (by number):', missingBooks);
    }
    
    // Get sample verses from each book
    log('\nSample verses from each book:');
    for (let i = 0; i < BOOK_NAMES.length; i++) {
      const bookNum = i + 1;
      if (bookCounts.some(b => b.book === bookNum)) {
        const sample = await db.get(
          'SELECT book, chapter, verse, text FROM t_nasb1995 WHERE book = ? LIMIT 1',
          [bookNum]
        );
        
        if (sample) {
          const preview = sample.text.length > 50 
            ? sample.text.substring(0, 50) + '...' 
            : sample.text;
          log(`  ${BOOK_NAMES[i].padEnd(15)} ${sample.chapter}:${sample.verse} - "${preview}"`);
        }
      }
    }
    
    // Check for potential data issues
    log('\nChecking for potential data issues...');
    
    // Find very short verses
    const shortVerses = await db.all(`
      SELECT book, chapter, verse, LENGTH(text) as length, text 
      FROM t_nasb1995 
      WHERE LENGTH(text) < 10
      ORDER BY book, chapter, verse
      LIMIT 10
    `);
    
    if (shortVerses.length > 0) {
      log(`\nFound ${shortVerses.length} very short verses (potential issues):`);
      shortVerses.forEach(v => {
        const bookName = BOOK_NAMES[v.book - 1] || `Book ${v.book}`;
        log(`  ${bookName} ${v.chapter}:${v.verse} (${v.length} chars): "${v.text}"`);
      });
    }
    
    // Check for duplicate verses
    const duplicates = await db.all(`
      SELECT book, chapter, verse, COUNT(*) as count
      FROM t_nasb1995
      GROUP BY book, chapter, verse
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `);
    
    if (duplicates.length > 0) {
      log(`\nFound ${duplicates.length} duplicate verses:`);
      duplicates.forEach(d => {
        const bookName = BOOK_NAMES[d.book - 1] || `Book ${d.book}`;
        log(`  ${bookName} ${d.chapter}:${d.verse} - ${d.count} occurrences`);
      });
    }
    
    log('\nAnalysis complete!');
    
  } catch (error) {
    log('Error during analysis:', error.message);
  } finally {
    if (db) {
      await db.close();
    }
    output.end();
    console.log(`Analysis written to: ${OUTPUT_FILE}`);
  }
}

// Run the analysis
analyzeDatabase().catch(error => {
  console.error('Unhandled error during analysis:', error);
  process.exit(1);
});
