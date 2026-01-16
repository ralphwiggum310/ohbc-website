import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_readable.txt');
const LOG_FILE = path.join(__dirname, 'extract-log.txt');

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
  // Remove non-printable ASCII characters (except newline and tab)
  return text.replace(/[^\x20-\x7E\n\t]/g, ' ')
             .replace(/\s+/g, ' ')  // Replace multiple spaces with one
             .trim();
}

// Function to process the file
async function processFile() {
  try {
    log('Starting to extract readable text from NASB1995.txt...');
    
    // Read the file as a buffer
    const buffer = fs.readFileSync(INPUT_FILE);
    log(`File size: ${buffer.length} bytes`);
    
    // Convert buffer to string, replacing any invalid UTF-8 sequences
    const content = buffer.toString('binary');
    
    // Split into lines and process each line
    const lines = content.split(/\r?\n/);
    log(`Found ${lines.length} lines in the file`);
    
    let currentBook = '';
    let currentChapter = 0;
    let currentVerse = 0;
    let verseBuffer = [];
    
    for (let i = 0; i < lines.length; i++) {
      // Clean the line
      const cleanLine = cleanText(lines[i]).trim();
      
      // Skip empty lines
      if (!cleanLine) {
        if (verseBuffer.length > 0) {
          outputStream.write(verseBuffer.join(' ') + '\n');
          verseBuffer = [];
        }
        outputStream.write('\n');
        continue;
      }
      
      // Check for book header
      if (cleanLine.startsWith('#')) {
        if (verseBuffer.length > 0) {
          outputStream.write(verseBuffer.join(' ') + '\n');
          verseBuffer = [];
        }
        currentBook = cleanLine.substring(1).trim();
        outputStream.write(`# ${currentBook}\n`);
        log(`Found book: ${currentBook}`);
        continue;
      }
      
      // Check for chapter header
      const chapterMatch = cleanLine.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        if (verseBuffer.length > 0) {
          outputStream.write(verseBuffer.join(' ') + '\n');
          verseBuffer = [];
        }
        currentChapter = parseInt(chapterMatch[1], 10);
        outputStream.write(`Chapter ${currentChapter}\n`);
        log(`Found chapter: ${currentChapter}`);
        continue;
      }
      
      // Check for verse number
      const verseMatch = cleanLine.match(/^(\d+)\s+(.*)/);
      if (verseMatch) {
        if (verseBuffer.length > 0) {
          outputStream.write(verseBuffer.join(' ') + '\n');
        }
        currentVerse = parseInt(verseMatch[1], 10);
        verseBuffer = [`${currentVerse} ${verseMatch[2].trim()}`];
      } else if (verseBuffer.length > 0) {
        // This is a continuation of the current verse
        verseBuffer.push(cleanLine);
      } else {
        // This might be a chapter title or other metadata
        outputStream.write(cleanLine + '\n');
      }
      
      // Log progress every 1000 lines
      if (i % 1000 === 0) {
        log(`Processed ${i} of ${lines.length} lines...`);
      }
    }
    
    // Write the last verse if it exists
    if (verseBuffer.length > 0) {
      outputStream.write(verseBuffer.join(' ') + '\n');
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
