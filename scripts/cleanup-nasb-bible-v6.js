import { createReadStream, createWriteStream, existsSync, unlinkSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v6.txt');
const DEBUG_LOG = path.join(__dirname, 'cleanup-debug-v6.log');

// Clear previous debug log and output file
if (existsSync(DEBUG_LOG)) unlinkSync(DEBUG_LOG);
if (existsSync(OUTPUT_FILE)) unlinkSync(OUTPUT_FILE);

// Create write stream for output
const outputStream = createWriteStream(OUTPUT_FILE, { flags: 'a' });

function logDebug(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  
  console.log(`[${timestamp}] ${message}`);
  if (existsSync(DEBUG_LOG)) {
    require('fs').appendFileSync(DEBUG_LOG, logMessage);
  } else {
    require('fs').writeFileSync(DEBUG_LOG, logMessage);
  }
}

async function processFile() {
  logDebug('Starting NASB1995 cleanup (v6)...');
  
  // Counters for statistics
  let lineCount = 0;
  let bookCount = 0;
  let chapterCount = 0;
  let verseCount = 0;
  
  // State tracking
  let currentBook = '';
  let currentChapter = 0;
  let currentVerse = 0;
  let verseBuffer = [];
  
  // Create read stream with explicit encoding
  const fileStream = createReadStream(INPUT_FILE, { 
    encoding: 'utf8',
    highWaterMark: 1024 * 1024 // Process 1MB at a time
  });
  
  // Create readline interface
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  // Process each line
  for await (const line of rl) {
    lineCount++;
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      if (verseBuffer.length > 0) {
        await writeVerse(verseBuffer.join(' '));
        verseBuffer = [];
      }
      outputStream.write('\n');
      continue;
    }
    
    // Check for book header (e.g., "# GENESIS")
    if (trimmedLine.startsWith('#')) {
      if (verseBuffer.length > 0) {
        await writeVerse(verseBuffer.join(' '));
        verseBuffer = [];
      }
      
      currentBook = trimmedLine.substring(2).trim();
      bookCount++;
      outputStream.write(`\n# ${currentBook}\n`);
      logDebug(`Found book: ${currentBook}`);
      continue;
    }
    
    // Check for chapter line (e.g., "Chapter 1")
    const chapterMatch = trimmedLine.match(/^Chapter\s+(\d+)/i);
    if (chapterMatch) {
      if (verseBuffer.length > 0) {
        await writeVerse(verseBuffer.join(' '));
        verseBuffer = [];
      }
      
      currentChapter = parseInt(chapterMatch[1], 10);
      chapterCount++;
      outputStream.write(`\nChapter ${currentChapter}\n`);
      continue;
    }
    
    // Check for verse line (e.g., "1 In the beginning...")
    const verseMatch = trimmedLine.match(/^(\d+)\s+(.*)/);
    if (verseMatch) {
      if (verseBuffer.length > 0) {
        await writeVerse(verseBuffer.join(' '));
      }
      
      currentVerse = parseInt(verseMatch[1], 10);
      verseBuffer = [`${currentVerse} ${verseMatch[2].trim()}`];
      verseCount++;
    } 
    // If we're in a verse and the line doesn't start with a number, it's a continuation
    else if (verseBuffer.length > 0) {
      verseBuffer.push(trimmedLine);
    }
    
    // Log progress every 1000 lines
    if (lineCount % 1000 === 0) {
      logDebug(`Processed ${lineCount} lines...`);
    }
  }
  
  // Write any remaining buffered verse
  if (verseBuffer.length > 0) {
    await writeVerse(verseBuffer.join(' '));
  }
  
  // Close the output stream
  outputStream.end();
  
  // Log summary
  logDebug('\nCleanup completed!', {
    totalLines: lineCount,
    books: bookCount,
    chapters: chapterCount,
    verses: verseCount
  });
  
  logDebug(`Output written to: ${OUTPUT_FILE}`);
  logDebug(`Debug log: ${DEBUG_LOG}`);
}

// Helper function to write a verse to the output file
function writeVerse(verseText) {
  return new Promise((resolve) => {
    outputStream.write(verseText + '\n', 'utf8', () => {
      resolve();
    });
  });
}

// Handle errors
process.on('unhandledRejection', (error) => {
  logDebug('Unhandled rejection:', error);
  process.exit(1);
});

// Start processing
processFile().catch(error => {
  logDebug('Error processing file:', error);
  process.exit(1);
});
