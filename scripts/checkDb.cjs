const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Path to the database
const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
console.log(`Checking database at: ${dbPath}`);

// Check if file exists
if (!fs.existsSync(dbPath)) {
  console.error('Error: Database file not found at', dbPath);
  process.exit(1);
}

console.log('Database file exists. Size:', (fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2), 'MB');

try {
  // Try to open the database
  console.log('\nOpening database...');
  const db = sqlite3(dbPath, { readonly: true });
  
  // Test connection
  console.log('\nDatabase connection successful!');
  console.log('SQLite version:', db.prepare('SELECT sqlite_version() as version').get().version);
  
  // List all tables
  console.log('\nListing all tables:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  
  if (tables.length === 0) {
    console.log('No tables found in the database!');
  } else {
    console.log(`Found ${tables.length} tables:`);
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
    });
    
    // Show structure of key_english table if it exists
    const keyEnglish = tables.find(t => t.name === 'key_english');
    if (keyEnglish) {
      console.log('\nStructure of key_english table:');
      const columns = db.prepare('PRAGMA table_info(key_english)').all();
      console.table(columns);
      
      // Show first 3 rows
      console.log('\nFirst 3 rows from key_english:');
      const rows = db.prepare('SELECT * FROM key_english LIMIT 3').all();
      console.table(rows);
    }
    
    // Show first Bible version table if any exist
    const versionTable = tables.find(t => t.name.startsWith('t_'));
    if (versionTable) {
      console.log(`\nStructure of ${versionTable.name} table:`);
      const columns = db.prepare(`PRAGMA table_info(${versionTable.name})`).all();
      console.table(columns);
      
      // Show first 3 rows
      console.log(`\nFirst 3 rows from ${versionTable.name}:`);
      const rows = db.prepare(`SELECT * FROM ${versionTable.name} LIMIT 3`).all();
      console.table(rows);
    }
  }
  
  db.close();
  
} catch (error) {
  console.error('\nError:', error.message);
  if (error.code) console.error('Error code:', error.code);
}
