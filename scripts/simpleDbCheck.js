const sqlite3 = require('better-sqlite3');
const path = require('path');

// Path to the database
const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
console.log(`Checking database at: ${dbPath}`);

try {
  // Connect to the database
  const db = sqlite3(dbPath, { readonly: true });
  
  // List all tables
  console.log('\nTables in database:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`- ${table.name}: ${count.count} rows`);
  });
  
  // Check Translation table if it exists
  if (tables.some(t => t.name === 'Translation')) {
    console.log('\nTranslations:');
    const translations = db.prepare('SELECT * FROM Translation').all();
    console.table(translations);
  }
  
  // Check key_english table if it exists
  if (tables.some(t => t.name === 'key_english')) {
    console.log('\nFirst 5 books in key_english:');
    const books = db.prepare('SELECT * FROM key_english LIMIT 5').all();
    console.table(books);
  }
  
  // Check for any verse tables
  const verseTables = tables.filter(t => t.name.startsWith('t_') && t.name !== 'temptable');
  if (verseTables.length > 0) {
    console.log('\nVerse tables found:');
    verseTables.forEach(table => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      console.log(`- ${table.name}: ${count.count} verses`);
      
      if (count.count > 0) {
        console.log('  Sample verse:');
        const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 1`).get();
        console.log(sample);
      }
    });
  }
  
  db.close();
  
} catch (error) {
  console.error('Error:', error.message);
  if (error.code) console.error('Error code:', error.code);
}
