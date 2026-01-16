// Simple script to get file statistics
import { readFileSync } from 'fs';

const filePath = 'scripts/NASB1995-cleaned.txt';

try {
  // Read the file
  const data = readFileSync(filePath, 'utf8');
  
  // Basic stats
  const lines = data.split('\n');
  const charCount = data.length;
  const lineCount = lines.length;
  
  console.log('File Statistics:');
  console.log('----------------');
  console.log(`File path: ${filePath}`);
  console.log(`Total characters: ${charCount}`);
  console.log(`Total lines: ${lineCount}`);
  
  // Show first 5 lines
  console.log('\nFirst 5 lines:');
  console.log('------------');
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
  
  // Show last 5 lines
  console.log('\nLast 5 lines:');
  console.log('-----------');
  const start = Math.max(0, lines.length - 5);
  for (let i = start; i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
  
  // Count lines starting with # (potential headers)
  const headerLines = lines.filter(line => line.startsWith('#'));
  console.log(`\nLines starting with #: ${headerLines.length} (${(headerLines.length / lineCount * 100).toFixed(1)}% of total)`);
  
  // Show sample of header lines
  console.log('\nSample header lines:');
  console.log('-----------------');
  const sampleSize = Math.min(5, headerLines.length);
  for (let i = 0; i < sampleSize; i++) {
    console.log(headerLines[i]);
  }
  
} catch (error) {
  console.error('Error reading file:', error);
}
