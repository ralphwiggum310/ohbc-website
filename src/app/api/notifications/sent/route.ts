import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { authenticateUser } from '@/lib/auth';

const DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');
const ADMIN_ROLES = ['Admin', 'Super Admin'];

// GET /api/notifications/sent — admin view of sent notifications with recipient counts
export async function GET(request: Request) {
  const { user, error } = await authenticateUser(request);
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  if (!ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const db = new Database(DB_PATH, { readonly: true, timeout: 5000 });
  try {
    // Super Admin sees all; Admin sees only their own
    const senderFilter = user.role === 'Super Admin' ? '' : 'WHERE n.sender_id = ?';
    const params = user.role === 'Super Admin' ? [] : [user.userId];

    const rows = db.prepare(`
      SELECT
        n.id, n.title, n.message, n.type, n.target_role, n.created_at,
        u.first_name AS sender_first, u.last_name AS sender_last,
        COUNT(nr.id) AS recipient_count,
        SUM(CASE WHEN nr.read_at IS NOT NULL THEN 1 ELSE 0 END) AS read_count
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      LEFT JOIN notification_recipients nr ON nr.notification_id = n.id
      ${senderFilter}
      GROUP BY n.id
      ORDER BY n.created_at DESC
      LIMIT 200
    `).all(...params) as any[];

    return NextResponse.json({ notifications: rows });
  } finally {
    db.close();
  }
}
