import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function checkDb() {
  const dbPath = 'Bible api/bibles.db';
  console.log(`Checking database at: ${dbPath}`);
  
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // List all tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('\nTables in database:');
    for (const table of tables) {
      const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`- ${table.name}: ${count.count} rows`);
    }
    
    // Check key_english table
    console.log('\nChecking key_english table:');
    const books = await db.all('SELECT * FROM key_english LIMIT 5');
    console.table(books);
    
    // Check a verse table if it exists
    const verseTables = tables.filter(t => t.name.startsWith('t_') && t.name !== 'temptable');
    if (verseTables.length > 0) {
      const tableName = verseTables[0].name;
      console.log(`\nChecking ${tableName} table (first 2 verses):`);
      const verses = await db.all(`SELECT * FROM ${tableName} LIMIT 2`);
      console.table(verses);
    }
    
    await db.close();
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDb().catch(console.error);
