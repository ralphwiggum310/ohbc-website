import xlsx from 'xlsx';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXCEL_PATH = 'C:\\WindSurf\\ohbc_website\\data\\bible\\KJV,ASV,ERV,WEB.xlsx';
const DB_PATH = 'C:\\WindSurf\\ohbc_website\\data\\bible\\bibles.db';

// Bible version mapping (Excel column index to version code)
const VERSIONS = [
  { name: 'KJV', column: 1 },
  { name: 'ASV', column: 2 },
  { name: 'ERV', column: 3 },
  { name: 'WEB', column: 4 }
];

// Book name to ID mapping (you may need to adjust this)
const BOOK_IDS = {
  'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
  'Joshua': 6, 'Judges': 7, 'Ruth': 8, '1 Samuel': 9, '2 Samuel': 10,
  '1 Kings': 11, '2 Kings': 12, '1 Chronicles': 13, '2 Chronicles': 14, 'Ezra': 15,
  'Nehemiah': 16, 'Esther': 17, 'Job': 18, 'Psalms': 19, 'Proverbs': 20,
  'Ecclesiastes': 21, 'Song of Solomon': 22, 'Isaiah': 23, 'Jeremiah': 24,
  'Lamentations': 25, 'Ezekiel': 26, 'Daniel': 27, 'Hosea': 28, 'Joel': 29,
  'Amos': 30, 'Obadiah': 31, 'Jonah': 32, 'Micah': 33, 'Nahum': 34,
  'Habakkuk': 35, 'Zephaniah': 36, 'Haggai': 37, 'Zechariah': 38, 'Malachi': 39,
  'Matthew': 40, 'Mark': 41, 'Luke': 42, 'John': 43, 'Acts': 44,
  'Romans': 45, '1 Corinthians': 46, '2 Corinthians': 47, 'Galatians': 48,
  'Ephesians': 49, 'Philippians': 50, 'Colossians': 51, '1 Thessalonians': 52,
  '2 Thessalonians': 53, '1 Timothy': 54, '2 Timothy': 55, 'Titus': 56,
  'Philemon': 57, 'Hebrews': 58, 'James': 59, '1 Peter': 60, '2 Peter': 61,
  '1 John': 62, '2 John': 63, '3 John': 64, 'Jude': 65, 'Revelation': 66
};

async function parseVerseReference(ref) {
  // Example: "Genesis 1:1" -> { book: "Genesis", chapter: 1, verse: 1 }
  const match = ref.match(/^(\d*\s*[A-Za-z]+)\s+(\d+):(\d+)/);
  if (!match) {
    console.error(`Could not parse reference: ${ref}`);
    return null;
  }
  
  let book = match[1].trim();
  // Handle books with numbers (e.g., "1 John")
  if (/^\d/.test(book)) {
    const spaceIdx = book.indexOf(' ');
    if (spaceIdx > 0) {
      book = book.substring(0, spaceIdx + 1) + book[spaceIdx + 1].toUpperCase() + book.substring(spaceIdx + 2).toLowerCase();
    }
  } else {
    book = book[0].toUpperCase() + book.substring(1).toLowerCase();
  }
  
  // Special case for Psalm vs Psalms
  if (book === 'Psalm') book = 'Psalms';
  
  return {
    book,
    bookId: BOOK_IDS[book],
    chapter: parseInt(match[2], 10),
    verse: parseInt(match[3], 10)
  };
}

async function importBibleText() {
  console.log('Starting Bible text import...');
  
  // Open the database
  console.log(`Opening database: ${DB_PATH}`);
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  try {
    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bible_verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        version TEXT NOT NULL,
        text TEXT NOT NULL,
        UNIQUE(book_id, chapter, verse, version)
      );
    `);
    
    // Read the Excel file
    console.log(`Reading Excel file: ${EXCEL_PATH}`);
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Skip header row
    const dataRows = rows.slice(1);
    console.log(`Found ${dataRows.length} verses to process`);
    
    // Start a transaction for better performance
    await db.exec('BEGIN TRANSACTION');
    
    // Clear existing data (optional, comment out if you want to keep existing data)
    // console.log('Clearing existing data...');
    // await db.run('DELETE FROM bible_verses');
    
    // Process each row
    let count = 0;
    const batchSize = 1000;
    
    for (const row of dataRows) {
      if (!row || row.length < 1) continue;
      
      const reference = row[0];
      if (!reference) continue;
      
      const verseInfo = await parseVerseReference(reference);
      if (!verseInfo) continue;
      
      // Insert verse for each version
      for (const version of VERSIONS) {
        const text = row[version.column];
        if (!text) continue;
        
        try {
          await db.run(
            `INSERT OR REPLACE INTO bible_verses 
             (book_id, chapter, verse, version, text) 
             VALUES (?, ?, ?, ?, ?)`,
            [verseInfo.bookId, verseInfo.chapter, verseInfo.verse, version.name, text]
          );
        } catch (error) {
          console.error(`Error inserting ${version.name} ${reference}:`, error.message);
        }
      }
      
      // Log progress
      count++;
      if (count % batchSize === 0) {
        console.log(`Processed ${count} verses...`);
      }
    }
    
    // Commit the transaction
    await db.exec('COMMIT');
    
    console.log(`\nImport completed successfully!`);
    console.log(`Processed ${count} verses`);
    
    // Show some stats
    const stats = await db.all(
      'SELECT version, COUNT(*) as count FROM bible_verses GROUP BY version'
    );
    
    console.log('\nVerses imported by version:');
    for (const stat of stats) {
      console.log(`  ${stat.version}: ${stat.count} verses`);
    }
    
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run the import
importBibleText().catch(console.error);
