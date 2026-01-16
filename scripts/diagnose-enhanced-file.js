import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const enhancedFilePath = path.join(__dirname, 'NASB1995-enhanced.txt');

async function diagnoseFile() {
  console.log('Diagnosing enhanced NASB1995 file...');
  
  try {
    // Read the file
    const content = await readFile(enhancedFilePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    console.log(`Total lines: ${lines.length}`);
    
    // Track different line types
    const lineTypes = {
      book: 0,
      chapter: 0,
      verse: 0,
      other: 0
    };
    
    // Sample data
    const samples = {
      book: [],
      chapter: [],
      verse: [],
      other: []
    };
    
    // Analyze each line
    for (const line of lines) {
      if (line.startsWith('# ')) {
        lineTypes.book++;
        if (samples.book.length < 3) samples.book.push(line);
      } else if (line.startsWith('## ')) {
        lineTypes.chapter++;
        if (samples.chapter.length < 3) samples.chapter.push(line);
      } else if (/^\d+:\d+\s+/.test(line)) {
        lineTypes.verse++;
        if (samples.verse.length < 3) samples.verse.push(line.substring(0, 100) + (line.length > 100 ? '...' : ''));
      } else {
        lineTypes.other++;
        if (samples.other.length < 3) samples.other.push(line);
      }
    }
    
    // Print summary
    console.log('\nLine Type Summary:');
    console.log('-----------------');
    for (const [type, count] of Object.entries(lineTypes)) {
      console.log(`${type.padEnd(10)}: ${count}`);
    }
    
    // Print samples
    console.log('\nSample Book Headers:');
    samples.book.forEach((sample, i) => console.log(`  ${i + 1}. ${sample}`));
    
    console.log('\nSample Chapter Headers:');
    samples.chapter.forEach((sample, i) => console.log(`  ${i + 1}. ${sample}`));
    
    console.log('\nSample Verse Lines:');
    samples.verse.forEach((sample, i) => console.log(`  ${i + 1}. ${sample}`));
    
    if (samples.other.length > 0) {
      console.log('\nSample Other Lines:');
      samples.other.forEach((sample, i) => console.log(`  ${i + 1}. ${sample}`));
    }
    
    // Check first 50 lines for potential issues
    console.log('\nFirst 50 lines of file:');
    console.log('----------------------');
    lines.slice(0, 50).forEach((line, i) => {
      console.log(`${(i + 1).toString().padStart(3)}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    });
    
  } catch (error) {
    console.error('Error diagnosing file:', error);
  }
}

// Run the diagnosis
diagnoseFile().catch(console.error);
