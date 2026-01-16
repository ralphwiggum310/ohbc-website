import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_PATH = path.join(__dirname, '../Bible api/bible.eng.db');
const BACKUP_PATH = path.join(__dirname, '../Bible api/bible.eng.backup.db');
const OPTIMIZED_DB_PATH = path.join(__dirname, '../Bible api/bible.eng.optimized.db');

// List of tables to KEEP (all others will be removed)
const TABLES_TO_KEEP = new Set([
  // Core structure tables
  'key_english',
  'Book',
  'Chapter',
  'ChapterVerse',
  'Translation',
  
  // Version-specific tables (keeping only the most important ones)
  't_king_james_bible',          // KJV
  't_american_standard_version', // ASV
  't_english_revised_version',   // ERV
  't_world_english_bible',       // WEB
  
  // Additional tables needed for functionality
  'ChapterFootnote',
  'ChapterAudioUrl',
  
  // Commentaries and references (reduced set)
  'Commentary',
  'CommentaryBook',
  'CommentaryChapter',
  'CommentaryChapterVerse',
  
  // Dataset information
  'Dataset',
  'DatasetBook',
  'DatasetChapter',
  'DatasetChapterVerse',
  'DatasetReference'
]);

// Create a backup of the database
async function backupDatabase() {
  try {
    console.log('Creating backup of database...');
    fs.copyFileSync(DB_PATH, BACKUP_PATH);
    console.log(`Backup created at: ${BACKUP_PATH}`);
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
}

// Optimize the database by keeping only the specified tables
async function optimizeDatabase() {
  console.log('Starting database optimization...');
  
  console.log('Creating optimized database...');
  
  // Import better-sqlite3 dynamically
  const sqlite3 = (await import('better-sqlite3')).default;
  
  // Connect to the source and target databases
  const sourceDb = new sqlite3(DB_PATH, { readonly: true });
  const targetDb = new sqlite3(TEMP_DB_PATH);
  
  // Enable WAL mode and set page size for better performance
  targetDb.pragma('journal_mode = WAL');
  targetDb.pragma('synchronous = NORMAL');
  targetDb.pragma('page_size = 4096');
  targetDb.pragma('temp_store = MEMORY');
  
  // Start a transaction for the entire process
  targetDb.exec('BEGIN TRANSACTION');
  
  try {
    // Get all tables from source database
    const tables = sourceDb.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all();
    
    console.log(`Found ${tables.length} tables in source database`);
    
    // Track which tables we're keeping
    const keptTables = [];
    const skippedTables = [];
    
    // First pass: Create tables
    console.log('\nCreating tables...');
    for (const { name: tableName, sql: createTableSql } of tables) {
      if (TABLES_TO_KEEP.has(tableName)) {
        console.log(`  Creating table: ${tableName}`);
        targetDb.exec(createTableSql);
      } else {
        skippedTables.push(tableName);
      }
    }
    
    // Second pass: Copy data in batches
    console.log('\nCopying table data...');
    for (const { name } of tables) {
      if (TABLES_TO_KEEP.has(name)) {
        console.log(`  Copying data for ${name}...`);
        
        // Get row count for progress reporting
        const rowCount = sourceDb.prepare(`SELECT COUNT(*) as count FROM [${name}]`).get().count;
        console.log(`    ${rowCount.toLocaleString()} rows to copy`);
        
        // Use a transaction for each table to ensure data consistency
        targetDb.transaction(() => {
          // Use a prepared statement for better performance
          const sourceStmt = sourceDb.prepare(`SELECT * FROM [${name}]`);
          const targetStmt = targetDb.prepare(`INSERT INTO [${name}] VALUES (${Array(sourceStmt.columns().length).fill('?').join(', ')})`);
          
          // Process in chunks to manage memory
          const chunkSize = 1000;
          let offset = 0;
          let rowsProcessed = 0;
          
          while (true) {
            const rows = sourceDb.prepare(
              `SELECT * FROM [${name}] LIMIT ? OFFSET ?`
            ).all(chunkSize, offset);
            
            if (rows.length === 0) break;
            
            // Insert rows in batches
            for (const row of rows) {
              targetStmt.run(...Object.values(row));
            }
            
            rowsProcessed += rows.length;
            offset += chunkSize;
            
            // Show progress
            if (rowCount > 0) {
              const percent = Math.round((rowsProcessed / rowCount) * 100);
              process.stdout.write(`\r    Progress: ${percent}% (${rowsProcessed.toLocaleString()}/${rowCount.toLocaleString()})`);
            }
          }
          
          if (rowCount > 0) console.log(); // New line after progress
          keptTables.push(name);
        })();
      } else {
        skippedTables.push(name);
      }
    }
    
        // Third pass: Create indexes after all data is inserted (faster)
      console.log('\nCreating indexes...');
      for (const { name } of tables) {
        if (TABLES_TO_KEEP.has(name)) {
          const indexes = sourceDb.prepare(
            `SELECT name, sql FROM sqlite_master 
             WHERE type='index' AND tbl_name=? AND sql IS NOT NULL`
          ).all(name);
          
          for (const { name: indexName, sql: createIndexSql } of indexes) {
            if (createIndexSql) {
              console.log(`  Creating index: ${indexName}`);
              try {
                targetDb.exec(createIndexSql);
              } catch (err) {
                console.error(`    Error creating index ${indexName}:`, err.message);
              }
            }
          }
        }
      }
      
      // Commit the transaction
      targetDb.prepare('COMMIT').run();
      
      // Show optimization summary
      console.log('\n\n' + '='.repeat(80));
      console.log('DATABASE OPTIMIZATION COMPLETE');
      console.log('='.repeat(80));
      
      // Get file sizes
      const originalSize = fs.statSync(DB_PATH).size;
      const optimizedSize = fs.statSync(OPTIMIZED_DB_PATH).size;
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
      
      // Show summary
      console.log('\nSUMMARY');
      console.log('-------');
      console.log(`Original database: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`Optimized database: ${(optimizedSize / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`Reduction: ${reduction}%`);
      
      console.log(`\nTables kept: ${keptTables.length}`);
      console.log('Tables removed:', skippedTables.length);
      
      // Show next steps
      console.log('\nNEXT STEPS');
      console.log('----------');
      console.log('1. A backup of your original database has been created at:');
      console.log(`   ${BACKUP_PATH}`);
      console.log('\n2. To complete the optimization, you need to:');
      console.log('   a. Delete the original database:');
      console.log(`      ${DB_PATH}`);
      console.log('   b. Rename the optimized database:');
      console.log(`      ${OPTIMIZED_DB_PATH} -> ${DB_PATH}`);
      console.log('\n3. After replacing the database, verify the application works correctly.');
      
      console.log('\n' + '='.repeat(80));
      
    } catch (error) {
      // Rollback on error
      targetDb.exec('ROLLBACK');
      console.error('Error during database optimization:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Error during database optimization:', error);
    process.exit(1);
  } finally {
    // Close database connections
    if (sourceDb) sourceDb.close();
    if (targetDb) targetDb.close();
  }
}

// Main function
async function main() {
  console.log('Bible Database Optimization Tool');
  console.log('================================');
  
  // Check if the database exists
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Error: Database not found at ${DB_PATH}`);
    process.exit(1);
  }
  
  // Check if optimized file already exists
  if (fs.existsSync(OPTIMIZED_DB_PATH)) {
    console.error(`Error: Optimized database already exists at ${OPTIMIZED_DB_PATH}`);
    console.error('Please delete or move this file before running the optimizer.');
    process.exit(1);
  }
  
  // Create a backup first
  if (!backupDatabase()) {
    console.error('Aborting: Could not create backup of the database.');
    process.exit(1);
  }
  
  try {
    // Perform the optimization
    await optimizeDatabase();
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
