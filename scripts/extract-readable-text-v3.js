import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v10.txt');
const LOG_FILE = path.join(__dirname, 'extract-log-v3.txt');

// Clear previous output files
[OUTPUT_FILE, LOG_FILE].forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`Removed existing file: ${file}`);
    } catch (error) {
      console.error(`Error removing ${file}:`, error.message);
    }
  }
});

// Create write streams
const outputStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  console.log(`[${timestamp}] ${message}`);
  logStream.write(logMessage);
}

// Function to clean a line of text
function cleanText(text) {
  // First, replace any non-printable ASCII characters with spaces
  let cleaned = text.replace(/[^\x20-\x7E\r\n\t]/g, ' ');
  
  // Remove any remaining control characters (except newline and tab)
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
  
  // Replace multiple spaces with a single space
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

// Function to determine if a line is a verse number
function isVerseStart(line) {
  return /^\d+\s+[A-Za-z]/.test(line);
}

// Function to determine if a line is a chapter header
function isChapterHeader(line) {
  return /^Chapter\s+\d+/i.test(line);
}

// Function to determine if a line is a book header
function isBookHeader(line) {
  return line.startsWith('#');
}

// Function to process the file
async function processFile() {
  try {
    log('Starting to extract readable text from NASB1995.txt (v3)...');
    
    // Read the file as a buffer
    const buffer = fs.readFileSync(INPUT_FILE);
    log(`File size: ${buffer.length} bytes`);
    
    // Convert buffer to string using binary encoding to avoid UTF-8 issues
    const content = buffer.toString('binary');
    
    // Split into lines and clean each line
    const lines = content.split(/\r?\n/);
    log(`Found ${lines.length} lines in the file`);
    
    let currentBook = '';
    let currentChapter = 0;
    let currentVerse = 0;
    let verseBuffer = [];
    let inVerse = false;
    
    // First pass: identify and fix wrapped lines
    const fixedLines = [];
    let currentLine = '';
    
    for (let i = 0; i < lines.length; i++) {
      const cleanLine = cleanText(lines[i]);
      
      // Skip empty lines
      if (!cleanLine) {
        if (currentLine) {
          fixedLines.push(currentLine);
          currentLine = '';
        }
        fixedLines.push('');
        continue;
      }
      
      // Check for book, chapter, or verse start
      if (isBookHeader(cleanLine) || isChapterHeader(cleanLine) || isVerseStart(cleanLine)) {
        if (currentLine) {
          fixedLines.push(currentLine);
        }
        currentLine = cleanLine;
      } else {
        // This is a continuation of the previous line
        currentLine = currentLine ? `${currentLine} ${cleanLine}` : cleanLine;
      }
    }
    
    // Add the last line if it exists
    if (currentLine) {
      fixedLines.push(currentLine);
    }
    
    log(`After fixing wrapped lines: ${fixedLines.length} lines`);
    
    // Second pass: process the fixed lines
    for (let i = 0; i < fixedLines.length; i++) {
      const line = fixedLines[i];
      
      // Skip empty lines
      if (!line) {
        if (inVerse && verseBuffer.length > 0) {
          outputStream.write(verseBuffer.join(' ').trim() + '\n');
          verseBuffer = [];
          inVerse = false;
        }
        outputStream.write('\n');
        continue;
      }
      
      // Check for book header
      if (isBookHeader(line)) {
        if (verseBuffer.length > 0) {
          outputStream.write(verseBuffer.join(' ').trim() + '\n');
          verseBuffer = [];
        }
        currentBook = line.substring(1).trim();
        outputStream.write(`# ${currentBook}\n`);
        log(`Found book: ${currentBook}`);
        inVerse = false;
        continue;
      }
      
      // Check for chapter header
      const chapterMatch = line.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        if (verseBuffer.length > 0) {
          outputStream.write(verseBuffer.join(' ').trim() + '\n');
          verseBuffer = [];
        }
        currentChapter = parseInt(chapterMatch[1], 10);
        outputStream.write(`Chapter ${currentChapter}\n`);
        log(`Found chapter: ${currentChapter}`);
        inVerse = false;
        continue;
      }
      
      // Check for verse number at the start of the line
      const verseMatch = line.match(/^(\d+)\s+(.*)/);
      if (verseMatch) {
        if (verseBuffer.length > 0) {
          outputStream.write(verseBuffer.join(' ').trim() + '\n');
        }
        currentVerse = parseInt(verseMatch[1], 10);
        verseBuffer = [`${currentVerse} ${verseMatch[2].trim()}`];
        inVerse = true;
      } else if (inVerse) {
        // This is a continuation of the current verse
        verseBuffer.push(line.trim());
      } else {
        // This might be a chapter title or other metadata
        outputStream.write(line + '\n');
      }
      
      // Log progress every 1000 lines
      if (i % 1000 === 0) {
        log(`Processed ${i} of ${fixedLines.length} lines...`);
      }
    }
    
    // Write the last verse if it exists
    if (verseBuffer.length > 0) {
      outputStream.write(verseBuffer.join(' ').trim() + '\n');
    }
    
    log('Extraction complete!');
    log(`Readable text written to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    log('An error occurred during extraction:', error);
  } finally {
    outputStream.end();
    logStream.end();
  }
}

// Run the extraction
processFile().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
