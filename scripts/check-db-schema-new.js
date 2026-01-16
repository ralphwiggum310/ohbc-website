import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Open the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the Bibles database.');
  
  // Get all table names
  db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err.message);
      return;
    }
    
    console.log('\nTables in the database:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
      
      // Get table structure
      db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
        if (err) {
          console.error(`Error getting structure for ${table.name}:`, err.message);
          return;
        }
        
        console.log(`\nStructure of ${table.name}:`);
        console.table(columns);
        
        // For the key_english table, show some sample data
        if (table.name === 'key_english' || table.name === 't_nasb1995') {
          db.all(`SELECT * FROM ${table.name} LIMIT 5`, (err, rows) => {
            if (err) {
              console.error(`Error getting sample data from ${table.name}:`, err.message);
              return;
            }
            console.log(`\nSample data from ${table.name}:`);
            console.table(rows);
          });
        }
      });
    });
  });
});

// Close the database connection when done
process.on('exit', () => {
  db.close();
});
