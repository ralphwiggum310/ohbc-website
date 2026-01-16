import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../Bible api/bible.eng.db');

async function checkDatabase() {
  try {
    console.log('Checking original database at:', DB_PATH);
    
    // Check if file exists
    if (!fs.existsSync(DB_PATH)) {
      console.error('Error: Database file not found');
      return;
    }
    
    // Open the database
    const db = new sqlite3(DB_PATH, { readonly: true });
    
    try {
      // Get database info
      console.log('\nDatabase Information:');
      console.log('---------------------');
      
      // Get SQLite version
      const version = db.prepare('SELECT sqlite_version() as version').get();
      console.log(`SQLite Version: ${version.version}`);
      
      // Get all tables
      const tables = db.prepare(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      ).all();
      
      console.log(`\nFound ${tables.length} tables in the database\n`);
      
      // List all tables with row counts
      console.log('Tables in database:');
      console.log('-------------------');
      
      const tableData = [];
      for (const {name} of tables) {
        try {
          const count = db.prepare(`SELECT COUNT(*) as count FROM "${name}"`).get().count;
          console.log(`${name.padEnd(30)}: ${count.toLocaleString().padStart(10)} rows`);
          tableData.push({ name, rowCount: count });
        } catch (err) {
          console.log(`${name.padEnd(30)}: ERROR - ${err.message}`);
        }
      }
      
      // Show tables with most rows
      console.log('\nLargest tables:');
      console.log('---------------');
      tableData
        .sort((a, b) => b.rowCount - a.rowCount)
        .slice(0, 10)
        .forEach(({name, rowCount}) => {
          console.log(`${name.padEnd(30)}: ${rowCount.toLocaleString().padStart(10)} rows`);
        });
      
      // Get database size
      const stats = db.prepare('PRAGMA page_count').get();
      const pageSize = db.prepare('PRAGMA page_size').get().page_size;
      const dbSizeMB = (stats.page_count * pageSize) / (1024 * 1024);
      
      console.log('\nDatabase Statistics:');
      console.log('-------------------');
      console.log(`Total tables: ${tables.length}`);
      console.log(`Approximate size: ${dbSizeMB.toFixed(2)} MB`);
      
    } finally {
      db.close();
    }
    
  } catch (error) {
    console.error('Error checking database:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.stack) console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the check
checkDatabase();
