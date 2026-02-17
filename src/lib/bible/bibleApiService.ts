import { BibleVersion, BibleBook, BibleVerse } from './types';

// ESV API configuration
const ESV_API_KEY = process.env.ESV_API_KEY || '';

// Available Bible versions
export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: 'kjv', name: 'King James Version', abbreviation: 'KJV', language: 'en' },
  { id: 'esv', name: 'English Standard Version', abbreviation: 'ESV', language: 'en' },
  { id: 'asv', name: 'American Standard Version', abbreviation: 'ASV', language: 'en' },
  { id: 'web', name: 'World English Bible', abbreviation: 'WEB', language: 'en' },
];

// Cache for API responses
const apiCache = new Map<string, any>();

// Get a unique cache key for a request
function getCacheKey(book: string, chapter: number, version: string): string {
  return `${version}:${book.toLowerCase()}:${chapter}`;
}

// Map book names to ESV API format
const getEsvBookName = (bookName: string): string => {
  // Handle special cases first
  const specialCases: Record<string, string> = {
    '1 John': '1john',
    '2 John': '2john',
    '3 John': '3john',
    '1 Peter': '1peter',
    '2 Peter': '2peter',
    '1 Corinthians': '1corinthians',
    '2 Corinthians': '2corinthians',
    '1 Thessalonians': '1thessalonians',
    '2 Thessalonians': '2thessalonians',
    '1 Timothy': '1timothy',
    '2 Timothy': '2timothy',
    '1 Kings': '1kings',
    '2 Kings': '2kings',
    '1 Chronicles': '1chronicles',
    '2 Chronicles': '2chronicles',
    '1 Samuel': '1samuel',
    '2 Samuel': '2samuel',
    'Song of Solomon': 'songofsolomon',
  };

  if (specialCases[bookName]) {
    return specialCases[bookName];
  }

  // Default case: convert to lowercase and remove spaces
  return bookName.toLowerCase().replace(/\s+/g, '');
};

