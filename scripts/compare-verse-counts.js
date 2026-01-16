import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

async function compareVerseCounts() {
  console.log('Comparing verse counts across all version tables...');
  
  const db = new Database(dbPath, { readonly: true });
  
  try {
    // Get all version tables (t_* tables that aren't system tables)
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't\\_%' ESCAPE '\\' AND name NOT LIKE 't\\_%\\_%' ESCAPE '\\'"
    ).all();
    
    if (tables.length === 0) {
      console.log('No version tables found in the database.');
      return;
    }
    
    console.log('\nVerse counts by table:');
    console.log('-------------------');
    
    // Get verse counts for each table
    const counts = [];
    for (const { name } of tables) {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get().count;
        console.log(`${name.padEnd(25)}: ${count.toString().padStart(5)} verses`);
        counts.push({ table: name, count });
      } catch (error) {
        console.error(`Error counting ${name}:`, error.message);
      }
    }
    
    // Check for discrepancies
    if (counts.length > 0) {
      const firstCount = counts[0].count;
      const mismatched = counts.filter(c => c.count !== firstCount);
      
      if (mismatched.length === 0) {
        console.log('\n✅ All version tables have the same number of verses!');
      } else {
        console.log(`\n❌ Version table counts do not match!`);
        console.log(`Expected ${firstCount} verses (from ${counts[0].table}), but found different counts in these tables:`);
        mismatched.forEach(m => {
          console.log(`- ${m.table.padEnd(25)}: ${m.count.toString().padStart(5)} (difference: ${m.count - firstCount})`);
        });
      }
    }
    
    // Get book counts for each table
    console.log('\nBook counts by table:');
    console.log('-------------------');
    
    for (const { name } of tables) {
      try {
        const bookCount = db.prepare(`SELECT COUNT(DISTINCT book) as count FROM ${name}`).get().count;
        console.log(`${name.padEnd(25)}: ${bookCount} books`);
      } catch (error) {
        console.error(`Error getting book count for ${name}:`, error.message);
      }
    }
    
    // Get chapter counts for each table
    console.log('\nChapter counts by table:');
    console.log('----------------------');
    
    for (const { name } of tables) {
      try {
        const chapterCount = db.prepare(`SELECT COUNT(DISTINCT book || '-' || chapter) as count FROM ${name}`).get().count;
        console.log(`${name.padEnd(25)}: ${chapterCount} chapters`);
      } catch (error) {
        console.error(`Error getting chapter count for ${name}:`, error.message);
      }
    }
    
    // Check for missing verses between tables
    if (tables.length > 1) {
      console.log('\nChecking for missing verses between tables...');
      console.log('----------------------------------------');
      
      const baseTable = tables[0].name;
      console.log(`Using ${baseTable} as the reference table`);
      
      // Get all book, chapter, verse combinations from the base table
      const baseVerses = db.prepare(
        `SELECT book, chapter, verse FROM ${baseTable} ORDER BY book, chapter, verse`
      ).all();
      
      // Check each table against the base table
      for (let i = 1; i < tables.length; i++) {
        const table = tables[i].name;
        console.log(`\nChecking ${table} against ${baseTable}...`);
        
        const missingVerses = [];
        const extraVerses = [];
        
        // Find verses in base table missing from this table
        for (const verse of baseVerses) {
          const exists = db.prepare(
            `SELECT 1 FROM ${table} WHERE book = ? AND chapter = ? AND verse = ?`
          ).get(verse.book, verse.chapter, verse.verse);
          
          if (!exists) {
            missingVerses.push(`${verse.book}:${verse.chapter}:${verse.verse}`);
          }
        }
        
        // Find verses in this table that aren't in the base table
        const allVerses = db.prepare(
          `SELECT book, chapter, verse FROM ${table} ORDER BY book, chapter, verse`
        ).all();
        
        for (const verse of allVerses) {
          const exists = baseVerses.some(
            v => v.book === verse.book && v.chapter === verse.chapter && v.verse === verse.verse
          );
          
          if (!exists) {
            extraVerses.push(`${verse.book}:${verse.chapter}:${verse.verse}`);
          }
        }
        
        console.log(`- Missing in ${table}: ${missingVerses.length} verses`);
        if (missingVerses.length > 0 && missingVerses.length <= 5) {
          console.log(`  Samples: ${missingVerses.slice(0, 5).join(', ')}`);
        }
        
        console.log(`- Extra in ${table}: ${extraVerses.length} verses`);
        if (extraVerses.length > 0 && extraVerses.length <= 5) {
          console.log(`  Samples: ${extraVerses.slice(0, 5).join(', ')}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error comparing verse counts:', error);
  } finally {
    db.close();
  }
}

// Run the comparison
compareVerseCounts().catch(console.error);
