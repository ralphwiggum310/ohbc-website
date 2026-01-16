import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'nasb-diagnostic-report.txt');

// Clear previous output file
if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
}

function log(message, data = null) {
  const logMessage = `${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  console.log(logMessage);
  fs.appendFileSync(OUTPUT_FILE, logMessage, 'utf8');
}

async function analyzeFile() {
  try {
    log('Starting NASB1995 file analysis...');
    
    // Read the file in binary mode
    log('\nReading file in binary mode...');
    const buffer = fs.readFileSync(INPUT_FILE);
    log(`File size: ${buffer.length} bytes`);
    
    // Check for BOM (Byte Order Mark)
    const hasBOM = buffer.length >= 3 && 
                  buffer[0] === 0xEF && 
                  buffer[1] === 0xBB && 
                  buffer[2] === 0xBF;
    log(`Has BOM: ${hasBOM}`);
    
    // Check line endings
    let crlfCount = 0;
    let lfCount = 0;
    let crCount = 0;
    
    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i] === 0x0D && buffer[i + 1] === 0x0A) {
        crlfCount++;
      } else if (buffer[i] === 0x0A) {
        lfCount++;
      } else if (buffer[i] === 0x0D) {
        crCount++;
      }
    }
    
    log('\nLine ending analysis:');
    log(`- CRLF (Windows): ${crlfCount}`);
    log(`- LF (Unix): ${lfCount}`);
    log(`- CR (Old Mac): ${crCount}`);
    
    // Sample first 1000 bytes as hex
    const sampleSize = Math.min(1000, buffer.length);
    const sample = buffer.subarray(0, sampleSize);
    
    log('\nHex dump of first 1000 bytes:');
    for (let i = 0; i < sample.length; i += 16) {
      const chunk = sample.subarray(i, Math.min(i + 16, sample.length));
      const hex = Array.from(chunk)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
      const ascii = Array.from(chunk)
        .map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')
        .join('');
      log(`${i.toString(16).padStart(8, '0')}: ${hex.padEnd(47)} ${ascii}`);
    }
    
    // Read as text with different encodings
    log('\nReading file with different encodings:');
    
    const encodings = ['utf8', 'utf16le', 'latin1'];
    for (const encoding of encodings) {
      try {
        const text = fs.readFileSync(INPUT_FILE, encoding);
        log(`\nFirst 200 characters (${encoding}):`);
        log(text.substring(0, 200));
      } catch (error) {
        log(`Error reading with ${encoding}: ${error.message}`);
      }
    }
    
    log('\nAnalysis complete!');
    log(`Report saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    log('An error occurred during analysis:', error);
    process.exit(1);
  }
}

// Run the analysis
analyzeFile().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
