const fs = require('fs');

const filePath = 'scripts/NASB1995-cleaned.txt';
const LINES_TO_SHOW = 50;

console.log(`First ${LINES_TO_SHOW} lines of ${filePath}:\n`);
console.log('-' + '-'.repeat(80));

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < Math.min(LINES_TO_SHOW, lines.length); i++) {
    const line = lines[i];
    console.log(`${(i + 1).toString().padStart(4)}: ${line}`);
  }
  
  console.log('\n...
');
  
  // Show last 10 lines if file is larger than LINES_TO_SHOW
  if (lines.length > LINES_TO_SHOW) {
    const start = Math.max(0, lines.length - 10);
    console.log(`Last ${lines.length - start} lines:`);
    console.log('-' + '-'.repeat(80));
    
    for (let i = start; i < lines.length; i++) {
      const line = lines[i];
      console.log(`${(i + 1).toString().padStart(4)}: ${line}`);
    }
  }
  
  console.log('\nFile length:', lines.length, 'lines');
  
} catch (error) {
  console.error('Error reading file:', error);
}
