const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'Bible api', 'bible.eng.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database');
});

// List all tables
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, tables) => {
  if (err) {
    console.error('Error getting tables:', err);
    db.close();
    return;
  }
  
  console.log('Tables:');
  tables.forEach((table) => {
    console.log(`- ${table.name}`);
    
    // For each table, show the first row
    db.get(`SELECT * FROM ${table.name} LIMIT 1`, (err, row) => {
      if (!err && row) {
        console.log(`  Sample row:`, JSON.stringify(row, null, 2));
      }
    });
  });
  
  // Close the database connection after a short delay
  setTimeout(() => db.close(), 1000);
});
