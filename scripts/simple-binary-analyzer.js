import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'simple-binary-analysis.txt');

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

function analyzeFile() {
  try {
    log('Starting simple binary analysis of NASB1995.txt...');
    
    // Read the file in binary mode
    const buffer = fs.readFileSync(INPUT_FILE);
    log(`File size: ${buffer.length} bytes`);
    
    // Check for BOM (Byte Order Mark)
    const hasBOM = buffer.length >= 3 && 
                  buffer[0] === 0xEF && 
                  buffer[1] === 0xBB && 
                  buffer[2] === 0xBF;
    log(`Has BOM: ${hasBOM}`);
    
    // Analyze the first 1000 bytes
    const sampleSize = Math.min(1000, buffer.length);
    const sample = buffer.subarray(0, sampleSize);
    
    log('\nFirst 1000 bytes as hex and ASCII:');
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
    
    // Look for common patterns
    log('\nLooking for common patterns...');
    
    // Check for common line endings
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
    
    log('Line ending counts:');
    log(`- CRLF (Windows): ${crlfCount}`);
    log(`- LF (Unix): ${lfCount}`);
    log(`- CR (Old Mac): ${crCount}`);
    
    // Try to detect the most likely encoding
    const encodings = [
      'utf8', 'latin1', 'utf16le', 'ucs2', 'ascii', 'base64', 'hex'
    ];
    
    log('\nTrying different encodings...');
    
    for (const encoding of encodings) {
      try {
        const text = buffer.toString(encoding);
        const sample = text.substring(0, 100);
        log(`\n${encoding.toUpperCase()} sample (first 100 chars):`);
        log(sample);
        
        // Look for verse numbers in the sample
        const verseMatch = text.match(/\d+\s+[A-Za-z]/);
        if (verseMatch) {
          log(`Found verse number pattern in ${encoding}`);
          log(`Example: ${verseMatch[0]}`);
        }
      } catch (error) {
        log(`Error with ${encoding} encoding: ${error.message}`);
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
analyzeFile();
