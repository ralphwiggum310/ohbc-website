const fs = require('fs');
const path = require('path');

// Path to the BibleVersePopup.tsx file
const filePath = path.join(__dirname, '..', 'src', 'components', 'BibleVersePopup.tsx');

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Extract the VERSE_TEXTS object
const verseTextsMatch = content.match(/const VERSE_TEXTS: Record<string, string> = ({[\s\S]*?});/);
if (!verseTextsMatch) {
  console.error('Could not find VERSE_TEXTS object in the file');
  process.exit(1);
}

const verseTextsStr = verseTextsMatch[1];

// Parse the object to find duplicates
const verseMap = new Map();
const duplicateRefs = new Set();

// Extract all verse references and their content
const verseRegex = /'([^']+)':\s*'([^']*?(?:\\'[^']*?)*?)'(?:,|$)/g;
let match;

while ((match = verseRegex.exec(verseTextsStr)) !== null) {
  const ref = match[1];
  const text = match[2];
  
  if (verseMap.has(ref)) {
    console.log(`Duplicate found: ${ref}`);
    duplicateRefs.add(ref);
    // Keep the longer version of the text
    if (text.length > (verseMap.get(ref).text || '').length) {
      verseMap.set(ref, { text, match });
    }
  } else {
    verseMap.set(ref, { text, match });
  }
}

console.log(`\nFound ${duplicateRefs.size} duplicate verse references`);

if (duplicateRefs.size > 0) {
  console.log('\nDuplicate references:');
  console.log(Array.from(duplicateRefs).join('\n'));
  
  // Create a new version of the content with duplicates removed
  let newContent = content;
  
  // Process each duplicate
  for (const ref of duplicateRefs) {
    const { match } = verseMap.get(ref);
    // Remove all but the last occurrence of this reference
    const regex = new RegExp(`'${ref}':\s*'[^']*?'(?:,|\s*\/\*.*?\*\/\s*)?\s*\n`, 'g');
    newContent = newContent.replace(regex, '');
  }
  
  // Write the cleaned content back to the file
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('\nDuplicates have been removed from the file.');
} else {
  console.log('No duplicate verse references found.');
}
