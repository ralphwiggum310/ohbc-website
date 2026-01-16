import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'nasb-source-analysis.txt');
const LOG_FILE = path.join(__dirname, 'analyze-nasb-source.log');

// Book names in order with their IDs
const BOOK_NAMES = [
  'GENESIS', 'EXODUS', 'LEVITICUS', 'NUMBERS', 'DEUTERONOMY', 'JOSHUA', 'JUDGES', 'RUTH',
  '1 SAMUEL', '2 SAMUEL', '1 KINGS', '2 KINGS', '1 CHRONICLES', '2 CHRONICLES', 'EZRA', 'NEHEMIAH',
  'ESTHER', 'JOB', 'PSALMS', 'PROVERBS', 'ECCLESIASTES', 'SONG OF SOLOMON', 'ISAIAH', 'JEREMIAH',
  'LAMENTATIONS', 'EZEKIEL', 'DANIEL', 'HOSEA', 'JOEL', 'AMOS', 'OBADIAH', 'JONAH', 'MICAH',
  'NAHUM', 'HABAKKUK', 'ZEPHANIAH', 'HAGGAI', 'ZECHARIAH', 'MALACHI', 'MATTHEW', 'MARK', 'LUKE',
  'JOHN', 'ACTS', 'ROMANS', '1 CORINTHIANS', '2 CORINTHIANS', 'GALATIANS', 'EPHESIANS',
  'PHILIPPIANS', 'COLOSSIANS', '1 THESSALONIANS', '2 THESSALONIANS', '1 TIMOTHY', '2 TIMOTHY',
  'TITUS', 'PHILEMON', 'HEBREWS', 'JAMES', '1 PETER', '2 PETER', '1 JOHN', '2 JOHN', '3 JOHN',
  'JUDE', 'REVELATION'
];

// Initialize log file
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });

function log(message, data) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  logStream.write(logMessage);
  console.log(`[${timestamp}] ${message}`);
}

// Track statistics
const stats = {
  totalLines: 0,
  bookHeaders: 0,
  chapterHeaders: 0,
  sectionHeaders: 0,
  verseLines: 0,
  wrappedLines: 0,
  emptyLines: 0,
  otherLines: 0,
  versePatterns: {
    startsWithNumber: 0,
    startsWithNumberColon: 0,
    startsWithNumberSpace: 0,
    other: 0
  },
  lineLengths: [],
  booksFound: new Set(),
  chaptersByBook: {},
  verseCounts: {},
  sampleVerses: []
};

function analyzeLine(line, lineNumber) {
  stats.totalLines++;
  
  // Track line length
  stats.lineLengths.push(line.length);
  
  const trimmed = line.trim();
  
  // Skip empty lines
  if (!trimmed) {
    stats.emptyLines++;
    return;
  }
  
  // Check for book header
  const bookMatch = isBookHeader(trimmed);
  if (bookMatch) {
    stats.bookHeaders++;
    stats.booksFound.add(bookMatch);
    return;
  }
  
  // Check for chapter header
  const chapterNum = isChapterHeader(trimmed);
  if (chapterNum !== null) {
    stats.chapterHeaders++;
    return;
  }
  
  // Check for section header (title)
  if (isSectionHeader(trimmed)) {
    stats.sectionHeaders++;
    return;
  }
  
  // Check for verse start
  const verseMatch = isVerseStart(trimmed);
  if (verseMatch) {
    stats.verseLines++;
    
    // Track verse pattern
    if (trimmed.match(/^\d+\s+[A-Z]/)) {
      stats.versePatterns.startsWithNumberSpace++;
    } else if (trimmed.match(/^\d+:\d+\s+[A-Z]/)) {
      stats.versePatterns.startsWithNumberColon++;
    } else if (trimmed.match(/^\d+/)) {
      stats.versePatterns.startsWithNumber++;
    } else {
      stats.versePatterns.other++;
    }
    
    // Track verse counts by book and chapter
    if (verseMatch.book && verseMatch.chapter && verseMatch.verse) {
      const key = `${verseMatch.book}|${verseMatch.chapter}`;
      if (!stats.verseCounts[key]) {
        stats.verseCounts[key] = new Set();
      }
      stats.verseCounts[key].add(verseMatch.verse);
      
      // Sample some verses for analysis
      if (stats.sampleVerses.length < 10 && verseMatch.text) {
        stats.sampleVerses.push({
          book: verseMatch.book,
          chapter: verseMatch.chapter,
          verse: verseMatch.verse,
          text: verseMatch.text.substring(0, 50) + (verseMatch.text.length > 50 ? '...' : '')
        });
      }
    }
    
    return;
  }
  
  // Check for wrapped line (continuation of verse)
  if (isWrappedLine(trimmed)) {
    stats.wrappedLines++;
    return;
  }
  
  // If we get here, it's some other pattern
  stats.otherLines++;
  
  // Log unusual lines for analysis
  if (lineNumber <= 1000 && lineNumber % 100 === 0) {
    log(`Unusual line at ${lineNumber}: ${trimmed.substring(0, 100)}`);
  }
}

