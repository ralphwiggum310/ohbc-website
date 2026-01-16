const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'BibleVersePopup.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// List of duplicate references we found
const duplicates = [
  '2 Timothy 3:16-17',
  '2 Corinthians 6:14-18',
  'Ephesians 4:1-6',
  'Luke 1:35',
  'Ephesians 1:7',
  'Hebrews 2:9',
  'Romans 12:1-2',
  'Romans 15:13-14',
  '1 Corinthians 11:3',
  '1 Timothy 2:9-15',
  '2 Timothy 4:1-5',
  'Acts 17:17',
  'Acts 18:4',
  'Acts 19:8-9',
  '1 Corinthians 13:4-7',
  'Philippians 4:5',
  'Hebrews 13:2',
  'Matthew 28:18-20',
  'Romans 12:3-8',
  'Ephesians 4:7-14',
  'Ephesians 2:8-10',
  'Romans 14:13',
  'Romans 16:17',
  '1 Corinthians 5:7-11',
  '1 Corinthians 6:19-20',
  '2 Thessalonians 3:11-14',
  '2 Timothy 3:1-5',
  'James 4:4-5',
  '1 Peter 2:9',
  '2 John 9-11',
  '1 John 2:15-17',
  'Matthew 18:15-17'
];

// Create a backup of the original file
fs.writeFileSync(filePath + '.bak', content, 'utf8');
console.log('Created backup at:', filePath + '.bak');

// Remove duplicates
let newContent = content;
let removedCount = 0;

duplicates.forEach(ref => {
  // Create a regex to find the verse entry (including any trailing comma and whitespace)
  const regex = new RegExp(`\\s*'${ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':[^,}]*,[\s]*`, 'g');
  const matches = newContent.match(regex);
  
  if (matches && matches.length > 1) {
    // Keep the first occurrence, remove the rest
    newContent = newContent.replace(regex, (match, offset, str) => {
      // If this is the first match, keep it
      if (offset < newContent.indexOf(`'${ref}'`)) {
        return match;
      }
      removedCount++;
      return ''; // Remove this occurrence
    });
  }
});

// Write the cleaned content back to the file
fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Removed ${removedCount} duplicate verse references.`);
console.log('File updated successfully.');
