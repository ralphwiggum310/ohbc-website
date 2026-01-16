import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'nasb-chunks.txt');

// Clear previous output file
if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
}

// Create write stream for output
const outputStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  outputStream.write(logMessage);
}

async function processFile() {
  try {
    log('Starting to process NASB1995.txt in chunks...');
    
    // Create read stream with explicit encoding
    const readStream = fs.createReadStream(INPUT_FILE, { 
      encoding: 'utf8',
      highWaterMark: 1024 // Process 1KB at a time
    });
    
    let lineCount = 0;
    let buffer = '';
    
    readStream.on('data', (chunk) => {
      // Process each chunk
      buffer += chunk;
      
      // Process complete lines
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);
        
        if (line) {
          lineCount++;
          
          // Log the first 20 lines
          if (lineCount <= 20) {
            log(`Line ${lineCount}: ${line}`);
          }
          
          // Log progress every 1000 lines
          if (lineCount % 1000 === 0) {
            log(`Processed ${lineCount} lines...`);
          }
        }
      }
    });
    
    readStream.on('end', () => {
      // Process any remaining data in the buffer
      if (buffer.trim()) {
        lineCount++;
        log(`Line ${lineCount}: ${buffer.trim()}`);
      }
      
      log(`\nProcessing complete. Total lines: ${lineCount}`);
      log(`Output written to: ${OUTPUT_FILE}`);
      outputStream.end();
    });
    
    readStream.on('error', (error) => {
      log(`Error reading file: ${error.message}`);
      outputStream.end();
      process.exit(1);
    });
    
  } catch (error) {
    log(`An error occurred: ${error.message}`);
    outputStream.end();
    process.exit(1);
  }
}

// Run the script
processFile();
