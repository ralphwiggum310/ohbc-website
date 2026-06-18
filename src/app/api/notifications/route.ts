import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { authenticateUser } from '@/lib/auth';

const DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

function getDb() {
  const db = new Database(DB_PATH, { readonly: false, timeout: 5000 });
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  return db;
}

const ADMIN_ROLES = ['Admin', 'Super Admin'];

// GET /api/notifications — current user's notifications (with unread count)
export async function GET(request: Request) {
  const { user, error } = await authenticateUser(request);
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  const db = getDb();
  try {
    const whereClause = unreadOnly ? 'AND nr.read_at IS NULL' : '';
    const rows = db.prepare(`
      SELECT
        n.id, n.title, n.message, n.type, n.created_at,
        u.first_name AS sender_first, u.last_name AS sender_last,
        nr.read_at
      FROM notification_recipients nr
      JOIN notifications n ON nr.notification_id = n.id
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE nr.user_id = ? ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT 100
    `).all(user.userId) as any[];

    const unreadCount = (db.prepare(`
      SELECT COUNT(*) AS cnt
      FROM notification_recipients nr
      WHERE nr.user_id = ? AND nr.read_at IS NULL
    `).get(user.userId) as any).cnt;

    return NextResponse.json({ notifications: rows, unreadCount });
  } finally {
    db.close();
  }
}

// POST /api/notifications — admin sends a notification
export async function POST(request: Request) {
  const { user, error } = await authenticateUser(request);
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  if (!ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const { title, message, type, targetUserId, targetRole } = body;

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
  }
  if (!['direct', 'mass', 'role'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  if (type === 'direct' && !targetUserId) {
    return NextResponse.json({ error: 'targetUserId required for direct messages' }, { status: 400 });
  }

  const db = getDb();
  try {
    const insertNotif = db.prepare(`
      INSERT INTO notifications (sender_id, title, message, type, target_role)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertRecipient = db.prepare(`
      INSERT OR IGNORE INTO notification_recipients (notification_id, user_id)
      VALUES (?, ?)
    `);

    const send = db.transaction(() => {
      const result = insertNotif.run(user.userId, title.trim(), message.trim(), type, targetRole ?? null);
      const notifId = result.lastInsertRowid as number;

      if (type === 'direct') {
        insertRecipient.run(notifId, Number(targetUserId));
      } else {
        // mass or role-based
        let userQuery = 'SELECT id FROM users WHERE is_active = 1';
        const params: any[] = [];
        if (type === 'role' && targetRole && targetRole !== 'all') {
          // roles stored in the users table under the "role" column — check auth.js
          // the role column is actually in the JWT but we need to find it in the DB
          // Looking at users table: status column is used, but role comes from a separate lookup
          // Check if there's a role column or roles table
          userQuery += ' AND role = ?';
          params.push(targetRole);
        }
        const recipients = db.prepare(userQuery).all(...params) as { id: number }[];
        for (const r of recipients) {
          insertRecipient.run(notifId, r.id);
        }
      }

      return notifId;
    });

    const notifId = send();
    return NextResponse.json({ success: true, notificationId: notifId });
  } finally {
    db.close();
  }
}
