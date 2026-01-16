import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const txtPath = path.join(__dirname, 'NASB1995.txt');

// Book name to ID mapping
const bookNameToId = {
  'GENESIS': 1, 'EXODUS': 2, 'LEVITICUS': 3, 'NUMBERS': 4, 'DEUTERONOMY': 5,
  'JOSHUA': 6, 'JUDGES': 7, 'RUTH': 8, '1 SAMUEL': 9, '2 SAMUEL': 10,
  '1 KINGS': 11, '2 KINGS': 12, '1 CHRONICLES': 13, '2 CHRONICLES': 14,
  'EZRA': 15, 'NEHEMIAH': 16, 'ESTHER': 17, 'JOB': 18, 'PSALM': 19, 'PSALMS': 19,
  'PROVERBS': 20, 'ECCLESIASTES': 21, 'SONG OF SOLOMON': 22, 'ISAIAH': 23,
  'JEREMIAH': 24, 'LAMENTATIONS': 25, 'EZEKIEL': 26, 'DANIEL': 27,
  'HOSEA': 28, 'JOEL': 29, 'AMOS': 30, 'OBADIAH': 31, 'JONAH': 32,
  'MICAH': 33, 'NAHUM': 34, 'HABAKKUK': 35, 'ZEPHANIAH': 36, 'HAGGAI': 37,
  'ZECHARIAH': 38, 'MALACHI': 39, 'MATTHEW': 40, 'MARK': 41, 'LUKE': 42,
  'JOHN': 43, 'ACTS': 44, 'ROMANS': 45, '1 CORINTHIANS': 46, '2 CORINTHIANS': 47,
  'GALATIANS': 48, 'EPHESIANS': 49, 'PHILIPPIANS': 50, 'COLOSSIANS': 51,
  '1 THESSALONIANS': 52, '2 THESSALONIANS': 53, '1 TIMOTHY': 54, '2 TIMOTHY': 55,
  'TITUS': 56, 'PHILEMON': 57, 'HEBREWS': 58, 'JAMES': 59, '1 PETER': 60,
  '2 PETER': 61, '1 JOHN': 62, '2 JOHN': 63, '3 JOHN': 64, 'JUDE': 65,
  'REVELATION': 66
};

// Function to normalize book names
function normalizeBookName(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')  // Remove special characters
    .replace(/\s+/g, ' ')          // Replace multiple spaces with single space
    .trim();
}

async function debugParsing() {
  console.log('Debugging NASB1995.txt parsing...');
  
  try {
    // Read the file
    const content = await readFile(txtPath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentBook = '';
    let currentBookId = 0;
    let currentChapter = 0;
    let verseCount = 0;
    let inVerse = false;
    let currentVerseText = [];
    let currentVerseRef = '';
    
    // Track parsing issues
    const issues = [];
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for book name (all caps, not a verse)
      if (line === line.toUpperCase() && line.length > 2 && !/^\d/.test(line)) {
        const normalizedBookName = normalizeBookName(line);
        if (bookNameToId[normalizedBookName]) {
          currentBook = normalizedBookName;
          currentBookId = bookNameToId[normalizedBookName];
          console.log(`\nProcessing book: ${currentBook} (ID: ${currentBookId})`);
        } else {
          console.warn(`Unknown book name: ${line}`);
        }
        continue;
      }
      
      // Check for chapter line
      const chapterMatch = line.match(/^Chapter\s+(\d+)/i);
      if (chapterMatch) {
        currentChapter = parseInt(chapterMatch[1], 10);
        console.log(`  Chapter ${currentChapter}`);
        continue;
      }
      
      // Check for verse reference
      const verseMatch = line.match(/^(\d+):(\d+)(?:\s+(.*))?/);
      if (verseMatch) {
        // If we were in a verse, save it
        if (inVerse) {
          const text = currentVerseText.join(' ');
          console.log(`    ${currentVerseRef}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
          verseCount++;
          currentVerseText = [];
        }
        
        const chapter = parseInt(verseMatch[1], 10);
        const verse = parseInt(verseMatch[2], 10);
        const text = verseMatch[3] || '';
        
        // Update chapter if it's different
        if (chapter !== currentChapter) {
          console.warn(`  Chapter mismatch: Expected ${currentChapter}, found ${chapter} in ${currentBook} ${chapter}:${verse}`);
          currentChapter = chapter;
        }
        
        currentVerseRef = `${chapter}:${verse}`;
        inVerse = true;
        
        if (text) {
          currentVerseText.push(text);
        }
        
        // Log some samples
        if (verseCount < 5 || (verseCount % 1000 === 0)) {
          console.log(`    ${currentBook} ${currentVerseRef}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
        }
      } 
      // If we're in a verse and this line doesn't start a new verse, it's a continuation
      else if (inVerse && currentBookId && currentChapter) {
        currentVerseText.push(line);
      }
      // If we see a line that looks like it should be a verse but wasn't caught
      else if (/\d+\s+[A-Za-z]/.test(line) && !/^Chapter\s+\d+/i.test(line)) {
        issues.push({
          lineNumber: i + 1,
          line: line.substring(0, 100),
          issue: 'Possible verse not detected',
          context: {
            previousLine: lines[i-1],
            nextLine: i < lines.length - 1 ? lines[i+1] : null
          }
        });
      }
    }
    
    // Don't forget the last verse
    if (inVerse && currentVerseText.length > 0) {
      const text = currentVerseText.join(' ');
      console.log(`    ${currentVerseRef}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
      verseCount++;
    }
    
    console.log('\nParsing complete!');
    console.log(`- Total verses found: ${verseCount}`);
    
    // Report any issues
    if (issues.length > 0) {
      console.log('\nPossible parsing issues found:');
      console.log('----------------------------');
      
      const maxIssuesToShow = Math.min(10, issues.length);
      for (let i = 0; i < maxIssuesToShow; i++) {
        const issue = issues[i];
        console.log(`\nIssue at line ${issue.lineNumber}: ${issue.issue}`);
        console.log(`Line: ${issue.line}`);
        console.log('Context:');
        console.log(`  Previous: ${issue.context.previousLine || '(start of file)'}`);
        console.log(`  Next: ${issue.context.nextLine || '(end of file)'}`);
      }
      
      if (issues.length > maxIssuesToShow) {
        console.log(`\n... and ${issues.length - maxIssuesToShow} more issues not shown.`);
      }
    }
    
  } catch (error) {
    console.error('Error during parsing:', error);
  }
}

// Run the debug
debugParsing().catch(console.error);
