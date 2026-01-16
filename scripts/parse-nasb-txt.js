import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the text file
const txtPath = path.join(__dirname, 'NASB1995.txt');

// Path to the SQLite database
const dbPath = path.join(__dirname, '..', 'data', 'bible', 'Bibles.db');

// Book name to ID mapping (expanded to include common variations)
const bookNameToId = {
  // Old Testament
  'GENESIS': 1, 'GEN': 1, 'GE': 1, 'GN': 1,
  'EXODUS': 2, 'EXOD': 2, 'EXO': 2, 'EX': 2,
  // ... (rest of the book mappings remain the same as before)
  'REVELATION': 66, 'REV': 66, 'RE': 66
};

async function parseAndImport() {
  console.log('Starting NASB 1995 text parsing...');
  
  // Read the file with different encodings if needed
  let fileContent;
  try {
    // Try UTF-8 first
    fileContent = await readFile(txtPath, 'utf-8');
  } catch (error) {
    console.error('Error reading file with UTF-8 encoding, trying Windows-1252...');
    try {
      // Try Windows-1252 if UTF-8 fails
      const buffer = await readFile(txtPath);
      const decoder = new TextDecoder('windows-1252');
      fileContent = decoder.decode(buffer);
    } catch (err) {
      console.error('Failed to read file with any encoding:', err);
      return;
    }
  }

  // Clean up the content
  let lines = fileContent
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\r/g, '\n')     // Handle Mac line endings
    .split('\n')               // Split into lines
    .map(line => line.trim())   // Trim whitespace
    .filter(line => line.length > 0); // Remove empty lines

  console.log(`Found ${lines.length} non-empty lines in the file`);

  // Open the database
  const db = new Database(dbPath);
  
  try {
    // Clear existing data
    console.log('Clearing existing data from t_nasb1995 table...');
    db.prepare('DELETE FROM t_nasb1995').run();
    
    // Prepare the insert statement
    const insertStmt = db.prepare(
      'INSERT INTO t_nasb1995 (book, chapter, verse, text) VALUES (?, ?, ?, ?)'
    );

    // State tracking
    let currentBook = '';
    let currentChapter = 0;
    let verseCount = 0;
    let skippedLines = 0;
    let inBook = false;
    let currentVerseText = '';
    let currentVerseNum = 0;

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip the URL line if present
      if (line.includes('nasb.literalword.com')) {
        continue;
      }
      
      // Check for book name (all caps, not a verse)
      if (line === line.toUpperCase() && line.length > 2 && !/^\d/.test(line) && !line.includes('Chapter')) {
        currentBook = line.trim();
        inBook = true;
        console.log(`Found book: ${currentBook}`);
        continue;
      }
      
      // Check for chapter line
      const chapterMatch = line.match(/Chapter\s+(\d+)/i);
      if (chapterMatch) {
        currentChapter = parseInt(chapterMatch[1], 10);
        console.log(`  Chapter ${currentChapter}`);
        continue;
      }
      
      // Check for verse pattern (verse number followed by text)
      const verseMatch = line.match(/^\s*\uFEFF*\uFFFD*\s*(\d+):(\d+)\s*(.*)/);
      if (verseMatch) {
        // If we have a verse text pending, save it
        if (currentVerseText && currentBook && currentChapter && currentVerseNum) {
          try {
            insertStmt.run(
              bookNameToId[currentBook] || 0,
              currentChapter,
              currentVerseNum,
              currentVerseText.trim()
            );
            verseCount++;
          } catch (error) {
            console.error(`Error inserting ${currentBook} ${currentChapter}:${currentVerseNum}:`, error.message);
          }
        }
        
        // Start new verse
        const [, chapter, verseNum, text] = verseMatch;
        currentChapter = parseInt(chapter, 10);
        currentVerseNum = parseInt(verseNum, 10);
        currentVerseText = text || '';
        continue;
      }
      
      // If we're in a book and have a current verse, append to it
      if (inBook && currentBook && currentChapter && currentVerseNum) {
        currentVerseText += ' ' + line;
      } else {
        skippedLines++;
        if (skippedLines < 10) { // Only log first few skipped lines to avoid spam
          console.log(`Skipping line: ${line.substring(0, 50)}...`);
        } else if (skippedLines === 10) {
          console.log('(Additional skipped lines not shown)')
        }
      }
      
      // Show progress
      if (i % 1000 === 0) {
        console.log(`Processed ${i} of ${lines.length} lines...`);
      }
    }
    
    // Insert the last verse
    if (currentVerseText && currentBook && currentChapter && currentVerseNum) {
      try {
        insertStmt.run(
          bookNameToId[currentBook] || 0,
          currentChapter,
          currentVerseNum,
          currentVerseText.trim()
        );
        verseCount++;
      } catch (error) {
        console.error(`Error inserting final verse:`, error.message);
      }
    }
    
    console.log('\nImport completed!');
    console.log(`- Total verses imported: ${verseCount}`);
    console.log(`- Lines skipped: ${skippedLines}`);
    
    // Verify the import
    const result = db.prepare('SELECT COUNT(*) as count FROM t_nasb1995').get();
    console.log(`\nTotal verses in t_nasb1995 table: ${result.count}`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    db.close();
  }
}

// Run the import
parseAndImport().catch(console.error);
