import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const enhancedFilePath = path.join(__dirname, 'NASB1995-enhanced.txt');
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Book name to ID mapping
const bookNameToId = {
  'GENESIS': 1, 'EXODUS': 2, 'LEVITICUS': 3, 'NUMBERS': 4, 'DEUTERONOMY': 5,
  'JOSHUA': 6, 'JUDGES': 7, 'RUTH': 8, '1 SAMUEL': 9, '2 SAMUEL': 10,
  '1 KINGS': 11, '2 KINGS': 12, '1 CHRONICLES': 13, '2 CHRONICLES': 14,
  'EZRA': 15, 'NEHEMIAH': 16, 'ESTHER': 17, 'JOB': 18, 'PSALM': 19, 'PSALMS': 19,
  'PROVERBS': 20, 'ECCLESIASTES': 21, 'SONG OF SOLOMON': 22, 'ISAIAH': 23,
  'JEREMIAH': 24, 'LAMENTATIONS': 25, 'EZEKIEL': 26, 'DANIEL': 27,
  'HOSEA': 28, 'JOEL': 29, 'AMOS': 30, 'OBADIAH': 31, 'JONAH': 32,
  'MICAH': 33, 'NAHUM': 34, 'HABAKKUK': 35, 'ZEPHANIAH': 36, 'HAGGAI': 37,
  'ZECHARIAH': 38, 'MALACHI': 39, 'MATTHEW': 40, 'MARK': 41, 'LUKE': 42,
  'JOHN': 43, 'ACTS': 44, 'ROMANS': 45, '1 CORINTHIANS': 46, '2 CORINTHIANS': 47,
  'GALATIANS': 48, 'EPHESIANS': 49, 'PHILIPPIANS': 50, 'COLOSSIANS': 51,
  '1 THESSALONIANS': 52, '2 THESSALONIANS': 53, '1 TIMOTHY': 54, '2 TIMOTHY': 55,
  'TITUS': 56, 'PHILEMON': 57, 'HEBREWS': 58, 'JAMES': 59, '1 PETER': 60,
  '2 PETER': 61, '1 JOHN': 62, '2 JOHN': 63, '3 JOHN': 64, 'JUDE': 65,
  'REVELATION': 66
};

async function importEnhancedNASB() {
  console.log('Starting import of enhanced NASB1995 text...');
  
  // Connect to the database
  const db = new Database(dbPath);
  
  try {
    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');
    
    // Create the table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS t_nasb1995 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (book) REFERENCES key_english (id),
        UNIQUE(book, chapter, verse)
      )
    `);
    
    // Clear existing data
    console.log('Clearing existing data from t_nasb1995...');
    db.prepare('DELETE FROM t_nasb1995').run();
    
    // Read the enhanced file
    console.log('Reading enhanced text file...');
    const content = await readFile(enhancedFilePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Prepare the insert statement
    const insert = db.prepare(
      'INSERT INTO t_nasb1995 (book, chapter, verse, text) VALUES (?, ?, ?, ?)'
    );
    
    // Start a transaction
    const insertMany = db.transaction((verses) => {
      for (const verse of verses) {
        try {
          insert.run(verse.book, verse.chapter, verse.verse, verse.text);
        } catch (error) {
          console.error(`Error inserting ${verse.book}:${verse.chapter}:${verse.verse}:`, error.message);
        }
      }
    });
    
    // Process the file
    console.log('Processing verses...');
    let currentBook = null;
    let currentChapter = 0;
    const verses = [];
    let verseCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check for book header
      if (line.startsWith('# ')) {
        const bookName = line.substring(2).trim();
        if (bookNameToId[bookName]) {
          currentBook = bookNameToId[bookName];
          console.log(`\nProcessing book: ${bookName} (ID: ${currentBook})`);
        } else {
          console.warn(`Unknown book: ${bookName}`);
        }
        continue;
      }
      
      // Check for chapter header
      if (line.startsWith('## ')) {
        const chapterMatch = line.match(/## Chapter (\d+)/);
        if (chapterMatch) {
          currentChapter = parseInt(chapterMatch[1], 10);
          console.log(`  Chapter ${currentChapter}`);
        }
        continue;
      }
      
      // Process verse line
      if (currentBook && currentChapter) {
        const verseMatch = line.match(/^(\d+):(\d+)\s+(.*)/);
        if (verseMatch) {
          const chapter = parseInt(verseMatch[1], 10);
          const verseNum = parseInt(verseMatch[2], 10);
          const text = verseMatch[3].trim();
          
          // Verify chapter consistency
          if (chapter !== currentChapter) {
            console.warn(`  Chapter mismatch: Expected ${currentChapter}, found ${chapter} in verse ${verseNum}`);
          }
          
          // Add to batch
          verses.push({
            book: currentBook,
            chapter: currentChapter, // Use the current chapter to maintain consistency
            verse: verseNum,
            text
          });
          
          verseCount++;
          
          // Insert in batches of 1000
          if (verses.length >= 1000) {
            insertMany(verses);
            console.log(`  Processed ${verseCount} verses...`);
            verses.length = 0; // Clear the array
          }
        }
      }
    }
    
    // Insert any remaining verses
    if (verses.length > 0) {
      insertMany(verses);
    }
    
    console.log(`\nImport complete!`);
    console.log(`Total verses processed: ${verseCount}`);
    
    // Verify the import
    const result = db.prepare('SELECT COUNT(*) as count FROM t_nasb1995').get();
    console.log(`Verses in database: ${result.count}`);
    
    // Count verses by book
    console.log('\nVerses by book:');
    const bookCounts = db.prepare(`
      SELECT b.name, COUNT(*) as count 
      FROM t_nasb1995 v 
      JOIN key_english b ON v.book = b.id 
      GROUP BY v.book 
      ORDER BY v.book
    `).all();
    
    bookCounts.forEach(({name, count}) => {
      console.log(`  ${name.padEnd(15)}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    db.close();
  }
}

// Run the import
importEnhancedNASB().catch(console.error);
