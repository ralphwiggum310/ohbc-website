import Database from 'better-sqlite3';
import path from 'path';
import { authenticateUser } from '@/lib/auth';

const USERS_DB_PATH = path.join(process.cwd(), 'data', 'users', 'ohbc_users.db');

export async function PUT(request) {
  const { user, error } = await authenticateUser(request);
  if (!user) return Response.json({ error: error || 'Unauthorized' }, { status: 401 });

  const adminRoles = ['Admin', 'Super Admin'];
  if (!adminRoles.includes(user.role)) {
    return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, email, phone } = body;

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = new Database(USERS_DB_PATH);
    try {
      const updates = [];
      const params = [];

      if (email !== undefined) { updates.push('email = ?'); params.push(email); }
      if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }

      if (updates.length === 0) {
        return Response.json({ error: 'No fields to update' }, { status: 400 });
      }

      params.push(userId);
      db.prepare(
        `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(...params);

      return Response.json({ success: true, message: 'Login information updated successfully' });
    } finally {
      db.close();
    }
  } catch (err) {
    console.error('Update login info error:', err);
    return Response.json({ error: 'Failed to update login information' }, { status: 500 });
  }
}
