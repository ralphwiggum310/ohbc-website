import { NextResponse } from 'next/server';
import { getChapters } from '@/lib/db/bible-db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ versionId: string; bookId: string }> }
) {
  try {
    const { versionId, bookId } = await params;
    
    if (!versionId || !bookId) {
      return NextResponse.json(
        { error: 'Invalid version or book ID' },
        { status: 400 }
      );
    }

    const chapters = await getChapters(versionId, bookId);
    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Error fetching chapter count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter count' },
      { status: 500 }
    );
  }
}
