const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

// Database path
const dbPath = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';

// Promisified database methods
function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    console.log(`[SQL] Executing: ${sql}`, params);
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(`[SQL ERROR] ${err.message}`, { sql, params });
        reject(err);
      } else {
        console.log(`[SQL] Returned ${rows ? rows.length : 0} rows`);
        resolve(rows || []);
      }
    });
  });
}

async function main() {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, async (err) => {
    if (err) {
      console.error('Error opening database:', err);
      process.exit(1);
    }

    console.log('Connected to database successfully!');
    
    try {
      // List all tables
      console.log('\n=== All Tables ===');
      const tables = await dbAll(db, "SELECT name, sql FROM sqlite_master WHERE type='table'");
      
      for (const table of tables) {
        console.log(`\n=== Table: ${table.name} ===`);
        console.log('Schema:', table.sql || 'No schema information');
        
        // Show columns
        const columns = await dbAll(db, `PRAGMA table_info(${table.name})`);
        console.log('Columns:');
        console.table(columns);
        
        // Show row count
        const count = await dbAll(db, `SELECT COUNT(*) as count FROM ${table.name}`);
        console.log(`Row count: ${count[0].count}`);
        
        // Show sample data for bible_verses table
        if (table.name === 'bible_verses' || table.name === 'bible_verses') {
          console.log('\nSample data (first 5 rows):');
          const sample = await dbAll(db, `SELECT * FROM ${table.name} LIMIT 5`);
          console.table(sample);
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      db.close((err) => {
        if (err) console.error('Error closing database:', err);
        console.log('\nDatabase connection closed.');
      });
    }
  });
}

main().catch(console.error);
