import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_chunked.txt');
const LOG_FILE = path.join(__dirname, 'chunked-extraction-log.txt');

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
  if (!text) return '';
  
  // Replace any non-printable ASCII characters with spaces
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

// Function to process the file in chunks
async function processFile() {
  try {
    log('Starting chunked extraction from NASB1995.txt...');
    
    // Get file stats
    const stats = fs.statSync(INPUT_FILE);
    log(`File size: ${stats.size} bytes`);
    
    // Create read stream
    const readStream = createReadStream(INPUT_FILE, {
      encoding: 'utf8',
      highWaterMark: 64 * 1024 // 64KB chunks
    });
    
    const rl = createInterface({
      input: readStream,
      crlfDelay: Infinity
    });
    
    let lineCount = 0;
    let currentBook = '';
    let currentChapter = 0;
    let currentVerse = 0;
    let currentLine = '';
    let inVerse = false;
    
    // Process each line
    for await (const rawLine of rl) {
      lineCount++;
      
      // Clean the line
      const cleanLine = cleanText(rawLine);
      
      // Skip empty lines
      if (!cleanLine) {
        if (currentLine) {
          outputStream.write(currentLine + '\n');
          currentLine = '';
        }
        outputStream.write('\n');
        continue;
      }
      
      // Check for book header
      if (isBookHeader(cleanLine)) {
        if (currentLine) {
          outputStream.write(currentLine + '\n');
          currentLine = '';
        }
        currentBook = cleanLine.substring(1).trim();
        outputStream.write(`# ${currentBook}\n`);
        log(`Found book: ${currentBook}`);
        inVerse = false;
        continue;
      }
      
      // Check for chapter header
      const chapterMatch = cleanLine.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        if (currentLine) {
          outputStream.write(currentLine + '\n');
          currentLine = '';
        }
        currentChapter = parseInt(chapterMatch[1], 10);
        outputStream.write(`Chapter ${currentChapter}\n`);
        log(`Found chapter: ${currentChapter}`);
        inVerse = false;
        continue;
      }
      
      // Check for verse number at the start of the line
      const verseMatch = cleanLine.match(/^(\d+)\s+(.*)/);
      if (verseMatch) {
        if (currentLine) {
          outputStream.write(currentLine + '\n');
        }
        currentVerse = parseInt(verseMatch[1], 10);
        currentLine = `${currentVerse} ${verseMatch[2].trim()}`;
        inVerse = true;
      } else if (inVerse) {
        // This is a continuation of the current verse
        currentLine = currentLine ? `${currentLine} ${cleanLine.trim()}` : cleanLine.trim();
      } else {
        // This might be a chapter title or other metadata
        outputStream.write(cleanLine + '\n');
      }
      
      // Log progress every 1000 lines
      if (lineCount % 1000 === 0) {
        log(`Processed ${lineCount} lines...`);
      }
    }
    
    // Write the last line if it exists
    if (currentLine) {
      outputStream.write(currentLine + '\n');
    }
    
    log(`Extraction complete! Processed ${lineCount} lines.`);
    log(`Output written to: ${OUTPUT_FILE}`);
    
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
