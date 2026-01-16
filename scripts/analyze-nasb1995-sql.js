import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sqlFilePath = join(__dirname, '..', 'data', 'bible', 'NASB1995_bible.sql');

// Counters for analysis
let lineCount = 0;
let createTableCount = 0;
let insertCount = 0;
let sampleInserts = [];
const bookCounts = new Map();

// Create a read stream for the SQL file
const fileStream = createReadStream(sqlFilePath, { encoding: 'utf8' });
const rl = createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

console.log('Analyzing NASB 1995 SQL file...');
console.log('-------------------------------');

// Process each line of the SQL file
rl.on('line', (line) => {
  lineCount++;
  
  // Check for CREATE TABLE statements
  if (line.toLowerCase().includes('create table')) {
    createTableCount++;
    console.log(`\nFound CREATE TABLE statement (${createTableCount}):`);
    console.log(line.substring(0, 200) + (line.length > 200 ? '...' : ''));
  }
  
  // Check for INSERT statements
  if (line.toLowerCase().startsWith('insert into')) {
    insertCount++;
    
    // Extract book name for counting
    const bookMatch = line.match(/\(\s*\d+\s*,\s*'([^']+)'/i);
    if (bookMatch && bookMatch[1]) {
      const bookName = bookMatch[1];
      bookCounts.set(bookName, (bookCounts.get(bookName) || 0) + 1);
    }
    
    // Save a few sample inserts
    if (sampleInserts.length < 5) {
      sampleInserts.push(line.substring(0, 200) + (line.length > 200 ? '...' : ''));
    }
  }
  
  // Log progress every 100,000 lines
  if (lineCount % 100000 === 0) {
    console.log(`Processed ${lineCount.toLocaleString()} lines...`);
  }
});

// When done reading the file
rl.on('close', () => {
  console.log('\nAnalysis Complete');
  console.log('-----------------');
  console.log(`Total lines: ${lineCount.toLocaleString()}`);
  console.log(`CREATE TABLE statements: ${createTableCount}`);
  console.log(`INSERT statements: ${insertCount.toLocaleString()}`);
  
  console.log('\nSample INSERT statements:');
  sampleInserts.forEach((insert, i) => {
    console.log(`\n${i + 1}. ${insert}`);
  });
  
  console.log('\nBook distribution (top 10):');
  const sortedBooks = Array.from(bookCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  sortedBooks.forEach(([book, count]) => {
    console.log(`- ${book}: ${count.toLocaleString()} verses`);
  });
});

// Handle errors
rl.on('error', (error) => {
  console.error('Error reading SQL file:', error);
});
