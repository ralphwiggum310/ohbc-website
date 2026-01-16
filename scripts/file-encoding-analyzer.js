import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'encoding-analysis.txt');

// Clear previous output file
if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
}

// Create write stream for output
const outputStream = fs.createWriteStream(OUTPUT_FILE, { flags: 'a' });

// Log function
function log(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  console.log(`[${timestamp}] ${message}`);
  outputStream.write(logMessage);
}

async function analyzeEncodings() {
  try {
    log('Starting file encoding analysis...');
    
    // Read the file in binary mode
    const buffer = fs.readFileSync(INPUT_FILE);
    log(`File size: ${buffer.length} bytes`);
    
    // Try different encodings
    const encodings = [
      'utf8',
      'latin1',
      'ascii',
      'utf16le',
      'ucs2',
      'base64',
      'hex'
    ];
    
    for (const encoding of encodings) {
      try {
        log(`\n=== Testing encoding: ${encoding} ===`);
        
        // Try to read the file with the current encoding
        const content = buffer.toString(encoding);
        const sample = content.substring(0, 200);
        
        log(`Sample (first 200 chars):`);
        log(sample);
        
        // Look for verse numbers
        const verseMatch = content.match(/\d+\s+[A-Za-z]/);
        if (verseMatch) {
          log(`Found verse number pattern: ${verseMatch[0]}`);
        }
        
        // Count lines and characters
        const lines = content.split(/\r?\n/);
        log(`Total lines: ${lines.length}`);
        log(`Total characters: ${content.length}`);
        
      } catch (error) {
        log(`Error with encoding ${encoding}: ${error.message}`);
      }
    }
    
    log('\nAnalysis complete!');
    log(`Results saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    log('An error occurred during analysis:', error);
  } finally {
    outputStream.end();
  }
}

// Run the analysis
analyzeEncodings().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
