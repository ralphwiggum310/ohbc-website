// Script to fetch and convert KJV Bible to JSON format
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../src/lib/bible/data');

// KJV Bible in JSON format (public domain)
const KJV_JSON_URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json';

async function fetchKjvBible() {
  try {
    console.log('Fetching KJV Bible data...');
    const response = await axios.get(KJV_JSON_URL);
    const bibleData = response.data;
    
    // Transform the data to our preferred format
    const formattedData = {
      version: 'KJV',
      name: 'King James Version',
      language: 'en',
      books: {}
    };

    // Convert array to object with book names as keys
    bibleData.forEach(book => {
      formattedData.books[book.name] = {
        name: book.name,
        chapters: {}
      };

      // Group verses by chapter
      book.verses.forEach(verse => {
        const chapterNum = verse.chapter.toString();
        if (!formattedData.books[book.name].chapters[chapterNum]) {
          formattedData.books[book.name].chapters[chapterNum] = [];
        }
        
        formattedData.books[book.name].chapters[chapterNum].push({
          verse: verse.verse,
          text: verse.text
        });
      });
    });

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Save to file
    const outputPath = path.join(OUTPUT_DIR, 'kjv.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));
    console.log(`KJV Bible data saved to ${outputPath}`);
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching KJV Bible:', error.message);
    process.exit(1);
  }
}

// Run the script
fetchKjvBible();
