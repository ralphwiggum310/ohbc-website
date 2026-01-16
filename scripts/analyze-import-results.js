import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');
const OUTPUT_FILE = path.join(__dirname, 'import-analysis-results.txt');

// Book names in order
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

// Expected number of chapters per book
const EXPECTED_CHAPTERS = [
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52,
  5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4,
  5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22
];

// Expected number of verses per book (approximate)
const EXPECTED_VERSES = [
  1533, 1213, 859, 1288, 959, 658, 618, 85, 810, 695, 816, 719, 942, 822, 280, 406, 167, 1070, 2461,
  915, 222, 117, 1292, 1364, 154, 1273, 357, 197, 73, 146, 21, 48, 105, 47, 56, 53, 38, 211, 55,
  1071, 678, 1151, 879, 1007, 433, 437, 257, 149, 155, 104, 95, 89, 47, 113, 83, 46, 25, 303, 108,
  105, 61, 105, 13, 14, 25, 404
];

async function analyzeImport() {
  const results = [];
  const log = (message, data) => {
    const line = `${new Date().toISOString()} - ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
    console.log(line);
    results.push(line);
  };

  let db;
  
  try {
    log('Starting analysis of NASB1995 import...');
    
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
    
    // Get total verse count
    const totalVerses = await db.get('SELECT COUNT(*) as count FROM t_nasb1995');
    log(`\nTotal verses in database: ${totalVerses.count}`);
    
    // Analyze by book
    log('\n=== BOOK ANALYSIS ===');
    const bookCounts = await db.all(`
      SELECT book, COUNT(*) as count 
      FROM t_nasb1995 
      GROUP BY book 
      ORDER BY book
    `);
    
    let grandTotal = 0;
    let missingBooks = [];
    let lowCountBooks = [];
    
    // Check each book
    for (let i = 0; i < BOOK_NAMES.length; i++) {
      const bookNum = i + 1;
      const bookData = bookCounts.find(b => b.book === bookNum);
      const count = bookData ? bookData.count : 0;
      const expected = EXPECTED_VERSES[i];
      const percent = Math.round((count / expected) * 100);
      
      grandTotal += count;
      
      if (count === 0) {
        missingBooks.push(BOOK_NAMES[i]);
      } else if (percent < 50) {
        lowCountBooks.push(`${BOOK_NAMES[i]} (${count}/${expected} - ${percent}%)`);
      }
      
      log(`${bookNum.toString().padStart(2)}. ${BOOK_NAMES[i].padEnd(15)}: ${count.toString().padStart(4)} / ${expected.toString().padStart(4)} (${percent}%)`);
    }
    
    // Summary
    log('\n=== IMPORT SUMMARY ===');
    log(`Total verses imported: ${grandTotal}`);
    log(`Missing books (${missingBooks.length}): ${missingBooks.join(', ') || 'None'}`);
    log(`Books with low verse counts (${lowCountBooks.length}):`);
    lowCountBooks.forEach(book => log(`  - ${book}`));
    
    // Check for data quality issues
    log('\n=== DATA QUALITY CHECKS ===');
    
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
      log(`\nFound ${duplicates.length} duplicate verses (first 10 shown):`);
      for (const dup of duplicates) {
        const bookName = BOOK_NAMES[dup.book - 1] || `Book ${dup.book}`;
        log(`  - ${bookName} ${dup.chapter}:${dup.verse} (${dup.count} occurrences)`);
      }
    } else {
      log('No duplicate verses found.');
    }
    
    // Check for very short verses
    const shortVerses = await db.all(`
      SELECT book, chapter, verse, LENGTH(text) as length, text 
      FROM t_nasb1995 
      WHERE LENGTH(text) < 10
      ORDER BY book, chapter, verse
      LIMIT 10
    `);
    
    if (shortVerses.length > 0) {
      log(`\nFound ${shortVerses.length} very short verses (first 10 shown):`);
      for (const verse of shortVerses) {
        const bookName = BOOK_NAMES[verse.book - 1] || `Book ${verse.book}`;
        log(`  - ${bookName} ${verse.chapter}:${verse.verse} (${verse.length} chars): "${verse.text}"`);
      }
    } else {
      log('No unusually short verses found.');
    }
    
    // Sample verses
    log('\n=== SAMPLE VERSES ===');
    const sampleVerses = [
      { book: 1, chapter: 1, verse: 1 },  // Genesis 1:1
      { book: 19, chapter: 23, verse: 1 }, // Psalm 23:1
      { book: 40, chapter: 1, verse: 1 },  // Matthew 1:1
      { book: 43, chapter: 3, verse: 16 }, // John 3:16
      { book: 66, chapter: 22, verse: 21 } // Revelation 22:21
    ];
    
    for (const sv of sampleVerses) {
      const verse = await db.get(
        'SELECT text FROM t_nasb1995 WHERE book = ? AND chapter = ? AND verse = ?',
        [sv.book, sv.chapter, sv.verse]
      );
      
      const bookName = BOOK_NAMES[sv.book - 1] || `Book ${sv.book}`;
      if (verse) {
        log(`${bookName} ${sv.chapter}:${sv.verse} - "${verse.text}"`);
      } else {
        log(`${bookName} ${sv.chapter}:${sv.verse} - NOT FOUND`);
      }
    }
    
    log('\nAnalysis complete!');
    
  } catch (error) {
    log('Error during analysis:', error.message);
  } finally {
    if (db) {
      await db.close();
    }
    
    // Write results to file
    writeFileSync(OUTPUT_FILE, results.join('\n'));
    console.log(`\nAnalysis written to: ${OUTPUT_FILE}`);
  }
}

// Run the analysis
analyzeImport().catch(error => {
  console.error('Unhandled error during analysis:', error);
  process.exit(1);
});
