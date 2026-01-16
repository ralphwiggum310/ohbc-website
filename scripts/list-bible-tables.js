import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { verbose } = sqlite3;
const sqlite3Verbose = verbose();

// Path to the Bibles database
const dbPath = join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Connect to the database
const db = new sqlite3Verbose.Database(dbPath, sqlite3Verbose.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the Bibles database');
  
  // List all tables in the database
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
    if (err) {
      console.error('Error fetching tables:', err.message);
      return;
    }
    
    console.log('\nTables in the database:');
    tables.forEach((table) => {
      console.log(`- ${table.name}`);
    });
    
    // If there are tables, show the structure of the first few
    if (tables.length > 0) {
      console.log('\nTable structures:');
      let tablesProcessed = 0;
      
      tables.forEach((table) => {
        // Only show structure for the first 3 tables to avoid too much output
        if (tablesProcessed < 3) {
          db.get(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
            if (err) {
              console.error(`Error getting structure for ${table.name}:`, err.message);
              return;
            }
            
            console.log(`\nStructure of ${table.name}:`);
            console.log(columns);
            
            // If this is a verse table, show a few sample verses
            if (table.name.startsWith('t_') && table.name !== 'tables') {
              db.all(`SELECT * FROM ${table.name} LIMIT 3`, [], (err, rows) => {
                if (!err && rows && rows.length > 0) {
                  console.log(`\nSample verses from ${table.name}:`);
                  console.log(rows);
                }
                
                tablesProcessed++;
                if (tablesProcessed === Math.min(3, tables.length)) {
                  db.close();
                }
              });
            } else {
              tablesProcessed++;
              if (tablesProcessed === Math.min(3, tables.length)) {
                db.close();
              }
            }
          });
        } else {
          tablesProcessed++;
        }
      });
    } else {
      db.close();
    }
  });
});
