import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputPath = path.join(__dirname, 'NASB1995.txt');
const outputPath = path.join(__dirname, 'NASB1995-cleaned.txt');

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

// Function to normalize book names
function normalizeBookName(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')  // Remove special characters
    .replace(/\s+/g, ' ')          // Replace multiple spaces with single space
    .trim();
}

// Function to check if a line is a book name
function isBookName(line) {
  const normalized = normalizeBookName(line);
  return bookNames.includes(normalized);
}

// Function to check if a line is a chapter header
function isChapterHeader(line) {
  return /^\s*Chapter\s+\d+\s*$/i.test(line);
}

// Function to check if a line is a verse reference
function isVerseReference(line) {
  return /^\s*\d+:\d+\s+/.test(line);
}

// Function to clean a line of text
function cleanLine(line) {
  // Remove BOM and other non-printing characters
  let cleaned = line.replace(/^[\uFEFF\uFFFD]+/, '').trim();
  
  // Replace curly quotes with straight quotes
  cleaned = cleaned
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
    
  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

async function cleanBibleText() {
  console.log('Starting to clean NASB1995 text file...');
  
  try {
    // Read the input file
    const content = await readFile(inputPath, 'utf-8');
    const lines = content.split('\n');
    
    // Prepare output array
    const output = [];
    let currentBook = '';
    let currentChapter = 0;
    let inVerse = false;
    let verseBuffer = [];
    let verseRef = '';
    
    // Process each line
    for (const line of lines) {
      const cleanedLine = cleanLine(line);
      if (!cleanedLine) continue;
      
      // Check for book name
      if (isBookName(cleanedLine)) {
        // If we were in a verse, finish it
        if (inVerse) {
          output.push(`${verseRef} ${verseBuffer.join(' ').trim()}`);
          verseBuffer = [];
          inVerse = false;
        }
        
        currentBook = normalizeBookName(cleanedLine);
        output.push(`\n# ${currentBook}`);
        continue;
      }
      
      // Check for chapter header
      const chapterMatch = cleanedLine.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        // If we were in a verse, finish it
        if (inVerse) {
          output.push(`${verseRef} ${verseBuffer.join(' ').trim()}`);
          verseBuffer = [];
          inVerse = false;
        }
        
        currentChapter = parseInt(chapterMatch[1], 10);
        output.push(`\n## Chapter ${currentChapter}`);
        continue;
      }
      
      // Check for verse reference
      const verseMatch = cleanedLine.match(/^(\d+):(\d+)(?:\s+(.*))?/);
      if (verseMatch) {
        // If we were in a verse, finish it
        if (inVerse) {
          output.push(`${verseRef} ${verseBuffer.join(' ').trim()}`);
          verseBuffer = [];
        }
        
        const chapter = verseMatch[1];
        const verse = verseMatch[2];
        const text = verseMatch[3] || '';
        
        verseRef = `${chapter}:${verse}`;
        inVerse = true;
        
        if (text) {
          verseBuffer.push(text);
        }
        
        continue;
      }
      
      // If we're in a verse, add to the current verse buffer
      if (inVerse) {
        verseBuffer.push(cleanedLine);
      }
    }
    
    // Don't forget the last verse
    if (inVerse && verseBuffer.length > 0) {
      output.push(`${verseRef} ${verseBuffer.join(' ').trim()}`);
    }
    
    // Write the cleaned content to the output file
    await writeFile(outputPath, output.join('\n'), 'utf-8');
    
    console.log(`\nSuccessfully cleaned text file!`);
    console.log(`Original lines: ${lines.length}`);
    console.log(`Output lines: ${output.length}`);
    console.log(`Output file: ${outputPath}`);
    
  } catch (error) {
    console.error('Error cleaning text file:', error);
  }
}

// Run the cleanup
cleanBibleText().catch(console.error);
