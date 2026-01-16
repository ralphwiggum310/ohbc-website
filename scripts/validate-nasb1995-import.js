import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_PATH = path.join(__dirname, '..', 'Bible api', 'bible.eng.db');

// Expected number of verses per book (NASB1995)
const EXPECTED_VERSES = {
  1: 1533,   // Genesis
  2: 1213,   // Exodus
  3: 859,    // Leviticus
  4: 1288,   // Numbers
  5: 959,    // Deuteronomy
  6: 658,    // Joshua
  7: 618,    // Judges
  8: 85,     // Ruth
  9: 810,    // 1 Samuel
  10: 695,   // 2 Samuel
  11: 816,   // 1 Kings
  12: 719,   // 2 Kings
  13: 942,   // 1 Chronicles
  14: 822,   // 2 Chronicles
  15: 280,   // Ezra
  16: 406,   // Nehemiah
  17: 167,   // Esther
  18: 1070,  // Job
  19: 2461,  // Psalms
  20: 915,   // Proverbs
  21: 222,   // Ecclesiastes
  22: 117,   // Song of Solomon
  23: 1292,  // Isaiah
  24: 1364,  // Jeremiah
  25: 154,   // Lamentations
  26: 1273,  // Ezekiel
  27: 357,   // Daniel
  28: 197,   // Hosea
  29: 73,    // Joel
  30: 146,   // Amos
  31: 21,    // Obadiah
  32: 48,    // Jonah
  33: 105,   // Micah
  34: 47,    // Nahum
  35: 56,    // Habakkuk
  36: 53,    // Zephaniah
  37: 38,    // Haggai
  38: 211,   // Zechariah
  39: 55,    // Malachi
  40: 1071,  // Matthew
  41: 678,   // Mark
  42: 1151,  // Luke
  43: 879,   // John
  44: 1006,  // Acts
  45: 433,   // Romans
  46: 437,   // 1 Corinthians
  47: 256,   // 2 Corinthians
  48: 149,   // Galatians
  49: 155,   // Ephesians
  50: 104,   // Philippians
  51: 95,    // Colossians
  52: 89,    // 1 Thessalonians
  53: 47,    // 2 Thessalonians
  54: 113,   // 1 Timothy
  55: 83,    // 2 Timothy
  56: 46,    // Titus
  57: 25,    // Philemon
  58: 303,   // Hebrews
  59: 108,   // James
  60: 105,   // 1 Peter
  61: 61,    // 2 Peter
  62: 105,   // 1 John
  63: 13,    // 2 John
  64: 14,    // 3 John
  65: 25,    // Jude
  66: 404    // Revelation
};

async function validateImport() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  try {
    console.log('Validating NASB1995 import...\n');
    
    // Get book names for reporting
    const books = await db.all('SELECT id, name FROM key_english ORDER BY id');
    const bookMap = {};
    books.forEach(book => {
      bookMap[book.id] = book.name;
    });

    // Check if table exists
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='t_nasb1995'"
    );

    if (!tableExists) {
      console.error('Error: t_nasb1995 table does not exist in the database.');
      return;
    }

    // Get actual verse counts by book
    const results = await db.all(`
      SELECT book, COUNT(*) as count 
      FROM t_nasb1995 
      GROUP BY book 
      ORDER BY book
    `);

    // Analyze results
    let totalExpected = 0;
    let totalActual = 0;
    let hasIssues = false;

    console.log('BOOK'.padEnd(20) + 'EXPECTED'.padStart(10) + 'ACTUAL'.padStart(10) + 'STATUS'.padStart(15));
    console.log('-'.repeat(55));

    for (const bookId in EXPECTED_VERSES) {
      const expected = EXPECTED_VERSES[bookId];
      const actual = results.find(r => r.book == bookId)?.count || 0;
      const status = expected === actual ? '✓' : `MISSING ${expected - actual}`;
      
      if (expected !== actual) {
        hasIssues = true;
      }

      totalExpected += expected;
      totalActual += actual;

      console.log(
        `${bookMap[bookId] || `Book ${bookId}`.padEnd(20)}` +
        `${expected.toString().padStart(10)}` +
        `${actual.toString().padStart(10)}` +
        `${status.padStart(15)}`
      );
    }

    console.log('\nTOTALS:');
    console.log(`Expected: ${totalExpected} verses`);
    console.log(`Actual:   ${totalActual} verses`);
    console.log(`Difference: ${totalExpected - totalActual} verses`);
    
    if (hasIssues) {
      console.log('\nWARNING: Some books have missing verses.');
      console.log('Check the output above for details.');
    } else {
      console.log('\nSUCCESS: All books have the expected number of verses!');
    }

    // Check for any books in the database that aren't in our expected list
    const extraBooks = results.filter(r => !(r.book in EXPECTED_VERSES));
    if (extraBooks.length > 0) {
      console.log('\nWARNING: Found unexpected books in the database:');
      extraBooks.forEach(b => {
        console.log(`- ${bookMap[b.book] || `Book ${b.book}`}: ${b.count} verses`);
      });
    }

  } catch (error) {
    console.error('Error during validation:', error);
  } finally {
    await db.close();
  }
}

// Run the validation
validateImport().catch(console.error);
