// Simple test script to verify Node.js environment
console.log('=== Node.js Environment Test ===');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Current directory: ${process.cwd()}`);

// Test file system access
const fs = require('fs');
const path = require('path');

const testFilePath = path.join(process.cwd(), 'test-node-env.txt');

console.log(`\nWriting test file to: ${testFilePath}`);
fs.writeFileSync(testFilePath, 'Test content', 'utf8');
console.log('File written successfully');

// Read the file back
const content = fs.readFileSync(testFilePath, 'utf8');
console.log(`File content: "${content}"`);

// Clean up
fs.unlinkSync(testFilePath);
console.log('Test file deleted');

console.log('\n=== Test completed successfully ===');
