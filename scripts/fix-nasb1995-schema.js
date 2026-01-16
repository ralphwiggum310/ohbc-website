import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'bible.eng.db');

async function fixSchema() {
  let db;
  
  try {
    // Open the database
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database
    });
    
    console.log('Connected to database');
    
    // Drop existing tables if they exist
    console.log('Dropping existing tables...');
    await db.exec(`DROP TABLE IF EXISTS t_nasb1995`);
    await db.exec(`DROP TABLE IF EXISTS bible_books`);
    
    console.log('Creating new tables...');
    
    // Create the books table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bible_books (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        testament TEXT,
        chapters INTEGER
      )`);
    
    // Create the verses table with the correct schema
    await db.exec(`
      CREATE TABLE t_nasb1995 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES bible_books(id),
        UNIQUE(book_id, chapter, verse)
      )`);
    
    // Create an index for faster lookups
    await db.exec('CREATE INDEX idx_nasb1995_book_chapter_verse ON t_nasb1995(book_id, chapter, verse)');
    
    console.log('Database schema has been reset successfully');
    
  } catch (error) {
    console.error('Error fixing schema:', error.message);
    throw error;
  } finally {
    if (db) {
      await db.close();
      console.log('Database connection closed');
    }
  }
}

// Run the schema fix
fixSchema().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
