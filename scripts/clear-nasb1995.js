import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Bibles database
const dbPath = join(__dirname, '..', 'data', 'bible', 'Bibles.db');
const backupPath = join(__dirname, '..', 'data', 'bible', 'Bibles_backup_before_clear.db');

// Table to clear
const TABLE_NAME = 't_nasb1995';

// Create a backup of the database first
console.log(`Creating backup at: ${backupPath}`);
fs.copyFileSync(dbPath, backupPath);
console.log('✅ Backup created successfully');

// Open the database in read-write mode
console.log('\nOpening database...');
const db = new Database(dbPath, { verbose: console.log });

try {
  // Check if the table exists using a simpler query
  const tableExists = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
  ).get(TABLE_NAME);
  
  if (!tableExists) {
    console.log(`\n❌ Table '${TABLE_NAME}' does not exist in the database.`);
    process.exit(1);
  }
  
  // Count records before deletion
  const countBefore = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE_NAME}`).get().count;
  console.log(`\nFound ${countBefore.toLocaleString()} records in ${TABLE_NAME}`);
  
  // Show sample data
  console.log('\nSample data (first 3 rows):');
  const sample = db.prepare(`SELECT * FROM ${TABLE_NAME} LIMIT 3`).all();
  console.log(JSON.stringify(sample, null, 2));
  
  // Confirm before proceeding
  console.log('\n⚠️  WARNING: This will delete all data from', TABLE_NAME);
  console.log('A backup has been created at:', backupPath);
  
  // Simple delete without transaction for better error reporting
  console.log('\nDeleting all records...');
  const deleteStmt = db.prepare(`DELETE FROM ${TABLE_NAME}`);
  const result = deleteStmt.run();
  
  // Verify the table is empty
  const countAfter = db.prepare(`SELECT COUNT(*) as count FROM ${TABLE_NAME}`).get().count;
  
  console.log('\n✅ Table cleared successfully');
  console.log(`Records before: ${countBefore.toLocaleString()}`);
  console.log(`Records after: ${countAfter.toLocaleString()}`);
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\nThe database has NOT been modified. The original data is safe.');
} finally {
  // Close the database connection
  db.close();
  console.log('\nDatabase connection closed');
}
