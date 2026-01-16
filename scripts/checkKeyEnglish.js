import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkKeyEnglish() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
  console.log(`Checking key_english table in: ${dbPath}`);
  
  try {
    const db = sqlite3(dbPath, { readonly: true });
    
    // Check if key_english table exists
    const tableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='key_english'"
    ).get();
    
    if (!tableExists) {
      console.log('key_english table does not exist in the database');
      return;
    }
    
    // Get table structure
    console.log('\n=== key_english table structure ===');
    const columns = db.prepare("PRAGMA table_info(key_english)").all();
    console.table(columns);
    
    // Get sample data
    console.log('\n=== Sample data from key_english ===');
    const sampleData = db.prepare('SELECT * FROM key_english LIMIT 5').all();
    console.table(sampleData);
    
    // Get count
    const count = db.prepare('SELECT COUNT(*) as count FROM key_english').get();
    console.log(`\nTotal books in key_english: ${count.count}`);
    
    db.close();
    
  } catch (error) {
    console.error('Error checking key_english table:', error);
  }
}

checkKeyEnglish();
