const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFile = path.join('C:\\WindSurf\\ohbc_website\\Bible api\\NASB1995\\Genesis.txt');
const outputFile = path.join('C:\\WindSurf\\ohbc_website\\Bible api\\NASB1995\\Genesis_Cleaned.txt');

console.log('Reading input file...');
let content = fs.readFileSync(inputFile, 'utf-8');

// Remove all footnotes in square brackets
console.log('Removing footnotes...');
content = content.replace(/\s*\[[^\]]*\]\s*/g, ' ');

// Remove verse numbers and other numeric references
content = content.replace(/\b\d+\s*[a-zA-Z]*\b/g, '');

// Replace multiple spaces with a single space
content = content.replace(/\s+/g, ' ').trim();

// Remove any remaining special characters or markers
content = content.replace(/[\*\[\]\{\}]/g, '');

// Split into sentences (crude way to get verse-like chunks)
let verses = content.split(/(?<!\.\w)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+/);

// Write to output file with each verse on a new line
console.log('Writing cleaned content to file...');
fs.writeFileSync(outputFile, verses.join('\n\n'), 'utf-8');

console.log(`Cleaned text written to: ${outputFile}`);
console.log('First 10 lines of cleaned text:');
console.log(verses.slice(0, 10).join('\n'));
