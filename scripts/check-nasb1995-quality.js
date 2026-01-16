import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the Bibles database
const dbPath = join(__dirname, '..', 'data', 'bible', 'Bibles.db');

console.log(`Opening database at: ${dbPath}`);
const db = new Database(dbPath, { readonly: true });

// Function to get random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to clean and format text for display
function cleanText(text) {
  if (!text) return '';
  // Remove control characters
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
}

// Function to check a random verse from a random book
function checkRandomVerse() {
  try {
    // Get a random book
    const book = db.prepare('SELECT id, name FROM key_english WHERE id BETWEEN 1 AND 66 ORDER BY RANDOM() LIMIT 1').get();
    
    if (!book) {
      console.error('No books found in key_english table');
      return;
    }
    
    console.log(`\n🔍 Checking random verse from ${book.name} (ID: ${book.id})`);
    
    // Get the chapter count for this book
    const chapterCount = db.prepare('SELECT chapters FROM key_english WHERE id = ?').get(book.id).chapters;
    const randomChapter = getRandomInt(1, chapterCount);
    
    console.log(`📖 Chapter ${randomChapter} (of ${chapterCount})`);
    
    // Get verse count for this chapter
    const verseCountResult = db.prepare(
      'SELECT MAX(verse) as maxVerse FROM t_nasb1995 WHERE book = ? AND chapter = ?'
    ).get(book.id, randomChapter);
    
    if (!verseCountResult || !verseCountResult.maxVerse) {
      console.log(`⚠️  No verses found for ${book.name} ${randomChapter}`);
      return;
    }
    
    const verseCount = verseCountResult.maxVerse;
    const randomVerse = getRandomInt(1, verseCount);
    
    // Get the verse
    const verse = db.prepare(
      `SELECT v.text, b.name as bookName, v.chapter, v.verse 
       FROM t_nasb1995 v 
       JOIN key_english b ON v.book = b.id 
       WHERE v.book = ? AND v.chapter = ? AND v.verse = ?`
    ).get(book.id, randomChapter, randomVerse);
    
    if (!verse || !verse.text) {
      console.log(`⚠️  Verse ${randomVerse} not found in ${book.name} ${randomChapter}`);
      return;
    }
    
    // Clean the verse text
    const cleanedText = cleanText(verse.text);
    
    console.log(`📜 ${verse.bookName} ${verse.chapter}:${verse.verse}`);
    console.log(`"${cleanedText}"`);
    
    // Check for common data quality issues
    const issues = [];
    
    if (cleanedText.length < 5) {
      issues.push('Very short verse (possible truncation)');
    }
    
    if (/[^\x20-\x7E]/.test(cleanedText)) {
      issues.push('Contains non-printable characters');
    }
    
    if (cleanedText.includes('  ')) {
      issues.push('Contains multiple consecutive spaces');
    }
    
    if (cleanedText.trim() !== cleanedText) {
      issues.push('Contains leading or trailing whitespace');
    }
    
    // Check for common OCR/encoding artifacts
    const commonIssues = [
      { pattern: /[]/, desc: 'Contains replacement character ()' },
      { pattern: /\[\?\]/, desc: 'Contains [?] - possible OCR issue' },
      { pattern: /\b[a-z][A-Z]/, desc: 'Possible missing space between words' },
      { pattern: /\b\w{20,}\b/, desc: 'Very long word (possible concatenation)' },
      { pattern: /\b\w*\d+\w*\b/, desc: 'Word contains digits (may be verse numbers in text)' }
    ];
    
    commonIssues.forEach(issue => {
      if (issue.pattern.test(cleanedText)) {
        issues.push(issue.desc);
      }
    });
    
    if (issues.length > 0) {
      console.log('\n⚠️  Potential issues found:');
      issues.forEach(issue => console.log(`- ${issue}`));
    } else {
      console.log('✅ No obvious data quality issues detected');
    }
    
    return true;
    
  } catch (err) {
    console.error('Error checking random verse:', err.message);
    return false;
  }
}

// Function to check the first and last verse of a random book
function checkBookBoundaries() {
  try {
    // Get a random book
    const book = db.prepare('SELECT id, name FROM key_english WHERE id BETWEEN 1 AND 66 ORDER BY RANDOM() LIMIT 1').get();
    
    if (!book) {
      console.error('No books found in key_english table');
      return;
    }
    
    console.log(`\n📚 Checking first and last verses of ${book.name} (ID: ${book.id})`);
    
    // Get first verse
    const firstVerse = db.prepare(
      `SELECT v.text, b.name as bookName, v.chapter, v.verse 
       FROM t_nasb1995 v 
       JOIN key_english b ON v.book = b.id 
       WHERE v.book = ? 
       ORDER BY v.chapter, v.verse 
       LIMIT 1`
    ).get(book.id);
    
    if (firstVerse) {
      console.log(`\n📖 First verse (${firstVerse.bookName} ${firstVerse.chapter}:${firstVerse.verse}):`);
      console.log(`"${firstVerse.text}"`);
    } else {
      console.log('⚠️  No first verse found');
    }
    
    // Get last verse
    const lastVerse = db.prepare(
      `SELECT v.text, b.name as bookName, v.chapter, v.verse 
       FROM t_nasb1995 v 
       JOIN key_english b ON v.book = b.id 
       WHERE v.book = ? 
       ORDER BY v.chapter DESC, v.verse DESC 
       LIMIT 1`
    ).get(book.id);
    
    if (lastVerse) {
      console.log(`\n📖 Last verse (${lastVerse.bookName} ${lastVerse.chapter}:${lastVerse.verse}):`);
      console.log(`"${lastVerse.text}"`);
    } else {
      console.log('⚠️  No last verse found');
    }
    
  } catch (err) {
    console.error('Error checking book boundaries:', err.message);
  }
}

