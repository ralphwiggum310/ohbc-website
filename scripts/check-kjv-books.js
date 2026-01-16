const fs = require('fs/promises');
const path = require('path');

async function checkKjvBooks() {
  try {
    const filePath = path.join(__dirname, '../src/lib/bible/data/kjv.json');
    console.log(`Reading KJV data from: ${filePath}`);
    
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    if (!data.books) {
      console.error('No books found in KJV data');
      return;
    }
    
    const bookNames = Object.keys(data.books);
    console.log(`Found ${bookNames.length} books in KJV data:`);
    
    bookNames.forEach((bookName, index) => {
      const chapterCount = Object.keys(data.books[bookName].chapters || {}).length;
      console.log(`${index + 1}. ${bookName} (${chapterCount} chapters)`);
    });
    
  } catch (error) {
    console.error('Error checking KJV books:', error);
  }
}

checkKjvBooks();
