const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'BibleVersePopup.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Simple regex to find all verse references
const verseRefs = [];
const refRegex = /'([^']+)':/g;
let match;

while ((match = refRegex.exec(content)) !== null) {
  verseRefs.push(match[1]);
}

// Find duplicates
const duplicates = [];
const seen = new Set();

verseRefs.forEach(ref => {
  if (seen.has(ref)) {
    duplicates.push(ref);
  } else {
    seen.add(ref);
  }
});

console.log('Duplicate verse references found:');
console.log(Array.from(new Set(duplicates)).join('\n'));
console.log(`\nTotal unique duplicates: ${new Set(duplicates).size}`);
