import { NextResponse } from 'next/server';
import { getVerses } from '@/lib/db/bible-db';

// Define types inline for consistency
interface BibleVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ versionId: string; bookId: string; chapter: string }> }
) {
  try {
    const { versionId, bookId, chapter } = await params;
    const chapterNum = parseInt(chapter, 10); // Chapter should be number
    
    if (!versionId || !bookId || isNaN(chapterNum)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const verses = await getVerses(versionId, bookId, chapterNum);
    return NextResponse.json(verses);
  } catch (error) {
    console.error('Error fetching Bible verses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bible verses' },
      { status: 500 }
    );
  }
}
