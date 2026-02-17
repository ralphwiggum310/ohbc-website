import { NextResponse } from 'next/server';
import { searchVerses } from '@/lib/bibleDb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get('version');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!versionId || !query) {
      return NextResponse.json(
        { error: 'Version ID and search query are required' },
        { status: 400 }
      );
    }

    const versionNumber = parseInt(versionId, 10);
    if (isNaN(versionNumber)) {
      return NextResponse.json(
        { error: 'Invalid version ID' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;
    const { verses, total } = await searchVerses(versionId, query, limit, offset);

    return NextResponse.json({
      results: verses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching Bible:', error);
    return NextResponse.json(
      { error: 'Failed to search Bible' },
      { status: 500 }
    );
  }
}
