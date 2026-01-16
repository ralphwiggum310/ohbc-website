const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join('C:', 'WindSurf', 'ohbc_website', 'data', 'bible', 'bibles.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// List all tables in the database
db.all(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
  [],
  (err, tables) => {
    if (err) {
      console.error('Error fetching tables:', err);
      return;
    }
    
    console.log('\nTables in the database:');
    tables.forEach((table) => {
      console.log(`- ${table.name}`);
      
      // Get table schema
      db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
        if (err) {
          console.error(`  Error getting schema for ${table.name}:`, err.message);
          return;
        }
        
        console.log(`  Columns in ${table.name}:`);
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
        
        // For version tables, get a sample of the data
        if (table.name.startsWith('t_')) {
          db.get(`SELECT * FROM ${table.name} LIMIT 1`, (err, row) => {
            if (!err && row) {
              console.log(`  Sample row from ${table.name}:`, row);
            }
          });
        }
      });
    });
  }
);

// Close the database connection when done
setTimeout(() => {
  db.close();
  console.log('\nDatabase connection closed.');
}, 2000);
