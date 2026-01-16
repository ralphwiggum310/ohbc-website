import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testNASBQuery() {
  const dbPath = path.join(__dirname, '..', 'data', 'bible', 'bibles.db');
  console.log(`\n🔍 Testing NASB 1995 data in: ${dbPath}`);

  try {
    // Open the database
    const db = new sqlite3(dbPath, { readonly: true });
    console.log('✅ Database connection successful');

    // 1. Check if the table exists
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='t_nasb1995'"
    ).get();

    if (!tableExists) {
      throw new Error("❌ Table 't_nasb1995' not found in the database");
    }
    console.log("✅ Table 't_nasb1995' exists");

    // 2. Get total verse count
    const totalVerses = db.prepare('SELECT COUNT(*) as count FROM t_nasb1995').get().count;
    console.log(`📊 Total verses: ${totalVerses.toLocaleString()}`);

    // 3. Get book count
    const bookCount = db.prepare('SELECT COUNT(DISTINCT book) as count FROM t_nasb1995').get().count;
    console.log(`📚 Number of books: ${bookCount}`);

    // 4. Test sample verses
    const testVerses = [
      { book: 1, chapter: 1, verse: 1, ref: 'Genesis 1:1' },
      { book: 23, chapter: 53, verse: 5, ref: 'Isaiah 53:5' },
      { book: 40, chapter: 1, verse: 23, ref: 'Matthew 1:23' },
      { book: 43, chapter: 3, verse: 16, ref: 'John 3:16' },
      { book: 66, chapter: 22, verse: 21, ref: 'Revelation 22:21' }
    ];

    console.log('\n🔎 Sample verses:');
    for (const { book, chapter, verse, ref } of testVerses) {
      const verseData = db.prepare(`
        SELECT * FROM t_nasb1995 
        WHERE book = ? AND chapter = ? AND verse = ?
      `).get(book, chapter, verse);

      if (verseData) {
        console.log(`\n${ref}:`);
        console.log(`  Book: ${verseData.book}, Chapter: ${verseData.chapter}, Verse: ${verseData.verse}`);
        console.log(`  Text: ${verseData.text.substring(0, 80)}${verseData.text.length > 80 ? '...' : ''}`);
      } else {
        console.log(`\n❌ ${ref} not found`);
      }
    }

    // 5. Check for missing data
    console.log('\n🔍 Checking for missing data...');
    const missingData = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN book IS NULL OR book = 0 THEN 1 ELSE 0 END) as missing_book,
        SUM(CASE WHEN chapter IS NULL OR chapter = 0 THEN 1 ELSE 0 END) as missing_chapter,
        SUM(CASE WHEN verse IS NULL OR verse = 0 THEN 1 ELSE 0 END) as missing_verse,
        SUM(CASE WHEN text IS NULL OR text = '' THEN 1 ELSE 0 END) as missing_text
      FROM t_nasb1995
    `).get();

    console.log('Data quality check:');
    console.log(`- Missing book numbers: ${missingData.missing_book}`);
    console.log(`- Missing chapter numbers: ${missingData.missing_chapter}`);
    console.log(`- Missing verse numbers: ${missingData.missing_verse}`);
    console.log(`- Missing verse text: ${missingData.missing_text}`);

    if (missingData.missing_book > 0 || missingData.missing_chapter > 0 || 
        missingData.missing_verse > 0 || missingData.missing_text > 0) {
      console.warn('⚠️  Warning: Missing data detected');
    } else {
      console.log('✅ No missing data found');
    }

    // 6. Check first and last verses
    console.log('\n📖 First and last verses:');
    const firstVerse = db.prepare('SELECT * FROM t_nasb1995 ORDER BY book, chapter, verse LIMIT 1').get();
    const lastVerse = db.prepare('SELECT * FROM t_nasb1995 ORDER BY book DESC, chapter DESC, verse DESC LIMIT 1').get();

    if (firstVerse) {
      console.log(`\nFirst verse (Genesis 1:1):`);
      console.log(`  ${firstVerse.text.substring(0, 100)}...`);
    }

    if (lastVerse) {
      console.log(`\nLast verse (Revelation 22:21):`);
      console.log(`  ${lastVerse.text}`);
    }

    console.log('\n✅ NASB 1995 data verification complete!');

  } catch (error) {
    console.error('❌ Error testing NASB data:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
try {
  await testNASBQuery();
} catch (error) {
  console.error('Error in main execution:', error);
  process.exit(1);
}
