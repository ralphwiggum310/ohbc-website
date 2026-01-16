import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the NASB1995 file
const filePath = path.join(__dirname, 'NASB1995-cleaned.txt');

// Expected book names in order
const EXPECTED_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark',
  'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

// Known verse counts per book (NASB 1995)
const EXPECTED_VERSE_COUNTS = {
  'Genesis': 1533, 'Exodus': 1213, 'Leviticus': 859, 'Numbers': 1288, 'Deuteronomy': 959,
  'Joshua': 658, 'Judges': 618, 'Ruth': 85, '1 Samuel': 810, '2 Samuel': 695,
  '1 Kings': 816, '2 Kings': 719, '1 Chronicles': 942, '2 Chronicles': 822, 'Ezra': 280,
  'Nehemiah': 406, 'Esther': 167, 'Job': 1070, 'Psalms': 2461, 'Proverbs': 915,
  'Ecclesiastes': 222, 'Song of Solomon': 117, 'Isaiah': 1292, 'Jeremiah': 1364,
  'Lamentations': 154, 'Ezekiel': 1273, 'Daniel': 357, 'Hosea': 197, 'Joel': 73,
  'Amos': 146, 'Obadiah': 21, 'Jonah': 48, 'Micah': 105, 'Nahum': 47,
  'Habakkuk': 56, 'Zephaniah': 53, 'Haggai': 38, 'Zechariah': 211, 'Malachi': 55,
  'Matthew': 1071, 'Mark': 678, 'Luke': 1151, 'John': 879, 'Acts': 1007,
  'Romans': 433, '1 Corinthians': 437, '2 Corinthians': 257, 'Galatians': 149,
  'Ephesians': 155, 'Philippians': 104, 'Colossians': 95, '1 Thessalonians': 89,
  '2 Thessalonians': 47, '1 Timothy': 113, '2 Timothy': 83, 'Titus': 46,
  'Philemon': 25, 'Hebrews': 303, 'James': 108, '1 Peter': 105, '2 Peter': 61,
  '1 John': 105, '2 John': 13, '3 John': 15, 'Jude': 25, 'Revelation': 404
};

// Parse the file
function parseBibleFile(content) {
  const books = {};
  let currentBook = null;
  let currentChapter = null;
  let lineNumber = 0;

  const lines = content.split('\n');
  
  for (const line of lines) {
    lineNumber++;
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check for book header (e.g., "## Genesis" or "## 1. Genesis")
    const bookMatch = trimmedLine.match(/^##\s*(?:\d+\.\s*)?(.+?)(?:\s+\d+)?$/);
    if (bookMatch) {
      const bookName = bookMatch[1].trim();
      currentBook = bookName;
      books[bookName] = books[bookName] || { chapters: {}, verseCount: 0, lineNumber };
      currentChapter = null;
      continue;
    }

    // Check for chapter (e.g., "### 1" or "### Chapter 1")
    const chapterMatch = trimmedLine.match(/^###\s*(?:Chapter\s+)?(\d+)/i);
    if (chapterMatch && currentBook) {
      currentChapter = parseInt(chapterMatch[1], 10);
      books[currentBook].chapters[currentChapter] = books[currentBook].chapters[currentChapter] || { verses: new Set(), verseCount: 0 };
      continue;
    }

    // Check for verse (e.g., "#### 1" or "1:1")
    if (currentBook && currentChapter !== null) {
      const verseMatch = trimmedLine.match(/^(?:####\s*)?(\d+):(\d+)/);
      if (verseMatch) {
        const verseNumber = parseInt(verseMatch[2], 10);
        if (!books[currentBook].chapters[currentChapter].verses.has(verseNumber)) {
          books[currentBook].chapters[currentChapter].verses.add(verseNumber);
          books[currentBook].chapters[currentChapter].verseCount++;
          books[currentBook].verseCount++;
        }
      }
    }
  }

  return books;
}

// Main function
async function analyzeFile() {
  console.log(`Reading file: ${filePath}`);
  
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const books = parseBibleFile(content);
    
    // Check book count
    const foundBooks = Object.keys(books);
    console.log(`\nFound ${foundBooks.length} books in the file`);
    
    // Check for missing/extra books
    const missingBooks = EXPECTED_BOOKS.filter(book => !foundBooks.includes(book));
    const extraBooks = foundBooks.filter(book => !EXPECTED_BOOKS.includes(book));
    
    // Check verse counts
    const verseMismatches = [];
    for (const book of EXPECTED_BOOKS) {
      if (books[book]) {
        const expected = EXPECTED_VERSE_COUNTS[book];
        const actual = books[book].verseCount;
        if (expected !== actual) {
          verseMismatches.push({
            book,
            expected,
            actual,
            difference: actual - expected,
            lineNumber: books[book].lineNumber
          });
        }
      }
    }
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Found ${foundBooks.length} books`);
    console.log(`- Missing books: ${missingBooks.length}`);
    console.log(`- Extra books: ${extraBooks.length}`);
    console.log(`- Books with verse count mismatches: ${verseMismatches.length}`);
    
    // Print missing books
    if (missingBooks.length > 0) {
      console.log('\n❌ Missing books:');
      console.log(missingBooks.join(', '));
    }
    
    // Print extra books
    if (extraBooks.length > 0) {
      console.log('\n⚠️  Extra books found:');
      extraBooks.forEach(book => {
        console.log(`- ${book} (${books[book].verseCount} verses, starts at line ${books[book].lineNumber})`);
      });
    }
    
    // Print verse mismatches
    if (verseMismatches.length > 0) {
      console.log('\n⚠️  Verse count mismatches:');
      console.table(verseMismatches);
    }
    
    // Print book details
    console.log('\n📚 Book details:');
    const bookDetails = EXPECTED_BOOKS.map(book => {
      const data = books[book];
      const expected = EXPECTED_VERSE_COUNTS[book] || 0;
      const actual = data?.verseCount || 0;
      const status = !data ? '❌ Missing' : 
                   actual === expected ? '✅' : 
                   `⚠️  ${actual - expected > 0 ? '+' : ''}${actual - expected}`;
      
      return {
        Book: book,
        'Found': data ? '✅' : '❌',
        'Verses': actual.toLocaleString(),
        'Expected': expected.toLocaleString(),
        'Status': status,
        'Line': data?.lineNumber || 'N/A'
      };
    });
    
    console.table(bookDetails);
    
    // Print sample of extra content
    if (extraBooks.length > 0) {
      console.log('\n🔍 Sample of extra content:');
      extraBooks.slice(0, 2).forEach(book => {
        const startLine = Math.max(0, books[book].lineNumber - 2);
        const endLine = startLine + 5;
        const lines = content.split('\n').slice(startLine, endLine);
        console.log(`\nLines ${startLine + 1}-${endLine} (${book}):`);
        lines.forEach((line, i) => console.log(`${startLine + i + 1}: ${line}`));
      });
    }
    
    if (missingBooks.length === 0 && extraBooks.length === 0 && verseMismatches.length === 0) {
      console.log('\n🎉 All checks passed! The file structure looks good.');
    } else {
      console.log('\n⚠️  Some issues were found. Please review the output above.');
    }
    
  } catch (error) {
    console.error('\n❌ Error reading or parsing the file:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the analysis
analyzeFile();
