const sqlite3 = require('better-sqlite3');
const path = require('path');

// Path to the SQLite database
const dbPath = path.join(process.cwd(), 'bibles.db');
console.log(`Checking database at: ${dbPath}`);

// Connect to the database
const db = sqlite3(dbPath, { readonly: true });

// Check if the database is accessible
try {
  // Check if the database has the expected tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  console.log('\nTables in database:');
  console.table(tables);

  // Check the key_english table
  console.log('\nSample from key_english:');
  const books = db.prepare('SELECT * FROM key_english LIMIT 5').all();
  console.table(books);

  // Check the KJV table structure
  console.log('\nSample from KJV table (t_king_james_bible):');
  const kjvSample = db.prepare('SELECT * FROM t_king_james_bible WHERE book = 43 LIMIT 5').all(); // John is book 43
  console.table(kjvSample);

  // Verify we can find John 3:16
  console.log('\nLooking for John 3:16 in KJV:');
  const john316 = db.prepare(`
    SELECT v.*, b.name as book_name 
    FROM t_king_james_bible v
    JOIN key_english b ON b.id = v.book
    WHERE b.abbreviation = 'jhn' AND v.chapter = 3 AND v.verse = 16
  `).get();
  
  if (john316) {
    console.log('Found John 3:16:', john316);
  } else {
    console.log('John 3:16 not found. Checking if book exists...');
    const johnBook = db.prepare(`
      SELECT * FROM key_english 
      WHERE abbreviation = 'jhn' OR name LIKE '%John%' OR name LIKE '%JOHN%'
    `).all();
    console.log('Matching books:', johnBook);
  }

  // Check the first few verses of John 3
  console.log('\nFirst 5 verses of John 3:');
  const john3 = db.prepare(`
    SELECT v.*, b.name as book_name 
    FROM t_king_james_bible v
    JOIN key_english b ON b.id = v.book
    WHERE b.abbreviation = 'jhn' AND v.chapter = 3
    ORDER BY v.verse
    LIMIT 5
  `).all();
  console.table(john3);

} catch (error) {
  console.error('Error accessing database:', error.message);
  if (error.code === 'SQLITE_CANTOPEN') {
    console.error('Could not open the database file. Make sure the file exists and is accessible.');
  } else if (error.message.includes('no such table')) {
    console.error('A required table is missing from the database.');
  }
} finally {
  db.close();
}
