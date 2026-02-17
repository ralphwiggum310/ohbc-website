import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Define types inline for consistency
interface BibleVersion {
  id: number;
  name: string;
  abbreviation: string;
  language: string;
}

export async function GET() {
  try {
    const result = await query<BibleVersion>('SELECT * FROM bible_versions ORDER BY name', []);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bible versions' },
      { status: 500 }
    );
  }
}
