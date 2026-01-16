import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkBibleDb() {
  try {
    const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');
    console.log(`Checking database at: ${dbPath}`);

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('\n=== Database Schema ===');
    const tables = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    console.log('Tables:', tables.map(t => t.name).join(', '));

    for (const table of tables) {
      console.log(`\n=== Table: ${table.name} ===`);
      try {
        const columns = await db.all(`PRAGMA table_info(${table.name})`);
        console.log('Columns:', columns.map(c => `${c.name} (${c.type})`).join(', '));
        
        const sample = await db.all(`SELECT * FROM ${table.name} LIMIT 1`);
        console.log('Sample row:', JSON.stringify(sample[0], null, 2));
      } catch (err) {
        console.error(`Error checking table ${table.name}:`, err.message);
      }
    }

    await db.close();
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkBibleDb();
