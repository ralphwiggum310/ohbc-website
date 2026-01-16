import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';

async function verifyImport() {
  console.log('Verifying Bible text import...');
  
  // Open the database
  console.log(`Opening database: ${DB_PATH}`);
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  try {
    // Check if the table exists
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='bible_verses'"
    );
    
    if (!tableExists) {
      console.error('Error: bible_verses table does not exist');
      return;
    }
    
    // Get counts by version
    const versionCounts = await db.all(
      'SELECT version, COUNT(*) as count FROM bible_verses GROUP BY version'
    );
    
    console.log('\n=== Verses by Version ===');
    for (const row of versionCounts) {
      console.log(`${row.version}: ${row.count} verses`);
    }
    
    // Get counts by book
    const bookCounts = await db.all(`
      SELECT book_id, COUNT(*) as count 
      FROM bible_verses 
      WHERE version = 'KJV' 
      GROUP BY book_id 
      ORDER BY book_id
    `);
    
    console.log('\n=== Verses by Book (KJV) ===');
    for (const row of bookCounts) {
      console.log(`Book ${row.book_id}: ${row.count} verses`);
    }
    
    // Get sample verses
    console.log('\n=== Sample Verses ===');
    const samples = await db.all(`
      SELECT book_id, chapter, verse, version, 
             substr(text, 1, 50) || '...' as preview
      FROM bible_verses 
      WHERE (book_id = 1 AND chapter = 1 AND verse <= 5)
         OR (book_id = 43 AND chapter = 1 AND verse = 1)
         OR (book_id = 19 AND chapter = 23 AND verse = 1)
      ORDER BY book_id, chapter, verse, version
    `);
    
    for (const verse of samples) {
      console.log(
        `[${verse.version}] Book ${verse.book_id} ${verse.chapter}:${verse.verse}: ${verse.preview}`
      );
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await db.close();
  }
}

// Run the verification
verifyImport().catch(console.error);
