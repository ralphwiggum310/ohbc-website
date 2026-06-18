import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Check if token exists and is not expired
    const result = await query(
      'SELECT id FROM members WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const userId = result.rows[0].id;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await query(
      'UPDATE members SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, userId]
    );

    return NextResponse.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
