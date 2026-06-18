import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'bible', 'bibles.db');

interface RawVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  book_name: string;
  testament: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get('version');
  const q = searchParams.get('q')?.trim();
  const mode = searchParams.get('mode') ?? 'similar'; // 'similar' | 'exact'
  const caseSensitive = searchParams.get('caseSensitive') === 'true';

  if (!versionId || !q) {
    return NextResponse.json({ error: 'Version and query are required' }, { status: 400 });
  }

  const db = new Database(DB_PATH, { readonly: true });
  try {
    // Toggle case sensitivity for LIKE at the connection level
    if (caseSensitive) {
      db.pragma('case_sensitive_like = ON');
    }

    // Pull all candidate verses via LIKE (fast DB filter)
    const rows = db.prepare(`
      SELECT v.id, v.book_id, v.chapter, v.verse, v.text,
             b.name AS book_name, b.testament
      FROM   verses v
      JOIN   books  b ON v.book_id = b.id
      WHERE  v.version_id = ? AND v.text LIKE ?
      ORDER  BY v.book_id, v.chapter, v.verse
    `).all(Number(versionId), `%${q}%`) as RawVerse[];

    let results = rows;

    // For exact-word mode, refine with JS regex word boundaries
    if (mode === 'exact') {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, caseSensitive ? '' : 'i');
      results = rows.filter(v => regex.test(v.text));
    }

    return NextResponse.json({ results, total: results.length });
  } finally {
    db.close();
  }
}
