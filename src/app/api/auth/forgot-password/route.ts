import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists in database
    const result = await query(
      'SELECT id, first_name, last_name FROM members WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal that user doesn't exist for security
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await query(
      'UPDATE members SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry.toISOString(), user.id]
    );

    // TODO: Send email with reset link
    // For now, we'll just return the token (in production, you'd send an email)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    console.log('Password reset link:', resetUrl); // For development only

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
