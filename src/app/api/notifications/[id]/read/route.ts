import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { authenticateUser } from '@/lib/auth';

const DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

// PATCH /api/notifications/[id]/read — mark a notification as read
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await authenticateUser(request);
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const db = new Database(DB_PATH, { readonly: false, timeout: 5000 });
  try {
    const result = db.prepare(`
      UPDATE notification_recipients
      SET read_at = CURRENT_TIMESTAMP
      WHERE notification_id = ? AND user_id = ? AND read_at IS NULL
    `).run(Number(params.id), user.userId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Not found or already read' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } finally {
    db.close();
  }
}
