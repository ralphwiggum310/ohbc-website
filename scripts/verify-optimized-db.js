import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the optimized database
const DB_PATH = path.join(__dirname, '../Bible api/bible.eng.optimized.db');

// Expected minimum row counts for key tables
const EXPECTED_ROW_COUNTS = {
  'key_english': 60,
  'Book': 2600,
  'Chapter': 40000,
  'ChapterVerse': 1000000,
  'ChapterFootnote': 100000,
  'ChapterAudioUrl': 3000,
  'Translation': 40
};

// Connect to the database
const db = new sqlite3(DB_PATH, { readonly: true });

try {
  console.log('Verifying optimized database...\n');
  
  // Get all tables
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all().map(t => t.name);
  
  console.log('Table Verification:');
  console.log('------------------');
  
  let allChecksPassed = true;
  
  // Check each expected table
  for (const [table, minRows] of Object.entries(EXPECTED_ROW_COUNTS)) {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM [${table}]`).get().count;
      const status = count >= minRows ? '✅' : '❌';
      console.log(`${status} ${table.padEnd(20)}: ${count.toLocaleString().padStart(8)} rows`);
      
      if (count < minRows) {
        allChecksPassed = false;
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(20)}: Error (${err.message})`);
      allChecksPassed = false;
    }
  }
  
  // Check for any unexpected tables
  const unexpectedTables = tables.filter(t => !(t in EXPECTED_ROW_COUNTS));
  if (unexpectedTables.length > 0) {
    console.log('\nUnexpected Tables:');
    console.log('------------------');
    for (const table of unexpectedTables) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM [${table}]`).get().count;
      console.log(`ℹ️  ${table.padEnd(20)}: ${count.toLocaleString().padStart(8)} rows`);
    }
  }
  
  // Show database size
  const stats = db.prepare('PRAGMA page_count; PRAGMA page_size').raw().all();
  const pageCount = stats[0][0];
  const pageSize = stats[1][0];
  const sizeInMB = (pageCount * pageSize) / (1024 * 1024);
  
  console.log('\nDatabase Statistics:');
  console.log('------------------');
  console.log(`Total tables: ${tables.length}`);
  console.log(`Database size: ${sizeInMB.toFixed(2)} MB`);
  
  // Final status
  console.log('\nVerification Result:');
  console.log('------------------');
  if (allChecksPassed) {
    console.log('✅ All checks passed! The database is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Backup your original database (already done at bible.eng.backup.db)');
    console.log('2. Replace the original database with the optimized one:');
    console.log('   - Delete: bible.eng.db');
    console.log('   - Rename: bible.eng.optimized.db -> bible.eng.db');
  } else {
    console.log('❌ Some checks failed. Please review the issues above.');
  }
  
} catch (error) {
  console.error('Error during verification:', error);
} finally {
  db.close();
}
