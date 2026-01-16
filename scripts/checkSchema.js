import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkSchema() {
  try {
    const dbPath = path.join(__dirname, 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
    console.log(`Checking database at: ${dbPath}`);
    
    const db = sqlite3(dbPath, { readonly: true });
    
    // List all tables
    console.log('\nTables in database:');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.table(tables);
    
    // Show Translation table structure
    console.log('\nTranslation table columns:');
    const translationColumns = db.prepare("PRAGMA table_info(Translation)").all();
    console.table(translationColumns);
    
    // Show sample data from Translation table
    console.log('\nSample translations:');
    const sampleTranslations = db.prepare("SELECT * FROM Translation LIMIT 5").all();
    console.table(sampleTranslations);
    
    // Show structure of a verse table
    const verseTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%' LIMIT 1").get();
    if (verseTable) {
      console.log(`\nStructure of ${verseTable.name} table:`);
      const verseColumns = db.prepare(`PRAGMA table_info(${verseTable.name})`).all();
      console.table(verseColumns);
    }
    
    db.close();
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

checkSchema();
