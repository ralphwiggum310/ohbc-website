import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database paths
const sourceDbPath = path.join(process.cwd(), 'Bible api', 'bible.eng.db');
const targetDbPath = path.join(process.cwd(), 'Bible api', 'bible.eng.optimized.db');

// Tables to copy (starting with 't_')
const tablesToCopy = [
  't_king_james_bible',
  't_american_standard_version',
  't_english_revised_version',
  't_world_english_bible'
];

console.log('Source database:', sourceDbPath);
console.log('Target database:', targetDbPath);

// Connect to both databases
const sourceDb = sqlite3(sourceDbPath, { readonly: true });
const targetDb = sqlite3(targetDbPath);

// Enable WAL mode for better concurrency
targetDb.pragma('journal_mode = WAL');

// Create a transaction for better performance
const transaction = targetDb.transaction(() => {
  for (const table of tablesToCopy) {
    try {
      console.log(`\nProcessing table: ${table}`);
      
      // Check if table exists in source
      const tableExists = sourceDb.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name = ?"
      ).get(table);
      
      if (!tableExists) {
        console.log(`  ❌ Table not found in source database: ${table}`);
        continue;
      }
      
      // Drop the table if it exists in the target
      console.log(`  Dropping existing table if it exists...`);
      targetDb.prepare(`DROP TABLE IF EXISTS ${table}`).run();
      
      // Get the table schema from source
      const createTableSql = sourceDb.prepare(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name = ?`
      ).get(table).sql;
      
      // Create the table in target
      console.log(`  Creating table...`);
      targetDb.prepare(createTableSql).run();
      
      // Copy the data
      console.log(`  Copying data...`);
      const rows = sourceDb.prepare(`SELECT * FROM ${table}`).all();
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const insert = targetDb.prepare(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
        );
        
        // Insert rows in batches for better performance
        const batchSize = 1000;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          targetDb.transaction(() => {
            for (const row of batch) {
              insert.run(...columns.map(col => row[col]));
            }
          })();
          process.stdout.write(`\r  Copied ${Math.min(i + batch.length, rows.length)} of ${rows.length} rows...`);
        }
        console.log(' Done!');
      } else {
        console.log('  No data to copy.');
      }
      
      console.log(`  ✅ Successfully copied ${table}`);
      
    } catch (error) {
      console.error(`  ❌ Error copying table ${table}:`, error.message);
    }
  }
});

// Run the transaction
try {
  console.log('\nStarting table copy process...');
  transaction();
  console.log('\n✅ All tables copied successfully!');
} catch (error) {
  console.error('❌ Error during table copy:', error.message);
} finally {
  // Close database connections
  sourceDb.close();
  targetDb.close();
  console.log('Database connections closed.');
}
