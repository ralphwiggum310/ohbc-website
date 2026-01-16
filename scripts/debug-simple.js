// Simple JavaScript debug script
const fs = require('fs');
const path = require('path');

console.log('Starting simple debug script...');

// Test file path
const testFilePath = path.join(__dirname, '..', 'test-output.txt');
console.log(`Test file path: ${testFilePath}`);

try {
  // Write test file
  console.log('Writing test file...');
  fs.writeFileSync(testFilePath, 'This is a test file', 'utf8');
  console.log('Test file written successfully');
  
  // Verify file exists
  if (fs.existsSync(testFilePath)) {
    console.log('Test file exists');
    const stats = fs.statSync(testFilePath);
    console.log(`File size: ${stats.size} bytes`);
    console.log(`File content: ${fs.readFileSync(testFilePath, 'utf8')}`);
  } else {
    console.error('Error: Test file was not created!');
  }
  
  // Test bible-json
  console.log('\nTesting bible-json...');
  try {
    const bible = require('bible-json');
    console.log('bible-json loaded successfully');
    console.log('Sample verse:', bible.bible[0]);
  } catch (err) {
    console.error('Error loading bible-json:', err);
  }
  
} catch (error) {
  console.error('Error in debug script:', error);
}
