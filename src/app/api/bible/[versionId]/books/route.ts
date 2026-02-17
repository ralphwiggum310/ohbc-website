import { NextResponse } from 'next/server';
import { getBooks } from '@/lib/db/bible-db';

// Define types inline for consistency
interface BibleBook {
  id: number;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
  abbreviation: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await params;
    
    console.log(`[API] Fetching books for version: ${versionId}`);
    
    if (!versionId) {
      return NextResponse.json(
        { error: 'Invalid version ID' },
        { status: 400 }
      );
    }

    const books = await getBooks(versionId);
    console.log(`[API] Found ${books.length} books`);
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching Bible books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bible books' },
      { status: 500 }
    );
  }
}
