import { NextResponse } from 'next/server';

// Base URL for the Bible API
const API_BASE_URL = 'https://api.scripture.api.bible/v1/bibles';

// API key for the Bible API - ensure this is set in your .env.local file
const API_KEY = process.env.BIBLE_API_KEY;

if (!API_KEY) {
  console.error('ERROR: BIBLE_API_KEY is not set in environment variables');
}

// Bible version IDs with their supported testaments
const BIBLE_VERSIONS = {
  'KJV': { 
    id: 'de4e12af7f28f599-01',
    name: 'King James Version',
    hasOT: true,
    hasNT: true
  },
  'NASB1995': {
    id: 'de4e12af7f28f599-02',
    name: 'NASB 1995',
    hasOT: true,
    hasNT: true
  }
};

// Check if a book is in the Old Testament
function isOldTestament(book: string): boolean {
  const otBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];
  return otBooks.includes(book);
}

// Map book names to their abbreviations and IDs
const BOOK_MAPPING: Record<string, { id: string; abbr: string }> = {
  // Old Testament
  'Genesis': { id: 'GEN', abbr: 'Gen' },
  'Exodus': { id: 'EXO', abbr: 'Exod' },
  'Leviticus': { id: 'LEV', abbr: 'Lev' },
  'Numbers': { id: 'NUM', abbr: 'Num' },
  'Deuteronomy': { id: 'DEU', abbr: 'Deut' },
  'Joshua': { id: 'JOS', abbr: 'Josh' },
  'Judges': { id: 'JDG', abbr: 'Judg' },
  'Ruth': { id: 'RUT', abbr: 'Ruth' },
  '1 Samuel': { id: '1SA', abbr: '1Sam' },
  '2 Samuel': { id: '2SA', abbr: '2Sam' },
  '1 Kings': { id: '1KI', abbr: '1Kgs' },
  '2 Kings': { id: '2KI', abbr: '2Kgs' },
  '1 Chronicles': { id: '1CH', abbr: '1Chr' },
  '2 Chronicles': { id: '2CH', abbr: '2Chr' },
  'Ezra': { id: 'EZR', abbr: 'Ezra' },
  'Nehemiah': { id: 'NEH', abbr: 'Neh' },
  'Esther': { id: 'EST', abbr: 'Esth' },
  'Job': { id: 'JOB', abbr: 'Job' },
  'Psalms': { id: 'PSA', abbr: 'Ps' },
  'Proverbs': { id: 'PRO', abbr: 'Prov' },
  'Ecclesiastes': { id: 'ECC', abbr: 'Eccl' },
  'Song of Solomon': { id: 'SNG', abbr: 'Song' },
  'Isaiah': { id: 'ISA', abbr: 'Isa' },
  'Jeremiah': { id: 'JER', abbr: 'Jer' },
  'Lamentations': { id: 'LAM', abbr: 'Lam' },
  'Ezekiel': { id: 'EZK', abbr: 'Ezek' },
  'Daniel': { id: 'DAN', abbr: 'Dan' },
  'Hosea': { id: 'HOS', abbr: 'Hos' },
  'Joel': { id: 'JOL', abbr: 'Joel' },
  'Amos': { id: 'AMO', abbr: 'Amos' },
  'Obadiah': { id: 'OBA', abbr: 'Obad' },
  'Jonah': { id: 'JON', abbr: 'Jonah' },
  'Micah': { id: 'MIC', abbr: 'Mic' },
  'Nahum': { id: 'NAM', abbr: 'Nah' },
  'Habakkuk': { id: 'HAB', abbr: 'Hab' },
  'Zephaniah': { id: 'ZEP', abbr: 'Zeph' },
  'Haggai': { id: 'HAG', abbr: 'Hag' },
  'Zechariah': { id: 'ZEC', abbr: 'Zech' },
  'Malachi': { id: 'MAL', abbr: 'Mal' },
  // New Testament
  'Matthew': { id: 'MAT', abbr: 'Matt' },
  'Mark': { id: 'MRK', abbr: 'Mark' },
  'Luke': { id: 'LUK', abbr: 'Luke' },
  'John': { id: 'JHN', abbr: 'John' },
  'Acts': { id: 'ACT', abbr: 'Acts' },
  'Romans': { id: 'ROM', abbr: 'Rom' },
  '1 Corinthians': { id: '1CO', abbr: '1Cor' },
  '2 Corinthians': { id: '2CO', abbr: '2Cor' },
  'Galatians': { id: 'GAL', abbr: 'Gal' },
  'Ephesians': { id: 'EPH', abbr: 'Eph' },
  'Philippians': { id: 'PHP', abbr: 'Phil' },
  'Colossians': { id: 'COL', abbr: 'Col' },
  '1 Thessalonians': { id: '1TH', abbr: '1Thess' },
  '2 Thessalonians': { id: '2TH', abbr: '2Thess' },
  '1 Timothy': { id: '1TI', abbr: '1Tim' },
  '2 Timothy': { id: '2TI', abbr: '2Tim' },
  'Titus': { id: 'TIT', abbr: 'Titus' },
  'Philemon': { id: 'PHM', abbr: 'Phlm' },
  'Hebrews': { id: 'HEB', abbr: 'Heb' },
  'James': { id: 'JAS', abbr: 'Jas' },
  '1 Peter': { id: '1PE', abbr: '1Pet' },
  '2 Peter': { id: '2PE', abbr: '2Pet' },
  '1 John': { id: '1JN', abbr: '1John' },
  '2 John': { id: '2JN', abbr: '2John' },
  '3 John': { id: '3JN', abbr: '3John' },
  'Jude': { id: 'JUD', abbr: 'Jude' },
  'Revelation': { id: 'REV', abbr: 'Rev' },
  // All books included
};

