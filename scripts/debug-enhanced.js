// Enhanced debug script with more detailed logging
const fs = require('fs');
const path = require('path');

console.log('=== Starting Enhanced Debug Script ===');

// 1. Basic environment info
console.log('\n1. Environment Information:');
console.log(`- Current directory: ${process.cwd()}`);
console.log(`- Node.js version: ${process.version}`);
console.log(`- Platform: ${process.platform}`);
console.log(`- Architecture: ${process.arch}`);

// 2. Test file system access
console.log('\n2. Testing File System Access:');
const testFile = path.join(process.cwd(), 'test-debug.txt');

try {
  console.log(`- Attempting to write to: ${testFile}`);
  fs.writeFileSync(testFile, 'Test content', 'utf8');
  console.log('- Successfully wrote test file');
  
  const fileContent = fs.readFileSync(testFile, 'utf8');
  console.log(`- File content: "${fileContent}"`);
  
  fs.unlinkSync(testFile);
  console.log('- Successfully deleted test file');
} catch (error) {
  console.error('File system test failed:', error);
}

// 3. Test package loading
console.log('\n3. Testing Package Loading:');

try {
  console.log('- Attempting to load bible-json...');
  const bibleJson = require('bible-json');
  
  console.log('- bible-json loaded successfully');
  console.log(`- Type of bibleJson: ${typeof bibleJson}`);
  
  if (bibleJson && bibleJson.bible) {
    console.log(`- Number of verses: ${bibleJson.bible.length}`);
    if (bibleJson.bible.length > 0) {
      console.log('- First verse sample:', JSON.stringify(bibleJson.bible[0], null, 2));
    }
  } else {
    console.log('- bibleJson structure:', Object.keys(bibleJson));
  }
} catch (error) {
  console.error('Failed to load bible-json:', error);
}

// 4. Test directory creation
console.log('\n4. Testing Directory Creation:');
const testDir = path.join(process.cwd(), 'test-dir');

try {
  console.log(`- Creating directory: ${testDir}`);
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log('- Directory created successfully');
  } else {
    console.log('- Directory already exists');
  }
  
  // Write a test file in the new directory
  const testFileInDir = path.join(testDir, 'test.txt');
  fs.writeFileSync(testFileInDir, 'Test content in directory', 'utf8');
  console.log(`- Created test file: ${testFileInDir}`);
  
  // Clean up
  fs.unlinkSync(testFileInDir);
  fs.rmdirSync(testDir);
  console.log('- Cleaned up test directory and file');
  
} catch (error) {
  console.error('Directory test failed:', error);
}

console.log('\n=== Debug Script Completed ===');
