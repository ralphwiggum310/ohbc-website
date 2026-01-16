const fs = require('fs');
const path = require('path');
const sqlite3 = require('better-sqlite3');

// Database path
const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error(`Error: Database file not found at ${dbPath}`);
  process.exit(1);
}

console.log(`Database found at: ${dbPath}`);
console.log(`File size: ${(fs.statSync(dbPath).size / (1024 * 1024)).toFixed(2)} MB`);

// Try to open the database
try {
  console.log('\n=== Database Integrity Check ===');
  
  // Try to open with WAL mode disabled first
  const db = sqlite3(dbPath, { readonly: true, fileMustExist: true });
  
  // Check if the database is valid
  console.log('\n=== Running PRAGMA integrity_check ===');
  const integrityCheck = db.prepare('PRAGMA integrity_check').all();
  console.log(integrityCheck);
  
  // Check WAL mode
  console.log('\n=== Database Journal Mode ===');
  const journalMode = db.prepare('PRAGMA journal_mode').get();
  console.log(journalMode);
  
  // List all tables
  console.log('\n=== Listing all tables ===');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  console.table(tables);
  
  // For each table, count rows
  console.log('\n=== Table Row Counts ===');
  const tableCounts = [];
  for (const {name} of tables) {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get().count;
      tableCounts.push({ table: name, rowCount: count });
    } catch (error) {
      tableCounts.push({ table: name, error: error.message });
    }
  }
  console.table(tableCounts);
  
  // Check if we can read any data
  console.log('\n=== Testing Data Access ===');
  
  // Try to read from key_english
  try {
    const books = db.prepare('SELECT * FROM key_english LIMIT 5').all();
    console.log('\nFirst 5 books:');
    console.table(books);
  } catch (error) {
    console.error('Error reading from key_english:', error.message);
  }
  
  // Try to find a known table with Bible data
  const bibleTables = tables.filter(t => t.name.startsWith('t_') && t.name !== 'tables');
  if (bibleTables.length > 0) {
    const testTable = bibleTables[0].name;
    console.log(`\nTesting data from ${testTable}:`);
    try {
      const sample = db.prepare(`SELECT * FROM ${testTable} LIMIT 5`).all();
      console.table(sample);
    } catch (error) {
      console.error(`Error reading from ${testTable}:`, error.message);
    }
  }
  
  db.close();
  
} catch (error) {
  console.error('\n=== DATABASE ERROR ===');
  console.error('Error accessing database:', error.message);
  console.error('Error code:', error.code);
  
  if (error.code === 'SQLITE_CORRUPT') {
    console.error('\nWARNING: The database appears to be corrupt!');
    console.error('Try running: sqlite3 'C:\WindSurf\ohbc_website\data\bible\bibles.db' ".recover" | sqlite3 "Bible api\\bibles_fixed.db"');
  }
}
