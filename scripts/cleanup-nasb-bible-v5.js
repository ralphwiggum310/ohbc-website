import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v5.txt');
const DEBUG_LOG = path.join(__dirname, 'cleanup-debug-v5.log');

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

function preprocessContent(content) {
  logDebug('Preprocessing content to join wrapped lines...');
  
  const lines = content.split('\n');
  const processedLines = [];
  let currentLine = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      if (currentLine) {
        processedLines.push(currentLine);
        currentLine = '';
      }
      processedLines.push('');
      continue;
    }
    
    // Check for book or chapter headers
    if (trimmedLine.startsWith('#') || /^Chapter\s+\d+/i.test(trimmedLine)) {
      if (currentLine) {
        processedLines.push(currentLine);
        currentLine = '';
      }
      processedLines.push(trimmedLine);
      continue;
    }
    
    // Check for verse number at the start of the line
    const verseMatch = trimmedLine.match(/^(\d+)\s+/);
    if (verseMatch) {
      if (currentLine) {
        processedLines.push(currentLine);
      }
      currentLine = trimmedLine;
    } else if (currentLine) {
      // This is a continuation of the previous line
      currentLine += ' ' + trimmedLine;
    } else {
      // This might be a chapter title or other metadata
      processedLines.push(trimmedLine);
    }
  }
  
  // Add the last line if it exists
  if (currentLine) {
    processedLines.push(currentLine);
  }
  
  return processedLines.join('\n');
}

function cleanBibleText(content) {
  logDebug('Starting Bible text cleanup...');
  
  // First preprocess to join wrapped lines
  const preprocessedContent = preprocessContent(content);
  
  const lines = preprocessedContent.split('\n');
  const cleanedLines = [];
  
  let currentBook = '';
  let currentChapter = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      cleanedLines.push('');
      continue;
    }
    
    // Check for book header (e.g., "# GENESIS")
    if (line.startsWith('#')) {
      currentBook = line.substring(2).trim();
      logDebug(`Found book: ${currentBook}`);
      cleanedLines.push(`# ${currentBook}`);
      continue;
    }
    
    // Check for chapter line (e.g., "Chapter 1")
    const chapterMatch = line.match(/^Chapter\s+(\d+)/i);
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1], 10);
      logDebug(`Found chapter: ${currentChapter}`);
      cleanedLines.push(`Chapter ${currentChapter}`);
      
      // Check if the next line is a chapter title
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && !/^\d+\s+/.test(nextLine) && !nextLine.startsWith('Chapter ')) {
          cleanedLines.push(nextLine);
          i++; // Skip the title line in the next iteration
        }
      }
      continue;
    }
    
    // Process verse lines
    const verseMatch = line.match(/^(\d+)\s+(.*)/);
    if (verseMatch) {
      const verseNum = verseMatch[1];
      const verseText = verseMatch[2].trim();
      cleanedLines.push(`${verseNum} ${verseText}`);
    } else {
      // If it doesn't match any pattern, add it as-is
      cleanedLines.push(line);
    }
  }
  
  logDebug(`Cleanup complete. Processed ${cleanedLines.length} lines.`);
  return cleanedLines.join('\n');
}

async function main() {
  try {
    logDebug('Starting NASB1995 cleanup (v5)...');
    
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
