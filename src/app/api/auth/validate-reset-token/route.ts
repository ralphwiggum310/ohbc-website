import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Check if token exists and is not expired
    const result = await query(
      'SELECT id FROM members WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error('Error validating reset token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