function isBookHeader(line) {
  const upperLine = line.toUpperCase().trim();
  
  // Check for book name at start of line (with or without #)
  for (const book of BOOK_NAMES) {
    if (upperLine === `#${book}` || 
        upperLine === `# ${book}` ||
        upperLine === book) {
      return book;
    }
  }
  
  return null;
}

function isChapterHeader(line) {
  // Match "Chapter 1", "CHAPTER 1", etc.
  const match = line.match(/^\s*Chapter\s+(\d+)\s*$/i);
  return match ? parseInt(match[1], 10) : null;
}

function isSectionHeader(line) {
  // Section headers are usually title case and don't start with numbers
  return /^[A-Z][a-z]/.test(line) && !/^\d/.test(line);
}

function isVerseStart(line) {
  // Match "1 Text..." or "1:1 Text..." or "1. Text..."
  const verseMatch = line.match(/^(\d+)(?::(\d+))?[\s\.](.*)/);
  
  if (verseMatch) {
    const chapter = verseMatch[2] ? parseInt(verseMatch[1], 10) : null;
    const verse = verseMatch[2] ? parseInt(verseMatch[2], 10) : parseInt(verseMatch[1], 10);
    const text = verseMatch[3].trim();
    
    // Try to determine the current book from context
    let book = null;
    if (stats.booksFound.size > 0) {
      book = Array.from(stats.booksFound).pop();
    }
    
    return { book, chapter, verse, text };
  }
  
  return null;
}

