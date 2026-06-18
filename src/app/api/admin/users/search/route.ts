import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { authenticateUser } from '@/lib/auth';

const DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');
const ADMIN_ROLES = ['Admin', 'Super Admin'];

// GET /api/admin/users/search?q=... — lightweight user search for notification compose
export async function GET(request: Request) {
  const { user, error } = await authenticateUser(request);
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  if (!ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ users: [] });

  const db = new Database(DB_PATH, { readonly: true, timeout: 5000 });
  try {
    const term = `%${q}%`;
    const users = db.prepare(`
      SELECT id, first_name, last_name, email, role
      FROM users
      WHERE is_active = 1
        AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
             OR (first_name || ' ' || last_name) LIKE ?)
      ORDER BY last_name, first_name
      LIMIT 10
    `).all(term, term, term, term) as any[];

    return NextResponse.json({ users });
  } finally {
    db.close();
  }
}
