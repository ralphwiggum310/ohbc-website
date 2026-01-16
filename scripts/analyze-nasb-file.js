import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const txtPath = path.join(__dirname, 'NASB1995.txt');

async function analyzeFile() {
  console.log('Analyzing NASB1995.txt file...');
  
  try {
    // Read the file
    const content = await readFile(txtPath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    console.log(`Total lines: ${lines.length}`);
    
    // Count lines by type
    let bookLines = 0;
    let chapterLines = 0;
    let verseLines = 0;
    let otherLines = 0;
    
    // Sample data
    const sampleSize = 10;
    const bookSamples = [];
    const chapterSamples = [];
    const verseSamples = [];
    
    // Analyze each line
    for (const line of lines) {
      if (line === line.toUpperCase() && line.length > 2 && !/^\d/.test(line)) {
        // Likely a book name
        bookLines++;
        if (bookSamples.length < sampleSize) bookSamples.push(line);
      } else if (/^Chapter\s+\d+/i.test(line)) {
        // Likely a chapter header
        chapterLines++;
        if (chapterSamples.length < sampleSize) chapterSamples.push(line);
      } else if (/^\d+:\d+\s+/.test(line)) {
        // Likely a verse
        verseLines++;
        if (verseSamples.length < sampleSize) verseSamples.push(line.substring(0, 100) + (line.length > 100 ? '...' : ''));
      } else {
        otherLines++;
      }
    }
    
    // Print summary
    console.log('\nLine Type Summary:');
    console.log('-----------------');
    console.log(`Book headers:   ${bookLines}`);
    console.log(`Chapter headers: ${chapterLines}`);
    console.log(`Verse lines:    ${verseLines}`);
    console.log(`Other lines:    ${otherLines}`);
    
    // Print samples
    console.log('\nSample Book Headers:');
    bookSamples.forEach((sample, i) => console.log(`  ${i + 1}. ${sample}`));
    
    console.log('\nSample Chapter Headers:');
    chapterSamples.forEach((sample, i) => console.log(`  ${i + 1}. ${sample}`));
    
    console.log('\nSample Verse Lines:');
    verseSamples.forEach((sample, i) => console.log(`  ${i + 1}. ${sample}`));
    
    // Check for common verse patterns
    console.log('\nChecking for verse patterns...');
    const versePatterns = {};
    
    for (const line of lines) {
      // Look for verse references like "1:1", "1:2-3", etc.
      const verseRefMatch = line.match(/^(\d+):(\d+)(?:-(\d+))?/);
      if (verseRefMatch) {
        const chapter = verseRefMatch[1];
        const verseStart = verseRefMatch[2];
        const verseEnd = verseRefMatch[3] || verseStart;
        
        const range = `${chapter}:${verseStart}${verseEnd !== verseStart ? `-${verseEnd}` : ''}`;
        versePatterns[range] = (versePatterns[range] || 0) + 1;
      }
    }
    
    console.log('\nCommon verse reference patterns:');
    Object.entries(versePatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([pattern, count]) => console.log(`  ${pattern.padEnd(10)}: ${count} occurrences`));
    
    // Check for potential verse content without references
    console.log('\nChecking for potential verse content without references...');
    const potentialVerses = [];
    
    for (let i = 0; i < Math.min(1000, lines.length); i++) {
      const line = lines[i];
      if (!/^\d+:\d+\s+/.test(line) && // Doesn't start with verse ref
          line.length > 20 && line.length < 200 && // Reasonable length for a verse
          !/^Chapter\s+\d+/i.test(line) && // Not a chapter header
          line !== line.toUpperCase()) { // Not all caps (like book names)
        
        // Check if previous line was a verse reference
        if (i > 0 && /^\d+:\d+\s+/.test(lines[i-1])) {
          potentialVerses.push(`  ${i+1}. ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          if (potentialVerses.length >= 5) break;
        }
      }
    }
    
    if (potentialVerses.length > 0) {
      console.log('Found potential verse continuations (verse text on its own line):');
      potentialVerses.forEach(line => console.log(line));
    } else {
      console.log('No obvious verse continuations found in first 1000 lines.');
    }
    
  } catch (error) {
    console.error('Error analyzing file:', error);
  }
}

// Run the analysis
analyzeFile().catch(console.error);
