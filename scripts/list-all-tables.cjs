const sqlite3 = require('sqlite3').verbose();

// Database path
const dbPath = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';

// Create database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to database successfully!');
  
  // List all tables
  db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      db.close();
      return;
    }
    
    console.log(`\nFound ${tables.length} tables in the database:\n`);
    
    // Process each table
    let processed = 0;
    tables.forEach((table) => {
      console.log(`=== ${table.name} ===`);
      console.log('Schema:', table.sql || 'No schema information');
      
      // Get column info for this table
      db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
        if (err) {
          console.error(`  Error getting columns for ${table.name}:`, err.message);
        } else {
          console.log('  Columns:');
          columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
          });
        }
        
        // After processing all tables, close the database
        processed++;
        if (processed === tables.length) {
          db.close();
          console.log('\nDatabase connection closed.');
        }
      });
    });
  });
});
