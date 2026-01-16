import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Expected book names in order
const expectedBooks = [
  'GENESIS', 'EXODUS', 'LEVITICUS', 'NUMBERS', 'DEUTERONOMY',
  'JOSHUA', 'JUDGES', 'RUTH', '1 SAMUEL', '2 SAMUEL',
  '1 KINGS', '2 KINGS', '1 CHRONICLES', '2 CHRONICLES',
  'EZRA', 'NEHEMIAH', 'ESTHER', 'JOB', 'PSALM', 'PROVERBS',
  'ECCLESIASTES', 'SONG OF SOLOMON', 'ISAIAH', 'JEREMIAH',
  'LAMENTATIONS', 'EZEKIEL', 'DANIEL', 'HOSEA', 'JOEL',
  'AMOS', 'OBADIAH', 'JONAH', 'MICAH', 'NAHUM', 'HABAKKUK',
  'ZEPHANIAH', 'HAGGAI', 'ZECHARIAH', 'MALACHI', 'MATTHEW',
  'MARK', 'LUKE', 'JOHN', 'ACTS', 'ROMANS', '1 CORINTHIANS',
  '2 CORINTHIANS', 'GALATIANS', 'EPHESIANS', 'PHILIPPIANS',
  'COLOSSIANS', '1 THESSALONIANS', '2 THESSALONIANS',
  '1 TIMOTHY', '2 TIMOTHY', 'TITUS', 'PHILEMON', 'HEBREWS',
  'JAMES', '1 PETER', '2 PETER', '1 JOHN', '2 JOHN', '3 JOHN',
  'JUDE', 'REVELATION'
];

async function checkBooks() {
  try {
    const cleanedFilePath = path.join(__dirname, 'NASB1995-cleaned.txt');
    const content = await readFile(cleanedFilePath, 'utf-8');
    
    // Find all book headers in the cleaned file
    const bookHeaders = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const bookMatch = line.match(/^#\s*(.+?)(?:\s*$|\s*#)/);
      if (bookMatch) {
        const bookName = bookMatch[1].trim().toUpperCase();
        bookHeaders.push(bookName);
      }
    }
    
    // Find missing books
    const missingBooks = [];
    const foundBooks = [];
    
    for (const expectedBook of expectedBooks) {
      if (!bookHeaders.includes(expectedBook)) {
        missingBooks.push(expectedBook);
      } else {
        foundBooks.push(expectedBook);
      }
    }
    
    // Find extra books (not in expected list)
    const extraBooks = bookHeaders.filter(book => !expectedBooks.includes(book));
    
    // Print results
    console.log('=== Book Verification Results ===');
    console.log(`Found ${foundBooks.length} out of ${expectedBooks.length} expected books`);
    console.log(`Missing books: ${missingBooks.length ? missingBooks.join(', ') : 'None'}`);
    console.log(`Extra books found: ${extraBooks.length ? extraBooks.join(', ') : 'None'}`);
    
    // Print first few lines of the cleaned file for reference
    console.log('\n=== First 10 lines of cleaned file ===');
    console.log(lines.slice(0, 10).join('\n'));
    
    // Print context around 2 TIMOTHY if found
    const timothyIndex = lines.findIndex(line => line.includes('# 2 TIMOTHY'));
    if (timothyIndex !== -1) {
      console.log('\n=== 2 TIMOTHY context ===');
      console.log(lines.slice(Math.max(0, timothyIndex - 2), timothyIndex + 3).join('\n'));
    }
    
  } catch (error) {
    console.error('Error checking books:', error);
  }
}

checkBooks().catch(console.error);
