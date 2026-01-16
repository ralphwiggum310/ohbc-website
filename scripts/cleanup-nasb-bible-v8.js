import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v8.txt');
const DEBUG_LOG = path.join(__dirname, 'cleanup-debug-v8.log');

// Clear previous output files
[OUTPUT_FILE, DEBUG_LOG].forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`Removed existing file: ${file}`);
    } catch (error) {
      console.error(`Error removing ${file}:`, error.message);
    }
  }
});

// Simple logging function
function log(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(DEBUG_LOG, logMessage, 'utf8');
}

// Function to clean a single line
function cleanLine(line) {
  // Remove any non-printable characters except newlines and tabs
  return line.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
            .replace(/\s+/g, ' ') // Replace multiple spaces with one
            .trim();
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

// Main processing function
async function processFile() {
  try {
    log('Starting NASB1995 cleanup (v8)...');
    
    // Read the entire file as binary
    log('Reading input file...');
    const buffer = fs.readFileSync(INPUT_FILE);
    
    // Convert to string, replacing any non-UTF8 sequences
    let content = buffer.toString('utf8');
    
    // Normalize line endings to LF
    content = content.replace(/\r\n?/g, '\n');
    
    // Split into lines and clean each line
    const lines = content.split('\n').map(cleanLine).filter(line => line.length > 0);
    log(`Processed ${lines.length} lines`);
    
    // Process the lines to join wrapped verses
    const output = [];
    let currentVerse = '';
    
    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) {
        if (currentVerse) {
          output.push(currentVerse);
          currentVerse = '';
        }
        output.push('');
        continue;
      }
      
      // Handle book headers
      if (isBookHeader(line)) {
        if (currentVerse) {
          output.push(currentVerse);
          currentVerse = '';
        }
        output.push(line);
        continue;
      }
      
      // Handle chapter headers
      if (isChapterHeader(line)) {
        if (currentVerse) {
          output.push(currentVerse);
          currentVerse = '';
        }
        output.push(line);
        continue;
      }
      
      // Handle verse lines
      if (isVerseStart(line)) {
        if (currentVerse) {
          output.push(currentVerse);
        }
        currentVerse = line;
      } else if (currentVerse) {
        // This is a continuation of the current verse
        currentVerse += ' ' + line.trim();
      } else {
        // This might be a chapter title or other metadata
        output.push(line);
      }
    }
    
    // Add the last verse if it exists
    if (currentVerse) {
      output.push(currentVerse);
    }
    
    // Write the output to file
    log(`Writing ${output.length} lines to output file...`);
    fs.writeFileSync(OUTPUT_FILE, output.join('\n'), 'utf8');
    
    // Log completion
    log('Cleanup completed successfully!');
    log(`Output written to: ${OUTPUT_FILE}`);
    log(`Debug log: ${DEBUG_LOG}`);
    
    // Log a sample of the output
    const sample = output.slice(0, 20).join('\n');
    log('Sample of cleaned content:', { sample });
    
  } catch (error) {
    log('An error occurred:', error);
    process.exit(1);
  }
}

// Run the script
processFile().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