// Fetch verses from the appropriate API based on version
export async function fetchVerses(
  book: string,
  chapter: number,
  version: string = 'kjv'
): Promise<BibleVerse[]> {
  const cacheKey = getCacheKey(book, chapter, version);
  
  // Check cache first
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  try {
    if (version === 'esv') {
      return fetchEsvVerses(book, chapter);
    } else {
      return fetchBibleApiVerses(book, chapter, version);
    }
  } catch (error) {
    console.error(`[BibleAPI] Error fetching ${book} ${chapter} (${version}):`, error);
    throw new Error(`Failed to fetch verses: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Fetch verses from the ESV API
async function fetchEsvVerses(book: string, chapter: number): Promise<BibleVerse[]> {
  if (!ESV_API_KEY) {
    throw new Error('ESV API key is not configured');
  }

  const bookName = getEsvBookName(book);
  const passage = `${bookName}+${chapter}`;
  const url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(passage)}&include-headings=false&include-footnotes=false&include-verse-numbers=true&include-short-copyright=false&include-passage-references=false`;
  
  console.log(`[ESV API] Fetching ${book} ${chapter}`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Token ${ESV_API_KEY}`,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`ESV API request failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.passages || !Array.isArray(data.passages) || data.passages.length === 0) {
    throw new Error('Invalid ESV API response format');
  }
  
  // Parse the response into verses
  const verses: BibleVerse[] = [];
  const verseRegex = /\[(\d+)\]\s*([^\[]+)/g;
  let match;
  
  while ((match = verseRegex.exec(data.passages[0])) !== null) {
    verses.push({
      verse: parseInt(match[1], 10),
      text: match[2].trim(),
    });
  }
  
  // Cache the result
  const cacheKey = getCacheKey(book, chapter, 'esv');
  apiCache.set(cacheKey, verses);
  
  return verses;
}

// Map book names to Bible-API format
function getBibleApiBookName(bookName: string): string {
  // Handle special cases for Bible-API
  const specialCases: Record<string, string> = {
    '1 John': '1_john',
    '2 John': '2_john',
    '3 John': '3_john',
    '1 Peter': '1_peter',
    '2 Peter': '2_peter',
    '1 Corinthians': '1_corinthians',
    '2 Corinthians': '2_corinthians',
    '1 Thessalonians': '1_thessalonians',
    '2 Thessalonians': '2_thessalonians',
    '1 Timothy': '1_timothy',
    '2 Timothy': '2_timothy',
    '1 Kings': '1_kings',
    '2 Kings': '2_kings',
    '1 Chronicles': '1_chronicles',
    '2 Chronicles': '2_chronicles',
    '1 Samuel': '1_samuel',
    '2 Samuel': '2_samuel',
    'Song of Solomon': 'song_of_solomon',
    'Song of Songs': 'song_of_solomon', // Alternative name
  };

  // Return special case if it exists
  if (specialCases[bookName]) {
    return specialCases[bookName];
  }

  // Default case: convert to lowercase and replace spaces with underscores
  return bookName.toLowerCase().replace(/\s+/g, '_');
}

// Fetch verses from the Bible-API
async function fetchBibleApiVerses(
  book: string,
  chapter: number,
  version: string
): Promise<BibleVerse[]> {
  // Format the book name for the API
  const formattedBook = getBibleApiBookName(book);
  const reference = `${formattedBook}+${chapter}`;
  const url = `https://bible-api.com/${reference}?translation=${version}`;
  
  console.log(`[Bible-API] Fetching ${book} ${chapter} (${version}) -> ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // Try with a more generic book name format if the first attempt fails
      if (response.status === 404) {
        const altBookName = book.replace(/^\d+\s+/, ''); // Remove leading numbers
        const altFormattedBook = altBookName.toLowerCase().replace(/\s+/g, '_');
        const altUrl = `https://bible-api.com/${altFormattedBook}+${chapter}?translation=${version}`;
        console.log(`[Bible-API] Retrying with alternative book name: ${altUrl}`);
        
        const altResponse = await fetch(altUrl);
        if (altResponse.ok) {
          const data = await altResponse.json();
          return transformApiResponse(data, book, chapter, version);
        }
      }
      throw new Error(`Bible-API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return transformApiResponse(data, book, chapter, version);
  } catch (error) {
    console.error(`[Bible-API] Error fetching ${book} ${chapter}:`, error);
    throw error;
  }
}

// Transform API response to our format
function transformApiResponse(data: any, book: string, chapter: number, version: string): BibleVerse[] {
  if (!data.verses || !Array.isArray(data.verses)) {
    console.error('Invalid Bible-API response format:', data);
    throw new Error('Invalid Bible-API response format');
  }
  
  // Transform the API response to our format
  const verses: BibleVerse[] = data.verses.map((v: any) => ({
    verse: v.verse,
    text: v.text
  }));
  
  // Cache the result
  const cacheKey = getCacheKey(book, chapter, version);
  apiCache.set(cacheKey, verses);
  
  return verses;
}

// Get list of all Bible books
export function getBibleBooks(): Array<{name: string; chapters: number; testament: string}> {
  // Return all 66 books in canonical order
  return [
    // Old Testament
    { name: 'Genesis', chapters: 50, testament: 'old' },
    { name: 'Exodus', chapters: 40, testament: 'old' },
    { name: 'Leviticus', chapters: 27, testament: 'old' },
    { name: 'Numbers', chapters: 36, testament: 'old' },
    { name: 'Deuteronomy', chapters: 34, testament: 'old' },
    { name: 'Joshua', chapters: 24, testament: 'old' },
    { name: 'Judges', chapters: 21, testament: 'old' },
    { name: 'Ruth', chapters: 4, testament: 'old' },
    { name: '1 Samuel', chapters: 31, testament: 'old' },
    { name: '2 Samuel', chapters: 24, testament: 'old' },
    { name: '1 Kings', chapters: 22, testament: 'old' },
    { name: '2 Kings', chapters: 25, testament: 'old' },
    { name: '1 Chronicles', chapters: 29, testament: 'old' },
    { name: '2 Chronicles', chapters: 36, testament: 'old' },
    { name: 'Ezra', chapters: 10, testament: 'old' },
    { name: 'Nehemiah', chapters: 13, testament: 'old' },
    { name: 'Esther', chapters: 10, testament: 'old' },
    { name: 'Job', chapters: 42, testament: 'old' },
    { name: 'Psalms', chapters: 150, testament: 'old' },
    { name: 'Proverbs', chapters: 31, testament: 'old' },
    { name: 'Ecclesiastes', chapters: 12, testament: 'old' },
    { name: 'Song of Solomon', chapters: 8, testament: 'old' },
    { name: 'Isaiah', chapters: 66, testament: 'old' },
    { name: 'Jeremiah', chapters: 52, testament: 'old' },
    { name: 'Lamentations', chapters: 5, testament: 'old' },
    { name: 'Ezekiel', chapters: 48, testament: 'old' },
    { name: 'Daniel', chapters: 12, testament: 'old' },
    { name: 'Hosea', chapters: 14, testament: 'old' },
    { name: 'Joel', chapters: 3, testament: 'old' },
    { name: 'Amos', chapters: 9, testament: 'old' },
    { name: 'Obadiah', chapters: 1, testament: 'old' },
    { name: 'Jonah', chapters: 4, testament: 'old' },
    { name: 'Micah', chapters: 7, testament: 'old' },
    { name: 'Nahum', chapters: 3, testament: 'old' },
    { name: 'Habakkuk', chapters: 3, testament: 'old' },
    { name: 'Zephaniah', chapters: 3, testament: 'old' },
    { name: 'Haggai', chapters: 2, testament: 'old' },
    { name: 'Zechariah', chapters: 14, testament: 'old' },
    { name: 'Malachi', chapters: 4, testament: 'old' },
    
    // New Testament
    { name: 'Matthew', chapters: 28, testament: 'new' },
    { name: 'Mark', chapters: 16, testament: 'new' },
    { name: 'Luke', chapters: 24, testament: 'new' },
    { name: 'John', chapters: 21, testament: 'new' },
    { name: 'Acts', chapters: 28, testament: 'new' },
    { name: 'Romans', chapters: 16, testament: 'new' },
    { name: '1 Corinthians', chapters: 16, testament: 'new' },
    { name: '2 Corinthians', chapters: 13, testament: 'new' },
    { name: 'Galatians', chapters: 6, testament: 'new' },
    { name: 'Ephesians', chapters: 6, testament: 'new' },
    { name: 'Philippians', chapters: 4, testament: 'new' },
    { name: 'Colossians', chapters: 4, testament: 'new' },
    { name: '1 Thessalonians', chapters: 5, testament: 'new' },
    { name: '2 Thessalonians', chapters: 3, testament: 'new' },
    { name: '1 Timothy', chapters: 6, testament: 'new' },
    { name: '2 Timothy', chapters: 4, testament: 'new' },
    { name: 'Titus', chapters: 3, testament: 'new' },
    { name: 'Philemon', chapters: 1, testament: 'new' },
    { name: 'Hebrews', chapters: 13, testament: 'new' },
    { name: 'James', chapters: 5, testament: 'new' },
    { name: '1 Peter', chapters: 5, testament: 'new' },
    { name: '2 Peter', chapters: 3, testament: 'new' },
    { name: '1 John', chapters: 5, testament: 'new' },
    { name: '2 John', chapters: 1, testament: 'new' },
    { name: '3 John', chapters: 1, testament: 'new' },
    { name: 'Jude', chapters: 1, testament: 'new' },
    { name: 'Revelation', chapters: 22, testament: 'new' }
  ];
}

// Get chapters for a specific book
export function getChaptersForBook(bookName: string): number[] {
  const book = getBibleBooks().find(b => b.name.toLowerCase() === bookName.toLowerCase());
  if (!book) return [];
  return Array.from({ length: book.chapters }, (_, i) => i + 1);
}

// Get a book by name (case-insensitive)
export function getBookByName(bookName: string): {name: string; chapters: number; testament: string} | undefined {
  return getBibleBooks().find(
    b => b.name.toLowerCase() === bookName.toLowerCase()
  );
}
