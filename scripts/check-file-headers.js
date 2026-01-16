import fs from 'fs';

const filePath = 'scripts/NASB1995-cleaned.txt';
const MAX_LINES = 50; // Only check first 50 lines for headers

function checkFileHeaders() {
  console.log('Checking file headers...\n');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, MAX_LINES);
    
    console.log(`First ${lines.length} lines of the file:`);
    console.log('----------------------------------------');
    
    // Print first few lines with line numbers
    lines.forEach((line, index) => {
      console.log(`${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    });
    
    // Check for common patterns
    console.log('\nCommon patterns in first 50 lines:');
    const patterns = {
      book: { regex: /^[A-Z][a-zA-Z\s]+$/, count: 0, examples: [] },
      chapter: { regex: /^Chapter\s+\d+/i, count: 0, examples: [] },
      verse: { regex: /^\d+:\d+/, count: 0, examples: [] },
      markdown: { regex: /^#+\s+/, count: 0, examples: [] },
      empty: { regex: /^\s*$/, count: 0, examples: [] }
    };
    
    lines.forEach(line => {
      for (const [type, data] of Object.entries(patterns)) {
        if (data.regex.test(line)) {
          data.count++;
          if (data.examples.length < 3) {
            data.examples.push(line.substring(0, 60) + (line.length > 60 ? '...' : ''));
          }
          break;
        }
      }
    });
    
    // Print pattern counts
    console.log('\nPattern counts:');
    for (const [type, data] of Object.entries(patterns)) {
      console.log(`- ${type.padEnd(10)}: ${data.count} (${(data.count / lines.length * 100).toFixed(1)}%)`);
      if (data.examples.length > 0) {
        console.log('  Examples:');
        data.examples.forEach(ex => console.log(`    - ${ex}`));
      }
    }
    
    // Look for potential book names
    console.log('\nPotential book names in file:');
    const potentialBooks = new Set();
    const bookPattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+\d+)?$/;
    
    lines.forEach(line => {
      if (bookPattern.test(line) && line.length > 3 && !/Chapter/i.test(line)) {
        potentialBooks.add(line);
      }
    });
    
    if (potentialBooks.size > 0) {
      console.log(Array.from(potentialBooks).join('\n'));
    } else {
      console.log('No potential book names found in first 50 lines.');
    }
    
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

checkFileHeaders();
