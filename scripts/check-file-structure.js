import fs from 'fs';
import readline from 'readline';

const filePath = 'scripts/NASB1995-cleaned.txt';

async function checkFileStructure() {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;
  let currentBook = '';
  let currentChapter = '';
  let verseCount = 0;
  const books = new Set();
  const chapters = new Set();
  
  console.log('Checking file structure...\n');

  for await (const line of rl) {
    lineNumber++;
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Check for book headers (## Book Name)
    if (trimmed.startsWith('## ')) {
      currentBook = trimmed.substring(3).trim();
      books.add(currentBook);
      console.log(`Found book: ${currentBook} (line ${lineNumber})`);
      continue;
    }
    
    // Check for chapter headers (### Chapter X)
    if (trimmed.startsWith('### ')) {
      currentChapter = trimmed.substring(4).trim();
      chapters.add(currentChapter);
      console.log(`  Chapter: ${currentChapter} (line ${lineNumber})`);
      continue;
    }
    
    // Count verses (#### X:Y)
    if (trimmed.startsWith('#### ')) {
      verseCount++;
      if (verseCount <= 3 || verseCount % 1000 === 0) {
        console.log(`    Verse: ${trimmed.substring(5)} (line ${lineNumber})`);
      }
    }
    
    // Show progress
    if (lineNumber % 1000 === 0) {
      console.log(`Processed ${lineNumber} lines...`);
    }
  }
  
  // Print summary
  console.log('\n=== File Structure Summary ===');
  console.log(`Total lines processed: ${lineNumber}`);
  console.log(`Books found: ${books.size}`);
  console.log(`Chapters found: ${chapters.size}`);
  console.log(`Verses found: ${verseCount}`);
  
  // Show first 5 books as sample
  console.log('\nSample of books found:');
  console.log(Array.from(books).slice(0, 5).join('\n'));
  
  // Show first 5 chapters as sample
  console.log('\nSample of chapters found:');
  console.log(Array.from(chapters).slice(0, 5).join('\n'));
}

checkFileStructure().catch(console.error);
