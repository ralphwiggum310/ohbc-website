import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v4.txt');
const DEBUG_LOG = path.join(__dirname, 'cleanup-debug-v4.log');

// Clear previous debug log
if (fs.existsSync(DEBUG_LOG)) {
  fs.unlinkSync(DEBUG_LOG);
}

function logDebug(message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;
  
  if (data !== null) {
    logMessage += '\n' + JSON.stringify(data, null, 2);
  }
  
  console.log(message);
  fs.appendFileSync(DEBUG_LOG, logMessage + '\n');
}

function cleanBibleText(content) {
  logDebug('Starting Bible text cleanup...');
  
  const lines = content.split('\n');
  const cleanedLines = [];
  
  let currentBook = '';
  let currentChapter = 0;
  let currentVerse = 0;
  let verseBuffer = [];
  let inVerse = false;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    // Skip empty lines unless we're in the middle of a verse
    if (!lines[i].trim()) {
      if (inVerse) {
        verseBuffer.push('');
      }
      continue;
    }
    
    // Check for book header (e.g., "# GENESIS")
    if (lines[i].startsWith('#')) {
      // Save any buffered verse
      if (inVerse && verseBuffer.length > 0) {
        cleanedLines.push(verseBuffer.join(' ').trim());
        verseBuffer = [];
        inVerse = false;
      }
      
      currentBook = lines[i].substring(2).trim();
      logDebug(`Found book: ${currentBook}`);
      cleanedLines.push(`# ${currentBook}`);
      continue;
    }
    
    // Check for chapter line (e.g., "Chapter 1")
    const chapterMatch = lines[i].match(/^Chapter\s+(\d+)/i);
    if (chapterMatch) {
      // Save any buffered verse
      if (inVerse && verseBuffer.length > 0) {
        cleanedLines.push(verseBuffer.join(' ').trim());
        verseBuffer = [];
      }
      
      currentChapter = parseInt(chapterMatch[1], 10);
      logDebug(`Found chapter: ${currentChapter}`);
      cleanedLines.push(`Chapter ${currentChapter}`);
      inVerse = false;
      continue;
    }
    
    // Check for verse line (e.g., "1 In the beginning...")
    // This regex looks for numbers at the start of the line or after whitespace
    const verseMatch = lines[i].trim().match(/^(\d+)\s+(.*)/);
    if (verseMatch) {
      // Save previous verse if exists
      if (inVerse && verseBuffer.length > 0) {
        cleanedLines.push(verseBuffer.join(' ').trim());
      }
      
      // Start new verse
      currentVerse = parseInt(verseMatch[1], 10);
      const verseText = verseMatch[2].trim();
      verseBuffer = [`${currentVerse} ${verseText}`];
      inVerse = true;
    } 
    // If we're in a verse and the line doesn't start with a number, it's a continuation
    else if (inVerse) {
      verseBuffer.push(lines[i].trim());
    }
  }
  
  // Save the last verse if it exists
  if (inVerse && verseBuffer.length > 0) {
    cleanedLines.push(verseBuffer.join(' ').trim());
  }
  
  logDebug(`Cleanup complete. Processed ${cleanedLines.length} lines.`);
  return cleanedLines.join('\n');
}

async function main() {
  try {
    logDebug('Starting NASB1995 cleanup (v4)...');
    
    // Read the input file with proper encoding
    logDebug(`Reading input file: ${INPUT_FILE}`);
    const content = fs.readFileSync(INPUT_FILE, 'utf8');
    
    // Clean the content
    const cleanedContent = cleanBibleText(content);
    
    // Write the cleaned content to the output file
    logDebug(`Writing cleaned content to: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, cleanedContent, 'utf8');
    
    // Log statistics
    const originalLines = content.split('\n').length;
    const cleanedLines = cleanedContent.split('\n').length;
    
    logDebug('\nCleanup Statistics:');
    logDebug(`- Original file: ${originalLines} lines`);
    logDebug(`- Cleaned file: ${cleanedLines} lines`);
    logDebug(`- Difference: ${originalLines - cleanedLines} lines removed`);
    
    // Log a sample of the cleaned content
    const sample = cleanedContent.split('\n').slice(0, 20).join('\n');
    logDebug('\nSample of cleaned content:');
    logDebug(sample);
    
    logDebug('\nCleanup completed successfully!');
    logDebug(`Debug log saved to: ${DEBUG_LOG}`);
    
  } catch (error) {
    logDebug('An error occurred:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
