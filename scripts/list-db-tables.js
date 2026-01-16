import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../Bible api/bible.eng.db');

function listTables() {
  try {
    console.log('Connecting to database...');
    const db = sqlite3(DB_PATH, { readonly: true });
    
    // Get all tables
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();
    
    console.log('\nTables in the database:');
    console.log('----------------------');
    tables.forEach((table, index) => {
      // Count rows in each table
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get().count;
        console.log(`${index + 1}. ${table.name.padEnd(15)} - ${count.toLocaleString()} rows`);
      } catch (e) {
        console.log(`${index + 1}. ${table.name} (error counting rows)`);
      }
    });
    
    // Get database size
    const stats = fs.statSync(DB_PATH);
    console.log('\nDatabase size:', (stats.size / (1024 * 1024)).toFixed(2), 'MB');
    
    db.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listTables();
