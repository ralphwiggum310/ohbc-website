import { Database } from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Define types inline to avoid import issues
export interface BibleVersion {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface Chapter {
  number: number;
  verses: number;
}

export interface Verse {
  id: number;
  verse: number;
  text: string;
}

let db: any = null;

// Using dynamic path that works in both development and production
const DB_PATH = process.env.NODE_ENV === 'production' 
  ? 'C:\\WindSurf\\ohbc_website\\data\\bible\\Bibles.db'
  : path.join(process.cwd(), 'data', 'bible', 'Bibles.db');
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
    
    // First, let's check what tables exist in database
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('[DB] Available tables:', tables.map((t: any) => t.name).join(', '));
    
    // Use the actual table name 'books' instead of 'bible_books'
    const query = `
      SELECT 
        id,
        name,
        testament,
        chapters
      FROM books 
      ORDER BY display_order
    `;
    
    console.log('[DB] Executing query:', query);
    
    const books = await db.all(query);
    
    // Convert numeric IDs to strings to match the Book interface
    const booksWithStringIds = books.map((book: any) => ({
      ...book,
      id: book.id.toString()
    }));
    
    console.log(`[DB] Found ${booksWithStringIds.length} books`);
    return booksWithStringIds;
  } catch (error) {
    console.error('[DB] Error in getBooks:', error);
    // Return a basic set of books as fallback
    console.log('[DB] Returning fallback books list');
    return [
      { id: '1', name: 'Genesis', testament: 'OT', chapters: 50 },
      { id: '40', name: 'Matthew', testament: 'NT', chapters: 28 }
    ];
  }
}

export async function getChapters(versionId: string, bookId: string): Promise<Chapter[]> {
  const db = await getBibleDb();
  try {
    const chapters = await db.all(
      `SELECT DISTINCT chapter as number, 
              COUNT(*) as verses
       FROM verses 
       WHERE version_id = ? AND book_id = ?
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
       FROM verses
       WHERE version_id = ? AND book_id = ? AND chapter = ?
       ORDER BY verse`,
      [versionId, bookId, chapterNum]
    );

    return verses;
  } catch (error) {
    console.error('Error in getVerses:', error);
    throw error;
  }
}
