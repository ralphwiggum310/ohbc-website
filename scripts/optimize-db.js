import sqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_PATH = path.join(__dirname, '../Bible api/bible.eng.db');
const BACKUP_PATH = path.join(__dirname, '../Bible api/bible.eng.backup.db');
const OPTIMIZED_DB_PATH = path.join(__dirname, '../Bible api/bible.eng.optimized.db');

// List of tables to KEEP
const TABLES_TO_KEEP = [
  // Core structure
  'key_english',
  'Book',
  'Chapter', 
  'ChapterVerse',
  'Translation',
  
  // Version-specific tables
  't_king_james_bible',          // KJV
  't_american_standard_version', // ASV
  't_english_revised_version',   // ERV
  't_world_english_bible',       // WEB
  
  // Additional data
  'ChapterFootnote',
  'ChapterAudioUrl'
];

// Create a backup of the database
function backupDatabase() {
  console.log('Creating backup of database...');
  try {
    if (fs.existsSync(BACKUP_PATH)) {
      fs.unlinkSync(BACKUP_PATH);
    }
    fs.copyFileSync(DB_PATH, BACKUP_PATH);
    console.log(`Backup created at: ${BACKUP_PATH}`);
    return true;
  } catch (error) {
    console.error('Error creating backup:', error.message);
    return false;
  }
}

// Optimize the database
async function optimizeDatabase() {
  console.log('Starting database optimization...');
  
  // Create backup first
  if (!backupDatabase()) {
    console.error('Failed to create backup. Aborting optimization.');
    return;
  }
  
  // Connect to source and target databases
  const sourceDb = new sqlite3(DB_PATH, { readonly: true });
  const targetDb = new sqlite3(OPTIMIZED_DB_PATH);
  
  try {
    // Set up target database
    targetDb.pragma('journal_mode = WAL');
    targetDb.pragma('synchronous = NORMAL');
    targetDb.pragma('page_size = 4096');
    targetDb.pragma('temp_store = MEMORY');
    
    // Get all tables from source
    const tables = sourceDb.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all();
    
    console.log(`\nFound ${tables.length} tables in source database`);
    
    // Process tables
    for (const {name, sql} of tables) {
      if (TABLES_TO_KEEP.includes(name)) {
        console.log(`\nProcessing table: ${name}`);
        
        // Drop table if it exists in target
        targetDb.prepare(`DROP TABLE IF EXISTS [${name}]`).run();
        
        // Create table in target
        targetDb.exec(sql);
        
        // Copy data
        const rowCount = sourceDb.prepare(`SELECT COUNT(*) as count FROM [${name}]`).get().count;
        console.log(`  Copying ${rowCount} rows...`);
        
        // Process in chunks to handle large tables
        const chunkSize = 1000;
        let offset = 0;
        let rowsProcessed = 0;
        
        while (true) {
          const rows = sourceDb.prepare(
            `SELECT * FROM [${name}] LIMIT ? OFFSET ?`
          ).all(chunkSize, offset);
          
          if (rows.length === 0) break;
          
          // Get column names and properly escape them
          const columns = Object.keys(rows[0]).map(col => `[${col}]`);
          const placeholders = columns.map(() => '?').join(', ');
          const columnList = `(${columns.join(', ')})`;
          
          // Create a transaction for each chunk
          targetDb.transaction(() => {
            const stmt = targetDb.prepare(
              `INSERT INTO [${name}] ${columnList} VALUES (${placeholders})`
            );
            
            for (const row of rows) {
              try {
                stmt.run(...Object.values(row));
              } catch (err) {
                console.error(`Error inserting row:`, err.message);
                console.error('Row data:', row);
                throw err;
              }
            }
          })();
          
          offset += chunkSize;
          rowsProcessed += rows.length;
          
          // Show progress
          if (rowCount > 0) {
            const percent = Math.round((rowsProcessed / rowCount) * 100);
            process.stdout.write(`\r  Progress: ${percent}% (${rowsProcessed.toLocaleString()}/${rowCount.toLocaleString()})`);
          }
        }
        
        if (rowCount > 0) console.log(); // New line after progress
        
        // Copy indexes
        const indexes = sourceDb.prepare(
          `SELECT name, sql FROM sqlite_master 
           WHERE type='index' AND tbl_name=? AND sql IS NOT NULL`
        ).all(name);
        
        for (const {sql: indexSql} of indexes) {
          try {
            targetDb.exec(indexSql);
          } catch (err) {
            console.error(`  Error creating index:`, err.message);
          }
        }
      }
    }
    
    // Show optimization summary
    const originalSize = fs.statSync(DB_PATH).size;
    const optimizedSize = fs.statSync(OPTIMIZED_DB_PATH).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE OPTIMIZATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Original size: ${(originalSize / (1024 * 1024).toFixed(2))} MB`);
    console.log(`Optimized size: ${(optimizedSize / (1024 * 1024).toFixed(2))} MB`);
    console.log(`Reduction: ${reduction}%`);
    
    console.log('\nNext steps:');
    console.log(`1. Backup your current database (already done at ${BACKUP_PATH})`);
    console.log(`2. Replace the original database with the optimized one:`);
    console.log(`   - Delete: ${DB_PATH}`);
    console.log(`   - Rename: ${OPTIMIZED_DB_PATH} -> ${DB_PATH}`);
    
  } catch (error) {
    console.error('Error during optimization:', error.message);
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

// Run the optimization
optimizeDatabase().catch(console.error);
