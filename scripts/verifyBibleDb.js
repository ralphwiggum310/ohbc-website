import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyBibleDatabase() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
  console.log(`Verifying Bible database at: ${dbPath}`);
  
  const db = sqlite3(dbPath, { readonly: true });
  
  try {
    // 1. Check key_english table
    console.log('\n=== key_english table ===');
    
    // Check if table exists
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='key_english'"
    ).get();
    
    if (!tableExists) {
      console.error('❌ key_english table does not exist');
      return;
    }
    
    // Check table structure
    const columns = db.prepare('PRAGMA table_info(key_english)').all();
    console.log('Table columns:');
    console.table(columns);
    
    // Check row count
    const rowCount = db.prepare('SELECT COUNT(*) as count FROM key_english').get();
    console.log(`Total books: ${rowCount.count}`);
    
    // Show sample data
    if (rowCount.count > 0) {
      console.log('\nSample books:');
      const sampleBooks = db.prepare('SELECT * FROM key_english WHERE id IN (1, 40, 66)').all();
      console.table(sampleBooks);
    }
    
    // 2. Check verse tables
    console.log('\n=== Verse tables ===');
    const verseTables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%'"
    ).all();
    
    console.log(`Found ${verseTables.length} verse tables`);
    
    for (const { name: tableName } of verseTables) {
      console.log(`\nTable: ${tableName}`);
      
      // Check table structure
      const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
      console.log('Columns:');
      console.table(columns);
      
      // Count verses
      const verseCount = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
      console.log(`Total verses: ${verseCount.count.toLocaleString()}`);
      
      // Count books
      const bookCount = db.prepare(`SELECT COUNT(DISTINCT book) as count FROM ${tableName}`).get();
      console.log(`Books with verses: ${bookCount.count}`);
      
      // Check sample verse
      const sampleVerse = db.prepare(`
        SELECT * FROM ${tableName} 
        WHERE book = 1 AND chapter = 1 AND verse = 1
        LIMIT 1
      `).get();
      
      if (sampleVerse) {
        console.log('Genesis 1:1 sample:');
        console.log(sampleVerse);
      } else {
        console.log('No verse found for Genesis 1:1');
      }
      
      // Check join with key_english
      try {
        const joinedSample = db.prepare(`
          SELECT k.name as book_name, v.chapter, v.verse, v.text
          FROM ${tableName} v
          JOIN key_english k ON k.id = v.book
          WHERE v.book = 1 AND v.chapter = 1
          LIMIT 1
        `).get();
        
        if (joinedSample) {
          console.log('Join with key_english successful:');
          console.log(joinedSample);
        } else {
          console.log('No data returned from join with key_english');
        }
      } catch (joinError) {
        console.error('Error joining with key_english:', joinError.message);
      }
    }
    
    console.log('\n=== Verification complete ===');
    
  } catch (error) {
    console.error('Error verifying database:', error);
  } finally {
    db.close();
  }
}

// Run the verification
verifyBibleDatabase();
