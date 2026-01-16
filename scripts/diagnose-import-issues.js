import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995_chunked.txt');
const OUTPUT_FILE = path.join(__dirname, 'import-diagnostic-results.txt');

// Expected verse counts by book (approximate)
const EXPECTED_VERSES = [
  1533, 1213, 859, 1288, 959, 658, 618, 85, 810, 695, 816, 719, 942, 822, 280, 406, 167, 1070, 2461,
  915, 222, 117, 1292, 1364, 154, 1273, 357, 197, 73, 146, 21, 48, 105, 47, 56, 53, 38, 211, 55,
  1071, 678, 1151, 879, 1007, 433, 437, 257, 149, 155, 104, 95, 89, 47, 113, 83, 46, 25, 303, 108,
  105, 61, 105, 13, 14, 25, 404
];

// Book names in order
const BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
  'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

// Track statistics
const stats = {
  totalLines: 0,
  bookStarts: 0,
  chapterStarts: 0,
  verseStarts: 0,
  currentBook: null,
  currentChapter: null,
  books: {},
  versePatterns: {
    standard: 0,      // e.g., "1 In the beginning..."
    chapterVerse: 0,  // e.g., "1:1 In the beginning..."
    other: 0          // Other patterns
  },
  lineLengths: {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
    '100+': 0
  },
  consecutiveVerses: {
    count: 0,
    max: 0,
    current: 0
  }
};

// Initialize book tracking
BOOK_NAMES.forEach((book, index) => {
  stats.books[book] = {
    name: book,
    id: index + 1,
    chapterCount: 0,
    verseCount: 0,
    expectedVerses: EXPECTED_VERSES[index] || 0,
    chapters: {},
    firstVerse: null,
    lastVerse: null
  };
});

function analyzeLine(line) {
  stats.totalLines++;
  const trimmed = line.trim();
  
  // Track line length distribution
  const length = trimmed.length;
  if (length <= 20) stats.lineLengths['0-20']++;
  else if (length <= 40) stats.lineLengths['21-40']++;
  else if (length <= 60) stats.lineLengths['41-60']++;
  else if (length <= 80) stats.lineLengths['61-80']++;
  else if (length <= 100) stats.lineLengths['81-100']++;
  else stats.lineLengths['100+']++;
  
  // Check for book header (e.g., "# GENESIS")
  if (trimmed.startsWith('#')) {
    stats.bookStarts++;
    const bookName = trimmed.substring(1).trim().toUpperCase();
    const bookMatch = BOOK_NAMES.find(book => 
      book.toUpperCase() === bookName || 
      bookName.startsWith(book.toUpperCase() + ' ')
    );
    
    if (bookMatch) {
      stats.currentBook = bookMatch;
      stats.currentChapter = null;
      stats.consecutiveVerses.current = 0;
    }
    return { type: 'book', name: bookMatch || bookName };
  }
  
  // Check for chapter header (e.g., "Chapter 1")
  const chapterMatch = trimmed.match(/^Chapter\s+(\d+)/i);
  if (chapterMatch && stats.currentBook) {
    stats.chapterStarts++;
    const chapterNum = parseInt(chapterMatch[1], 10);
    stats.currentChapter = chapterNum;
    
    // Initialize chapter tracking
    if (!stats.books[stats.currentBook].chapters[chapterNum]) {
      stats.books[stats.currentBook].chapters[chapterNum] = {
        verseCount: 0,
        verses: new Set(),
        firstVerse: null,
        lastVerse: null
      };
      stats.books[stats.currentBook].chapterCount++;
    }
    
    stats.consecutiveVerses.current = 0;
    return { type: 'chapter', number: chapterNum };
  }
  
  // Check for verse (e.g., "1 In the beginning..." or "1:1 In the beginning...")
  if (stats.currentBook && stats.currentChapter) {
    // Try standard verse format: "1 Text..."
    let verseMatch = trimmed.match(/^(\d+)\s+(.+)/);
    
    if (verseMatch) {
      stats.verseStarts++;
      stats.versePatterns.standard++;
      
      const verseNum = parseInt(verseMatch[1], 10);
      const verseText = verseMatch[2].trim();
      
      return processVerse(verseNum, verseText);
    }
    
    // Try chapter:verse format: "1:1 Text..."
    verseMatch = trimmed.match(/^(\d+):(\d+)\s+(.+)/);
    if (verseMatch) {
      stats.verseStarts++;
      stats.versePatterns.chapterVerse++;
      
      const verseNum = parseInt(verseMatch[2], 10);
      const verseText = verseMatch[3].trim();
      
      return processVerse(verseNum, verseText);
    }
    
    // Count other lines as potential verse continuations
    if (trimmed.length > 0) {
      stats.versePatterns.other++;
      return { type: 'other', text: trimmed };
    }
  }
  
  return { type: 'unknown', text: trimmed };
}

