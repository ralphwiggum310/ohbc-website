import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputPath = path.join(__dirname, 'NASB1995.txt');
const outputPath = path.join(__dirname, 'NASB1995-enhanced.txt');

// Book name to ID mapping
const bookNames = [
  'GENESIS', 'EXODUS', 'LEVITICUS', 'NUMBERS', 'DEUTERONOMY',
  'JOSHUA', 'JUDGES', 'RUTH', '1 SAMUEL', '2 SAMUEL',
  '1 KINGS', '2 KINGS', '1 CHRONICLES', '2 CHRONICLES',
  'EZRA', 'NEHEMIAH', 'ESTHER', 'JOB', 'PSALM', 'PROVERBS',
  'ECCLESIASTES', 'SONG OF SOLOMON', 'ISAIAH', 'JEREMIAH',
  'LAMENTATIONS', 'EZEKIEL', 'DANIEL', 'HOSEA', 'JOEL',
  'AMOS', 'OBADIAH', 'JONAH', 'MICAH', 'NAHUM', 'HABAKKUK',
  'ZEPHANIAH', 'HAGGAI', 'ZECHARIAH', 'MALACHI', 'MATTHEW',
  'MARK', 'LUKE', 'JOHN', 'ACTS', 'ROMANS', '1 CORINTHIANS',
  '2 CORINTHIANS', 'GALATIANS', 'EPHESIANS', 'PHILIPPIANS',
  'COLOSSIANS', '1 THESSALONIANS', '2 THESSALONIANS',
  '1 TIMOTHY', '2 TIMOTHY', 'TITUS', 'PHILEMON', 'HEBREWS',
  'JAMES', '1 PETER', '2 PETER', '1 JOHN', '2 JOHN', '3 JOHN',
  'JUDE', 'REVELATION'
];

// Function to clean and normalize text
function cleanText(text) {
  return text
    .replace(/[\u201C\u201D]/g, '"')  // Replace curly double quotes
    .replace(/[\u2018\u2019]/g, "'")   // Replace curly single quotes
    .replace(/\s+/g, ' ')               // Replace multiple spaces with single space
    .replace(/^\s+|\s+$/g, '')         // Trim whitespace
    .replace(/\s*\n\s*/g, '\n')      // Normalize line breaks
    .replace(/\s*\r\s*/g, '\n')        // Handle Windows line endings
    .replace(/\n{3,}/g, '\n\n')        // Limit consecutive newlines to 2
    .trim();
}

// Function to detect book names with more flexibility
function detectBookName(line) {
  const normalizedLine = line.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
  return bookNames.find(book => {
    const pattern = book.split(' ').map(word => `\\b${word}\\b`).join('.*');
    return new RegExp(`^${pattern}$`).test(normalizedLine);
  });
}

// Function to detect chapter headers
function isChapterHeader(line) {
  return /^\s*Chapter\s+\d+\s*$/i.test(line) || 
         /^\s*[A-Z\s]+\s+\d+\s*$/.test(line) ||
         /^\s*\d+\s*$/.test(line);
}

// Function to detect verse references
function isVerseReference(line) {
  return /^\s*\d+\s*:\s*\d+\b/.test(line);
}

// Function to process verse text
function processVerseText(text) {
  // Remove verse numbers from the middle of text
  return text.replace(/([^0-9]|^)(\d+):(\d+)/g, '').trim();
}

async function enhanceBibleText() {
  console.log('Starting enhanced cleaning of NASB1995 text file...');
  
  try {
    // Read the input file
    const content = await readFile(inputPath, 'utf-8');
    
    // Split into lines and clean each line
    const lines = content.split(/\r?\n/).map(line => cleanText(line)).filter(line => line);
    
    // Prepare output
    const output = [];
    let currentBook = '';
    let currentChapter = 0;
    let currentVerse = 0;
    let verseBuffer = [];
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for book name
      const bookName = detectBookName(line);
      if (bookName) {
        // Save previous verse if any
        if (verseBuffer.length > 0 && currentBook && currentChapter && currentVerse) {
          output.push(`${currentBook} ${currentChapter}:${currentVerse} ${verseBuffer.join(' ')}`);
          verseBuffer = [];
        }
        
        currentBook = bookName;
        output.push(`\n# ${currentBook}`);
        continue;
      }
      
      // Check for chapter header
      const chapterMatch = line.match(/Chapter\s+(\d+)/i) || line.match(/^(\d+)$/);
      if (chapterMatch) {
        // Save previous verse if any
        if (verseBuffer.length > 0 && currentBook && currentChapter && currentVerse) {
          output.push(`${currentBook} ${currentChapter}:${currentVerse} ${verseBuffer.join(' ')}`);
          verseBuffer = [];
        }
        
        currentChapter = parseInt(chapterMatch[1] || chapterMatch[0], 10);
        output.push(`\n## Chapter ${currentChapter}`);
        continue;
      }
      
      // Check for verse reference
      const verseMatch = line.match(/^(\d+):(\d+)(?:\s+(.*))?/);
      if (verseMatch) {
        // Save previous verse if any
        if (verseBuffer.length > 0 && currentBook && currentChapter && currentVerse) {
          output.push(`${currentBook} ${currentChapter}:${currentVerse} ${verseBuffer.join(' ')}`);
        }
        
        currentVerse = parseInt(verseMatch[2], 10);
        verseBuffer = [];
        
        // Add verse text if present
        if (verseMatch[3]) {
          verseBuffer.push(verseMatch[3]);
        }
        continue;
      }
      
      // If we have a current verse, add to the buffer
      if (currentBook && currentChapter && currentVerse) {
        verseBuffer.push(line);
      }
    }
    
    // Don't forget the last verse
    if (verseBuffer.length > 0 && currentBook && currentChapter && currentVerse) {
      output.push(`${currentBook} ${currentChapter}:${currentVerse} ${verseBuffer.join(' ')}`);
    }
    
    // Write the enhanced content to the output file
    await writeFile(outputPath, output.join('\n'), 'utf-8');
    
    console.log(`\nEnhanced cleaning complete!`);
    console.log(`Original lines: ${lines.length}`);
    console.log(`Output lines: ${output.length}`);
    console.log(`Output file: ${outputPath}`);
    
  } catch (error) {
    console.error('Error during enhanced cleaning:', error);
  }
}

// Run the enhanced cleaning
enhanceBibleText().catch(console.error);
