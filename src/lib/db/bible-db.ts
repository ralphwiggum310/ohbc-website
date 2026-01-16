import { Database } from 'sqlite3';
import { open } from 'sqlite';
import { BibleVersion, Book, Chapter, Verse } from '@/types/bible';
import path from 'path';
import fs from 'fs';

let db: any = null;

// Using exact Windows path as specified
const DB_PATH = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';
const DB_DIR = path.dirname(DB_PATH);

export async function getBibleDb() {
  console.log(`[DB] Attempting to connect to database at: ${DB_PATH}`);
  
  // Check if database file exists
  if (!fs.existsSync(DB_PATH)) {
    console.error(`[DB] Error: Database file not found at ${DB_PATH}`);
    // List files in the directory for debugging
    try {
      const files = fs.readdirSync(DB_DIR);
      console.log(`[DB] Files in directory:`, files);
    } catch (err) {
      console.error(`[DB] Error reading directory:`, err);
    }
    throw new Error(`Bible database not found at ${DB_PATH}`);
  }

  if (!db) {
    try {
      db = await open({
        filename: DB_PATH,
        driver: Database
      });
      console.log('[DB] Successfully connected to database');
      
      // Log database schema for debugging
      const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('[DB] Database schema:', tables.map((t: any) => t.name).join(', '));
      
      // Log the structure of each table
      for (const table of tables) {
        try {
          const columns = await db.all(`PRAGMA table_info(${table.name})`);
          console.log(`[DB] Table ${table.name} columns:`, 
            columns.map((c: any) => `${c.name} (${c.type})`).join(', '));
        } catch (err) {
          console.error(`[DB] Error getting schema for table ${table.name}:`, err);
        }
      }
      
      // Enable foreign keys
      await db.run('PRAGMA foreign_keys = ON');
    } catch (error) {
      console.error('[DB] Error connecting to database:', error);
      throw error;
    }
  }
  return db;
}

export async function getVersions(): Promise<BibleVersion[]> {
  const db = await getBibleDb();
  try {
    // First check if we have a versions table
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='bible_versions'"
    );

    if (tableExists) {
      // If we have a versions table, use it
      return db.all('SELECT id, name FROM bible_versions');
    } else {
      // Otherwise, return a default version
      return [
        { id: 'niv', name: 'New International Version' },
        { id: 'esv', name: 'English Standard Version' },
        { id: 'kjv', name: 'King James Version' }
      ];
    }
  } catch (error) {
    console.error('Error in getVersions:', error);
    throw error;
  }
}

export async function getBooks(versionId: string): Promise<Book[]> {
  const db = await getBibleDb();
  try {
    console.log(`[DB] Getting books for version: ${versionId}`);
    
    // First, let's check what tables exist in the database
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('[DB] Available tables:', tables.map((t: any) => t.name).join(', '));
    
    // Check if we have a BookNames table
    const bookNamesTableExists = tables.some((t: any) => t.name === 'BookNames');
    console.log(`[DB] BookNames table exists: ${bookNamesTableExists}`);
    
    // Get distinct books from the verses table
    let query = `
      SELECT DISTINCT 
        book as id,
        book as number,
        CASE WHEN book <= 39 THEN 'OT' ELSE 'NT' END as testament
      FROM Verse 
      WHERE version = ?
      ORDER BY book
    `;
    
    console.log('[DB] Executing query:', query);
    console.log('[DB] With parameters:', [versionId]);
    
    const books = await db.all(query, [versionId]);
    
    // If we have a BookNames table, try to get the book names
    if (bookNamesTableExists) {
      console.log('[DB] Fetching book names from BookNames table');
      for (const book of books) {
        try {
          const nameRow = await db.get(
            'SELECT name FROM BookNames WHERE book = ?',
            [book.id]
          );
          book.name = nameRow?.name || `Book ${book.id}`;
        } catch (error) {
          console.error(`[DB] Error getting name for book ${book.id}:`, error);
          book.name = `Book ${book.id}`;
        }
      }
    } else {
      console.log('[DB] No BookNames table found, using generic names');
      // Provide generic names if no BookNames table
      for (const book of books) {
        book.name = `Book ${book.id}`;
      }
    }
    
    console.log(`[DB] Found ${books.length} books`);
    return books;
  } catch (error) {
    console.error('[DB] Error in getBooks:', error);
    // Return a basic set of books as fallback
    console.log('[DB] Returning fallback books list');
    return [
      { id: '1', name: 'Genesis', number: 1, testament: 'OT' },
      { id: '40', name: 'Matthew', number: 40, testament: 'NT' }
    ];
  }
}

export async function getChapters(versionId: string, bookId: string): Promise<Chapter[]> {
  const db = await getBibleDb();
  try {
    const chapters = await db.all(
      `SELECT DISTINCT chapter as number, 
              COUNT(*) as verses
       FROM Verse 
       WHERE version = ? AND book = ?
       GROUP BY chapter
       ORDER BY chapter`,
      [versionId, bookId]
    );

    return chapters;
  } catch (error) {
    console.error('Error in getChapters:', error);
    throw error;
  }
}

export async function getVerses(versionId: string, bookId: string, chapterNum: number): Promise<Verse[]> {
  const db = await getBibleDb();
  try {
    const verses = await db.all(
      `SELECT id, verse, text
       FROM Verse
       WHERE version = ? AND book = ? AND chapter = ?
       ORDER BY verse`,
      [versionId, bookId, chapterNum]
    );

    return verses;
  } catch (error) {
    console.error('Error in getVerses:', error);
    throw error;
  }
}
