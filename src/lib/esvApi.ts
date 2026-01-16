import { BIBLE_BOOKS } from '../app/data/bibleData';

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

interface Verse {
  verse: number | string;
  text: string;
}

export const fetchEsvChapter = async (
  bookName: string,
  chapter: number,
  apiKey: string
): Promise<{ verses: Verse[]; reference: string }> => {
  try {
    const book = getEsvBookName(bookName);
    const passage = `${book}+${chapter}`;
    const url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(passage)}&include-headings=false&include-footnotes=false&include-verse-numbers=true&include-short-copyright=false&include-passage-references=false`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response into verses
    const verses: Verse[] = [];
    const verseRegex = /\[(\d+)\]\s*([^\[]+)/g;
    let match;
    
    while ((match = verseRegex.exec(data.passages[0])) !== null) {
      verses.push({
        verse: match[1],
        text: match[2].trim(),
      });
    }

    return {
      verses,
      reference: data.canonical,
    };
  } catch (error) {
    console.error('Error fetching from ESV API:', error);
    throw new Error('Failed to fetch Bible text. Please try again later.');
  }
};

// Get list of available books
export const getAvailableBooks = () => {
  return BIBLE_BOOKS;
};

// Get available translations
export const getAvailableTranslations = () => {
  return [
    { id: 'ESV', name: 'English Standard Version' },
  ];
};
