import sqlite3 from 'better-sqlite3';

// Path to the optimized database
const DB_PATH = '../Bible api/bible.eng.optimized.db';

// Connect to the optimized database
const db = new sqlite3(DB_PATH, { readonly: true });

try {
  // Get all tables
  const tables = db.prepare(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all();
  
  console.log('Tables in optimized database:');
  console.log('----------------------------');
  
  // List all tables and their row counts
  for (const {name} of tables) {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM [${name}]`).get().count;
      console.log(`${name}: ${count.toLocaleString()} rows`);
    } catch (err) {
      console.log(`${name}: Error getting row count (${err.message})`);
    }
  }
  
  // Show database size
  const stats = db.prepare('PRAGMA page_count * PRAGMA page_size').get();
  const sizeInMB = (stats['page_count * PRAGMA page_size'] / (1024 * 1024)).toFixed(2);
  
  console.log('\nDatabase Statistics:');
  console.log('-------------------');
  console.log(`Total tables: ${tables.length}`);
  console.log(`Database size: ${sizeInMB} MB`);
  
} catch (error) {
  console.error('Error checking optimized database:', error.message);
} finally {
  db.close();
}
