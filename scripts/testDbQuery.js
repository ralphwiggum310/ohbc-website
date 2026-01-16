const sqlite3 = require('better-sqlite3');
const path = require('path');

// Path to the database
const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
console.log(`Testing database at: ${dbPath}`);

// Connect to the database
const db = sqlite3(dbPath, { readonly: true, verbose: console.log });

// Test function to run queries
async function testQueries() {
  try {
    // 1. Check if database is accessible
    console.log('\n=== Testing database connection ===');
    const version = db.prepare('SELECT sqlite_version() as version').get();
    console.log('SQLite version:', version.version);

    // 2. List all tables
    console.log('\n=== Listing all tables ===');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    console.table(tables);

    // 3. Check key_english table
    console.log('\n=== Checking key_english table ===');
    const bookCount = db.prepare('SELECT COUNT(*) as count FROM key_english').get();
    console.log(`Total books in key_english: ${bookCount.count}`);
    
    // 4. Get sample books
    const sampleBooks = db.prepare('SELECT * FROM key_english LIMIT 5').all();
    console.log('Sample books:');
    console.table(sampleBooks);

    // 5. Check KJV table
    console.log('\n=== Checking KJV table ===');
    const kjvVerses = db.prepare(`
      SELECT v.*, b.name as book_name 
      FROM t_king_james_bible v
      JOIN key_english b ON b.id = v.book
      WHERE b.abbreviation = 'jhn' AND v.chapter = 3
      ORDER BY v.verse
      LIMIT 5
    `).all();
    
    console.log('Sample verses from John 3 (KJV):');
    console.table(kjvVerses);

  } catch (error) {
    console.error('Error running test queries:', error.message);
    if (error.code) console.error('Error code:', error.code);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Run the tests
testQueries();
