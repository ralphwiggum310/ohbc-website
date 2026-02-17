const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'bible', 'Bibles.db');
console.log('Auditing database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Database opened successfully');
});

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('Error getting tables:', err);
    return;
  }
  
  console.log('\n=== TABLES FOUND ===');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  
  // Check each table structure
  tables.forEach(table => {
    console.log(`\n=== STRUCTURE FOR ${table.name} ===`);
    try {
      const columns = db.all(`PRAGMA table_info(${table.name})`, [], (err, cols) => {
        if (err) {
          console.error(`Error getting columns for ${table.name}:`, err);
          return;
        }
        
        console.log('Columns:');
        cols.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
      });
    } catch (err) {
      console.error(`Error analyzing ${table.name}:`, err);
    }
  });
  
  // Get sample data from key tables
  const keyTables = ['bible_versions', 'bible_books', 'bible_verses'];
  
  keyTables.forEach(tableName => {
    console.log(`\n=== SAMPLE DATA FOR ${tableName} ===`);
    try {
      const sample = db.all(`SELECT * FROM ${tableName} LIMIT 3`, [], (err, rows) => {
        if (err) {
          console.error(`Error getting sample from ${tableName}:`, err);
          return;
        }
        
        console.log(`Sample rows (${rows.length}):`);
        rows.forEach((row, index) => {
          console.log(`  ${index + 1}:`, row);
        });
      });
    } catch (err) {
      console.error(`Error getting sample from ${tableName}:`, err);
    }
  });
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('\n=== AUDIT COMPLETE ===');
    }
  });
});
