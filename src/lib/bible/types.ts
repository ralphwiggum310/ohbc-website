export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
}

export interface BibleBook {
  name: string;
  chapters: {
    [chapterNumber: string]: BibleVerse[];
  };
  testament: 'old' | 'new';
}

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleData {
  version: string;
  name: string;
  language: string;
  books: {
    [bookName: string]: BibleBook;
  };
}

export interface BibleReference {
  book: string;
  chapter: number;
  verse?: number;
}

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleVerseWithReference extends BibleVerse {
  book: string;
  chapter: number;
  reference: string;
  version: string;
}
