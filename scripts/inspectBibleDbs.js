import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import path from 'path';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database files to check
const DB_FILES = [
  path.join(__dirname, '..', 'Bible api', 'bible.eng.db'),
  path.join(__dirname, '..', 'Bible api', 'bible.eng.backup.db'),
  'C:\WindSurf\ohbc_website\data\bible\bibles.db'
];

async function inspectDatabase(dbPath) {
  console.log(`\nInspecting database: ${dbPath}`);
  
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Check if Translation table exists
    const translationTables = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 't_%' OR name = 'Translation' OR name = 'key_english')"
    );
    
    console.log('\nTables found:');
    for (const table of translationTables) {
      console.log(`- ${table.name}`);
      
      // Get row count for each table
      try {
        const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
        console.log(`  Rows: ${count.count}`);
        
        // If it's a verse table, show a sample
        if (table.name.startsWith('t_') && count.count > 0) {
          const sample = await db.get(`SELECT * FROM ${table.name} LIMIT 1`);
          console.log('  Sample data:', JSON.stringify(sample, null, 2));
        }
      } catch (e) {
        console.log('  Could not count rows:', e.message);
      }
    }
    
    // Check for Translation table
    try {
      const translations = await db.all('SELECT * FROM Translation');
      console.log('\nTranslations found:', translations.length);
      console.table(translations.map(t => ({
        id: t.id,
        name: t.name,
        abbreviation: t.abbreviation,
        language: t.language
      })));
    } catch (e) {
      console.log('No Translation table or error reading it:', e.message);
    }
    
    await db.close();
    
  } catch (error) {
    console.error('Error inspecting database:', error.message);
  }
}

// Run inspection for each database
async function main() {
  for (const dbFile of DB_FILES) {
    await inspectDatabase(dbFile);
  }
}

main().catch(console.error);
