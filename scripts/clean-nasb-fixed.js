import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const inputPath = path.join(__dirname, 'NASB1995.txt');
const outputPath = path.join(__dirname, 'NASB1995-cleaned.txt');

// Book names in order
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

// Function to clean text
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/^\s*\d+\s*$/, '') // Remove line numbers
    .replace(/\[.*?\]/g, '')    // Remove anything in square brackets
    .replace(/\(.*?\)/g, '')   // Remove anything in parentheses
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .trim();
}

// Function to detect book names with more flexible matching
function isBookName(line, context = {}) {
  // Normalize the line for better matching
  const normalizedLine = line.toUpperCase().trim();
  
  // Special case for 2 TIMOTHY which might be missing a header
  if (context.lastBook === '1 TIMOTHY' && /^Chapter\s+[1-9]/.test(line)) {
    return '2 TIMOTHY';
  }
  
  // Special case for books with numbers (like 1 SAMUEL, 2 KINGS, etc.)
  if (/^[123]\s+[A-Z]+$/.test(normalizedLine.replace(/[^A-Z0-9\s]/g, '').trim())) {
    const potentialBook = normalizedLine.replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (bookNames.includes(potentialBook)) {
      return potentialBook;
    }
  }
  
  // Check for exact match first
  for (const book of bookNames) {
    if (normalizedLine === book) {
      return book;
    }
  }
  
  // Check for partial matches at word boundaries
  for (const book of bookNames) {
    // Match at start of line
    if (normalizedLine.startsWith(book) && 
        (normalizedLine.length === book.length || /[\s\W]/.test(normalizedLine[book.length]))) {
      return book;
    }
    
    // Match at end of line
    if (normalizedLine.endsWith(book) && 
        (normalizedLine.length === book.length || /[\s\W]/.test(normalizedLine[normalizedLine.length - book.length - 1]))) {
      return book;
    }
    
    // Match in the middle of the line
    const index = normalizedLine.indexOf(book);
    if (index > 0 && index + book.length < normalizedLine.length) {
      const before = normalizedLine[index - 1];
      const after = normalizedLine[index + book.length];
      if (/[\s\W]/.test(before) && /[\s\W]/.test(after)) {
        return book;
      }
    }
  }
  
  return null;
}

// Main function to clean the NASB text
async function cleanNASB() {
  console.log('Cleaning NASB1995 text file...');
  
  try {
    const data = await readFile(inputPath, 'utf-8');
    const lines = data.split('\n');
    let output = [];
    let currentBook = '';
    let currentChapter = 0;
    let currentVerse = 0;
    let lastBook = '';
    
    for (const line of lines) {
      const cleanLine = cleanText(line);
      if (!cleanLine) continue;
      
      // Check for book name with context
      const bookMatch = isBookName(cleanLine, { lastBook });
      if (bookMatch) {
        currentBook = bookMatch;
        lastBook = currentBook;
        output.push(`# ${currentBook}`);
        console.log(`Processing book: ${currentBook}`);
        currentChapter = 0;
        currentVerse = 0;
        continue;
      }
      
      // Check for chapter header
      const chapterMatch = cleanLine.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        currentChapter = parseInt(chapterMatch[1], 10);
        output.push(`## Chapter ${currentChapter}`);
        console.log(`  Chapter ${currentChapter}`);
        currentVerse = 0;
        continue;
      }
      
      // Check for verse reference
      const verseMatch = cleanLine.match(/^(\d+):(\d+)\s*(.*)/);
      if (verseMatch) {
        const [_, chapter, verse, text] = verseMatch;
        // Only update chapter if we don't have one yet or if it's a new chapter
        if (currentChapter === 0 || parseInt(chapter, 10) !== currentChapter) {
          currentChapter = parseInt(chapter, 10);
          output.push(`## Chapter ${currentChapter}`);
          console.log(`  Chapter ${currentChapter}`);
        }
        currentVerse = parseInt(verse, 10);
        output.push(`${currentBook} ${chapter}:${verse} ${text}`);
        continue;
      }
      
      // If we have a current book and chapter, append to the last verse
      if (currentBook && currentChapter > 0) {
        if (output.length > 0) {
          output[output.length - 1] += ' ' + cleanLine;
        } else {
          output.push(cleanLine);
        }
      }
    }
    
    // Write the cleaned output to file
    await writeFile(outputPath, output.join('\n'), 'utf-8');
    console.log(`Cleaning complete!\nInput lines: ${lines.length}\nOutput lines: ${output.length}\nOutput file: ${outputPath}`);
  } catch (error) {
    console.error('Error cleaning NASB text:', error);
  }
}

// Run the cleaning
cleanNASB().catch(console.error);
