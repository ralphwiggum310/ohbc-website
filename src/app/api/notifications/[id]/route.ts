import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { authenticateUser } from '@/lib/auth';

const DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');
const ADMIN_ROLES = ['Admin', 'Super Admin'];

// DELETE /api/notifications/[id] — admin deletes a notification (and all recipients)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await authenticateUser(request);
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  if (!ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const db = new Database(DB_PATH, { readonly: false, timeout: 5000 });
  db.pragma('foreign_keys = ON');
  try {
    const notif = db.prepare('SELECT id, sender_id FROM notifications WHERE id = ?').get(Number(params.id)) as any;
    if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Super Admin can delete any; Admin can only delete their own
    if (user.role === 'Admin' && notif.sender_id !== user.userId) {
      return NextResponse.json({ error: 'You can only delete your own notifications' }, { status: 403 });
    }

    db.prepare('DELETE FROM notifications WHERE id = ?').run(Number(params.id));
    return NextResponse.json({ success: true });
  } finally {
    db.close();
  }
}
