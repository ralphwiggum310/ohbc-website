// Script to clean and reformat the NASB1995 file
import { readFileSync, writeFileSync } from 'fs';

const inputFile = 'scripts/NASB1995-cleaned.txt';
const outputFile = 'scripts/NASB1995-formatted.txt';

// Expected books of the Bible in order
const EXPECTED_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

function cleanFile() {
  console.log(`Reading from: ${inputFile}`);
  console.log('Cleaning and reformatting file...');
  
  try {
    // Read the input file
    const content = readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');
    let output = [];
    
    let currentBook = '';
    let currentChapter = '';
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      
      // Check for book header (e.g., "# GENESIS")
      const bookMatch = line.match(/^#\s*([A-Za-z0-9\s]+)$/);
      if (bookMatch) {
        const bookName = bookMatch[1].trim();
        if (EXPECTED_BOOKS.includes(bookName)) {
          currentBook = bookName;
          output.push(`# ${currentBook}`);
          console.log(`Found book: ${currentBook}`);
        }
        continue;
      }
      
      // Check for chapter header (e.g., "## Chapter 1 The Creation")
      const chapterMatch = line.match(/^##\s*Chapter\s*(\d+)(?:\s+(.*))?/i);
      if (chapterMatch && currentBook) {
        const chapterNum = chapterMatch[1];
        const chapterTitle = chapterMatch[2] || '';
        currentChapter = chapterNum;
        output.push(`## Chapter ${currentChapter} ${chapterTitle}`.trim());
        continue;
      }
      
      // Check for verse (e.g., "### 1:1" or "1:1")
      const verseMatch = line.match(/^(?:###\s*)?(\d+:\d+)(?:\s+(.*))?/);
      if (verseMatch && currentBook && currentChapter) {
        const verseRef = verseMatch[1];
        const verseText = verseMatch[2] || '';
        output.push(`### ${verseRef} ${verseText}`.trim());
        continue;
      }
      
      // If we get here, it's probably a continuation of the previous line
      if (output.length > 0) {
        const lastLine = output[output.length - 1];
        if (lastLine.startsWith('### ')) {
          // Append to the last verse
          output[output.length - 1] = `${lastLine} ${line}`.replace(/\s+/g, ' ').trim();
        } else {
          // Add as a new line
          output.push(line);
        }
      } else {
        output.push(line);
      }
    }
    
    // Write the cleaned file
    writeFileSync(outputFile, output.join('\n'), 'utf8');
    console.log(`\nCleaned file written to: ${outputFile}`);
    console.log(`Total lines in original: ${lines.length}`);
    console.log(`Total lines in cleaned: ${output.length}`);
    
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

cleanFile();
