const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Path to the SQLite database
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'bibles.db');

async function checkNASBData() {
  console.log('Checking NASB 1995 data in the database...');
  
  // Open the database
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    // Check if the table exists
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='bible_verses'"
    );

    if (!tableExists) {
      console.log('Error: bible_verses table does not exist');
      return;
    }

    // Check if we have any NASB 1995 data
    const count = await db.get(
      'SELECT COUNT(*) as count FROM bible_verses WHERE version = ?', 
      ['nasb1995']
    );

    console.log(`Found ${count.count} NASB 1995 verses in the database`);

    // Show some sample data if available
    if (count.count > 0) {
      console.log('\nSample NASB 1995 verses:');
      const sample = await db.all(
        'SELECT book_id, chapter, verse, substr(text, 1, 50) as text_start ' +
        'FROM bible_verses WHERE version = ? LIMIT 5', 
        ['nasb1995']
      );
      
      sample.forEach(row => {
        console.log(`Book ID: ${row.book_id}, Chapter: ${row.chapter}, ` +
                   `Verse: ${row.verse}, Text: ${row.text_start}...`);
      });
    } else {
      console.log('No NASB 1995 verses found in the database');
      
      // Show available versions
      const versions = await db.all(
        'SELECT version, COUNT(*) as count FROM bible_verses GROUP BY version'
      );
      
      if (versions.length > 0) {
        console.log('\nAvailable versions in the database:');
        versions.forEach(v => {
          console.log(`- ${v.version}: ${v.count} verses`);
        });
      } else {
        console.log('No verses found in the database');
      }
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await db.close();
  }
}

// Run the check
checkNASBData().catch(console.error);
