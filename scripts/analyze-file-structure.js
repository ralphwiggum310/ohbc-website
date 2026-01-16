// Diagnostic script to analyze the structure of the NASB1995 file
import { readFileSync } from 'fs';

const filePath = 'scripts/NASB1995-formatted.txt';
const SAMPLE_SIZE = 20; // Number of lines to sample for each pattern

// Patterns to look for
const PATTERNS = {
  book: /^#\s+[A-Za-z0-9\s]+$/,         // # BOOK NAME
  chapter: /^##\s+Chapter\s+\d+/i,       // ## Chapter X
  verse: /^###\s*\d+:\d+/,              // ### X:Y
  verseRef: /^\d+:\d+/,                  // X:Y (at start of line)
  other: /^/                             // Catch-all for other lines
};

function analyzeFile() {
  console.log(`Analyzing file structure of ${filePath}...\n`);
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`Total lines: ${lines.length}\n`);
    
    // Track matches for each pattern
    const matches = {
      book: { count: 0, samples: [] },
      chapter: { count: 0, samples: [] },
      verse: { count: 0, samples: [] },
      verseRef: { count: 0, samples: [] },
      other: { count: 0, samples: [] }
    };
    
    // First pass: count and sample patterns
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      let matched = false;
      
      for (const [type, pattern] of Object.entries(PATTERNS)) {
        if (pattern.test(trimmed)) {
          matches[type].count++;
          if (matches[type].samples.length < SAMPLE_SIZE) {
            matches[type].samples.push(trimmed);
          }
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        matches.other.count++;
        if (matches.other.samples.length < SAMPLE_SIZE) {
          matches.other.samples.push(trimmed);
        }
      }
    }
    
    // Print pattern analysis
    console.log('=== Pattern Analysis ===\n');
    for (const [type, data] of Object.entries(matches)) {
      if (data.count === 0) continue;
      
      console.log(`"${type}" pattern: ${data.count} matches (${((data.count / lines.length) * 100).toFixed(1)}%)`);
      console.log('  Samples:');
      data.samples.forEach((sample, i) => {
        console.log(`    ${i + 1}. ${sample.substring(0, 80)}${sample.length > 80 ? '...' : ''}`);
      });
      if (data.samples.length < data.count) {
        console.log(`    ... and ${data.count - data.samples.length} more`);
      }
      console.log();
    }
    
    // Look for potential book names
    console.log('=== Potential Book Names ===\n');
    const potentialBooks = new Set();
    
    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^#\s*([A-Z][A-Za-z0-9\s]+)$/);
      if (match) {
        const bookName = match[1].trim();
        potentialBooks.add(bookName);
        if (potentialBooks.size >= 10) break; // Limit to first 10
      }
    }
    
    if (potentialBooks.size > 0) {
      console.log('Found potential book names:');
      console.log(Array.from(potentialBooks).map(b => `- ${b}`).join('\n'));
    } else {
      console.log('No potential book names found using standard pattern.');
    }
    
    // Look for potential chapter headers
    console.log('\n=== Potential Chapter Headers ===\n');
    const potentialChapters = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/chapter/i)) {
        potentialChapters.push(trimmed);
        if (potentialChapters.length >= 5) break; // Limit to first 5
      }
    }
    
    if (potentialChapters.length > 0) {
      console.log('Found potential chapter headers:');
      potentialChapters.forEach((chap, i) => console.log(`${i + 1}. ${chap}`));
    } else {
      console.log('No chapter headers found using standard pattern.');
    }
    
    // Look for potential verse references
    console.log('\n=== Potential Verse References ===\n');
    const potentialVerses = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+:\d+/)) {
        potentialVerses.push(trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : ''));
        if (potentialVerses.length >= 5) break; // Limit to first 5
      }
    }
    
    if (potentialVerses.length > 0) {
      console.log('Found potential verse references:');
      potentialVerses.forEach((verse, i) => console.log(`${i + 1}. ${verse}`));
    } else {
      console.log('No verse references found at start of lines.');
      
      // Try to find verse references elsewhere in lines
      console.log('\nLooking for verse references within lines...');
      const verseRefs = [];
      
      for (const line of lines) {
        const match = line.match(/\b\d+:\d+\b/);
        if (match) {
          const context = line.substring(Math.max(0, match.index - 20), match.index + 30);
          verseRefs.push(`...${context}...`);
          if (verseRefs.length >= 5) break;
        }
      }
      
      if (verseRefs.length > 0) {
        console.log('Found verse references within lines:');
        verseRefs.forEach((ref, i) => console.log(`${i + 1}. ${ref}`));
      } else {
        console.log('No verse references found within lines either.');
      }
    }
    
    // Print first and last few lines for context
    console.log('\n=== File Samples ===\n');
    console.log('First 5 lines:');
    console.log('--------------');
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
    
    console.log('\nLast 5 lines:');
    console.log('------------');
    const start = Math.max(0, lines.length - 5);
    for (let i = start; i < lines.length; i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
    
  } catch (error) {
    console.error('Error analyzing file:', error);
    process.exit(1);
  }
}

analyzeFile();
