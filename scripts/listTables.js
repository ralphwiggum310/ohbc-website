const sqlite3 = require('better-sqlite3');
const path = require('path');

// Path to the SQLite database
const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
console.log(`Checking database at: ${dbPath}`);

// Connect to the database
const db = sqlite3(dbPath, { readonly: true });

try {
  // List all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  console.log('\nTables in database:');
  console.table(tables);
  
  // For each table, count rows and show a few columns
  for (const { name: tableName } of tables) {
    try {
      // Get column names
      const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
      const columnNames = columns.map(c => c.name);
      
      // Get row count
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
      
      console.log(`\nTable: ${tableName} (${count} rows)`);
      console.log('Columns:', columnNames.join(', '));
      
      // Show first few rows if table is not empty
      if (count > 0) {
        const sample = db.prepare(`SELECT * FROM ${tableName} LIMIT 3`).all();
        console.log('Sample rows:', JSON.stringify(sample, null, 2));
      }
    } catch (error) {
      console.error(`Error reading table ${tableName}:`, error.message);
    }
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