function isWrappedLine(line) {
  // Wrapped lines typically start with lowercase letters or punctuation
  return /^[a-z"'\[(]/.test(line) || /^[\u0591-\u05F4]/.test(line);
}

function generateReport() {
  const report = [];
  
  // Basic file info
  report.push('=== NASB1995 SOURCE FILE ANALYSIS ===');
  report.push(`File: ${INPUT_FILE}`);
  report.push(`Total lines: ${stats.totalLines}`);
  report.push('');
  
  // Line type counts
  report.push('=== LINE TYPE COUNTS ===');
  report.push(`Book headers: ${stats.bookHeaders}`);
  report.push(`Chapter headers: ${stats.chapterHeaders}`);
  report.push(`Section headers: ${stats.sectionHeaders}`);
  report.push(`Verse lines: ${stats.verseLines}`);
  report.push(`Wrapped lines: ${stats.wrappedLines}`);
  report.push(`Empty lines: ${stats.emptyLines}`);
  report.push(`Other lines: ${stats.otherLines}`);
  report.push('');
  
  // Verse patterns
  report.push('=== VERSE PATTERNS ===');
  report.push(`Starts with number (e.g., "1 Text"): ${stats.versePatterns.startsWithNumber}`);
  report.push(`Starts with number:verse (e.g., "1:1 Text"): ${stats.versePatterns.startsWithNumberColon}`);
  report.push(`Starts with number and space (e.g., "1 Text"): ${stats.versePatterns.startsWithNumberSpace}`);
  report.push(`Other verse patterns: ${stats.versePatterns.other}`);
  report.push('');
  
  // Books found
  report.push('=== BOOKS FOUND ===');
  report.push(`Total books: ${stats.booksFound.size}`);
  report.push(Array.from(stats.booksFound).join(', '));
  report.push('');
  
  // Line length statistics
  if (stats.lineLengths.length > 0) {
    const maxLength = Math.max(...stats.lineLengths);
    const minLength = Math.min(...stats.lineLengths);
    const avgLength = Math.round(stats.lineLengths.reduce((a, b) => a + b, 0) / stats.lineLengths.length);
    
    report.push('=== LINE LENGTH STATISTICS ===');
    report.push(`Maximum length: ${maxLength} characters`);
    report.push(`Minimum length: ${minLength} characters`);
    report.push(`Average length: ${avgLength} characters`);
    report.push('');
  }
  
  // Sample verses
  if (stats.sampleVerses.length > 0) {
    report.push('=== SAMPLE VERSES ===');
    stats.sampleVerses.forEach((v, i) => {
      report.push(`Sample ${i + 1}: ${v.book} ${v.chapter}:${v.verse} - "${v.text}"`);
    });
    report.push('');
  }
  
  // Missing books
  const missingBooks = BOOK_NAMES.filter(book => !stats.booksFound.has(book));
  if (missingBooks.length > 0) {
    report.push('=== POTENTIAL ISSUES ===');
    report.push(`Missing books (${missingBooks.length}):`);
    report.push(missingBooks.join(', '));
    report.push('');
  }
  
  // Recommendations
  report.push('=== RECOMMENDATIONS ===');
  
  if (stats.verseLines === 0) {
    report.push('WARNING: No verse lines were detected! Check the verse pattern matching.');
  } else if (stats.verseLines < 1000) {
    report.push('WARNING: Very few verse lines detected. The verse pattern matching may be too strict.');
  }
  
  if (stats.wrappedLines > 0) {
    report.push(`- The file contains ${stats.wrappedLines} wrapped lines that need to be properly joined with their verses.`);
  }
  
  if (missingBooks.length > 0) {
    report.push(`- ${missingBooks.length} expected books were not found in the file.`);
  }
  
  if (stats.otherLines > 0) {
    report.push(`- There are ${stats.otherLines} lines that don't match any expected pattern.`);
  }
  
  report.push('\n=== NEXT STEPS ===');
  report.push('1. Review the verse pattern matching to ensure it captures all verses');
  report.push('2. Implement logic to handle wrapped lines properly');
  report.push('3. Check for any encoding or line ending issues');
  report.push('4. Verify the book and chapter detection logic');
  
  return report.join('\n');
}

async function analyzeSourceFile() {
  log('Starting analysis of NASB1995 source file...');
  
  try {
    // Read the file line by line
    const fileStream = fs.createReadStream(INPUT_FILE, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    let lineNumber = 0;
    
    // Process each line
    for await (const line of rl) {
      lineNumber++;
      analyzeLine(line, lineNumber);
      
      // Log progress
      if (lineNumber % 1000 === 0) {
        log(`Processed ${lineNumber} lines...`);
      }
      
      // For testing, limit the number of lines processed
      // if (lineNumber >= 10000) break;
    }
    
    // Generate and save the report
    const report = generateReport();
    fs.writeFileSync(OUTPUT_FILE, report);
    
    log(`Analysis complete! Report saved to: ${OUTPUT_FILE}`);
    log('Summary of findings:');
    log(`- Total lines: ${stats.totalLines}`);
    log(`- Verse lines: ${stats.verseLines}`);
    log(`- Wrapped lines: ${stats.wrappedLines}`);
    log(`- Books found: ${stats.booksFound.size} of ${BOOK_NAMES.length}`);
    
  } catch (error) {
    log('Error during analysis:', error.message);
    throw error;
  } finally {
    logStream.end();
  }
}

// Run the analysis
analyzeSourceFile().catch(error => {
  console.error('Fatal error during analysis:', error);
  process.exit(1);
});
