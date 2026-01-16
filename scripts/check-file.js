// Simple script to check file content and structure
const fs = require('fs');

const filePath = 'scripts/NASB1995-cleaned.txt';

console.log(`Reading ${filePath}...\n`);

try {
  // Read the first 500 characters of the file
  const data = fs.readFileSync(filePath, 'utf8');
  
  console.log('First 500 characters of the file:');
  console.log('--------------------------------');
  console.log(data.substring(0, 500));
  
  // Count lines
  const lines = data.split('\n');
  console.log(`\nTotal lines in file: ${lines.length}`);
  
  // Show first 10 lines
  console.log('\nFirst 10 lines:');
  console.log('--------------');
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
  
  // Look for book patterns in first 100 lines
  console.log('\nPotential book headers in first 100 lines:');
  console.log('------------------------------------');
  for (let i = 0; i < Math.min(100, lines.length); i++) {
    if (lines[i].match(/^[A-Z][a-z]+( [A-Z][a-z]+)*$/)) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
    }
  }
  
  // Look for chapter patterns
  console.log('\nPotential chapter headers in first 100 lines:');
  console.log('--------------------------------------');
  for (let i = 0; i < Math.min(100, lines.length); i++) {
    if (lines[i].match(/Chapter \d+/i)) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
    }
  }
  
} catch (err) {
  console.error('Error reading file:', err);
}
