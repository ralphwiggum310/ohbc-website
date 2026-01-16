import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, '..', 'data', 'bible', 'nasb1995'),
  outputFile: 'nasb1995.json',
  baseUrl: 'https://www.biblegateway.com',
  searchUrl: 'https://www.biblegateway.com/quicksearch/?quicksearch=Genesis+1&version=NASB1995',
  delayBetweenRequests: 2000, // 2 seconds between requests
  headless: true // Set to false to see the browser
};

// Book names and their abbreviations
const BOOKS = [
  { name: 'Genesis', abbr: 'gen', chapters: 50 },
  { name: 'Exodus', abbr: 'exod', chapters: 40 },
  { name: 'Leviticus', abbr: 'lev', chapters: 27 },
  { name: 'Numbers', abbr: 'num', chapters: 36 },
  { name: 'Deuteronomy', abbr: 'deut', chapters: 34 },
  { name: 'Joshua', abbr: 'josh', chapters: 24 },
  { name: 'Judges', abbr: 'judg', chapters: 21 },
  { name: 'Ruth', abbr: 'ruth', chapters: 4 },
  { name: '1 Samuel', abbr: '1sam', chapters: 31 },
  { name: '2 Samuel', abbr: '2sam', chapters: 24 },
  { name: '1 Kings', abbr: '1kgs', chapters: 22 },
  { name: '2 Kings', abbr: '2kgs', chapters: 25 },
  { name: '1 Chronicles', abbr: '1chr', chapters: 29 },
  { name: '2 Chronicles', abbr: '2chr', chapters: 36 },
  { name: 'Ezra', abbr: 'ezra', chapters: 10 },
  { name: 'Nehemiah', abbr: 'neh', chapters: 13 },
  { name: 'Esther', abbr: 'esth', chapters: 10 },
  { name: 'Job', abbr: 'job', chapters: 42 },
  { name: 'Psalm', abbr: 'ps', chapters: 150 },
  { name: 'Proverbs', abbr: 'prov', chapters: 31 },
  { name: 'Ecclesiastes', abbr: 'eccl', chapters: 12 },
  { name: 'Song of Solomon', abbr: 'song', chapters: 8 },
  { name: 'Isaiah', abbr: 'isa', chapters: 66 },
  { name: 'Jeremiah', abbr: 'jer', chapters: 52 },
  { name: 'Lamentations', abbr: 'lam', chapters: 5 },
  { name: 'Ezekiel', abbr: 'ezek', chapters: 48 },
  { name: 'Daniel', abbr: 'dan', chapters: 12 },
  { name: 'Hosea', abbr: 'hos', chapters: 14 },
  { name: 'Joel', abbr: 'joel', chapters: 3 },
  { name: 'Amos', abbr: 'amos', chapters: 9 },
  { name: 'Obadiah', abbr: 'obad', chapters: 1 },
  { name: 'Jonah', abbr: 'jonah', chapters: 4 },
  { name: 'Micah', abbr: 'mic', chapters: 7 },
  { name: 'Nahum', abbr: 'nah', chapters: 3 },
  { name: 'Habakkuk', abbr: 'hab', chapters: 3 },
  { name: 'Zephaniah', abbr: 'zeph', chapters: 3 },
  { name: 'Haggai', abbr: 'hag', chapters: 2 },
  { name: 'Zechariah', abbr: 'zech', chapters: 14 },
  { name: 'Malachi', abbr: 'mal', chapters: 4 },
  { name: 'Matthew', abbr: 'matt', chapters: 28 },
  { name: 'Mark', abbr: 'mark', chapters: 16 },
  { name: 'Luke', abbr: 'luke', chapters: 24 },
  { name: 'John', abbr: 'john', chapters: 21 },
  { name: 'Acts', abbr: 'acts', chapters: 28 },
  { name: 'Romans', abbr: 'rom', chapters: 16 },
  { name: '1 Corinthians', abbr: '1cor', chapters: 16 },
  { name: '2 Corinthians', abbr: '2cor', chapters: 13 },
  { name: 'Galatians', abbr: 'gal', chapters: 6 },
  { name: 'Ephesians', abbr: 'eph', chapters: 6 },
  { name: 'Philippians', abbr: 'phil', chapters: 4 },
  { name: 'Colossians', abbr: 'col', chapters: 4 },
  { name: '1 Thessalonians', abbr: '1thess', chapters: 5 },
  { name: '2 Thessalonians', abbr: '2thess', chapters: 3 },
  { name: '1 Timothy', abbr: '1tim', chapters: 6 },
  { name: '2 Timothy', abbr: '2tim', chapters: 4 },
  { name: 'Titus', abbr: 'titus', chapters: 3 },
  { name: 'Philemon', abbr: 'phlm', chapters: 1 },
  { name: 'Hebrews', abbr: 'heb', chapters: 13 },
  { name: 'James', abbr: 'jas', chapters: 5 },
  { name: '1 Peter', abbr: '1pet', chapters: 5 },
  { name: '2 Peter', abbr: '2pet', chapters: 3 },
  { name: '1 John', abbr: '1john', chapters: 5 },
  { name: '2 John', abbr: '2john', chapters: 1 },
  { name: '3 John', abbr: '3john', chapters: 1 },
  { name: 'Jude', abbr: 'jude', chapters: 1 },
  { name: 'Revelation', abbr: 'rev', chapters: 22 }
];

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
  } catch (error) {
    console.error('Error creating output directory:', error);
    process.exit(1);
  }
}

