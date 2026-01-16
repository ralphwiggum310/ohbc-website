const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'bibles.db');

// Connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the bibles database');
  
  // Check if the NIV 2011 table exists
  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='t_niv2011'",
    (err, row) => {
      if (err) {
        console.error('Error checking for table:', err.message);
        return;
      }
      
      if (!row) {
        console.error('Error: t_niv2011 table not found in the database');
        return;
      }
      
      console.log('t_niv2011 table exists. Verifying data access...');
      
      // Test query to get verse counts by book
      const query = `
        SELECT book, COUNT(*) as verse_count
        FROM t_niv2011
        GROUP BY book
        ORDER BY book
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error querying verse counts:', err.message);
          return;
        }
        
        console.log('\nVerse counts by book in t_niv2011:');
        console.log('----------------------------------------');
        
        let totalVerses = 0;
        rows.forEach(row => {
          console.log(`Book ${row.book}: ${row.verse_count} verses`);
          totalVerses += row.verse_count;
        });
        
        console.log('----------------------------------------');
        console.log(`Total books: ${rows.length}`);
        console.log(`Total verses: ${totalVerses}`);
        
        // Test getting a specific verse
        console.log('\nTesting specific verse retrieval (John 3:16):');
        db.get(
          `SELECT book, chapter, verse, text 
           FROM t_niv2011 
           WHERE book = 43 AND chapter = 3 AND verse = 16`,
          (err, row) => {
            if (err) {
              console.error('Error retrieving verse:', err.message);
              return;
            }
            
            if (row) {
              console.log(`\nFound John 3:16 in t_niv2011:`);
              console.log(`Book: ${row.book}, Chapter: ${row.chapter}, Verse: ${row.verse}`);
              console.log(`Text: ${row.text}`);
            } else {
              console.log('John 3:16 not found in t_niv2011');
            }
            
            // Close the database connection
            db.close();
          }
        );
      });
    }
  );
});
