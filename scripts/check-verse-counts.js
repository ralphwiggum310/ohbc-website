import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

async function checkVerseCounts() {
  console.log('Checking verse counts across all version tables...');
  
  const db = new Database(dbPath, { readonly: true });
  
  try {
    // Get all tables that start with 't_'
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't\\_%' ESCAPE '\\'"
    ).all();
    
    const versionTables = tables.filter(t => t.name !== 't_books' && t.name !== 't_key_english');
    
    console.log('\nVerse counts by version:');
    console.log('----------------------');
    
    const counts = [];
    
    // Get count for each version
    for (const { name } of versionTables) {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get().count;
        console.log(`${name.padEnd(15)}: ${count} verses`);
        counts.push({ table: name, count });
      } catch (error) {
        console.error(`Error counting ${name}:`, error.message);
      }
    }
    
    // Check if all counts match
    if (counts.length > 0) {
      const firstCount = counts[0].count;
      const mismatched = counts.filter(c => c.count !== firstCount);
      
      if (mismatched.length === 0) {
        console.log('\n✅ All versions have the same number of verses!');
      } else {
        console.log('\n❌ Version table counts do not match!');
        console.log(`Expected ${firstCount} verses, but found different counts in these tables:`);
        mismatched.forEach(m => {
          console.log(`- ${m.table}: ${m.count} (difference: ${m.count - firstCount})`);
        });
      }
    }
    
    // Check for any missing verses in each version
    console.log('\nChecking for missing verses...');
    console.log('---------------------------');
    
    // Get the list of all book, chapter, verse combinations from the first version
    const firstTable = counts[0]?.table;
    if (firstTable) {
      const allVerses = db.prepare(
        `SELECT book, chapter, verse FROM ${firstTable} ORDER BY book, chapter, verse`
      ).all();
      
      // Check each version for missing verses
      for (const { table } of versionTables) {
        if (table === firstTable) continue;
        
        console.log(`\nChecking for verses in ${firstTable} missing from ${table}...`);
        
        const missing = [];
        for (const verse of allVerses) {
          const exists = db.prepare(
            `SELECT 1 FROM ${table} WHERE book = ? AND chapter = ? AND verse = ?`
          ).get(verse.book, verse.chapter, verse.verse);
          
          if (!exists) {
            missing.push(`${verse.book}:${verse.chapter}:${verse.verse}`);
            if (missing.length >= 10) {
              missing.push('... (more missing)');
              break;
            }
          }
        }
        
        if (missing.length > 0) {
          console.log(`❌ Found ${missing.length} verses in ${firstTable} missing from ${table}:`);
          console.log(missing.join(', '));
        } else {
          console.log(`✅ No missing verses found in ${table} compared to ${firstTable}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking verse counts:', error);
  } finally {
    db.close();
  }
}

checkVerseCounts().catch(console.error);