// Initialize the browser
async function initBrowser() {
  try {
    console.log('Launching browser...');
    return await puppeteer.launch({
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (error) {
    console.error('Failed to launch browser:', error);
    process.exit(1);
  }
}

// Get verse text from a chapter
async function getChapterText(page, book, chapter) {
  const url = `${CONFIG.baseUrl}/passage/?search=${encodeURIComponent(book.name)}+${chapter}&version=NASB1995`;
  
  try {
    console.log(`Fetching ${book.name} ${chapter}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for the passage text to load
    await page.waitForSelector('.passage-text', { timeout: 10000 });
    
    // Extract the passage text
    const passage = await page.evaluate(() => {
      // Remove chapter numbers and other non-verse elements
      document.querySelectorAll('.chapternum, .footnotes, .crossrefs, .footnote, .crossreference').forEach(el => el.remove());
      
      // Get all verse elements
      const verses = [];
      const verseElements = document.querySelectorAll('.verse');
      
      verseElements.forEach(verseEl => {
        const verseNum = verseEl.getAttribute('data-verse');
        if (verseNum) {
          // Remove verse numbers from the text
          const verseNumEl = verseEl.querySelector('.versenum');
          if (verseNumEl) verseNumEl.remove();
          
          // Clean up the verse text
          let text = verseEl.textContent
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          
          verses.push({
            verse: parseInt(verseNum, 10),
            text: text
          });
        }
      });
      
      return verses;
    });
    
    return passage;
  } catch (error) {
    console.error(`Error fetching ${book.name} ${chapter}:`, error.message);
    return [];
  }
}

// Main scraping function
async function scrapeBible() {
  await ensureOutputDir();
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  // Configure request interception to block unnecessary resources
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });
  
  const bibleData = [];
  const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
  
  try {
    // Process each book
    for (const book of BOOKS) {
      console.log(`\nProcessing ${book.name}...`);
      const bookData = {
        bookId: BOOKS.findIndex(b => b.name === book.name) + 1,
        bookName: book.name,
        chapters: []
      };
      
      // Process each chapter
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const verses = await getChapterText(page, book, chapter);
        
        if (verses.length > 0) {
          bookData.chapters.push({
            chapter,
            verses
          });
          
          // Save progress after each chapter
          await fs.writeFile(outputPath, JSON.stringify(bibleData, null, 2));
          console.log(`  Saved ${verses.length} verses from ${book.name} ${chapter}`);
        }
        
        // Add a delay between requests
        await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
      }
      
      bibleData.push(bookData);
    }
    
    return bibleData;
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

// Run the scraper
// Main execution
(async () => {
  console.log('Starting NASB 1995 web scraper...');
  
  try {
    const bibleData = await scrapeBible();
    const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
    
    // Save the final output
    await fs.writeFile(outputPath, JSON.stringify(bibleData, null, 2));
    
    console.log(`\nScraping complete! Data saved to ${outputPath}`);
    console.log(`Total books: ${bibleData.length}`);
    console.log(`Total chapters: ${bibleData.reduce((sum, book) => sum + book.chapters.length, 0)}`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})().catch(error => {
  console.error('Unhandled error in main execution:', error);
  process.exit(1);
});
