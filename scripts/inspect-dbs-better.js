const Database = require('better-sqlite3');
const path = require('path');

// Database paths
const sourceDbPath = path.join(__dirname, '..', 'data', 'bible', 'NASB.sqlite');
const targetDbPath = path.join(__dirname, '..', 'data', 'bible', 'bible.db');

// Open databases
const sourceDb = new Database(sourceDbPath, { readonly: true });
const targetDb = new Database(targetDbPath, { readonly: true });

// Function to get table info
function getTableInfo(db, tableName) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    console.log(`\nStructure of ${tableName}:`);
    console.table(columns);
    return columns;
  } catch (err) {
    if (err.message.includes('no such table')) {
      console.log(`Table ${tableName} does not exist`);
      return null;
    }
    throw err;
  }
}

// Function to get row count
function getRowCount(db, tableName) {
  try {
    const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
    console.log(`Row count for ${tableName}:`, result.count);
    return result.count;
  } catch (err) {
    console.error(`Error getting row count for ${tableName}:`, err.message);
    return -1;
  }
}

// Function to get all tables
function getTables(db) {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  return tables.map(t => t.name);
}

// Main function
function inspectDatabases() {
  try {
    console.log('=== Source Database (NASB.sqlite) ===');
    // Get all tables in source
    const sourceTables = getTables(sourceDb);
    console.log('Tables in source database:', sourceTables);

    // Get all tables in target
    const targetTables = getTables(targetDb);
    console.log('\n=== Target Database (bible.db) ===');
    console.log('Tables in target database:', targetTables);

    // Check for t_nasb1995 in target
    const targetTable = 't_nasb1995';
    const targetTableExists = targetTables.includes(targetTable);
    
    console.log(`\n=== Checking ${targetTable} in target database ===`);
    if (targetTableExists) {
      getTableInfo(targetDb, targetTable);
      getRowCount(targetDb, targetTable);
    } else {
      console.log(`Table ${targetTable} does not exist in target database`);
    }

    // Check source table structure (assuming it's the first table)
    if (sourceTables.length > 0) {
      const sourceTable = sourceTables[0];
      console.log(`\n=== Checking source table: ${sourceTable} ===`);
      getTableInfo(sourceDb, sourceTable);
      getRowCount(sourceDb, sourceTable);
    }

  } catch (error) {
    console.error('Error inspecting databases:', error);
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

// Run the inspection
inspectDatabases();
