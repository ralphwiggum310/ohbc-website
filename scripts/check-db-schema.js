const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database
const dbPath = path.join(__dirname, '..', 'Bible api', 'bible.eng.db');

// Open the database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the Bible database');
});

// Get all table names
db.all(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'idx_%'",
  [],
  (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      return;
    }
    
    console.log('Tables in the database:');
    tables.forEach((table) => {
      console.log(`\nTable: ${table.name}`);
      
      // Get table info
      db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
        if (err) {
          console.error(`Error getting columns for ${table.name}:`, err);
          return;
        }
        
        console.log('Columns:');
        columns.forEach((col) => {
          console.log(`  ${col.name} (${col.type})`);
        });
        
        // For the verses table, show a sample of the data
        if (table.name.toLowerCase().includes('verse')) {
          db.get(`SELECT * FROM ${table.name} LIMIT 1`, [], (err, row) => {
            if (err) return;
            console.log('\nSample row:');
            console.log(row);
          });
        }
      });
    });
  }
);

// Close the database connection when done
process.on('exit', () => {
  db.close();
});
