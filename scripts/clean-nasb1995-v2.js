import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v2.txt');
const LOG_FILE = path.join(__dirname, 'clean-nasb1995-v2.log');

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

// Initialize log file
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });

function log(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  logStream.write(logMessage);
  console.log(`[${timestamp}] ${message}`);
}

function normalizeText(text) {
  if (!text) return '';
  
  // Replace non-breaking spaces and other whitespace with a single space
  let normalized = text.replace(/\s+/g, ' ').trim();
  
  // Remove any remaining control characters except space, letters, numbers, and basic punctuation
  normalized = normalized.replace(/[^\x20-\x7E]/g, '');
  
  return normalized;
}

function isBookHeader(line) {
  const upperLine = line.toUpperCase().trim();
  
  // Check for book name at start of line (with or without #)
  for (const book of BOOK_NAMES) {
    if (upperLine === `#${book}` || 
        upperLine === `# ${book}` ||
        upperLine === book) {
      return book;
    }
  }
  
  return null;
}

function isChapterHeader(line) {
  // Match "Chapter 1", "CHAPTER 1", etc.
  const match = line.match(/^\s*Chapter\s+(\d+)\s*$/i);
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
  log('Starting NASB1995 text cleaning (v2)...');
  log(`Input file: ${INPUT_FILE}`);
  log(`Output file: ${OUTPUT_FILE}`);
  
  // Clear output file
  fs.writeFileSync(OUTPUT_FILE, '');
  
  const outputStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });
  
  // Track state
  let currentBook = null;
  let currentChapter = null;
  let currentVerse = null;
  let verseBuffer = [];
  let lineNumber = 0;
  
  // Process the file line by line
  const fileStream = fs.createReadStream(INPUT_FILE, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  // Function to write the current verse to the output
  async function writeCurrentVerse() {
    if (currentBook && currentChapter !== null && currentVerse !== null && verseBuffer.length > 0) {
      const verseText = verseBuffer.join(' ').trim();
      if (verseText) {
        await new Promise((resolve, reject) => {
          outputStream.write(`${currentBook}|${currentChapter}|${currentVerse}|${verseText}\n`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      verseBuffer = [];
    }
  }
  
  // Process each line
  for await (const line of rl) {
    lineNumber++;
    
    // Log progress
    if (lineNumber % 1000 === 0) {
      log(`Processing line ${lineNumber}...`);
    }
    
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // Skip empty lines
    
    // Check for book header
    const bookMatch = isBookHeader(trimmedLine);
    if (bookMatch) {
      // Write any pending verse
      await writeCurrentVerse();
      
      // Update current book
      currentBook = bookMatch;
      currentChapter = null;
      currentVerse = null;
      log(`Found book: ${currentBook}`);
      continue;
    }
    
    // Check for chapter header
    const chapterNum = isChapterHeader(trimmedLine);
    if (chapterNum !== null) {
      // Write any pending verse
      await writeCurrentVerse();
      
      // Update current chapter
      currentChapter = chapterNum;
      currentVerse = null;
      log(`  Chapter ${currentChapter}`);
      continue;
    }
    
    // Check for verse start
    const verseMatch = isVerseStart(trimmedLine);
    if (verseMatch) {
      // Write any pending verse
      await writeCurrentVerse();
      
      // Update current verse
      if (verseMatch.chapter !== null) {
        currentChapter = verseMatch.chapter;
        log(`  Chapter ${currentChapter} (from verse)`);
      }
      
      currentVerse = verseMatch.verse;
      if (verseMatch.text) {
        verseBuffer.push(verseMatch.text);
      }
      continue;
    }
    
    // If we're in a verse, add to the current verse buffer
    if (currentVerse !== null) {
      const normalized = normalizeText(trimmedLine);
      if (normalized) {
        verseBuffer.push(normalized);
      }
    } else if (currentBook && currentChapter !== null) {
      // This might be a continuation of the previous verse without a number
      const normalized = normalizeText(trimmedLine);
      if (normalized) {
        if (verseBuffer.length === 0 && currentVerse === null) {
          // Start a new verse with an unknown number
          currentVerse = 0; // Will be replaced with the next verse number
        }
        verseBuffer.push(normalized);
      }
    }
  }
  
  // Write any remaining verse
  await writeCurrentVerse();
  
  // Close the output stream
  await new Promise((resolve) => outputStream.end(resolve));
  
  log('Cleaning complete!');
  log(`Output written to: ${OUTPUT_FILE}`);
  logStream.end();
}

// Run the cleaning process
cleanBibleText().catch(error => {
  console.error('Error during cleaning:', error);
  process.exit(1);
});
