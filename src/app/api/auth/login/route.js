import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();

    // Support both identifier and email field names
    const identifier = body.identifier || body.email;
    const password = body.password;

    // Validate required fields
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/phone and password are required' },
        { status: 400 }
      );
    }

    // Attempt login
    const result = await loginUser(identifier, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      expiresIn: result.tokens.expiresIn
    });

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    };

    response.cookies.set('accessToken', result.tokens.accessToken, {
      ...cookieOptions,
      maxAge: result.tokens.expiresIn,
    });

    response.cookies.set('refreshToken', result.tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
