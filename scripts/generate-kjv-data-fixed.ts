import fs from 'fs';
import path from 'path';
import { bible } from 'bible-json';

// Output directory - using src/app/api/bible/data to ensure it's included in the build
const OUTPUT_DIR = path.join(process.cwd(), 'public/bible-data');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

// Transform the data to our format
function transformBibleData() {
  console.log('Transforming Bible data...');
  
  const transformedData = {
    version: 'KJV',
    name: 'King James Version',
    language: 'en',
    books: {} as Record<string, any>,
  };

  // Group verses by book and chapter
  bible.forEach((verse, index) => {
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

    // Log progress
    if (index % 1000 === 0) {
      console.log(`Processed ${index} verses...`);
    }
  });

  console.log('Finished transforming Bible data');
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
    console.log('Starting KJV Bible data generation...');
    console.log(`Output directory: ${OUTPUT_DIR}`);
    
    const data = transformBibleData();
    
    // Save to file
    const outputPath = path.join(OUTPUT_DIR, 'kjv.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`\nSuccessfully generated KJV Bible data at: ${outputPath}`);
    console.log(`Total books: ${Object.keys(data.books).length}`);
    
    // Verify the file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.error('Error: Output file was not created!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error generating KJV Bible data:', error);
    process.exit(1);
  }
}

// Run the script
generateData();
