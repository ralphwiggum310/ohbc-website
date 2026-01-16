import { BibleBook, BibleVersion, BibleData, BibleVerse } from './types';

// Available Bible versions
export const BIBLE_VERSIONS: BibleVersion[] = [
  { 
    id: 'kjv', 
    name: 'King James Version', 
    abbreviation: 'KJV',
    language: 'en' 
  },
  { 
    id: 'nasb1995', 
    name: 'New American Standard Bible 1995', 
    abbreviation: 'NASB 1995',
    language: 'en'
  }
];

// Cache for Bible data
const bibleCache: Record<string, BibleData> = {};

/**
 * Load Bible data for a specific version
 */
async function loadBibleData(versionId: string): Promise<BibleData> {
  const cacheKey = versionId.toLowerCase();
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // Check cache first
  if (bibleCache[cacheKey]) {
    console.log(`[loadBibleData] Using cached data for version: ${versionId}`);
    return bibleCache[cacheKey];
  }

  try {
    console.log(`[loadBibleData] Loading data for version: ${versionId}`);
    
    // Use require for JSON files in Node.js
    let bibleData: BibleData;
    try {
      // Get the absolute path to the data file
      const dataPath = path.join(process.cwd(), 'src', 'lib', 'bible', 'data', `${cacheKey}.json`);
      console.log(`[loadBibleData] Loading data from: ${dataPath}`);
      
      // Read the file directly
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      bibleData = JSON.parse(fileContent);
      console.log(`[loadBibleData] Successfully loaded data for ${versionId}`);
    } catch (importError) {
      console.error(`[loadBibleData] Error loading data file for ${versionId}:`, importError);
      throw new Error(`Failed to load data file for version ${versionId}: ${importError instanceof Error ? importError.message : String(importError)}`);
    }
    
    // Validate the loaded data
    if (!bibleData) {
      throw new Error(`No data returned for version ${versionId}`);
    }
    
    if (!bibleData.books || typeof bibleData.books !== 'object') {
      console.error('[loadBibleData] Invalid books data:', bibleData.books);
      throw new Error(`Invalid books data for version ${versionId}`);
    }
    
    // Log some debug info
    const bookCount = Object.keys(bibleData.books).length;
    console.log(`[loadBibleData] Loaded ${bookCount} books for ${versionId}`);
    
    if (bookCount === 0) {
      console.warn(`[loadBibleData] No books found for version ${versionId}`);
    } else {
      console.log(`[loadBibleData] First book: ${Object.keys(bibleData.books)[0]}`);
    }
    
    // Cache the data
    bibleCache[cacheKey] = bibleData;
    return bibleData;
    
  } catch (error) {
    console.error(`[loadBibleData] Failed to load Bible data for version ${versionId}:`, error);
    // Re-throw with more context
    throw new Error(`Failed to load Bible data for version ${versionId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get list of all books in the Bible
 */
export async function getBooks(versionId: string = 'kjv'): Promise<BibleBook[]> {
  console.log(`[getBooks] Loading books for version: ${versionId}`);
  try {
    const bibleData = await loadBibleData(versionId);
    
    if (!bibleData) {
      console.error('[getBooks] No Bible data returned from loadBibleData');
      return [];
    }
    
    console.log(`[getBooks] Bible data loaded, found ${Object.keys(bibleData.books || {}).length} books`);
    
    // Log the first few books for debugging
    const bookNames = Object.keys(bibleData.books || {});
    console.log(`[getBooks] First 5 books:`, bookNames.slice(0, 5));
    
    const books = Object.values(bibleData.books);
    console.log(`[getBooks] Returning ${books.length} books`);
    
    return books;
  } catch (error) {
    console.error(`[getBooks] Error getting books for version ${versionId}:`, error);
    throw error;
  }
}

/**
 * Get chapters for a specific book
 */
export async function getChapters(
  bookName: string,
  versionId: string = 'kjv'
): Promise<number[]> {
  const bibleData = await loadBibleData(versionId);
  const book = bibleData.books[bookName];
  
  if (!book) {
    throw new Error(`Book '${bookName}' not found in ${versionId}`);
  }
  
  return Object.keys(book.chapters).map(Number).sort((a, b) => a - b);
}

/**
 * Get verses for a specific book and chapter
 */
export async function getVerses(
  bookName: string,
  chapter: number,
  versionId: string = 'kjv'
): Promise<Array<{ verse: number; text: string }>> {
  console.log(`[getVerses] Starting to load verses for ${bookName} ${chapter} (${versionId})`);
  
  try {
    console.log(`[getVerses] Loading Bible data for version: ${versionId}`);
    const bibleData = await loadBibleData(versionId);
    
    if (!bibleData) {
      const errorMsg = `[getVerses] Failed to load Bible data for version: ${versionId}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log(`[getVerses] Bible data loaded successfully for version: ${versionId}`);
    
    // Debug: Log available book names
    const bookNames = Object.keys(bibleData.books || {});
    console.log(`[getVerses] Available books (${bookNames.length}):`, bookNames);
    
    // Find the requested book (case-insensitive)
    const normalizedBookName = bookName.trim();
    console.log(`[getVerses] Looking for book: '${normalizedBookName}'`);
    
    const book = bibleData.books[normalizedBookName];
    
    if (!book) {
      const availableBooks = Object.keys(bibleData.books || {});
      const errorMsg = `Book '${normalizedBookName}' not found in ${versionId}. Available books: ${availableBooks.join(', ')}`;
      console.error('[getVerses]', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log(`[getVerses] Found book: '${normalizedBookName}'`);
    
    // Check if chapters exist
    if (!book.chapters) {
      const errorMsg = `No chapters found for book: ${normalizedBookName}`;
      console.error('[getVerses]', errorMsg);
      throw new Error(errorMsg);
    }
    
    // Debug: Log available chapters
    const chapterNumbers = Object.keys(book.chapters);
    console.log(`[getVerses] Available chapters for ${normalizedBookName} (${chapterNumbers.length}):`, chapterNumbers);
    
    // Get the requested chapter
    const chapterKey = chapter.toString();
    console.log(`[getVerses] Looking for chapter: ${chapterKey}`);
    
    const chapterData = book.chapters[chapterKey];
    
    if (!chapterData) {
      const availableChapters = Object.keys(book.chapters);
      const errorMsg = `Chapter ${chapter} not found in ${normalizedBookName} (${versionId}). Available chapters: ${availableChapters.join(', ')}`;
      console.error('[getVerses]', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log(`[getVerses] Successfully loaded ${chapterData.length} verses from ${normalizedBookName} ${chapter}`);
    return chapterData;
    
  } catch (error) {
    console.error(`[getVerses] Error getting verses for ${bookName} ${chapter} (${versionId}):`, error);
    
    // Log additional error details
    if (error && typeof error === 'object') {
      console.error('[getVerses] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as any).response ? { response: (error as any).response } : {}
      });
    }
    
    // Re-throw the error with more context
    if (error instanceof Error) {
      throw new Error(`Failed to get verses for ${bookName} ${chapter}: ${error.message}`);
    }
    
    throw new Error(`An unknown error occurred while getting verses for ${bookName} ${chapter}`);
  }
}

/**
 * Get a specific verse
 */
export async function getVerse(
  bookName: string,
  chapter: number,
  verse: number,
  versionId: string = 'kjv'
): Promise<{ verse: number; text: string } | undefined> {
  const verses = await getVerses(bookName, chapter, versionId);
  return verses.find(v => v.verse === verse);
}

/**
 * Search for text in the Bible
 */
export async function search(
  query: string,
  versionId: string = 'kjv',
  limit: number = 50
): Promise<Array<{
  book: string;
  chapter: number;
  verse: number;
  text: string;
}>> {
  const bibleData = await loadBibleData(versionId);
  const results = [];
  const queryLower = query.toLowerCase();
  
  // Simple search implementation - can be optimized
  for (const [bookName, book] of Object.entries(bibleData.books)) {
    for (const [chapterNum, verses] of Object.entries(book.chapters)) {
      for (const verse of verses) {
        if (verse.text.toLowerCase().includes(queryLower)) {
          results.push({
            book: bookName,
            chapter: parseInt(chapterNum, 10),
            verse: verse.verse,
            text: verse.text
          });
          
          if (results.length >= limit) {
            return results;
          }
        }
      }
    }
  }
  
  return results;
}
