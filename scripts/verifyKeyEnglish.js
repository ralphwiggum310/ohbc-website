import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyKeyEnglish() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
  console.log(`Verifying key_english table in: ${dbPath}`);
  
  try {
    const db = sqlite3(dbPath, { readonly: true });
    
    // Check table structure
    console.log('\n=== Table Structure ===');
    const columns = db.prepare("PRAGMA table_info(key_english)").all();
    console.table(columns);
    
    // Check row count
    console.log('\n=== Row Count ===');
    const count = db.prepare('SELECT COUNT(*) as count FROM key_english').get();
    console.log(`Total books: ${count.count}`);
    
    // Check first 5 books
    console.log('\n=== First 5 Books ===');
    const firstFive = db.prepare('SELECT * FROM key_english ORDER BY id LIMIT 5').all();
    console.table(firstFive);
    
    // Check last 5 books
    console.log('\n=== Last 5 Books ===');
    const lastFive = db.prepare('SELECT * FROM key_english ORDER BY id DESC LIMIT 5').all();
    console.table(lastFive);
    
    // Check a few specific books
    console.log('\n=== Sample Books ===');
    const sampleBooks = ['Genesis', 'Psalms', 'Matthew', 'Revelation'];
    for (const book of sampleBooks) {
      const bookInfo = db.prepare('SELECT * FROM key_english WHERE name = ?').get(book);
      console.log(`${book}:`, bookInfo);
    }
    
    db.close();
    console.log('\n=== Verification Complete ===');
    
  } catch (error) {
    console.error('Error verifying key_english table:', error);
    process.exit(1);
  }
}

verifyKeyEnglish();
