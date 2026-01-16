const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database paths
const sourceDbPath = path.join(__dirname, '..', 'data', 'bible', 'NASB.sqlite');
const targetDbPath = path.join(__dirname, '..', 'data', 'bible', 'bible.db');

// Function to get table info
function getTableInfo(db, tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) {
        if (err.message.includes('no such table')) {
          console.log(`Table ${tableName} does not exist`);
          resolve(null);
        } else {
          reject(err);
        }
      } else {
        console.log(`\nStructure of ${tableName}:`);
        console.table(rows);
        resolve(rows);
      }
    });
  });
}

// Function to get row count
function getRowCount(db, tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
      if (err) {
        reject(err);
      } else {
        console.log(`\nRow count for ${tableName}:`, row.count);
        resolve(row.count);
      }
    });
  });
}

// Main function
async function inspectDatabases() {
  const sourceDb = new sqlite3.Database(sourceDbPath, sqlite3.OPEN_READONLY);
  const targetDb = new sqlite3.Database(targetDbPath);

  try {
    console.log('=== Source Database (NASB.sqlite) ===');
    // Get all tables in source
    const sourceTables = await new Promise((resolve, reject) => {
      sourceDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.name));
      });
    });

    console.log('Tables in source database:', sourceTables);

    // Get all tables in target
    const targetTables = await new Promise((resolve, reject) => {
      targetDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.name));
      });
    });

    console.log('\n=== Target Database (bible.db) ===');
    console.log('Tables in target database:', targetTables);

    // Check for t_nasb1995 in target
    const targetTable = 't_nasb1995';
    const targetTableExists = targetTables.includes(targetTable);
    
    console.log(`\n=== Checking ${targetTable} in target database ===`);
    if (targetTableExists) {
      await getTableInfo(targetDb, targetTable);
      await getRowCount(targetDb, targetTable);
    } else {
      console.log(`Table ${targetTable} does not exist in target database`);
    }

    // Check source table structure (assuming it's the first table)
    if (sourceTables.length > 0) {
      const sourceTable = sourceTables[0];
      console.log(`\n=== Checking source table: ${sourceTable} ===`);
      await getTableInfo(sourceDb, sourceTable);
      await getRowCount(sourceDb, sourceTable);
    }

  } catch (error) {
    console.error('Error inspecting databases:', error);
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

inspectDatabases().catch(console.error);
