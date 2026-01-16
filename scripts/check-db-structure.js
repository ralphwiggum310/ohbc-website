import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Bibles database
const dbPath = join(__dirname, '..', 'data', 'bible', 'Bibles.db');

try {
  // Open the database
  console.log(`Opening database at: ${dbPath}`);
  const db = new Database(dbPath, { readonly: true });
  
  // Get all table names
  console.log('\nTables in the database:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  
  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table.name}`);
    
    // Get table info
    try {
      const info = db.prepare(`PRAGMA table_info(${table.name})`).all();
      console.log(`   Columns: ${info.map(col => col.name).join(', ')}`);
      
      // For verse tables, show a sample
      if (table.name.startsWith('t_')) {
        const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 1`).get();
        if (sample) {
          console.log('   Sample row:', sample);
        }
      }
    } catch (err) {
      console.log(`   Could not read table info: ${err.message}`);
    }
  });
  
  // Show the key_english table if it exists
  if (tables.some(t => t.name === 'key_english')) {
    console.log('\nBooks in key_english:');
    const books = db.prepare('SELECT * FROM key_english LIMIT 5').all();
    console.log(books);
  }
  
  db.close();
  console.log('\nDatabase inspection complete.');
  
} catch (err) {
  console.error('Error:', err.message);
}
