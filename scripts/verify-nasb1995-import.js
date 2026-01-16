import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream, appendFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');
const LOG_FILE = path.join(__dirname, 'verify-nasb1995-import.log');

// Book names and expected verse counts (approximate)
const EXPECTED_VERSES = {
  'GENESIS': 1533, 'EXODUS': 1213, 'LEVITICUS': 859, 'NUMBERS': 1288, 'DEUTERONOMY': 959,
  'JOSHUA': 658, 'JUDGES': 618, 'RUTH': 85, '1 SAMUEL': 810, '2 SAMUEL': 695,
  '1 KINGS': 816, '2 KINGS': 719, '1 CHRONICLES': 942, '2 CHRONICLES': 822,
  'EZRA': 280, 'NEHEMIAH': 406, 'ESTHER': 167, 'JOB': 1070, 'PSALMS': 2461,
  'PROVERBS': 915, 'ECCLESIASTES': 222, 'SONG OF SOLOMON': 117, 'ISAIAH': 1292,
  'JEREMIAH': 1364, 'LAMENTATIONS': 154, 'EZEKIEL': 1273, 'DANIEL': 357,
  'HOSEA': 197, 'JOEL': 73, 'AMOS': 146, 'OBADIAH': 21, 'JONAH': 48, 'MICAH': 105,
  'NAHUM': 47, 'HABAKKUK': 56, 'ZEPHANIAH': 53, 'HAGGAI': 38, 'ZECHARIAH': 211,
  'MALACHI': 55, 'MATTHEW': 1071, 'MARK': 678, 'LUKE': 1151, 'JOHN': 879,
  'ACTS': 1007, 'ROMANS': 433, '1 CORINTHIANS': 437, '2 CORINTHIANS': 257,
  'GALATIANS': 149, 'EPHESIANS': 155, 'PHILIPPIANS': 104, 'COLOSSIANS': 95,
  '1 THESSALONIANS': 89, '2 THESSALONIANS': 47, '1 TIMOTHY': 113,
  '2 TIMOTHY': 83, 'TITUS': 46, 'PHILEMON': 25, 'HEBREWS': 303, 'JAMES': 108,
  '1 PETER': 105, '2 PETER': 61, '1 JOHN': 105, '2 JOHN': 13, '3 JOHN': 14,
  'JUDE': 25, 'REVELATION': 404
};

async function verifyImport() {
  const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });
  
  function log(message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    console.log(`[${timestamp}] ${message}`);
    logStream.write(logMessage);
  }

  let db;
  
  try {
    log('Starting verification of NASB1995 import...');
    
    // Open the database
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
    
    // Check if table exists
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='t_nasb1995'"
    );
    
    if (!tableExists) {
      log('Error: t_nasb1995 table does not exist in the database');
      return;
    }
    
    // Get total verse count
    const totalVerses = await db.get('SELECT COUNT(*) as count FROM t_nasb1995');
    log(`Total verses in database: ${totalVerses.count}`);
    
    // Get verse counts by book
    const bookCounts = await db.all(`
      SELECT book, COUNT(*) as count 
      FROM t_nasb1995 
      GROUP BY book 
      ORDER BY book
    `);
    
    log('\nVerse counts by book:');
    let grandTotal = 0;
    
    for (const book of bookCounts) {
      const bookName = Object.entries(EXPECTED_VERSES)[book.book - 1]?.[0] || `Book ${book.book}`;
      const expected = EXPECTED_VERSES[bookName] || 'N/A';
      const diff = expected !== 'N/A' ? book.count - expected : 'N/A';
      const status = diff === 0 ? '✓' : diff !== 'N/A' ? `⚠ (${diff > 0 ? '+' : ''}${diff})` : '?';
      
      log(`  ${bookName.padEnd(20)}: ${book.count.toString().padStart(4)} / ${expected.toString().padStart(4)} ${status}`);
      grandTotal += book.count;
    }
    
    // Check for missing books
    log('\nMissing or incomplete books:');
    Object.entries(EXPECTED_VERSES).forEach(([book, expected], index) => {
      const bookId = index + 1;
      const found = bookCounts.find(b => b.book === bookId);
      if (!found) {
        log(`  ${book.padEnd(20)}: Missing (expected ${expected} verses)`);
      } else if (found.count < expected * 0.9) {
        log(`  ${book.padEnd(20)}: Low count (${found.count} / ${expected} verses)`);
      }
    });
    
    // Check for potential data issues
    log('\nChecking for potential data issues...');
    
    // Find verses with very short text (potential truncation)
    const shortVerses = await db.all(`
      SELECT book, chapter, verse, LENGTH(text) as length, SUBSTR(text, 1, 20) || '...' as preview
      FROM t_nasb1995 
      WHERE LENGTH(text) < 10
      ORDER BY book, chapter, verse
      LIMIT 20
    `);
    
    if (shortVerses.length > 0) {
      log(`\nFound ${shortVerses.length} verses with very short text (potential issues):`);
      shortVerses.forEach(v => {
        log(`  Book ${v.book} ${v.chapter}:${v.verse} (${v.length} chars): "${v.preview}"`);
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
        log(`  Book ${d.book} ${d.chapter}:${d.verse} - ${d.count} occurrences`);
      });
    }
    
    // Sample some verses
    log('\nSample verses from the database:');
    const samples = await db.all(`
      SELECT book, chapter, verse, text
      FROM t_nasb1995
      WHERE (book = 1 AND chapter = 1 AND verse IN (1, 5, 10)) OR
            (book = 40 AND chapter = 1 AND verse IN (1, 5, 10)) OR
            (book = 66 AND chapter = 22 AND verse IN (18, 20, 21))
      ORDER BY book, chapter, verse
    `);
    
    samples.forEach(sample => {
      const bookName = Object.entries(EXPECTED_VERSES)[sample.book - 1]?.[0] || `Book ${sample.book}`;
      log(`  ${bookName} ${sample.chapter}:${sample.verse} - "${sample.text.substring(0, 50)}${sample.text.length > 50 ? '...' : ''}"`);
    });
    
    log('\nVerification complete!');
    log(`Total verses verified: ${grandTotal}`);
    
  } catch (error) {
    log('Error during verification:', error.message);
  } finally {
    if (db) {
      await db.close();
    }
    logStream.end();
  }
}

// Use the imported fs methods directly
const fs = {
  createWriteStream: createWriteStream,
  appendFileSync: appendFileSync
};

// Run the verification
verifyImport().catch(error => {
  console.error('Unhandled error during verification:', error);
  process.exit(1);
});
