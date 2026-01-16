import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Bibles database
const dbPath = join(__dirname, '..', 'data', 'bible', 'Bibles.db');

console.log(`Opening database at: ${dbPath}`);
const db = new Database(dbPath, { readonly: true });

try {
  // Check if the NASB 1995 table exists
  const nasbTable = 't_nasb1995';
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
  ).get(nasbTable);
  
  if (!tableExists) {
    console.log(`\n❌ Table ${nasbTable} does not exist in the database.`);
    
    // List all available version tables
    console.log('\nAvailable Bible version tables:');
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 't_%'"
    ).all();
    
    tables.forEach((table, index) => {
      console.log(`- ${table.name.replace('t_', '')}`);
    });
    
  } else {
    console.log(`\n✅ Table ${nasbTable} exists.`);
    
    // Count verses in NASB 1995
    const verseCount = db.prepare(`SELECT COUNT(*) as count FROM ${nasbTable}`).get().count;
    console.log(`Total verses in NASB 1995: ${verseCount.toLocaleString()}`);
    
    // Get book names
    const books = db.prepare(
      'SELECT id, name, abbreviation, chapters FROM key_english ORDER BY id'
    ).all();
    
    console.log('\nBooks in the Bible:');
    books.forEach(book => {
      const verseCount = db.prepare(
        `SELECT COUNT(*) as count FROM ${nasbTable} WHERE book = ?`
      ).get(book.id).count;
      
      console.log(`- ${book.name.padEnd(20)} (${book.abbreviation.padEnd(3)}) - ${verseCount.toString().padStart(4)} verses`);
    });
    
    // Sample verses
    console.log('\nSample verses from NASB 1995:');
    const sampleVerses = db.prepare(
      `SELECT b.name as book, v.chapter, v.verse, v.text 
       FROM ${nasbTable} v 
       JOIN key_english b ON v.book = b.id 
       WHERE v.book IN (1, 40, 66) 
       AND v.chapter = 1 
       AND v.verse = 1`
    ).all();
    
    sampleVerses.forEach(v => {
      console.log(`\n${v.book} ${v.chapter}:${v.verse}`);
      console.log(v.text);
    });
  }
  
} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
