import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'Bible api', 'bible.eng.optimized.db');

console.log('Connecting to database...');
const db = sqlite3(dbPath, { readonly: true });

// Get all books with their abbreviations
const books = db.prepare('SELECT id, name, abbreviation FROM key_english ORDER BY id').all();

console.log('\nBook Abbreviations:');
console.log('------------------');
books.forEach(book => {
  console.log(`${book.id.toString().padEnd(3)} ${book.name.padEnd(15)} (${book.abbreviation})`);
});

db.close();
