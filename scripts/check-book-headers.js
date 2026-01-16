import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File path
const cleanedFilePath = path.join(__dirname, 'NASB1995-cleaned.txt');

// All expected book names in order
const allBooks = [
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

async function checkBookHeaders() {
  console.log('Checking for missing book headers in cleaned file...');
  
  try {
    // Read the cleaned file
    const content = await readFile(cleanedFilePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim());
    
    // Find all book headers in the file
    const foundBooks = [];
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        const bookName = line.substring(2).trim().toUpperCase();
        foundBooks.push(bookName);
      }
    });
    
    console.log(`Found ${foundBooks.length} book headers in the file`);
    
    // Find missing books
    const missingBooks = allBooks.filter(book => !foundBooks.includes(book));
    
    if (missingBooks.length > 0) {
      console.log('\nMissing book headers:');
      console.log(missingBooks.join(', '));
      
      // Show context around missing books
      console.log('\nContext around missing books:');
      for (let i = 0; i < allBooks.length; i++) {
        const book = allBooks[i];
        if (missingBooks.includes(book)) {
          const prevBook = i > 0 ? allBooks[i-1] : null;
          const nextBook = i < allBooks.length - 1 ? allBooks[i+1] : null;
          
          console.log(`\n${book} is missing.`);
          if (prevBook) console.log(`  Previous book: ${prevBook} (${foundBooks.includes(prevBook) ? 'found' : 'also missing'})`);
          if (nextBook) console.log(`  Next book: ${nextBook} (${foundBooks.includes(nextBook) ? 'found' : 'also missing'})`);
          
          // Find where the previous book appears in the file
          if (prevBook && foundBooks.includes(prevBook)) {
            const prevBookIndex = foundBooks.indexOf(prevBook);
            const nextFoundBook = foundBooks[prevBookIndex + 1];
            console.log(`  In the file, after ${prevBook} comes ${nextFoundBook || 'nothing'}`);
          }
        }
      }
    } else {
      console.log('All 66 book headers found!');
    }
    
    // Show first few lines of the file to check format
    console.log('\nFirst 20 lines of the file:');
    console.log('---------------------------');
    console.log(lines.slice(0, 20).join('\n'));
    
  } catch (error) {
    console.error('Error checking book headers:', error);
  }
}

// Run the check
checkBookHeaders().catch(console.error);
