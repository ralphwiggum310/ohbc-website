import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');

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

// Expected verse counts for each book (approximate)
const EXPECTED_VERSES = [
  1533, 1213, 859, 1288, 959, 658, 618, 85, 810, 695, 816, 719, 942, 822, 280, 406, 167, 1070, 2461,
  915, 222, 117, 1292, 1364, 154, 1273, 357, 197, 73, 146, 21, 48, 105, 47, 56, 53, 38, 211, 55,
  1071, 678, 1151, 879, 1007, 433, 437, 257, 149, 155, 104, 95, 89, 47, 113, 83, 46, 25, 303, 108,
  105, 61, 105, 13, 14, 25, 404
];

async function verifyImport() {
  let db;
  
  try {
    // Open the database
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
    
    console.log('=== NASB1995 IMPORT VERIFICATION ===\n');
    
    // 1. Get total verse count
    const totalVerses = await db.get('SELECT COUNT(*) as count FROM t_nasb1995');
    console.log(`Total verses in database: ${totalVerses.count}\n`);
    
    // 2. Get verse counts by book
    console.log('Verses by book:');
    console.log('----------------');
    
    const bookCounts = await db.all(`
      SELECT b.id, b.name, COUNT(v.id) as count
      FROM bible_books b
      LEFT JOIN t_nasb1995 v ON b.id = v.book_id
      GROUP BY b.id, b.name
      ORDER BY b.id
    `);
    
    let totalImported = 0;
    let booksWithIssues = [];
    
    for (const book of bookCounts) {
      const expected = EXPECTED_VERSES[book.id - 1] || 0;
      const percent = expected > 0 ? Math.round((book.count / expected) * 100) : 0;
      totalImported += book.count;
      
      console.log(`[${book.id.toString().padStart(2)}] ${book.name.padEnd(15)}: ${book.count.toString().padStart(5)} / ${expected.toString().padStart(5)} (${percent}%)`);
      
      // Check for potential issues
      if (book.count === 0) {
        booksWithIssues.push(`${book.name} (no verses)`);
      } else if (expected > 0 && percent < 50) {
        booksWithIssues.push(`${book.name} (low verse count: ${book.count}/${expected})`);
      }
    }
    
    // 3. Check for missing books
    const missingBooks = [];
    for (let i = 0; i < BOOK_NAMES.length; i++) {
      const bookName = BOOK_NAMES[i];
      const bookData = bookCounts.find(b => b.name === bookName);
      if (!bookData || bookData.count === 0) {
        missingBooks.push(bookName);
      }
    }
    
    // 4. Sample some verses
    console.log('\nSample verses:');
    console.log('--------------');
    
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
        console.log(`${verse.book_name} ${verse.chapter}:${verse.verse} - "${verse.text}"`);
      } else {
        console.log(`${sv.book} ${sv.chapter}:${sv.verse} - NOT FOUND`);
      }
    }
    
    // 5. Check for potential issues
    console.log('\n=== POTENTIAL ISSUES ===');
    
    if (booksWithIssues.length > 0) {
      console.log('\nBooks with potential issues:');
      booksWithIssues.forEach(issue => console.log(`- ${issue}`));
    } else {
      console.log('No major issues detected with book verse counts.');
    }
    
    if (missingBooks.length > 0) {
      console.log(`\nMissing books (${missingBooks.length}):`);
      console.log(missingBooks.join(', '));
    } else {
      console.log('\nAll expected books are present.');
    }
    
    // 6. Check for duplicate verses
    const duplicates = await db.all(`
      SELECT book_id, chapter, verse, COUNT(*) as count
      FROM t_nasb1995
      GROUP BY book_id, chapter, verse
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `);
    
    if (duplicates.length > 0) {
      console.log(`\nFound ${duplicates.length} duplicate verses (first 10 shown):`);
      for (const dup of duplicates) {
        const bookName = BOOK_NAMES[dup.book_id - 1] || `Book ${dup.book_id}`;
        console.log(`- ${bookName} ${dup.chapter}:${dup.verse} (${dup.count} occurrences)`);
      }
    } else {
      console.log('\nNo duplicate verses found.');
    }
    
    // 7. Summary
    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Total verses imported: ${totalImported}`);
    console.log(`Books with issues: ${booksWithIssues.length} of ${BOOK_NAMES.length}`);
    console.log(`Missing books: ${missingBooks.length} of ${BOOK_NAMES.length}`);
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    if (db) {
      await db.close();
    }
  }
}

// Run the verification
verifyImport().catch(console.error);
