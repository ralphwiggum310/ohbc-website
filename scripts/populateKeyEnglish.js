import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard 66 books of the Bible with their names and abbreviations
const BIBLE_BOOKS = [
  { id: 1, name: 'Genesis', abbreviation: 'gen', chapters: 50 },
  { id: 2, name: 'Exodus', abbreviation: 'exo', chapters: 40 },
  { id: 3, name: 'Leviticus', abbreviation: 'lev', chapters: 27 },
  { id: 4, name: 'Numbers', abbreviation: 'num', chapters: 36 },
  { id: 5, name: 'Deuteronomy', abbreviation: 'deu', chapters: 34 },
  { id: 6, name: 'Joshua', abbreviation: 'jos', chapters: 24 },
  { id: 7, name: 'Judges', abbreviation: 'jdg', chapters: 21 },
  { id: 8, name: 'Ruth', abbreviation: 'rut', chapters: 4 },
  { id: 9, name: '1 Samuel', abbreviation: '1sa', chapters: 31 },
  { id: 10, name: '2 Samuel', abbreviation: '2sa', chapters: 24 },
  { id: 11, name: '1 Kings', abbreviation: '1ki', chapters: 22 },
  { id: 12, name: '2 Kings', abbreviation: '2ki', chapters: 25 },
  { id: 13, name: '1 Chronicles', abbreviation: '1ch', chapters: 29 },
  { id: 14, name: '2 Chronicles', abbreviation: '2ch', chapters: 36 },
  { id: 15, name: 'Ezra', abbreviation: 'ezr', chapters: 10 },
  { id: 16, name: 'Nehemiah', abbreviation: 'neh', chapters: 13 },
  { id: 17, name: 'Esther', abbreviation: 'est', chapters: 10 },
  { id: 18, name: 'Job', abbreviation: 'job', chapters: 42 },
  { id: 19, name: 'Psalms', abbreviation: 'psa', chapters: 150 },
  { id: 20, name: 'Proverbs', abbreviation: 'pro', chapters: 31 },
  { id: 21, name: 'Ecclesiastes', abbreviation: 'ecc', chapters: 12 },
  { id: 22, name: 'Song of Solomon', abbreviation: 'sng', chapters: 8 },
  { id: 23, name: 'Isaiah', abbreviation: 'isa', chapters: 66 },
  { id: 24, name: 'Jeremiah', abbreviation: 'jer', chapters: 52 },
  { id: 25, name: 'Lamentations', abbreviation: 'lam', chapters: 5 },
  { id: 26, name: 'Ezekiel', abbreviation: 'ezk', chapters: 48 },
  { id: 27, name: 'Daniel', abbreviation: 'dan', chapters: 12 },
  { id: 28, name: 'Hosea', abbreviation: 'hos', chapters: 14 },
  { id: 29, name: 'Joel', abbreviation: 'jol', chapters: 3 },
  { id: 30, name: 'Amos', abbreviation: 'amo', chapters: 9 },
  { id: 31, name: 'Obadiah', abbreviation: 'oba', chapters: 1 },
  { id: 32, name: 'Jonah', abbreviation: 'jon', chapters: 4 },
  { id: 33, name: 'Micah', abbreviation: 'mic', chapters: 7 },
  { id: 34, name: 'Nahum', abbreviation: 'nam', chapters: 3 },
  { id: 35, name: 'Habakkuk', abbreviation: 'hab', chapters: 3 },
  { id: 36, name: 'Zephaniah', abbreviation: 'zep', chapters: 3 },
  { id: 37, name: 'Haggai', abbreviation: 'hag', chapters: 2 },
  { id: 38, name: 'Zechariah', abbreviation: 'zec', chapters: 14 },
  { id: 39, name: 'Malachi', abbreviation: 'mal', chapters: 4 },
  { id: 40, name: 'Matthew', abbreviation: 'mat', chapters: 28 },
  { id: 41, name: 'Mark', abbreviation: 'mrk', chapters: 16 },
  { id: 42, name: 'Luke', abbreviation: 'luk', chapters: 24 },
  { id: 43, name: 'John', abbreviation: 'jhn', chapters: 21 },
  { id: 44, name: 'Acts', abbreviation: 'act', chapters: 28 },
  { id: 45, name: 'Romans', abbreviation: 'rom', chapters: 16 },
  { id: 46, name: '1 Corinthians', abbreviation: '1co', chapters: 16 },
  { id: 47, name: '2 Corinthians', abbreviation: '2co', chapters: 13 },
  { id: 48, name: 'Galatians', abbreviation: 'gal', chapters: 6 },
  { id: 49, name: 'Ephesians', abbreviation: 'eph', chapters: 6 },
  { id: 50, name: 'Philippians', abbreviation: 'php', chapters: 4 },
  { id: 51, name: 'Colossians', abbreviation: 'col', chapters: 4 },
  { id: 52, name: '1 Thessalonians', abbreviation: '1th', chapters: 5 },
  { id: 53, name: '2 Thessalonians', abbreviation: '2th', chapters: 3 },
  { id: 54, name: '1 Timothy', abbreviation: '1ti', chapters: 6 },
  { id: 55, name: '2 Timothy', abbreviation: '2ti', chapters: 4 },
  { id: 56, name: 'Titus', abbreviation: 'tit', chapters: 3 },
  { id: 57, name: 'Philemon', abbreviation: 'phm', chapters: 1 },
  { id: 58, name: 'Hebrews', abbreviation: 'heb', chapters: 13 },
  { id: 59, name: 'James', abbreviation: 'jas', chapters: 5 },
  { id: 60, name: '1 Peter', abbreviation: '1pe', chapters: 5 },
  { id: 61, name: '2 Peter', abbreviation: '2pe', chapters: 3 },
  { id: 62, name: '1 John', abbreviation: '1jn', chapters: 5 },
  { id: 63, name: '2 John', abbreviation: '2jn', chapters: 1 },
  { id: 64, name: '3 John', abbreviation: '3jn', chapters: 1 },
  { id: 65, name: 'Jude', abbreviation: 'jud', chapters: 1 },
  { id: 66, name: 'Revelation', abbreviation: 'rev', chapters: 22 },
];

async function populateKeyEnglish() {
  const dbPath = path.join(process.cwd(), 'Bible api', 'C:\WindSurf\ohbc_website\data\bible\bibles.db');
  console.log(`Populating key_english table in: ${dbPath}`);
  
  try {
    const db = sqlite3(dbPath);
    
    // Begin transaction
    const transaction = db.transaction(() => {
      // Clear existing data
      console.log('Clearing existing key_english data...');
      db.prepare('DELETE FROM key_english').run();
      
      // Insert new data
      console.log('Inserting Bible book data...');
      const insert = db.prepare(
        'INSERT INTO key_english (id, name, abbreviation, chapters) VALUES (?, ?, ?, ?)'
      );
      
      for (const book of BIBLE_BOOKS) {
        insert.run(book.id, book.name, book.abbreviation, book.chapters);
      }
      
      console.log(`Successfully inserted ${BIBLE_BOOKS.length} books`);
      
      // Verify the data was inserted
      const count = db.prepare('SELECT COUNT(*) as count FROM key_english').get();
      console.log(`Total books in key_english after insert: ${count.count}`);
    });
    
    // Execute the transaction
    transaction();
    
    db.close();
    console.log('Successfully populated key_english table');
    
  } catch (error) {
    console.error('Error populating key_english table:', error);
    process.exit(1);
  }
}

populateKeyEnglish();
