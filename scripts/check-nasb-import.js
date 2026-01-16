const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'bibles.db');

// Connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  
  console.log('Connected to the SQLite database.');
  
  // Check if the bible_verses table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='bible_verses'", (err, row) => {
    if (err) {
      console.error('Error checking for bible_verses table:', err.message);
      db.close();
      return;
    }
    
    if (!row) {
      console.error('Error: bible_verses table does not exist');
      db.close();
      return;
    }
    
    console.log('Found bible_verses table');
    
    // Check the schema of the bible_verses table
    db.all("PRAGMA table_info(bible_verses)", (err, columns) => {
      if (err) {
        console.error('Error getting table info:', err.message);
        db.close();
        return;
      }
      
      console.log('\nTable schema:');
      console.table(columns);
      
      // Check for NASB 1995 verses
      checkNasbVersions();
    });
  });
});

function checkNasbVersions() {
  // Count verses by version
  db.all(
    "SELECT version, COUNT(*) as count FROM bible_verses GROUP BY version",
    (err, rows) => {
      if (err) {
        console.error('Error counting verses by version:', err.message);
        db.close();
        return;
      }
      
      console.log('\nVerses by version:');
      console.table(rows);
      
      // Check for NASB 1995 specifically
      db.get(
        "SELECT COUNT(*) as count FROM bible_verses WHERE version = ?",
        ['nasb1995'],
        (err, row) => {
          if (err) {
            console.error('Error counting NASB 1995 verses:', err.message);
            db.close();
            return;
          }
          
          console.log(`\nFound ${row.count} NASB 1995 verses in the database`);
          
          // Get a sample of NASB 1995 verses
          if (row.count > 0) {
            console.log('\nSample NASB 1995 verses:');
            db.all(
              `SELECT book_id, chapter, verse, substr(text, 1, 50) || '...' as text_preview 
               FROM bible_verses 
               WHERE version = 'nasb1995' 
               ORDER BY RANDOM() LIMIT 5`,
              (err, verses) => {
                if (err) {
                  console.error('Error getting sample verses:', err.message);
                } else {
                  console.table(verses);
                }
                
                // Check if the version is in the BIBLE_VERSIONS array
                console.log('\nChecking if NASB 1995 is in BIBLE_VERSIONS...');
                const fs = require('fs');
                const bibleServicePath = path.join(__dirname, '..', 'src', 'services', 'bibleService.ts');
                
                fs.readFile(bibleServicePath, 'utf8', (err, data) => {
                  if (err) {
                    console.error('Error reading bibleService.ts:', err.message);
                    db.close();
                    return;
                  }
                  
                  // Check if 'nasb1995' is in the BIBLE_VERSIONS array
                  const hasNasb1995 = data.includes("id: 'nasb1995'");
                  console.log(`NASB 1995 found in BIBLE_VERSIONS: ${hasNasb1995 ? 'Yes' : 'No'}`);
                  
                  // Check if 'nasb' is in the BIBLE_VERSIONS array
                  const hasNasb = data.includes("id: 'nasb'");
                  console.log(`NASB found in BIBLE_VERSIONS: ${hasNasb ? 'Yes' : 'No'}`);
                  
                  db.close();
                });
              }
            );
          } else {
            db.close();
          }
        }
      );
    }
  );
}
