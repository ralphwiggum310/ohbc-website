import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

async function checkSchema() {
  const db = new Database(dbPath, { readonly: true });
  
  try {
    // Get table info
    console.log('Table structure for t_nasb1995:');
    const tableInfo = db.prepare("PRAGMA table_info(t_nasb1995)").all();
    console.table(tableInfo);
    
    // Check foreign keys
    console.log('\nForeign keys for t_nasb1995:');
    const foreignKeys = db.prepare("PRAGMA foreign_key_list(t_nasb1995)").all();
    console.table(foreignKeys);
    
    // Check key_english table since it's referenced in the foreign key
    console.log('\nChecking key_english table:');
    try {
      const keyEnglish = db.prepare("SELECT * FROM key_english LIMIT 5").all();
      console.log('First 5 rows from key_english:');
      console.table(keyEnglish);
    } catch (e) {
      console.log('Could not access key_english table:', e.message);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    db.close();
  }
}

checkSchema().catch(console.error);
