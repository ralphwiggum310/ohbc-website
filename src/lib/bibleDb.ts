import { query } from './db';

export interface BibleVersion {
  id: number;
  name: string;
  abbreviation: string;
  language: string;
}

export interface BibleBook {
  id: number;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
  abbreviation: string;
}

export interface BibleVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

export async function getBibleVersions(): Promise<BibleVersion[]> {
  try {
    const result = await query<BibleVersion>('SELECT * FROM bible_versions ORDER BY name', []);
    return result.rows;
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    return [];
  }
}

export async function getBibleBooks(versionId: number): Promise<BibleBook[]> {
  try {
    const result = await query<BibleBook>(
      'SELECT * FROM bible_books WHERE version_id = ? ORDER BY id',
      [versionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching Bible books:', error);
    return [];
  }
}

export async function getBibleChapters(versionId: number, bookId: number): Promise<number> {
  try {
    const result = await query<{chapters: number}>(
      'SELECT chapters FROM bible_books WHERE version_id = ? AND id = ?',
      [versionId, bookId]
    );
    return result.rows[0]?.chapters || 0;
  } catch (error) {
    console.error('Error fetching chapter count:', error);
    return 0;
  }
}

export async function getBibleVerses(
  versionId: number,
  bookId: number,
  chapter: number
): Promise<BibleVerse[]> {
  try {
    const result = await query<BibleVerse>(
      `SELECT v.* 
       FROM bible_verses v
       JOIN bible_books b ON v.book_id = b.id
       WHERE b.version_id = ? AND v.book_id = ? AND v.chapter = ?
       ORDER BY v.verse`,
      [versionId, bookId, chapter]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching Bible verses:', error);
    return [];
  }
}

export async function searchVerses(
  versionId: string,
  searchTerm: string,
  limit: number = 50,
  offset: number = 0
): Promise<{verses: BibleVerse[], total: number}> {
  try {
    const searchQuery = `%${searchTerm}%`;
    const [versesResult, countResult] = await Promise.all([
      query<BibleVerse>(
        `SELECT v.* 
         FROM bible_verses v
         JOIN bible_books b ON v.book_id = b.id
         WHERE b.version_id = ? AND v.text LIKE ?
         ORDER BY v.book_id, v.chapter, v.verse
         LIMIT ? OFFSET ?`,
        [versionId, searchQuery, limit, offset]
      ),
      query<{count: number}>(
        `SELECT COUNT(*) as count
         FROM bible_verses v
         JOIN bible_books b ON v.book_id = b.id
         WHERE b.version_id = ? AND v.text LIKE ?`,
        [versionId, searchQuery]
      )
    ]);

    return {
      verses: versesResult.rows,
      total: countResult.rows[0]?.count || 0
    };
  } catch (error) {
    console.error('Error searching Bible:', error);
    return { verses: [], total: 0 };
  }
}
