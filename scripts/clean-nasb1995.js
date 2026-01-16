import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned.txt');
const LOG_FILE = path.join(__dirname, 'clean-nasb1995.log');

// Book names in order with common variations
const BOOK_NAMES = [
  'GENESIS', 'EXODUS', 'LEVITICUS', 'NUMBERS', 'DEUTERONOMY', 'JOSHUA', 'JUDGES', 'RUTH',
  '1 SAMUEL', '2 SAMUEL', '1 KINGS', '2 KINGS', '1 CHRONICLES', '2 CHRONICLES', 'EZRA', 'NEHEMIAH',
  'ESTHER', 'JOB', 'PSALMS', 'PROVERBS', 'ECCLESIASTES', 'SONG OF SOLOMON', 'ISAIAH', 'JEREMIAH',
  'LAMENTATIONS', 'EZEKIEL', 'DANIEL', 'HOSEA', 'JOEL', 'AMOS', 'OBADIAH', 'JONAH', 'MICAH',
  'NAHUM', 'HABAKKUK', 'ZEPHANIAH', 'HAGGAI', 'ZECHARIAH', 'MALACHI', 'MATTHEW', 'MARK', 'LUKE',
  'JOHN', 'ACTS', 'ROMANS', '1 CORINTHIANS', '2 CORINTHIANS', 'GALATIANS', 'EPHESIANS',
  'PHILIPPIANS', 'COLOSSIANS', '1 THESSALONIANS', '2 THESSALONIANS', '1 TIMOTHY', '2 TIMOTHY',
  'TITUS', 'PHILEMON', 'HEBREWS', 'JAMES', '1 PETER', '2 PETER', '1 JOHN', '2 JOHN', '3 JOHN',
  'JUDE', 'REVELATION'
];

// State machine states
const STATE = {
  START: 'start',
  IN_BOOK: 'in_book',
  IN_CHAPTER: 'in_chapter',
  IN_VERSE: 'in_verse'
};

// Track statistics
const stats = {
  linesProcessed: 0,
  booksFound: 0,
  chaptersFound: 0,
  versesFound: 0,
  currentBook: null,
  currentChapter: null,
  currentVerse: null,
  bookStarts: {},
  chapterStarts: {},
  versePatterns: {}
};

// Initialize log file
const logStream = createWriteStream(LOG_FILE, { flags: 'w' });

function log(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  logStream.write(logMessage);
  console.log(`[${timestamp}] ${message}`);
}

function normalizeText(text) {
  // Replace non-breaking spaces with regular spaces
  let normalized = text.replace(/\u00A0/g, ' ');
  
  // Replace multiple spaces with a single space
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Remove any remaining control characters
  normalized = normalized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  return normalized;
}

function isBookHeader(line) {
  const upperLine = line.toUpperCase();
  
  // Check for book name at start of line (with or without #)
  for (const book of BOOK_NAMES) {
    if (upperLine.startsWith(book) || 
        upperLine.startsWith(`#${book}`) ||
        upperLine.startsWith(`# ${book}`)) {
      return book;
    }
  }
  
  return null;
}

