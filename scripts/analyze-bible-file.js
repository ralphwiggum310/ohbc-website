const fs = require('fs');
const readline = require('readline');

const filePath = 'scripts/NASB1995-cleaned.txt';

// Expected books of the Bible in order
const EXPECTED_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

async function analyzeFile() {
  console.log(`Analyzing ${filePath}...\n`);
  
  try {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    const books = new Set();
    const chapters = new Set();
    const verses = new Set();
    let lineCount = 0;
    let currentBook = '';
    let currentChapter = '';
    
    // Patterns to identify different parts of the text
    const bookPattern = /^#\s+([A-Za-z0-9\s]+)$/;
    const chapterPattern = /^##\s+Chapter\s+(\d+)/i;
    const versePattern = /^###\s*(\d+:\d+)/;
    
    console.log('First 20 lines of the file:');
    console.log('---------------------------');
    
    const firstLines = [];
    
    for await (const line of rl) {
      lineCount++;
      
      // Store first 20 lines for analysis
      if (lineCount <= 20) {
        firstLines.push(`${lineCount}: ${line}`);
      }
      
      // Check for book headers
      const bookMatch = line.match(bookPattern);
      if (bookMatch) {
        currentBook = bookMatch[1].trim();
        books.add(currentBook);
        continue;
      }
      
      // Check for chapter headers
      const chapterMatch = line.match(chapterPattern);
      if (chapterMatch) {
        currentChapter = chapterMatch[1];
        chapters.add(`${currentBook} ${currentChapter}`);
        continue;
      }
      
      // Check for verses
      const verseMatch = line.match(versePattern);
      if (verseMatch) {
        verses.add(`${currentBook} ${currentChapter}:${verseMatch[1]}`);
      }
    }
    
    // Print first 20 lines
    console.log(firstLines.join('\n'));
    
    // Print analysis
    console.log('\n=== Analysis ===');
    console.log(`Total lines: ${lineCount}`);
    console.log(`Books found: ${books.size}`);
    console.log(`Chapters found: ${chapters.size}`);
    console.log(`Verses found: ${verses.size}`);
    
    // Check for missing books
    const missingBooks = EXPECTED_BOOKS.filter(book => !Array.from(books).some(b => b.includes(book)));
    
    if (missingBooks.length > 0) {
      console.log('\n⚠️  Missing books:');
      console.log(missingBooks.join(', '));
    }
    
    // Show sample of found books, chapters, and verses
    console.log('\nSample of found books:');
    console.log(Array.from(books).slice(0, 5).join('\n'));
    
    console.log('\nSample of found chapters:');
    console.log(Array.from(chapters).slice(0, 5).join('\n'));
    
    console.log('\nSample of found verses:');
    console.log(Array.from(verses).slice(0, 5).join('\n'));
    
  } catch (error) {
    console.error('Error analyzing file:', error);
  }
}

analyzeFile();
