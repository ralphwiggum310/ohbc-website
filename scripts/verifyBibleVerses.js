import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyBibleVerses() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
  console.log(`Verifying Bible verses in: ${dbPath}`);
  
  try {
    const db = sqlite3(dbPath, { readonly: true });
    
    // Get all verse tables
    console.log('\n=== Verse Tables ===');
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%'"
    ).all();
    
    console.log(`Found ${tables.length} verse tables:`);
    console.table(tables.map(t => t.name));
    
    // For each verse table, check a sample verse
    for (const { name: tableName } of tables) {
      console.log(`\n=== Verifying table: ${tableName} ===`);
      
      try {
        // Get table structure
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        console.log('\nTable structure:');
        console.table(columns);
        
        // Get a sample verse (Genesis 1:1)
        const sampleVerse = db.prepare(`
          SELECT * FROM ${tableName} 
          WHERE book = 1 AND chapter = 1 AND verse = 1
        `).get();
        
        console.log('\nSample verse (Genesis 1:1):');
        console.log(sampleVerse);
        
        // Count total verses
        const verseCount = db.prepare(`
          SELECT COUNT(*) as count FROM ${tableName}
        `).get().count;
        
        console.log(`\nTotal verses in ${tableName}: ${verseCount.toLocaleString()}`);
        
        // Count books
        const bookCount = db.prepare(`
          SELECT COUNT(DISTINCT book) as count FROM ${tableName}
        `).get().count;
        
        console.log(`Books with verses: ${bookCount}`);
        
      } catch (error) {
        console.error(`Error checking table ${tableName}:`, error.message);
      }
    }
    
    // Check if we can join with key_english
    console.log('\n=== Testing join with key_english ===');
    const verseTables = tables.map(t => t.name).filter(name => name !== 'key_english');
    
    if (verseTables.length > 0) {
      const testTable = verseTables[0];
      console.log(`\nTesting join between ${testTable} and key_english`);
      
      try {
        const result = db.prepare(`
          SELECT k.name as book_name, v.chapter, v.verse, v.text
          FROM ${testTable} v
          JOIN key_english k ON k.id = v.book
          WHERE v.book = 1 AND v.chapter = 1
          LIMIT 3
        `).all();
        
        console.log('Sample verses with book names:');
        console.table(result);
        
      } catch (error) {
        console.error('Error joining with key_english:', error.message);
      }
    }
    
    db.close();
    console.log('\n=== Verification Complete ===');
    
  } catch (error) {
    console.error('Error verifying Bible verses:', error);
    process.exit(1);
  }
}

verifyBibleVerses();
