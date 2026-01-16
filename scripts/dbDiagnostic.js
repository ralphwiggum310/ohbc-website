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

// Connect to database
const db = sqlite3(dbPath, { readonly: true, fileMustExist: true });

// Function to run a query and return results
function runQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error(`Error running query: ${sql}`, error.message);
    return [];
  }
}

// Get all tables
console.log('\n=== Database Tables ===');
const tables = runQuery("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
console.table(tables);

// Check key_english table
console.log('\n=== Key English Table ===');
const keyEnglishCols = runQuery("PRAGMA table_info(key_english)");
console.log('Columns in key_english:');
console.table(keyEnglishCols);

// Check for Bible version tables
console.log('\n=== Bible Version Tables ===');
const versionTables = tables
  .map(t => t.name)
  .filter(name => name.startsWith('t_') && name !== 'tables');

console.log('Found version tables:', versionTables.join(', '));

// For each version table, check structure and sample data
for (const table of versionTables) {
  console.log(`\n=== Table: ${table} ===`);
  
  // Get column info
  const columns = runQuery(`PRAGMA table_info(${table})`);
  console.log('Columns:');
  console.table(columns);
  
  // Get row count
  const count = runQuery(`SELECT COUNT(*) as count FROM ${table}`)[0].count;
  console.log(`Total rows: ${count}`);
  
  // Get sample data
  if (count > 0) {
    const sample = runQuery(`SELECT * FROM ${table} LIMIT 1`)[0];
    console.log('Sample row:', sample);
  }
}

// Check if we can find John 3:16 in any table
console.log('\n=== Searching for John 3:16 ===');
for (const table of versionTables) {
  try {
    const result = runQuery(
      `SELECT * FROM ${table} WHERE book = 43 AND chapter = 3 AND verse = 16`
    );
    
    if (result.length > 0) {
      console.log(`Found in ${table}:`, result[0]);
    }
  } catch (error) {
    // Ignore errors for tables that don't match the expected schema
  }
}

// Close database
db.close();
console.log('\nDiagnostic complete.');
