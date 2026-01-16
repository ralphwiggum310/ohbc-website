const XLSX = require('xlsx');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function importTranslations() {
  try {
    // Paths
    const excelPath = path.join(__dirname, '..', 'Bible api', 'KJV,ASV,ERV,WEB.xlsx');
    const dbPath = path.join(__dirname, '..', 'Bible api', 'bible.eng.db');

    // Read the Excel file
    console.log('Reading Excel file...');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Get headers (translations)
    const headers = jsonData[0];
    const translations = headers.slice(1); // Skip the first column (verse reference)
    
    console.log('Found translations:', translations);

    // Open the database
    console.log('Opening database...');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS key_english (
        id INTEGER PRIMARY KEY,
        name TEXT,
        abbreviation TEXT,
        book_order INTEGER
      );
    `);

    // Create a table for each translation if it doesn't exist
    for (const translation of translations) {
      const tableName = `t_${translation.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      
      await db.exec(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id INTEGER PRIMARY KEY,
          book INTEGER,
          chapter INTEGER,
          verse INTEGER,
          text TEXT,
          FOREIGN KEY (book) REFERENCES key_english (id)
        );
      `);
      
      // Create index for faster lookups
      await db.exec(`
        CREATE INDEX IF NOT EXISTS idx_${tableName}_ref 
        ON ${tableName} (book, chapter, verse);
      `);
    }

    // Parse and insert verses
    console.log('Importing verses...');
    const bookMap = new Map(); // Cache for book names to IDs
    
    // Skip header row
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      // Parse verse reference (format: "Genesis 1:1")
      const verseRef = row[0];
      const [bookChapter, verse] = verseRef.split(':');
      const bookMatch = bookChapter.match(/^(\d*\s*[A-Za-z]+)/);
      
      if (!bookMatch) {
        console.warn(`Skipping invalid verse reference: ${verseRef}`);
        continue;
      }
      
      const bookName = bookMatch[1].trim();
      const chapter = bookChapter.replace(bookName, '').trim();
      
      // Get or create book ID
      let bookId = bookMap.get(bookName);
      if (!bookId) {
        // Try to find existing book
        const existingBook = await db.get(
          'SELECT id FROM key_english WHERE name = ?', 
          bookName
        );
        
        if (existingBook) {
          bookId = existingBook.id;
        } else {
          // Insert new book
          const result = await db.run(
            'INSERT INTO key_english (name, abbreviation) VALUES (?, ?)',
            bookName,
            bookName.replace(/^\d+\s*/, '').substring(0, 3).toLowerCase()
          );
          bookId = result.lastID;
        }
        bookMap.set(bookName, bookId);
      }
      
      // Insert verses for each translation
      for (let j = 0; j < translations.length; j++) {
        const translation = translations[j];
        const tableName = `t_${translation.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const verseText = row[j + 1]; // +1 to skip verse reference column
        
        if (!verseText) continue; // Skip empty verses
        
        await db.run(
          `INSERT INTO ${tableName} (book, chapter, verse, text) VALUES (?, ?, ?, ?)`,
          bookId,
          parseInt(chapter) || 1,
          parseInt(verse) || 1,
          verseText
        );
      }
      
      // Log progress
      if (i % 1000 === 0) {
        console.log(`Processed ${i} verses...`);
      }
    }
    
    console.log('Import completed successfully!');
    await db.close();
    
  } catch (error) {
    console.error('Error importing translations:', error);
    process.exit(1);
  }
}

// Run the import
importTranslations();
