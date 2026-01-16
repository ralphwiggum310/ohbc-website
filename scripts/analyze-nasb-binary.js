import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'nasb-binary-analysis.txt');

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
    log('Starting binary analysis of NASB1995.txt...');
    
    // Read the file in binary mode
    const buffer = fs.readFileSync(INPUT_FILE);
    log(`File size: ${buffer.length} bytes`);
    
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
    
    // Look for patterns in the file
    log('\nLooking for patterns in the file...');
    
    // Check for common encodings by looking for known patterns
    const encodings = [
      { name: 'UTF-8', bom: [0xEF, 0xBB, 0xBF] },
      { name: 'UTF-16LE', bom: [0xFF, 0xFE] },
      { name: 'UTF-16BE', bom: [0xFE, 0xFF] },
      { name: 'UTF-32LE', bom: [0xFF, 0xFE, 0x00, 0x00] },
      { name: 'UTF-32BE', bom: [0x00, 0x00, 0xFE, 0xFF] }
    ];
    
    let hasBOM = false;
    for (const encoding of encodings) {
      if (buffer.length >= encoding.bom.length) {
        const bom = buffer.subarray(0, encoding.bom.length);
        const matches = encoding.bom.every((byte, i) => bom[i] === byte);
        if (matches) {
          log(`Found BOM for ${encoding.name}`);
          hasBOM = true;
          break;
        }
      }
    }
    
    if (!hasBOM) {
      log('No BOM found, assuming UTF-8 or other encoding');
    }
    
    // Look for common patterns that might indicate file structure
    const patterns = {
      newline: { pattern: /\r?\n/g, name: 'Newline' },
      tab: { pattern: /\t/g, name: 'Tab' },
      nonAscii: { pattern: /[^\x00-\x7F]/g, name: 'Non-ASCII' },
      verseNumber: { pattern: /\b\d+\b/g, name: 'Verse number' },
      chapterHeader: { pattern: /Chapter\s+\d+/gi, name: 'Chapter header' },
      bookHeader: { pattern: /^#\s*[A-Z]+$/gm, name: 'Book header' }
    };
    
    // Convert buffer to string for pattern matching
    const content = buffer.toString('binary');
    
    // Count occurrences of each pattern
    for (const [key, { pattern, name }] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      const count = matches ? matches.length : 0;
      log(`${name} count: ${count}`);
    }
    
    // Look for common encoding issues
    const commonIssues = {
      'UTF-8 with BOM': /\xEF\xBB\xBF/,
      'UTF-16LE BOM': /\xFF\xFE/,
      'UTF-16BE BOM': /\xFE\xFF/,
      'UTF-32LE BOM': /\xFF\xFE\x00\x00/,
      'UTF-32BE BOM': /\x00\x00\xFE\xFF/,
      'UTF-8 continuation byte': /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g,
      'Invalid UTF-8': /[\xC0-\xC1]|[\xF5-\xFF]|\xED[\xA0-\x9F]|\xF4[\x90-\xFF]/g
    };
    
    log('\nChecking for common encoding issues:');
    for (const [issue, pattern] of Object.entries(commonIssues)) {
      const matches = content.match(pattern);
      const count = matches ? matches.length : 0;
      if (count > 0) {
        log(`Found ${count} instances of ${issue}`);
        if (count < 10 && matches) {
          log(`  Examples: ${matches.slice(0, 5).join(', ')}`);
        }
      }
    }
    
    // Look for potential verse patterns in the first 1000 characters
    const sampleText = content.substring(0, 1000);
    const versePattern = /(\d+)\s+([^\r\n]+)/g;
    let match;
    const verses = [];
    
    while ((match = versePattern.exec(sampleText)) !== null && verses.length < 5) {
      verses.push({
        verse: match[1],
        text: match[2].trim()
      });
    }
    
    if (verses.length > 0) {
      log('\nSample verses found in the first 1000 characters:');
      verses.forEach((v, i) => {
        log(`  ${i + 1}. Verse ${v.verse}: ${v.text.substring(0, 50)}...`);
      });
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
