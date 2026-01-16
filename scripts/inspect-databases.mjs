import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database paths
const sourceDbPath = path.join(__dirname, '..', 'data', 'bible', 'NASB.sqlite');
const targetDbPath = path.join(__dirname, '..', 'data', 'bible', 'bible.db');

// Function to get table info
async function getTableInfo(db, tableName) {
  try {
    const columns = await db.all(`PRAGMA table_info(${tableName})`);
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
async function getRowCount(db, tableName) {
  try {
    const result = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);
    console.log(`Row count for ${tableName}:`, result.count);
    return result.count;
  } catch (err) {
    console.error(`Error getting row count for ${tableName}:`, err.message);
    return -1;
  }
}

// Main function
async function inspectDatabases() {
  // Open source database
  const sourceDb = await open({
    filename: sourceDbPath,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY
  });

  // Open target database
  const targetDb = await open({
    filename: targetDbPath,
    driver: sqlite3.Database
  });

  try {
    console.log('=== Source Database (NASB.sqlite) ===');
    // Get all tables in source
    const sourceTables = await sourceDb.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    const sourceTableNames = sourceTables.map(t => t.name);
    console.log('Tables in source database:', sourceTableNames);

    // Get all tables in target
    const targetTables = await targetDb.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    const targetTableNames = targetTables.map(t => t.name);
    console.log('\n=== Target Database (bible.db) ===');
    console.log('Tables in target database:', targetTableNames);

    // Check for t_nasb1995 in target
    const targetTable = 't_nasb1995';
    const targetTableExists = targetTableNames.includes(targetTable);
    
    console.log(`\n=== Checking ${targetTable} in target database ===`);
    if (targetTableExists) {
      await getTableInfo(targetDb, targetTable);
      await getRowCount(targetDb, targetTable);
    } else {
      console.log(`Table ${targetTable} does not exist in target database`);
    }

    // Check source table structure (assuming it's the first table)
    if (sourceTableNames.length > 0) {
      const sourceTable = sourceTableNames[0];
      console.log(`\n=== Checking source table: ${sourceTable} ===`);
      await getTableInfo(sourceDb, sourceTable);
      await getRowCount(sourceDb, sourceTable);
    }

  } catch (error) {
    console.error('Error inspecting databases:', error);
  } finally {
    await sourceDb.close();
    await targetDb.close();
  }
}

// Run the inspection
inspectDatabases().catch(console.error);
