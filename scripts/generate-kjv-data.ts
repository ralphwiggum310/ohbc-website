import fs from 'fs';
import path from 'path';
import { bible } from 'bible-json';

// Output directory
const OUTPUT_DIR = path.join(process.cwd(), 'src/lib/bible/data');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Transform the data to our format
function transformBibleData() {
  const transformedData = {
    version: 'KJV',
    name: 'King James Version',
    language: 'en',
    books: {} as Record<string, any>,
  };

  // Group verses by book and chapter
  bible.forEach(verse => {
    const { book, chapter, verse: verseNum, text } = verse;

    // Initialize book if it doesn't exist
    if (!transformedData.books[book]) {
      transformedData.books[book] = {
        name: book,
        chapters: {},
        testament: getTestament(book),
      };
    }

    // Initialize chapter if it doesn't exist
    if (!transformedData.books[book].chapters[chapter]) {
      transformedData.books[book].chapters[chapter] = [];
    }

    // Add verse to the chapter
    transformedData.books[book].chapters[chapter].push({
      verse: verseNum,
      text: text.trim(),
    });
  });

  return transformedData;
}

// Determine if a book is in the Old or New Testament
function getTestament(bookName: string): 'old' | 'new' {
  const newTestamentBooks = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
    '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
    'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John',
    '3 John', 'Jude', 'Revelation'
  ];

  return newTestamentBooks.includes(bookName) ? 'new' : 'old';
}

// Generate and save the data
async function generateData() {
  try {
    console.log('Generating KJV Bible data...');
    const data = transformBibleData();
    
    // Save to file
    const outputPath = path.join(OUTPUT_DIR, 'kjv.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`Successfully generated KJV Bible data at: ${outputPath}`);
    console.log(`Total books: ${Object.keys(data.books).length}`);
    
  } catch (error) {
    console.error('Error generating KJV Bible data:', error);
    process.exit(1);
  }
}

// Run the script
generateData();
