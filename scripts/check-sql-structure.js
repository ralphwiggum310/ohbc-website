import { createReadStream } from 'fs';
import { createInterface } from 'readline';

// Path to the SQL file
const sqlFilePath = 'C:\\WindSurf\\ohbc_website\\data\\bible\\NASB1995_bible.sql';

// Create a read stream for the SQL file
const fileStream = createReadStream(sqlFilePath, { 
  encoding: 'utf8',
  autoClose: true
});

// Create a readline interface
const rl = createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

console.log('Reading first 10 lines of the SQL file:');
console.log('--------------------------------------');

let lineCount = 0;

// Process each line
rl.on('line', (line) => {
  if (lineCount < 10) {
    console.log(`${lineCount + 1}. ${line}`);
    lineCount++;
  } else {
    rl.close();
  }
});

// Handle errors
rl.on('error', (error) => {
  console.error('Error reading SQL file:', error);
});

// When done
rl.on('close', () => {
  console.log('--------------------------------------');
  console.log('Finished reading first 10 lines.');
});
