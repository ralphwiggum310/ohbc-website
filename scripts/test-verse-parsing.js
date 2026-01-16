import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const cleanedFilePath = path.join(__dirname, 'NASB1995-cleaned.txt');

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

async function testVerseParsing() {
  console.log('Testing verse parsing from cleaned file...');
  
  try {
    // Read the cleaned file
    const content = await readFile(cleanedFilePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentBook = null;
    let currentChapter = 0;
    let verseCount = 0;
    let sampleVerses = [];
    
    console.log('Testing first 100 lines for verse patterns...');
    
    for (let i = 0; i < Math.min(100, lines.length); i++) {
      const line = lines[i];
      
      // Check for book header
      if (line.startsWith('# ')) {
        const bookName = line.substring(2).trim();
        currentBook = bookNameToId[bookName];
        console.log(`Found book: ${bookName} (ID: ${currentBook})`);
        continue;
      }
      
      // Check for chapter header
      if (line.startsWith('## ')) {
        const chapterMatch = line.match(/## Chapter (\d+)/);
        if (chapterMatch) {
          currentChapter = parseInt(chapterMatch[1], 10);
          console.log(`  Found chapter: ${currentChapter}`);
        }
        continue;
      }
      
      // Test verse pattern matching
      const versePatterns = [
        /^([A-Z]+)\s+(\d+):(\d+)\s+(.*)$/,  // GENESIS 1:1 text
        /^(\d+):(\d+)\s+(.*)$/,             // 1:1 text (without book name)
        /^([A-Z]+)\s+(\d+):(\d+)-(\d+)\s+(.*)$/ // GENESIS 1:1-2 text
      ];
      
      for (const pattern of versePatterns) {
        const match = line.match(pattern);
        if (match) {
          let bookName, chapter, verse, text;
          
          if (match.length >= 4) { // With book name
            bookName = match[1];
            chapter = match[2];
            verse = match[3];
            text = match[4] || '';
          } else { // Without book name
            chapter = match[1];
            verse = match[2];
            text = match[3] || '';
          }
          
          const bookId = bookName ? bookNameToId[bookName] : currentBook;
          
          if (bookId && chapter && verse) {
            verseCount++;
            if (sampleVerses.length < 5) {
              sampleVerses.push({
                bookId,
                bookName: bookName || Object.entries(bookNameToId).find(([_, id]) => id === currentBook)?.[0] || 'Unknown',
                chapter: parseInt(chapter, 10),
                verse: parseInt(verse, 10),
                text: text.substring(0, 50) + (text.length > 50 ? '...' : '')
              });
            }
            break;
          }
        }
      }
    }
    
    console.log(`\nFound ${verseCount} verses in first 100 lines`);
    console.log('Sample verses:');
    sampleVerses.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.bookName} ${v.chapter}:${v.verse} - ${v.text}`);
    });
    
  } catch (error) {
    console.error('Error testing verse parsing:', error);
  }
}

// Run the test
testVerseParsing().catch(console.error);
