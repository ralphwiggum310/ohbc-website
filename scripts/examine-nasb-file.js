import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');

// Read the first 5000 characters of the file
const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

// Function to display a line with its number and content
function displayLine(lineNumber, line) {
  console.log(`[${lineNumber.toString().padStart(5)}] ${line}`);
}

console.log('=== First 50 non-empty lines ===');
let count = 0;
let lineNumber = 0;

for (const line of lines) {
  lineNumber++;
  const trimmed = line.trim();
  if (trimmed) {  // Only process non-empty lines
    count++;
    displayLine(lineNumber, trimmed);
    if (count >= 50) break;
  }
}

// Look for verse patterns in the first 200 lines
console.log('\n=== Verse Patterns ===');
const versePatterns = new Set();
let verseCount = 0;

for (let i = 0; i < Math.min(200, lines.length); i++) {
  const line = lines[i].trim();
  
  // Look for verse patterns
  const verseMatch = line.match(/^(\d+\s+[A-Z])|(\d+:\d+\s+[A-Z])/);
  if (verseMatch) {
    const pattern = verseMatch[0];
    versePatterns.add(pattern);
    verseCount++;
    
    if (verseCount <= 5) {  // Show first 5 verse matches
      console.log(`[${i.toString().padStart(5)}] ${line}`);
    }
  }
}

console.log(`\nFound ${versePatterns.size} unique verse start patterns in first 200 lines.`);

// Look for wrapped lines (lines that start with lowercase or punctuation)
console.log('\n=== Wrapped Lines ===');
let wrappedCount = 0;

for (let i = 0; i < Math.min(200, lines.length); i++) {
  const line = lines[i].trim();
  
  // Skip empty lines and lines that start with numbers or uppercase letters
  if (line && !/^[\d#A-Z]/.test(line)) {
    wrappedCount++;
    
    if (wrappedCount <= 5) {  // Show first 5 wrapped lines
      console.log(`[${i.toString().padStart(5)}] ${line}`);
    }
  }
}

console.log(`\nFound ${wrappedCount} wrapped lines in first 200 lines.`);

// Check file encoding and line endings
console.log('\n=== File Information ===');
const stats = fs.statSync(INPUT_FILE);
console.log(`File size: ${stats.size} bytes`);

// Check for BOM (Byte Order Mark)
const BOM = Buffer.from([0xEF, 0xBB, 0xBF]);
const buffer = Buffer.alloc(3);
const fd = fs.openSync(INPUT_FILE, 'r');
fs.readSync(fd, buffer, 0, 3, 0);
fs.closeSync(fd);

console.log(`Has BOM: ${buffer.equals(BOM) ? 'Yes' : 'No'}`);

// Count different line ending types
let crlfCount = 0;
let lfCount = 0;
let crCount = 0;

for (let i = 0; i < Math.min(1000, lines.length); i++) {
  const line = lines[i];
  if (line.endsWith('\r\n')) crlfCount++;
  else if (line.endsWith('\n')) lfCount++;
  else if (line.endsWith('\r')) crCount++;
}

console.log(`Line endings in first 1000 lines:`);
console.log(`  CRLF: ${crlfCount}`);
console.log(`  LF: ${lfCount}`);
console.log(`  CR: ${crCount}`);