// Main function
async function main() {
  console.log('🔍 NASB 1995 Data Quality Check');
  console.log('==============================');
  
  // Check if the table exists
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
  ).get('t_nasb1995');
  
  if (!tableExists) {
    console.error('❌ t_nasb1995 table does not exist in the database');
    return;
  }
  
  // Get total verse count
  const totalVerses = db.prepare('SELECT COUNT(*) as count FROM t_nasb1995').get().count;
  console.log(`📊 Total verses in NASB 1995: ${totalVerses.toLocaleString()}`);
  
  // Check random verses
  console.log('\n🔍 Checking random verses...');
  for (let i = 0; i < 5; i++) {
    console.log(`\n--- Test ${i + 1} ---`);
    await checkRandomVerse();
  }
  
  // Check book boundaries
  console.log('\n🔍 Checking book boundaries...');
  checkBookBoundaries();
  
  // Check specific known verses
  console.log('\n🔍 Checking specific verses...');
  const testVerses = [
    { book: 1, chapter: 1, verse: 1, desc: 'Genesis 1:1' },
    { book: 19, chapter: 23, verse: 1, desc: 'Psalm 23:1' },
    { book: 40, chapter: 1, verse: 1, desc: 'Matthew 1:1' },
    { book: 43, chapter: 3, verse: 16, desc: 'John 3:16' },
    { book: 66, chapter: 22, verse: 20, desc: 'Revelation 22:20' },
    { book: 18, chapter: 1, verse: 1, desc: 'Job 1:1' },
    { book: 19, chapter: 1, verse: 1, desc: 'Psalm 1:1' },
    { book: 40, chapter: 28, verse: 20, desc: 'Matthew 28:20' },
    { book: 50, chapter: 4, verse: 13, desc: 'Philippians 4:13' },
    { book: 55, chapter: 3, verse: 16, desc: '2 Timothy 3:16' }
  ];
  
  for (const tv of testVerses) {
    const verse = db.prepare(
      `SELECT v.text, b.name as bookName, v.chapter, v.verse 
       FROM t_nasb1995 v 
       JOIN key_english b ON v.book = b.id 
       WHERE v.book = ? AND v.chapter = ? AND v.verse = ?`
    ).get(tv.book, tv.chapter, tv.verse);
    
    console.log(`\n📜 ${tv.desc} (Book ${tv.book} ${tv.chapter}:${tv.verse})`);
    
    if (verse && verse.text) {
      const cleanedText = cleanText(verse.text);
      console.log(`"${cleanedText}"`);
      
      // Check for common issues
      const issues = [];
      if (cleanedText.length < 5) issues.push('Very short verse');
      if (/[^\x20-\x7E]/.test(cleanedText)) issues.push('Non-printable characters');
      if (cleanedText.includes('  ')) issues.push('Multiple spaces');
      if (cleanedText.trim() !== cleanedText) issues.push('Leading/trailing whitespace');
      
      if (issues.length > 0) {
        console.log('  ⚠️  ' + issues.join(', '));
      } else {
        console.log('  ✅ Clean');
      }
    } else {
      console.log('⚠️  Verse not found');
    }
  }
  
  // Check for any obvious data issues
  console.log('\n🔍 Checking for common data issues...');
  
  // Check for empty or very short verses
  const shortVerses = db.prepare(
    'SELECT b.name as book, v.chapter, v.verse, LENGTH(v.text) as length ' +
    'FROM t_nasb1995 v ' +
    'JOIN key_english b ON v.book = b.id ' +
    'WHERE LENGTH(v.text) < 5 ' +
    'ORDER BY length ASC ' +
    'LIMIT 5'
  ).all();
  
  if (shortVerses.length > 0) {
    console.log('\n⚠️  Very short verses found (length < 5 characters):');
    shortVerses.forEach(v => {
      console.log(`- ${v.book} ${v.chapter}:${v.verse} (${v.length} chars): "${cleanText(v.text)}"`);
    });
  } else {
    console.log('✅ No extremely short verses found');
  }
  
  // Check for potential encoding issues
  const encodingIssues = db.prepare(
    'SELECT b.name as book, v.chapter, v.verse, v.text ' +
    'FROM t_nasb1995 v ' +
    'JOIN key_english b ON v.book = b.id ' +
    'WHERE v.text LIKE ? OR v.text LIKE ? ' +
    'LIMIT 5'
  ).all('%%', '%[?]%');
  
  if (encodingIssues.length > 0) {
    console.log('\n⚠️  Potential encoding issues found:');
    encodingIssues.forEach(v => {
      console.log(`- ${v.book} ${v.chapter}:${v.verse}`);
    });
  } else {
    console.log('✅ No obvious encoding issues found');
  }
  
  console.log('\n✅ Data quality check complete');
}

// Run the main function
main()
  .catch(console.error)
  .finally(() => db.close());
