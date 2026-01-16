import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../Bible api/bible.eng.optimized.db');

async function verifyDatabase() {
  try {
    console.log('Verifying optimized database at:', DB_PATH);
    
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
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      ).all();
      
      console.log(`\nFound ${tables.length} tables in the database\n`);
      
      // For each table, get row count and sample data
      for (const {name, sql} of tables) {
        console.log(`\nTable: ${name}`);
        console.log(''.padEnd(40, '-'));
        
        try {
          // Get row count
          const countStmt = db.prepare(`SELECT COUNT(*) as count FROM "${name}"`);
          const count = countStmt.get().count;
          console.log(`Row count: ${count.toLocaleString()}`);
          
          // Show table schema
          console.log('Schema:');
          console.log(sql || 'No schema information available');
          
          // Show sample data for non-empty tables
          if (count > 0) {
            try {
              const sample = db.prepare(`SELECT * FROM "${name}" LIMIT 3`).all();
              console.log('\nSample data (first 3 rows):');
              console.table(sample);
            } catch (err) {
              console.error('  Error reading sample data:', err.message);
            }
          }
          
        } catch (err) {
          console.error(`  Error processing table ${name}:`, err.message);
        }
      }
      
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
    console.error('Error verifying database:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.stack) console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the verification
verifyDatabase();
