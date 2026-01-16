import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'Bible api', 'bible.eng.optimized.db');
const tableName = 't_king_james_bible';

console.log(`Checking schema for table: ${tableName}`);

const db = sqlite3(dbPath, { readonly: true });

// Get table info
const columns = db.pragma(`table_info(${tableName})`);
console.log('\nColumns:');
console.table(columns);

// Get sample data
console.log('\nSample data (first 5 rows):');
const sample = db.prepare(`SELECT * FROM ${tableName} LIMIT 5`).all();
console.table(sample);

// Check if key_english table exists and has the expected structure
console.log('\nChecking key_english table:');
const keyEnglishInfo = db.pragma('table_info(key_english)');
console.table(keyEnglishInfo);

// Check sample data from key_english
console.log('\nSample from key_english table (first 5 rows):');
const keyEnglishSample = db.prepare('SELECT * FROM key_english LIMIT 5').all();
console.table(keyEnglishSample);

db.close();
