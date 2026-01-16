import fs from 'fs';

const filePath = 'scripts/NASB1995-cleaned.txt';
const SAMPLE_SIZE = 50; // Number of lines to sample for each pattern

async function analyzePatterns() {
  console.log('Analyzing file content patterns...\n');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    console.log(`Total non-empty lines: ${lines.length}`);
    
    // Analyze line patterns
    const patterns = {
      book: { pattern: /^[A-Z][a-zA-Z\s]+$/, count: 0, samples: [] },
      chapter: { pattern: /^Chapter\s+\d+/i, count: 0, samples: [] },
      verse: { pattern: /^\d+:\d+/, count: 0, samples: [] },
      heading: { pattern: /^#+\s+/, count: 0, samples: [] },
      other: { count: 0, samples: [] }
    };
    
    // Classify each line
    for (const line of lines) {
      let matched = false;
      
      for (const [type, data] of Object.entries(patterns)) {
        if (type === 'other') continue;
        
        if (data.pattern.test(line)) {
          data.count++;
          if (data.samples.length < SAMPLE_SIZE) {
            data.samples.push(line);
          }
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        patterns.other.count++;
        if (patterns.other.samples.length < SAMPLE_SIZE) {
          patterns.other.samples.push(line);
        }
      }
    }
    
    // Print pattern analysis
    console.log('\n=== Pattern Analysis ===');
    for (const [type, data] of Object.entries(patterns)) {
      console.log(`\n${type.toUpperCase()} (${data.count} lines, ${(data.count / lines.length * 100).toFixed(1)}%):`);
      if (data.pattern) {
        console.log(`  Pattern: ${data.pattern}`);
      }
      console.log('  Samples:');
      data.samples.slice(0, 5).forEach((sample, i) => console.log(`    ${i + 1}. ${sample.substring(0, 80)}${sample.length > 80 ? '...' : ''}`));
      if (data.samples.length > 5) {
        console.log(`    ... and ${data.samples.length - 5} more`);
      }
    }
    
    // Look for book names
    console.log('\n=== Potential Book Names ===');
    const potentialBooks = [];
    const bookPattern = /^(?:##\s*)?([A-Z][a-zA-Z\s]+)(?:\s+\d+)?$/;
    
    for (const line of lines) {
      const match = line.match(bookPattern);
      if (match && match[1].length > 3 && !/Chapter/i.test(match[1])) {
        const bookName = match[1].trim();
        if (!potentialBooks.includes(bookName)) {
          potentialBooks.push(bookName);
          if (potentialBooks.length >= 20) break;
        }
      }
    }
    
    console.log('First 20 potential book names:');
    potentialBooks.forEach((book, i) => console.log(`  ${i + 1}. ${book}`));
    
    // Look for chapter patterns
    console.log('\n=== Chapter Patterns ===');
    const chapterPatterns = new Set();
    
    for (const line of lines) {
      if (line.match(/chapter/i)) {
        chapterPatterns.add(line.split(' ')[0]);
        if (chapterPatterns.size >= 5) break;
      }
    }
    
    console.log('Chapter patterns found:');
    console.log(Array.from(chapterPatterns).map(p => `  - ${p}`).join('\n'));
    
    // Look for verse patterns
    console.log('\n=== Verse Patterns ===');
    const versePatterns = new Set();
    
    for (const line of lines) {
      const verseMatch = line.match(/^(\d+:\d+)/);
      if (verseMatch) {
        versePatterns.add(line.substring(0, 20) + (line.length > 20 ? '...' : ''));
        if (versePatterns.size >= 5) break;
      }
    }
    
    console.log('Verse patterns found:');
    console.log(Array.from(versePatterns).map(v => `  - ${v}`).join('\n'));
    
  } catch (error) {
    console.error('Error analyzing file:', error);
  }
}

analyzePatterns();
