import sqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ORIGINAL_DB = path.join(__dirname, '../Bible api/bible.eng.backup.db');
const OPTIMIZED_DB = path.join(__dirname, '../Bible api/bible.eng.optimized.db');
const TABLES_TO_FIX = ['key_english', 'ChapterFootnote', 'ChapterAudioUrl'];

// Function to copy table data from source to target
function copyTableData(sourceDb, targetDb, tableName) {
  try {
    // Get table schema
    const tableInfo = sourceDb.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(tableName);
    if (!tableInfo) {
      console.log(`Table ${tableName} not found in source database`);
      return false;
    }
    
    // Drop and recreate table in target
    targetDb.prepare(`DROP TABLE IF EXISTS [${tableName}]`).run();
    targetDb.exec(tableInfo.sql);
    
    // Copy data
    const rows = sourceDb.prepare(`SELECT * FROM [${tableName}]`).all();
    if (rows.length === 0) {
      console.log(`No data to copy for table ${tableName}`);
      return true;
    }
    
    // Get column names
    const columns = Object.keys(rows[0]).map(col => `[${col}]`);
    const placeholders = columns.map(() => '?').join(',');
    const insertSql = `INSERT INTO [${tableName}] (${columns.join(',')}) VALUES (${placeholders})`;
    
    // Insert data in transaction
    const insert = targetDb.prepare(insertSql);
    const insertMany = targetDb.transaction((items) => {
      for (const item of items) insert.run(...Object.values(item));
    });
    
    insertMany(rows);
    console.log(`Copied ${rows.length} rows to ${tableName}`);
    return true;
    
  } catch (error) {
    console.error(`Error copying table ${tableName}:`, error.message);
    return false;
  }
}

// Main function
async function fixOptimizedDatabase() {
  console.log('Fixing optimized database...');
  
  // Check if databases exist
  if (!fs.existsSync(ORIGINAL_DB) || !fs.existsSync(OPTIMIZED_DB)) {
    console.error('Original or optimized database not found');
    return;
  }
  
  // Connect to databases
  const sourceDb = new sqlite3(ORIGINAL_DB, { readonly: true });
  const targetDb = new sqlite3(OPTIMIZED_DB);
  
  try {
    // Fix each table
    for (const table of TABLES_TO_FIX) {
      console.log(`\nFixing table: ${table}`);
      const success = copyTableData(sourceDb, targetDb, table);
      console.log(success ? '✅ Success' : '❌ Failed');
    }
    
    // Verify the fixes
    console.log('\nVerifying fixes...');
    for (const table of TABLES_TO_FIX) {
      try {
        const count = targetDb.prepare(`SELECT COUNT(*) as count FROM [${table}]`).get().count;
        console.log(`- ${table}: ${count} rows`);
      } catch (err) {
        console.error(`Error verifying ${table}:`, err.message);
      }
    }
    
    console.log('\n✅ Database fix completed');
    
  } catch (error) {
    console.error('Error during database fix:', error);
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

// Run the fix
fixOptimizedDatabase().catch(console.error);
