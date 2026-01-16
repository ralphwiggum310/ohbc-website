import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'NASB1995_cleaned_v7.txt');
const DEBUG_LOG = path.join(__dirname, 'cleanup-debug-v7.log');

// Clear previous log and output files
[DEBUG_LOG, OUTPUT_FILE].forEach(file => {
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
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}`;
  
  console.log(logMessage);
  fs.appendFileSync(DEBUG_LOG, logMessage + '\n', 'utf8');
}

// Main function
async function main() {
  try {
    log('Starting NASB1995 cleanup (v7)...');
    
    // Read the entire file at once (since it's not extremely large)
    log(`Reading input file: ${INPUT_FILE}`);
    const content = fs.readFileSync(INPUT_FILE, 'utf8');
    
    // Split into lines and process
    const lines = content.split(/\r?\n/);
    log(`Read ${lines.length} lines from input file`);
    
    // Process lines to join wrapped verses
    const processedLines = [];
    let currentLine = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines unless we're in the middle of a verse
      if (!line) {
        if (currentLine) {
          processedLines.push(currentLine);
          currentLine = '';
        }
        processedLines.push('');
        continue;
      }
      
      // Check for book or chapter headers
      if (line.startsWith('#') || /^Chapter\s+\d+/i.test(line)) {
        if (currentLine) {
          processedLines.push(currentLine);
          currentLine = '';
        }
        processedLines.push(line);
        continue;
      }
      
      // Check for verse number at the start of the line
      const verseMatch = line.match(/^(\d+)\s+(.*)/);
      if (verseMatch) {
        if (currentLine) {
          processedLines.push(currentLine);
        }
        currentLine = line;
      } else if (currentLine) {
        // This is a continuation of the previous line
        currentLine += ' ' + line;
      } else {
        // This might be a chapter title or other metadata
        processedLines.push(line);
      }
      
      // Log progress every 1000 lines
      if (i % 1000 === 0) {
        log(`Processed ${i} of ${lines.length} lines...`);
      }
    }
    
    // Add the last line if it exists
    if (currentLine) {
      processedLines.push(currentLine);
    }
    
    // Write the processed lines to the output file
    log(`Writing ${processedLines.length} lines to output file...`);
    fs.writeFileSync(OUTPUT_FILE, processedLines.join('\n'), 'utf8');
    
    // Log completion
    log('Cleanup completed successfully!');
    log(`Output written to: ${OUTPUT_FILE}`);
    log(`Debug log: ${DEBUG_LOG}`);
    
    // Log a sample of the output
    const sample = processedLines.slice(0, 20).join('\n');
    log('Sample of cleaned content:', { sample });
    
  } catch (error) {
    log('An error occurred:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
