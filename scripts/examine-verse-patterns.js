import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'verse-patterns.txt');

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

// Track patterns
const patterns = {
  verseStarts: {},
  lineStarts: {},
  bookHeaders: [],
  chapterHeaders: [],
  sectionHeaders: [],
  sampleLines: []
};

// Track current book and chapter
let currentBook = null;
let currentChapter = null;

// Track line numbers for samples
let lineNumber = 0;

// Function to add a pattern to our tracking
function trackPattern(type, value, line) {
  // Convert value to string to handle cases where it's a number
  const valueStr = String(value);
  
  if (!patterns[type][valueStr]) {
    patterns[type][valueStr] = 0;
  }
  patterns[type][valueStr]++;
  
  // Keep a sample of lines for each pattern
  if (patterns.sampleLines.length < 10) {
    patterns.sampleLines.push({
      type,
      value: valueStr.substring(0, 100),
      line: lineNumber,
      content: line ? line.substring(0, 150).trim() : ''
    });
  }
}

// Function to analyze a line
function analyzeLine(line) {
  lineNumber++;
  const trimmed = line.trim();
  
  // Skip empty lines
  if (!trimmed) {
    trackPattern('lineStarts', 'EMPTY', line);
    return;
  }
  
  // Check for book header
  const bookMatch = isBookHeader(trimmed);
  if (bookMatch) {
    currentBook = bookMatch;
    trackPattern('bookHeaders', bookMatch, line);
    return;
  }
  
  // Check for chapter header
  const chapterNum = isChapterHeader(trimmed);
  if (chapterNum !== null) {
    currentChapter = chapterNum;
    trackPattern('chapterHeaders', `Chapter ${chapterNum}`, line);
    return;
  }
  
  // Check for section header
  if (isSectionHeader(trimmed)) {
    trackPattern('sectionHeaders', trimmed.substring(0, 50), line);
    return;
  }
  
  // Check for verse start
  const verseMatch = isVerseStart(trimmed);
  if (verseMatch) {
    const pattern = getVersePattern(trimmed);
    trackPattern('verseStarts', pattern, line);
    return;
  }
  
  // Check for wrapped line
  if (isWrappedLine(trimmed)) {
    trackPattern('lineStarts', 'WRAPPED', line);
    return;
  }
  
  // If we get here, it's some other pattern
  const first10 = trimmed.substring(0, 10);
  trackPattern('lineStarts', `OTHER:${first10}`, line);
}

function isBookHeader(line) {
  const upperLine = line.toUpperCase().trim();
  return BOOK_NAMES.some(book => 
    upperLine === `#${book}` || 
    upperLine === `# ${book}` ||
    upperLine === book
  );
}

function isChapterHeader(line) {
  return /^\s*Chapter\s+\d+\s*$/i.test(line);
}

function isSectionHeader(line) {
  return /^[A-Z][a-z]/.test(line) && !/^\d/.test(line);
}

function isVerseStart(line) {
  return /^\d+[\s\.:]/.test(line);
}

function isWrappedLine(line) {
  return /^[a-z"'\[(]/.test(line) || /^[\u0591-\u05F4]/.test(line);
}

function getVersePattern(line) {
  // Try to extract the verse number pattern
  const match = line.match(/^(\d+)([\s\.:].*)/);
  if (!match) return 'UNKNOWN';
  
  const num = match[1];
  const sep = match[2].substring(0, 1);
  
  if (sep === ':') {
    // Check if this is a chapter:verse pattern
    const verseMatch = line.match(/^(\d+):(\d+)/);
    return verseMatch ? `CHAP:VERSE (${verseMatch[1]}:${verseMatch[2]})` : 'NUM:VERSE';
  } else if (sep === '.') {
    return 'NUM.TEXT';
  } else if (/\s/.test(sep)) {
    return 'NUM TEXT';
  }
  
  return `NUM${sep}TEXT`;
}

function generateReport() {
  const report = [];
  
  // Basic file info
  report.push('=== VERSE PATTERN ANALYSIS ===');
  report.push(`File: ${INPUT_FILE}`);
  report.push(`Total lines processed: ${lineNumber}`);
  report.push('');
  
  // Book headers
  report.push('=== BOOK HEADERS ===');
  report.push(`Found: ${patterns.bookHeaders.length} book headers`);
  report.push('Sample:');
  patterns.bookHeaders.slice(0, 5).forEach(book => {
    report.push(`- ${book}`);
  });
  report.push('');
  
  // Chapter headers
  report.push('=== CHAPTER HEADERS ===');
  report.push(`Found: ${patterns.chapterHeaders.length} chapter headers`);
  report.push('Sample:');
  patterns.chapterHeaders.slice(0, 5).forEach(chapter => {
    report.push(`- ${chapter}`);
  });
  report.push('');
  
  // Section headers
  report.push('=== SECTION HEADERS ===');
  report.push(`Found: ${patterns.sectionHeaders.length} section headers`);
  report.push('Sample:');
  patterns.sectionHeaders.slice(0, 5).forEach(section => {
    report.push(`- ${section}`);
  });
  report.push('');
  
  // Verse start patterns
  report.push('=== VERSE START PATTERNS ===');
  report.push(`Found ${Object.keys(patterns.verseStarts).length} unique verse start patterns`);
  report.push('Most common patterns:');
  
  const sortedPatterns = Object.entries(patterns.verseStarts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  sortedPatterns.forEach(([pattern, count]) => {
    report.push(`- ${pattern}: ${count} occurrences`);
  });
  report.push('');
  
  // Line start patterns
  report.push('=== LINE START PATTERNS ===');
  report.push(`Found ${Object.keys(patterns.lineStarts).length} unique line start patterns`);
  report.push('Most common patterns:');
  
  const sortedLineStarts = Object.entries(patterns.lineStarts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  sortedLineStarts.forEach(([pattern, count]) => {
    report.push(`- ${pattern}: ${count} occurrences`);
  });
  report.push('');
  
  // Sample lines
  report.push('=== SAMPLE LINES ===');
  patterns.sampleLines.forEach((sample, i) => {
    report.push(`Sample ${i + 1} (${sample.type} at line ${sample.line}):`);
    report.push(`  Pattern: ${sample.value}`);
    report.push(`  Content: ${sample.content}`);
    report.push('');
  });
  
  // Recommendations
  report.push('=== RECOMMENDATIONS ===');
  report.push('1. Update the verse detection to handle the most common patterns:');
  sortedPatterns.slice(0, 3).forEach(([pattern], i) => {
    report.push(`   ${i + 1}. ${pattern}`);
  });
  
  report.push('\n2. Check for wrapped lines that might be part of verses');
  report.push('3. Verify book and chapter detection is working correctly');
  
  return report.join('\n');
}

async function analyzeFile() {
  console.log('Analyzing verse patterns in NASB1995.txt...');
  
  try {
    // Read the file line by line
    const fileStream = fs.createReadStream(INPUT_FILE, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    // Process each line
    for await (const line of rl) {
      analyzeLine(line);
      
      // For testing, limit the number of lines processed
      // if (lineNumber >= 10000) break;
    }
    
    // Generate and save the report
    const report = generateReport();
    fs.writeFileSync(OUTPUT_FILE, report);
    
    console.log(`Analysis complete! Report saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error during analysis:', error);
    throw error;
  }
}

// Run the analysis
analyzeFile().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
