import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectDatabase() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
  console.log(`Inspecting database at: ${dbPath}`);
  
  try {
    const db = sqlite3(dbPath, { readonly: true });
    
    // List all tables
    console.log('\n=== Tables in database ===');
    const tables = db.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='table'"
    ).all();
    
    tables.forEach(table => {
      console.log(`\nTable: ${table.name}`);
      console.log('SQL:', table.sql);
      
      // For verse tables, show a sample
      if (table.name.startsWith('t_')) {
        try {
          const sample = db.prepare(
            `SELECT * FROM ${table.name} LIMIT 1`
          ).get();
          console.log('Sample row:', sample);
          
          // Count verses
          const count = db.prepare(
            `SELECT COUNT(*) as count FROM ${table.name}`
          ).get();
          console.log(`Total verses: ${count.count.toLocaleString()}`);
          
        } catch (e) {
          console.error(`Error querying ${table.name}:`, e.message);
        }
      }
    });
    
    // Show Translation table content
    console.log('\n=== Translation Table ===');
    const translations = db.prepare('SELECT * FROM Translation').all();
    console.table(translations);
    
    // Show key_english table (if exists)
    try {
      console.log('\n=== Key English Table ===');
      const books = db.prepare('SELECT * FROM key_english').all();
      console.table(books);
    } catch (e) {
      console.log('key_english table not found');
    }
    
    db.close();
    console.log('\n=== Database inspection complete ===');
  } catch (error) {
    console.error('Error inspecting database:', error);
    process.exit(1);
  }
}

inspectDatabase();
