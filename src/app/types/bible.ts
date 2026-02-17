export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
}

export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'old' | 'new';
}

export interface Book {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface Verse {
  id: number;
  verse: number;
  text: string;
  book?: string;
  chapter?: number;
}
