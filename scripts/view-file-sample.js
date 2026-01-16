import fs from 'fs';

const filePath = 'scripts/NASB1995-cleaned.txt';
const LINES_TO_SHOW = 30; // Number of lines to display

function viewFileSample() {
  console.log(`Showing first ${LINES_TO_SHOW} lines of ${filePath}:\n`);
  console.log('--------------------------------------------------');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Display the first few lines with line numbers
    for (let i = 0; i < Math.min(LINES_TO_SHOW, lines.length); i++) {
      const line = lines[i];
      console.log(`${(i + 1).toString().padStart(4)}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    }
    
    // If file has more lines, show a sample from the middle and end
    if (lines.length > LINES_TO_SHOW * 2) {
      const midPoint = Math.floor(lines.length / 2);
      console.log('\n...
');
      console.log(`Sample from middle of file (around line ${midPoint}):\n`);
      
      for (let i = midPoint; i < midPoint + 10 && i < lines.length; i++) {
        const line = lines[i];
        console.log(`${(i + 1).toString().padStart(4)}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
      }
      
      console.log('\n...
');
      console.log('End of file sample:\n');
      
      const endStart = Math.max(0, lines.length - 10);
      for (let i = endStart; i < lines.length; i++) {
        const line = lines[i];
        console.log(`${(i + 1).toString().padStart(4)}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
      }
    }
    
    console.log('\n--------------------------------------------------');
    console.log(`Total lines in file: ${lines.length}`);
    
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

viewFileSample();
