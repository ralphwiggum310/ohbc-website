import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'Bible api', 'bible.eng.optimized.db');

console.log(`Connecting to database: ${dbPath}`);

const db = sqlite3(dbPath, { readonly: true });

// Get all tables that start with 't_'
const tables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%' ORDER BY name"
).all();

console.log('\nTables in the optimized database:');
console.log('--------------------------------');

tables.forEach((table) => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get().count;
    console.log(`- ${table.name.padEnd(30)} (${count.toLocaleString()} rows)`);
  } catch (e) {
    console.log(`- ${table.name} (error counting rows: ${e.message})`);
  }
});

db.close();
