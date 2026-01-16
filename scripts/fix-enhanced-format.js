import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputPath = path.join(__dirname, 'NASB1995-enhanced.txt');
const outputPath = path.join(__dirname, 'NASB1995-fixed.txt');

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

// Function to detect book names
function isBookName(line) {
  const normalized = line.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
  return bookNames.includes(normalized);
}

// Function to detect chapter headers
function isChapterHeader(line) {
  return /^##?\s*Chapter\s+\d+\s*$/i.test(line) || 
         /^##?\s*\d+\s*$/.test(line);
}

// Function to detect verse references
function isVerseReference(line) {
  return /^\d+:\d+\s+/.test(line);
}

async function fixEnhancedFormat() {
  console.log('Fixing format of enhanced NASB1995 file...');
  
  try {
    // Read the input file
    const content = await readFile(inputPath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
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
      if (isBookName(line)) {
        // Save previous verse if any
        if (verseBuffer.length > 0 && currentBook && currentChapter && currentVerse) {
          output.push(`${currentBook} ${currentChapter}:${currentVerse} ${verseBuffer.join(' ')}`);
          verseBuffer = [];
        }
        
        currentBook = line.toUpperCase();
        output.push(`# ${currentBook}`);
        continue;
      }
      
      // Check for chapter header
      const chapterMatch = line.match(/##?\s*Chapter\s+(\d+)/i) || line.match(/##?\s*(\d+)/);
      if (chapterMatch) {
        // Save previous verse if any
        if (verseBuffer.length > 0 && currentBook && currentChapter && currentVerse) {
          output.push(`${currentBook} ${currentChapter}:${currentVerse} ${verseBuffer.join(' ')}`);
          verseBuffer = [];
        }
        
        currentChapter = parseInt(chapterMatch[1] || chapterMatch[0], 10);
        output.push(`## Chapter ${currentChapter}`);
        continue;
      }
      
      // Check for verse reference
      const verseMatch = line.match(/^(\d+):(\d+)(?:\s+(.*))?/);
      if (verseMatch) {
        // Save previous verse if any
        if (verseBuffer.length > 0 && currentBook && currentChapter && currentVerse) {
          output.push(`${currentBook} ${currentChapter}:${currentVerse} ${verseBuffer.join(' ')}`);
        }
        
        const chapter = parseInt(verseMatch[1], 10);
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
    
    // Write the fixed content to the output file
    await writeFile(outputPath, output.join('\n'), 'utf-8');
    
    console.log(`\nFixed format complete!`);
    console.log(`Input lines: ${lines.length}`);
    console.log(`Output lines: ${output.length}`);
    console.log(`Output file: ${outputPath}`);
    
  } catch (error) {
    console.error('Error fixing format:', error);
  }
}

// Run the format fixer
fixEnhancedFormat().catch(console.error);
