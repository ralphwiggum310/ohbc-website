import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function testDatabase() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'bible.eng.optimized.db');
  console.log(`Connecting to database: ${dbPath}`);

  try {
    // Open the database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ Successfully connected to the database');

    // Test query to check tables
    console.log('\nListing tables:');
    const tables = await db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    console.table(tables);

    // Check if key_english table exists and has data
    if (tables.some(t => t.name === 'key_english')) {
      console.log('\nChecking key_english table:');
      const keyEnglish = await db.get('SELECT COUNT(*) as count FROM key_english');
      console.log(`- Rows in key_english: ${keyEnglish.count}`);
      
      // Get a sample book
      const sampleBook = await db.get('SELECT * FROM key_english LIMIT 1');
      console.log('- Sample book:', sampleBook);
    }

    // Check for a specific version table (e.g., t_kjv)
    const versionTable = 't_kjv';
    if (tables.some(t => t.name === versionTable)) {
      console.log(`\nChecking ${versionTable} table:`);
      const rowCount = await db.get(`SELECT COUNT(*) as count FROM ${versionTable}`);
      console.log(`- Total rows: ${rowCount.count}`);
      
      // Get a sample verse
      const sampleVerse = await db.get(`
        SELECT v.*, b.name as book_name 
        FROM ${versionTable} v
        JOIN key_english b ON b.book = v.book
        WHERE b.abbreviation = 'gen' AND v.chapter = 1 AND v.verse = 1
      `);
      console.log('- Sample verse (Genesis 1:1):', sampleVerse);
    }

    await db.close();
    console.log('\n✅ Database test completed successfully');
  } catch (error) {
    console.error('\n❌ Error testing database:');
    console.error(error);
    process.exit(1);
  }
}

testDatabase();
