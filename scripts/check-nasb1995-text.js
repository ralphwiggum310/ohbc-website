import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Open the database
const db = new Database(dbPath, { readonly: true });

// Check specific verses that had annotation issues
const verses = db.prepare(`
  SELECT k.name as book, t.chapter, t.verse, t.text 
  FROM t_nasb1995 t 
  JOIN key_english k ON t.book = k.id 
  WHERE (k.name = 'Genesis' AND t.chapter = 1 AND t.verse BETWEEN 10 AND 14)
     OR (k.name = 'Psalms' AND t.chapter = 23 AND t.verse = 1)
  ORDER BY k.id, t.chapter, t.verse
`).all();

console.log('Verifying cleaned NASB 1995 text:');
console.log('--------------------------------');

verses.forEach(verse => {
  console.log(`\n${verse.book} ${verse.chapter}:${verse.verse}`);
  console.log('--------------------------------');
  console.log(verse.text);
  console.log('--------------------------------');
});

db.close();
