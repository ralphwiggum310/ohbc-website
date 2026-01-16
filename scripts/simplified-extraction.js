import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_simplified.txt');
const LOG_FILE = path.join(__dirname, 'simplified-extraction-log.txt');

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

// Function to process the file
async function processFile() {
  try {
    log('Starting simplified extraction from NASB1995.txt...');
    
    // Read the file as a buffer
    const buffer = fs.readFileSync(INPUT_FILE);
    log(`File size: ${buffer.length} bytes`);
    
    // Convert buffer to string using binary encoding to avoid UTF-8 issues
    const content = buffer.toString('binary');
    
    // Split into lines and clean each line
    const lines = content.split(/\r?\n/);
    log(`Found ${lines.length} lines in the file`);
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const cleanLine = cleanText(lines[i]);
      
      // Skip empty lines
      if (!cleanLine) {
        outputStream.write('\n');
        continue;
      }
      
      // Write the cleaned line
      outputStream.write(cleanLine + '\n');
      
      // Log progress every 1000 lines
      if (i % 1000 === 0) {
        log(`Processed ${i} of ${lines.length} lines...`);
      }
    }
    
    log('Simplified extraction complete!');
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
