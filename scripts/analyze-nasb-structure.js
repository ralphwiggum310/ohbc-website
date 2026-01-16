import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, 'NASB1995.txt');
const OUTPUT_FILE = path.join(__dirname, 'nasb-structure-analysis.txt');

// Track different line patterns
const patterns = {
  bookHeader: 0,      // # BOOK_NAME
  chapterHeader: 0,   // Chapter X
  sectionHeader: 0,   // The Creation
  verse: 0,           // 1 In the beginning...
  wrappedLine: 0,     // Continuation of a verse
  emptyLine: 0,       // Empty line
  other: 0            // Any other pattern
};

// Track line lengths
const lineLengths = [];

// Track first 20 lines for analysis
const sampleLines = [];

// Track verse patterns
const versePatterns = {
  startsWithNumber: 0,
  startsWithNumberColon: 0,
  startsWithNumberSpace: 0,
  other: 0
};

function analyzeLine(line, lineNumber) {
  const trimmed = line.trim();
  
  // Collect sample lines
  if (lineNumber <= 20) {
    sampleLines.push({
      lineNumber,
      content: trimmed,
      length: line.length
    });
  }
  
  // Track line length
  lineLengths.push(line.length);
  
  // Check for empty line
  if (!trimmed) {
    patterns.emptyLine++;
    return;
  }
  
  // Check for book header
  if (trimmed.startsWith('#')) {
    patterns.bookHeader++;
    return;
  }
  
  // Check for chapter header
  if (/^Chapter\s+\d+/i.test(trimmed)) {
    patterns.chapterHeader++;
    return;
  }
  
  // Check for section header (title)
  if (/^[A-Z][a-z]/.test(trimmed) && !/^\d/.test(trimmed)) {
    patterns.sectionHeader++;
    return;
  }
  
  // Check for verse
  if (/^\d+\s+[A-Z]/.test(trimmed)) {
    patterns.verse++;
    versePatterns.startsWithNumberSpace++;
    return;
  }
  
  // Check for verse with chapter:verse format
  if (/^\d+:\d+\s+[A-Z]/.test(trimmed)) {
    patterns.verse++;
    versePatterns.startsWithNumberColon++;
    return;
  }
  
  // Check for verse starting with number
  if (/^\d+/.test(trimmed)) {
    patterns.verse++;
    versePatterns.startsWithNumber++;
    return;
  }
  
  // Check for wrapped line (continuation of verse)
  if (/^[a-z]/.test(trimmed) || /^[\u0591-\u05F4]/.test(trimmed)) {
    patterns.wrappedLine++;
    return;
  }
  
  // If we get here, it's some other pattern
  patterns.other++;
}

async function analyzeFile() {
  console.log(`Analyzing file: ${INPUT_FILE}`);
  
  try {
    // Read the file
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const lines = content.split('\n');
    
    console.log(`Total lines: ${lines.length}`);
    
    // Analyze each line
    lines.forEach((line, index) => {
      analyzeLine(line, index + 1);
    });
    
    // Calculate line length statistics
    const stats = {
      totalLines: lines.length,
      maxLength: Math.max(...lineLengths),
      minLength: Math.min(...lineLengths),
      avgLength: Math.round(lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length)
    };
    
    // Prepare the report
    const report = [
      '=== NASB1995 TEXT STRUCTURE ANALYSIS ===',
      `File: ${INPUT_FILE}`,
      `Total lines: ${lines.length}`,
      '',
      '=== LINE TYPE COUNTS ===',
      ...Object.entries(patterns).map(([type, count]) => `${type.padEnd(15)}: ${count}`),
      '',
      '=== VERSE PATTERNS ===',
      ...Object.entries(versePatterns).map(([type, count]) => `${type.padEnd(25)}: ${count}`),
      '',
      '=== LINE LENGTH STATISTICS ===',
      `Maximum length: ${stats.maxLength} characters`,
      `Minimum length: ${stats.minLength} characters`,
      `Average length: ${stats.avgLength} characters`,
      '',
      '=== SAMPLE LINES (first 20) ===',
      ...sampleLines.map(l => `${l.lineNumber.toString().padStart(4)}: [${l.length.toString().padStart(3)}] ${l.content}`),
      '',
      '=== SAMPLE VERSE LINES ===',
      ...lines
        .filter(line => /^\d+\s+[A-Z]/.test(line.trim()))
        .slice(0, 10)
        .map((line, i) => `Sample ${i + 1}: ${line.trim()}`),
      '',
      '=== SAMPLE WRAPPED LINES ===',
      ...lines
        .filter(line => /^[a-z]/.test(line.trim()))
        .slice(0, 5)
        .map((line, i) => `Sample ${i + 1}: ${line.trim()}`),
      '',
      '=== SAMPLE OTHER LINES ===',
      ...lines
        .filter(line => !/^\s*$/.test(line) && 
                       !line.trim().startsWith('#') && 
                       !/^Chapter\s+\d+/i.test(line.trim()) &&
                       !/^\d+\s+[A-Z]/.test(line.trim()) &&
                       !/^[a-z]/.test(line.trim()))
        .slice(0, 10)
        .map((line, i) => `Sample ${i + 1}: ${line.trim()}`)
    ];
    
    // Write the report to file
    fs.writeFileSync(OUTPUT_FILE, report.join('\n'));
    
    console.log(`Analysis complete. Results written to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error analyzing file:', error);
  }
}

// Run the analysis
analyzeFile().catch(console.error);