function isChapterHeader(line) {
  // Match "Chapter 1", "CHAPTER 1", "1", etc.
  const match = line.match(/^(?:Chapter\s+|CHAPTER\s+|)(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function isVerseStart(line) {
  // Match "1 Text..." or "1:1 Text..." or "1. Text..."
  const verseMatch = line.match(/^(\d+)(?::(\d+))?[\s\.](.*)/);
  
  if (verseMatch) {
    const chapter = verseMatch[2] ? parseInt(verseMatch[1], 10) : null;
    const verse = verseMatch[2] ? parseInt(verseMatch[2], 10) : parseInt(verseMatch[1], 10);
    const text = verseMatch[3].trim();
    
    return { chapter, verse, text };
  }
  
  return null;
}

async function cleanBibleText() {
  log('Starting NASB1995 text cleaning...');
  log(`Input file: ${INPUT_FILE}`);
  log(`Output file: ${OUTPUT_FILE}`);
  
  // Clear output file
  fs.writeFileSync(OUTPUT_FILE, '');
  
  // Read the input file
  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = content.split('\n');
  
  log(`Processing ${lines.length} lines...`);
  
  let state = STATE.START;
  let currentBook = null;
  let currentChapter = null;
  let currentVerse = null;
  let verseBuffer = [];
  
  const outputStream = createWriteStream(OUTPUT_FILE, { flags: 'a' });
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const normalizedLine = normalizeText(line);
    
    if (!normalizedLine) {
      continue; // Skip empty lines
    }
    
    stats.linesProcessed++;
    
    // Check for book header
    const bookMatch = isBookHeader(normalizedLine);
    if (bookMatch) {
      // Write any buffered verse before starting a new book
      if (verseBuffer.length > 0) {
        writeVerse(outputStream, currentBook, currentChapter, currentVerse, verseBuffer);
        verseBuffer = [];
      }
      
      currentBook = bookMatch;
      currentChapter = null;
      currentVerse = null;
      stats.booksFound++;
      
      // Write book header
      outputStream.write(`\n# ${bookMatch}\n`);
      log(`Found book: ${bookMatch}`);
      
      // Track book starts for statistics
      stats.bookStarts[bookMatch] = (stats.bookStarts[bookMatch] || 0) + 1;
      continue;
    }
    
    // Check for chapter header
    const chapterNum = isChapterHeader(normalizedLine);
    if (chapterNum !== null) {
      // Write any buffered verse before starting a new chapter
      if (verseBuffer.length > 0) {
        writeVerse(outputStream, currentBook, currentChapter, currentVerse, verseBuffer);
        verseBuffer = [];
      }
      
      currentChapter = chapterNum;
      currentVerse = null;
      stats.chaptersFound++;
      
      // Write chapter header
      outputStream.write(`\nChapter ${chapterNum}\n`);
      
      // Track chapter starts for statistics
      const chapterKey = `${currentBook} ${chapterNum}`;
      stats.chapterStarts[chapterKey] = (stats.chapterStarts[chapterKey] || 0) + 1;
      continue;
    }
    
    // Check for verse start
    const verseMatch = isVerseStart(normalizedLine);
    if (verseMatch) {
      // Write any buffered verse before starting a new one
      if (verseBuffer.length > 0) {
        writeVerse(outputStream, currentBook, currentChapter, currentVerse, verseBuffer);
        verseBuffer = [];
      }
      
      // Update chapter if specified in verse (e.g., "1:1")
      if (verseMatch.chapter !== null) {
        currentChapter = verseMatch.chapter;
        stats.chaptersFound++;
        outputStream.write(`\nChapter ${currentChapter}\n`);
      }
      
      currentVerse = verseMatch.verse;
      verseBuffer.push(verseMatch.text);
      stats.versesFound++;
      
      // Track verse pattern for statistics
      const pattern = verseMatch.chapter !== null ? 'chapter:verse' : 'verse_only';
      stats.versePatterns[pattern] = (stats.versePatterns[pattern] || 0) + 1;
      
      continue;
    }
    
    // If we're in a verse, add to the current verse buffer
    if (currentVerse !== null && normalizedLine) {
      verseBuffer.push(normalizedLine);
    }
    
    // Log progress
    if (stats.linesProcessed % 1000 === 0) {
      log(`Processed ${stats.linesProcessed} lines...`);
    }
  }
  
  // Write any remaining buffered verse
  if (verseBuffer.length > 0) {
    writeVerse(outputStream, currentBook, currentChapter, currentVerse, verseBuffer);
  }
  
  // Close the output stream
  outputStream.end();
  
  // Log summary
  log('\n=== CLEANING SUMMARY ===');
  log(`Total lines processed: ${stats.linesProcessed}`);
  log(`Books found: ${stats.booksFound}`);
  log(`Chapters found: ${stats.chaptersFound}`);
  log(`Verses found: ${stats.versesFound}`);
  log('\nBook starts:', stats.bookStarts);
  log('\nChapter starts (first 10):', Object.entries(stats.chapterStarts).slice(0, 10));
  log('\nVerse patterns:', stats.versePatterns);
  
  log('\nCleaning complete!');
  log(`Output written to: ${OUTPUT_FILE}`);
  
  // Close log stream
  logStream.end();
}

function writeVerse(stream, book, chapter, verse, lines) {
  if (!book || chapter === null || verse === null || lines.length === 0) {
    return;
  }
  
  const verseText = lines.join(' ').trim();
  if (verseText) {
    stream.write(`${verse} ${verseText}\n`);
  }
}

// Run the cleaning process
cleanBibleText().catch(error => {
  console.error('Error during cleaning:', error);
  process.exit(1);
});