// Helper function to make API requests with error handling
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  if (!API_KEY) {
    throw new Error('Bible API key is not configured');
  }

  const headers = {
    'api-key': API_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    console.log(`Making request to: ${url}`);
    const response = await fetch(url, { 
      ...options, 
      headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const versionKey = (searchParams.get('version') || 'NASB1995') as keyof typeof BIBLE_VERSIONS;
  const version = BIBLE_VERSIONS[versionKey];
  
  if (!version) {
    return NextResponse.json(
      { error: 'Invalid Bible version specified' },
      { status: 400 }
    );
  }
  
  try {
    if (!API_KEY) {
      throw new Error('Bible API key is not configured');
    }

    if (book && chapter) {
      const bookInfo = BOOK_MAPPING[book];
      if (!bookInfo) {
        throw new Error(`Book not found: ${book}`);
      }

      // Check if the requested book is in the OT and if the version supports it
      const isOT = isOldTestament(book);
      if (isOT && !version.hasOT) {
        return NextResponse.json(
          { 
            error: `The ${version.name} (${versionKey}) does not include the Old Testament. Please try a different version like KJV, NASB, or ESV.` 
          },
          { status: 403 }
        );
      }

      const passageId = `${bookInfo.id}.${chapter}`;
      
      // Use the chapters endpoint for all versions
      const url = `${API_BASE_URL}/${version.id}/chapters/${passageId}?content-type=text`;
      
      console.log(`Fetching Bible passage: ${passageId} (${version})`);
      
      // First, try to get the chapter content
      const chapterData = await fetchWithAuth(url);
      
      if (!chapterData?.data?.content) {
        throw new Error('No content found in API response');
      }
      
      // For now, return the raw content as a single verse
      // We'll improve the parsing in subsequent steps
      return NextResponse.json({
        data: {
          reference: `${book} ${chapter}`,
          verses: [{
            id: `${passageId}.1`,
            reference: `${book} ${chapter}:1`,
            text: chapterData.data.content
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim(),
            verse: '1'
          }],
          nextChapter: null,
          previousChapter: null
        }
      });
    } else if (searchParams.get('search')) {
      // Search functionality
      const searchQuery = searchParams.get('search') || '';
      const version = searchParams.get('version') || 'NASB1995';
      const versionId = BIBLE_VERSIONS[version as keyof typeof BIBLE_VERSIONS] || BIBLE_VERSIONS['NASB1995'];
      
      const searchUrl = `${API_BASE_URL}/${versionId}/search?query=${encodeURIComponent(searchQuery)}`;
      console.log(`Searching for: ${searchQuery} in ${version}`);
      
      const searchResults = await fetchWithAuth(searchUrl);
      
      if (!searchResults.data?.verses?.length) {
        return NextResponse.json({
          data: {
            query: searchQuery,
            results: [],
            total: 0,
            message: 'No results found'
          }
        });
      }
      
      const verses = searchResults.data.verses.map((verse: any) => ({
        id: verse.id,
        reference: verse.reference,
        text: verse.text?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '',
        verse: verse.verse
      }));
      
      return NextResponse.json({
        data: {
          query: searchQuery,
          results: verses,
          total: searchResults.data.total || 0
        }
      });
    } else {
      // List all available books
      const versionId = BIBLE_VERSIONS['NASB1995']; // Default version for book list
      const booksUrl = `${API_BASE_URL}/${versionId}/books?include-chapters=false`;
      
      console.log('Fetching list of books');
      const booksData = await fetchWithAuth(booksUrl);
      
      if (!booksData.data?.length) {
        throw new Error('No books data received from API');
      }
      
      // Return a simplified list of books
      return NextResponse.json({
        data: booksData.data.map((book: any) => ({
          id: book.id,
          name: book.name,
          abbreviation: book.abbreviation
        }))
      });
    }
  } catch (error: any) {
    console.error('Bible API error:', {
      message: error.message,
      stack: error.stack,
      url: request.url
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch Bible data',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
