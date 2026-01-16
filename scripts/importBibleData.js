const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Configuration
const DB_PATH = 'C:\WindSurf\ohbc_website\data\bible\bibles.db';
const DATA_DIR = path.join(__dirname, '..', 'Bible api', 'klv_wbt');

// Book name to ID mapping
const BOOK_ABBREVIATIONS = {
  'GEN': 1, 'EXO': 2, 'LEV': 3, 'NUM': 4, 'DEU': 5, 'JOS': 6, 'JDG': 7, 'RUT': 8,
  '1SA': 9, '2SA': 10, '1KI': 11, '2KI': 12, '1CH': 13, '2CH': 14, 'EZR': 15, 'NEH': 16,
  'EST': 17, 'JOB': 18, 'PSA': 19, 'PRO': 20, 'ECC': 21, 'SNG': 22, 'ISA': 23, 'JER': 24,
  'LAM': 25, 'EZK': 26, 'DAN': 27, 'HOS': 28, 'JOL': 29, 'AMO': 30, 'OBA': 31, 'JON': 32,
  'MIC': 33, 'NAM': 34, 'HAB': 35, 'ZEP': 36, 'HAG': 37, 'ZEC': 38, 'MAL': 39, 'MAT': 40,
  'MRK': 41, 'LUK': 42, 'JHN': 43, 'ACT': 44, 'ROM': 45, '1CO': 46, '2CO': 47, 'GAL': 48,
  'EPH': 49, 'PHP': 50, 'COL': 51, '1TH': 52, '2TH': 53, '1TI': 54, '2TI': 55, 'TIT': 56,
  'PHM': 57, 'HEB': 58, 'JAS': 59, '1PE': 60, '2PE': 61, '1JN': 62, '2JN': 63, '3JN': 64,
  'JUD': 65, 'REV': 66
};

async function main() {
  console.log('Starting Bible data import...');
  
  // Open the database
  console.log(`Opening database at ${DB_PATH}...`);
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  try {
    // Begin transaction for better performance
    await db.run('BEGIN TRANSACTION');
    
    // Check if tables exist and are empty
    const tableCheck = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='t_king_james_bible'"
    );
    
    if (!tableCheck) {
      throw new Error('Required tables do not exist in the database');
    }
    
    // Get list of book directories
    const bookDirs = (await fs.readdir(DATA_DIR, { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory() && dirent.name.length <= 4)
      .map(dirent => dirent.name);
    
    console.log(`Found ${bookDirs.length} book directories`);
    
    // Process each book
    for (const bookDir of bookDirs) {
      const bookPath = path.join(DATA_DIR, bookDir);
      const chapterFiles = (await fs.readdir(bookPath))
        .filter(file => file.endsWith('.json') && file !== 'books.json')
        .sort((a, b) => parseInt(a) - parseInt(b));
      
      console.log(`\nProcessing ${bookDir} (${chapterFiles.length} chapters)`);
      
      // Process each chapter
      for (const chapterFile of chapterFiles) {
        const chapterNum = parseInt(chapterFile.replace('.json', ''));
        const chapterPath = path.join(bookPath, chapterFile);
        
        try {
          // Read and parse the chapter file
          const data = JSON.parse(await fs.readFile(chapterPath, 'utf8'));
          
          // Get the book ID
          const bookId = BOOK_ABBREVIATIONS[bookDir];
          if (!bookId) {
            console.warn(`  Skipping unknown book: ${bookDir}`);
            continue;
          }
          
          // Process each verse
          for (const item of data.chapter.content) {
            if (item.type === 'verse' && item.number) {
              const verseNum = item.number;
              const verseText = Array.isArray(item.content) 
                ? item.content.join(' ') 
                : String(item.content || '');
              
              // Insert into KJV table
              await db.run(
                `INSERT OR REPLACE INTO t_king_james_bible (book, chapter, verse, text) 
                 VALUES (?, ?, ?, ?)`,
                [bookId, chapterNum, verseNum, verseText]
              );
            }
          }
          
          console.log(`  Processed ${bookDir} ${chapterNum}`);
          
        } catch (error) {
          console.error(`  Error processing ${bookDir} ${chapterNum}:`, error.message);
        }
      }
    }
    
    // Commit the transaction
    await db.run('COMMIT');
    console.log('\nImport completed successfully!');
    
  } catch (error) {
    // Rollback on error
    await db.run('ROLLBACK');
    console.error('\nError during import:', error);
    process.exit(1);
    
  } finally {
    // Close the database
    await db.close();
  }
}

// Run the import
main().catch(console.error);
