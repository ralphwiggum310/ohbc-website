import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      address,
      city,
      state,
      zip,
      occupation,
      company,
    } = await request.json();

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM members WHERE email = ?', [email]);
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with 'Pending' status
    const result = await query(
      `INSERT INTO members (
        first_name, last_name, email, password, phone, address_street, 
        address_city, address_state, address_zip, occupation, company, 
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
      [
        first_name,
        last_name,
        email,
        hashedPassword,
        phone,
        address,
        city,
        state,
        zip,
        occupation,
        company,
      ]
    );

    // TODO: Send notification email to Super Admins for approval
    // await sendApprovalNotificationEmail(email, first_name, last_name);

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Your account is pending approval by a Super Admin.',
      userId: result.rows[0]?.id || null
    });

  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
