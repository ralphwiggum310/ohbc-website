const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';

// Promisified database methods
function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    console.log(`[SQL] ${sql}`, params);
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(`[ERROR] ${err.message}`);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

async function main() {
  console.log('Connecting to database...');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  
  try {
    // Check if bible_verses table exists
    console.log('\n=== Checking bible_verses table ===');
    const tableInfo = await dbAll(db, 
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='bible_verses'"
    );
    
    if (tableInfo.length === 0) {
      console.error('ERROR: bible_verses table does not exist!');
      return;
    }
    
    console.log('\nTable schema:');
    console.log(tableInfo[0].sql);
    
    // Get column info
    console.log('\nColumn information:');
    const columns = await dbAll(db, 'PRAGMA table_info(bible_verses)');
    console.table(columns);
    
    // Get row count
    const count = await dbAll(db, 'SELECT COUNT(*) as count FROM bible_verses');
    console.log('\nTotal verses:', count[0].count);
    
    // Get sample data
    console.log('\nSample data (first 5 rows):');
    const sample = await dbAll(db, 'SELECT * FROM bible_verses LIMIT 5');
    console.table(sample);
    
    // Check for any data in the table
    if (count[0].count === 0) {
      console.log('\nWARNING: bible_verses table is empty!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
    console.log('\nDatabase connection closed.');
  }
}

main().catch(console.error);
