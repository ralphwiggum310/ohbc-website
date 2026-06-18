import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Define types inline for consistency
interface BibleVersion {
  id: number;
  name: string;
  abbreviation: string;
  language: string;
}

interface FormattedBibleVersion {
  id: number;
  name: string;
  abbreviation: string;
  language: string;
  displayName: string;
}

export async function GET() {
  try {
    const result = await query<BibleVersion>('SELECT * FROM bible_versions ORDER BY name', [], {}, 'bible');
    
    // Format versions to include both abbreviation and full name
    const formattedVersions: FormattedBibleVersion[] = result.rows.map(version => ({
      ...version,
      displayName: `${version.abbreviation} (${version.name})`
    }));
    
    return NextResponse.json(formattedVersions);
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bible versions' },
      { status: 500 }
    );
  }
}
