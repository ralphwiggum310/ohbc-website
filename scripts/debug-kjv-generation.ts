import fs from 'fs';
import path from 'path';

// Simple test script to verify file system operations
function testFileSystem() {
  console.log('Starting file system test...');
  
  // Test directory
  const testDir = path.join(process.cwd(), 'public/test-dir');
  console.log(`Test directory: ${testDir}`);
  
  try {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      console.log('Creating test directory...');
      fs.mkdirSync(testDir, { recursive: true });
      console.log('Test directory created successfully');
    } else {
      console.log('Test directory already exists');
    }
    
    // Test file path
    const testFilePath = path.join(testDir, 'test-file.txt');
    console.log(`Test file path: ${testFilePath}`);
    
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
    
  } catch (error) {
    console.error('File system test failed:', error);
  }
}

// Run the test
testFileSystem();

// Now test with the actual bible-json package
function testBibleJson() {
  console.log('\nTesting bible-json package...');
  
  try {
    // Try to import bible-json
    console.log('Importing bible-json...');
    // @ts-ignore - Using require for dynamic import
    const bible = require('bible-json');
    
    if (!bible || !bible.bible) {
      console.error('Error: bible-json module not loaded correctly');
      return;
    }
    
    console.log('bible-json loaded successfully');
    console.log(`Number of verses: ${bible.bible.length}`);
    
    // Show a sample verse
    if (bible.bible.length > 0) {
      console.log('Sample verse:', bible.bible[0]);
    }
    
  } catch (error) {
    console.error('Error testing bible-json:', error);
  }
}

// Run the bible-json test
testBibleJson();
