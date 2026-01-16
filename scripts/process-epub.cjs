const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { XMLParser } = require('fast-xml-parser');
const AdmZip = require('adm-zip');

// Paths
const epubPath = path.join(__dirname, '..', 'Bible api', 'NASB1995', 'NASB1995.epub');
const outputDir = path.join(__dirname, '..', 'Bible api', 'NASB1995', 'epub-extracted');
const outputPath = path.join(__dirname, '..', 'Bible api', 'NASB1995', 'nasb1995-import-ready.json');

// Book name to ID mapping
const bookNameToId = {
  'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
  'Joshua': 6, 'Judges': 7, 'Ruth': 8, '1 Samuel': 9, '2 Samuel': 10,
  '1 Kings': 11, '2 Kings': 12, '1 Chronicles': 13, '2 Chronicles': 14,
  'Ezra': 15, 'Nehemiah': 16, 'Esther': 17, 'Job': 18, 'Psalms': 19,
  'Proverbs': 20, 'Ecclesiastes': 21, 'Song of Solomon': 22, 'Isaiah': 23,
  'Jeremiah': 24, 'Lamentations': 25, 'Ezekiel': 26, 'Daniel': 27,
  'Hosea': 28, 'Joel': 29, 'Amos': 30, 'Obadiah': 31, 'Jonah': 32,
  'Micah': 33, 'Nahum': 34, 'Habakkuk': 35, 'Zephaniah': 36, 'Haggai': 37,
  'Zechariah': 38, 'Malachi': 39, 'Matthew': 40, 'Mark': 41, 'Luke': 42,
  'John': 43, 'Acts': 44, 'Romans': 45, '1 Corinthians': 46, '2 Corinthians': 47,
  'Galatians': 48, 'Ephesians': 49, 'Philippians': 50, 'Colossians': 51,
  '1 Thessalonians': 52, '2 Thessalonians': 53, '1 Timothy': 54, '2 Timothy': 55,
  'Titus': 56, 'Philemon': 57, 'Hebrews': 58, 'James': 59, '1 Peter': 60,
  '2 Peter': 61, '1 John': 62, '2 John': 63, '3 John': 64, 'Jude': 65,
  'Revelation': 66
};

// Version ID for NASB1995
const VERSION = 'nasb1995';

async function processEPUB() {
  console.log(`Processing EPUB file: ${epubPath}`);
  
  // Check if the file exists
  if (!fs.existsSync(epubPath)) {
    console.error(`Error: EPUB file not found at ${epubPath}`);
    return;
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  } else {
    // Clear the directory if it already exists
    console.log('Cleaning up existing extraction directory...');
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Extract the EPUB file
    console.log('Extracting EPUB contents...');
    const zip = new AdmZip(epubPath);
    zip.extractAllTo(outputDir, true);
    console.log(`EPUB contents extracted to: ${outputDir}`);

    // Find the OPF file to understand the structure
    const opfPath = findOPFFile(outputDir);
    if (!opfPath) {
      throw new Error('Could not find OPF file in the EPUB');
    }

    console.log(`Found OPF file at: ${path.relative(process.cwd(), opfPath)}`);
    
    // Parse the OPF file to get the spine and manifest
    const opfContent = fs.readFileSync(opfPath, 'utf8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name, jpath, isLeafNode, isAttribute) => {
        // Make sure these are always arrays
        return ['manifest', 'item', 'itemref', 'spine'].includes(name);
      }
    });
    
    const opf = parser.parse(opfContent);
    
    // Get the base directory of the OPF file
    const opfDir = path.dirname(opfPath);
    
    // Process each item in the spine
    const spine = opf.package.spine[0].itemref || [];
    const manifest = opf.package.manifest[0].item || [];
    
    // Create a map of id to item
    const itemMap = {};
    manifest.forEach(item => {
      itemMap[item['@_id']] = item;
    });
    
    console.log(`Found ${spine.length} items in the spine`);
    
    // Process each spine item
    const verses = [];
    
    for (const itemRef of spine) {
      const itemId = itemRef['@_idref'];
      const item = itemMap[itemId];
      
      if (!item) {
        console.warn(`Could not find item with id ${itemId}`);
        continue;
      }
      
      const itemPath = path.join(opfDir, item['@_href']);
      console.log(`\nProcessing item: ${path.basename(itemPath)}`);
      
      // Read the HTML content
      let htmlContent;
      try {
        htmlContent = fs.readFileSync(itemPath, 'utf8');
      } catch (error) {
        console.error(`Error reading file ${itemPath}:`, error.message);
        continue;
      }
      
      // Parse the HTML content
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // Extract the title (which might contain the book name and chapter)
      const title = document.querySelector('title')?.textContent || '';
      console.log(`  Title: ${title}`);
      
      // Try to extract book and chapter from the title
      let bookName = '';
      let chapter = 0;
      
      const titleMatch = title.match(/(\d*\s*[A-Za-z]+)\s+(\d+)/);
      if (titleMatch) {
        bookName = titleMatch[1].trim();
        chapter = parseInt(titleMatch[2], 10);
        console.log(`  Detected: ${bookName} ${chapter}`);
      }
      
      // If we couldn't determine the book and chapter, skip this file
      if (!bookName || !chapter) {
        console.warn(`  Could not determine book and chapter from title: ${title}`);
        continue;
      }
      
      // Get the book ID
      const bookId = bookNameToId[bookName];
      if (!bookId) {
        console.warn(`  Unknown book: ${bookName}`);
        continue;
      }
      
      // Find all paragraphs that might contain verses
      const paragraphs = document.querySelectorAll('p');
      console.log(`  Found ${paragraphs.length} paragraphs`);
      
      // Process each paragraph to extract verses
      let currentVerse = 0;
      
      for (const p of paragraphs) {
        const text = p.textContent.trim();
        if (!text) continue;
        
        // Try to extract verse number from the beginning of the paragraph
        const verseMatch = text.match(/^(\d+)/);
        if (verseMatch) {
          currentVerse = parseInt(verseMatch[1], 10);
          const verseText = text.substring(verseMatch[0].length).trim();
          
          if (verseText) {
            verses.push({
              book_id: bookId,
              book: bookName,
              chapter: chapter,
              verse: currentVerse,
              version: VERSION,
              text: verseText
            });
          }
        } else if (currentVerse > 0) {
          // If we have a current verse but no new verse number, append to the last verse
          if (verses.length > 0) {
            const lastVerse = verses[verses.length - 1];
            if (lastVerse.verse === currentVerse && lastVerse.chapter === chapter) {
              lastVerse.text += ' ' + text;
            }
          }
        }
      }
      
      console.log(`  Extracted ${verses.length} verses so far`);
    }
    
    console.log(`\nTotal verses extracted: ${verses.length}`);
    
    // Save the extracted verses to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(verses, null, 2));
    console.log(`\nSaved extracted verses to: ${outputPath}`);
    
    // Show a sample of the extracted data
    console.log('\nSample data (first 3 verses):');
    console.log(JSON.stringify(verses.slice(0, 3), null, 2));
    
    return verses;
    
  } catch (error) {
    console.error('Error processing EPUB:', error);
    throw error;
  }
}

function findOPFFile(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const found = findOPFFile(fullPath);
      if (found) return found;
    } else if (file.name.endsWith('.opf')) {
      return fullPath;
    }
  }
  
  return null;
}

// Run the processing
processEPUB().catch(console.error);