function processVerse(verseNum, verseText) {
  if (!stats.currentBook || !stats.currentChapter) {
    return { type: 'verse', number: verseNum, text: verseText, status: 'orphaned' };
  }
  
  const book = stats.books[stats.currentBook];
  const chapter = book.chapters[stats.currentChapter];
  
  if (!chapter) {
    return { type: 'verse', number: verseNum, text: verseText, status: 'no_chapter' };
  }
  
  // Track verse
  chapter.verses.add(verseNum);
  chapter.verseCount++;
  book.verseCount++;
  
  // Update first/last verse tracking
  if (!book.firstVerse || verseNum < book.firstVerse) {
    book.firstVerse = verseNum;
  }
  if (!book.lastVerse || verseNum > book.lastVerse) {
    book.lastVerse = verseNum;
  }
  
  // Track consecutive verses
  stats.consecutiveVerses.current++;
  if (stats.consecutiveVerses.current > stats.consecutiveVerses.max) {
    stats.consecutiveVerses.max = stats.consecutiveVerses.current;
  }
  
  return { 
    type: 'verse', 
    book: stats.currentBook,
    chapter: stats.currentChapter,
    number: verseNum,
    text: verseText,
    status: 'ok'
  };
}

async function analyzeFile() {
  const output = createWriteStream(OUTPUT_FILE);
  
  function log(message, data) {
    const line = `${new Date().toISOString()} - ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    console.log(line);
    output.write(line);
  }
  
  try {
    log('Starting analysis of NASB1995 text file...');
    log(`Input file: ${INPUT_FILE}`);
    
    // Read the file line by line
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const lines = content.split('\n');
    
    log(`Processing ${lines.length} lines...`);
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const result = analyzeLine(lines[i]);
      
      // Log interesting findings
      if (result.type === 'verse' && result.status !== 'ok') {
        log(`Issue at line ${i + 1}:`, result);
      }
      
      // Log progress
      if (i > 0 && i % 1000 === 0) {
        log(`Processed ${i} lines...`);
      }
    }
    
    // Generate summary
    log('\n=== ANALYSIS SUMMARY ===');
    log(`Total lines processed: ${stats.totalLines}`);
    log(`Book starts detected: ${stats.bookStarts}`);
    log(`Chapter starts detected: ${stats.chapterStarts}`);
    log(`Verse starts detected: ${stats.verseStarts}`);
    
    log('\n=== VERSE PATTERNS ===');
    log('Pattern counts:', stats.versePatterns);
    
    log('\n=== LINE LENGTH DISTRIBUTION ===');
    log('Line lengths:', stats.lineLengths);
    
    log('\n=== CONSECUTIVE VERSES ===');
    log('Longest consecutive verse run:', stats.consecutiveVerses.max);
    
    log('\n=== BOOK STATISTICS ===');
    BOOK_NAMES.forEach(bookName => {
      const book = stats.books[bookName];
      if (book.verseCount > 0) {
        const percent = Math.round((book.verseCount / book.expectedVerses) * 100);
        log(`${bookName.padEnd(15)}: ${book.verseCount.toString().padStart(5)} / ${book.expectedVerses.toString().padStart(5)} (${percent}%)`);
      }
    });
    
    // Identify potential issues
    log('\n=== POTENTIAL ISSUES ===');
    
    // Books with no verses
    const missingBooks = BOOK_NAMES.filter(name => stats.books[name].verseCount === 0);
    if (missingBooks.length > 0) {
      log(`Books with no verses detected (${missingBooks.length}):`, missingBooks);
    }
    
    // Books with low verse counts
    const lowCountBooks = BOOK_NAMES.filter(name => {
      const book = stats.books[name];
      return book.verseCount > 0 && book.verseCount < book.expectedVerses * 0.5;
    });
    
    if (lowCountBooks.length > 0) {
      log('\nBooks with low verse counts:');
      lowCountBooks.forEach(name => {
        const book = stats.books[name];
        const percent = Math.round((book.verseCount / book.expectedVerses) * 100);
        log(`  ${name.padEnd(15)}: ${book.verseCount.toString().padStart(5)} / ${book.expectedVerses.toString().padStart(5)} (${percent}%)`);
      });
    }
    
    // Sample some verses from each book
    log('\n=== SAMPLE VERSES ===');
    BOOK_NAMES.forEach(bookName => {
      const book = stats.books[bookName];
      if (book.verseCount > 0) {
        const chapters = Object.keys(book.chapters);
        if (chapters.length > 0) {
          const sampleChapter = parseInt(chapters[0], 10);
          const chapter = book.chapters[sampleChapter];
          if (chapter.verseCount > 0) {
            const firstVerse = Math.min(...Array.from(chapter.verses));
            log(`${bookName} ${sampleChapter}:${firstVerse} - [Sample verse]`);
          }
        }
      }
    });
    
    log('\nAnalysis complete!');
    
  } catch (error) {
    log('Error during analysis:', error.message);
  } finally {
    output.end();
    log(`\nResults written to: ${OUTPUT_FILE}`);
  }
}

// Run the analysis
analyzeFile().catch(error => {
  console.error('Unhandled error during analysis:', error);
  process.exit(1);
});
