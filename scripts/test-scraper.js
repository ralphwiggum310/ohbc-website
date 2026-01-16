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
  outputFile: 'test-output.json',
  baseUrl: 'https://www.biblegateway.com',
  delayBetweenRequests: 2000,
  headless: false // Show browser for debugging
};

// Just test with Genesis
const TEST_BOOK = {
  name: 'Genesis',
  chapters: 3 // Just test first 3 chapters
};

async function ensureOutputDir() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
  } catch (error) {
    console.error('Error creating output directory:', error);
    process.exit(1);
  }
}

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

async function getChapterText(page, book, chapter) {
  const url = `${CONFIG.baseUrl}/passage/?search=${encodeURIComponent(book.name)}+${chapter}&version=NASB1995`;
  console.log(`Fetching ${book.name} ${chapter}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for the passage text to load
    await page.waitForSelector('.passage-text', { timeout: 10000 });
    
    // Extract the passage text
    const passage = await page.evaluate(() => {
      // Remove chapter numbers and other non-verse elements
      document.querySelectorAll('.chapternum, .footnotes, .crossrefs, .footnote, .crossreference')
        .forEach(el => el.remove());
      
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

// Main execution
(async () => {
  console.log('Starting test scraper...');
  
  try {
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
    
    const bookData = {
      bookName: TEST_BOOK.name,
      chapters: []
    };
    
    // Process each chapter
    for (let chapter = 1; chapter <= TEST_BOOK.chapters; chapter++) {
      const verses = await getChapterText(page, TEST_BOOK, chapter);
      
      if (verses.length > 0) {
        bookData.chapters.push({
          chapter,
          verses
        });
        console.log(`  Saved ${verses.length} verses from ${TEST_BOOK.name} ${chapter}`);
      }
      
      // Add a delay between requests
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
    }
    
    // Save the output
    const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
    await fs.writeFile(outputPath, JSON.stringify(bookData, null, 2));
    
    console.log(`\nTest complete! Data saved to ${outputPath}`);
    console.log(`Total chapters: ${bookData.chapters.length}`);
    console.log(`Total verses: ${bookData.chapters.reduce((sum, ch) => sum + ch.verses.length, 0)}`);
    
    await browser.close();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();
