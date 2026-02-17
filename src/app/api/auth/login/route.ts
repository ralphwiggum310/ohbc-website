import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Enable debug in development
const debug = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Hardcoded admin credentials
    const ADMIN_CREDENTIALS = {
      username: 'Admin',
      password: 'Ohbc@1970',
      user: {
        id: '1',
        name: 'Admin',
        email: 'orchardhillsbiblechurch@gmail.com',
        role: 'admin' as const
      }
    };

    // Verify credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Create session data
      const sessionData = {
        user: ADMIN_CREDENTIALS.user,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      
      // Create response with user data
      const response = NextResponse.json({
        success: true,
        user: ADMIN_CREDENTIALS.user,
        redirectTo: '/admin/dashboard'
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      // Set the auth cookie in the response
      response.cookies.set({
        name: 'auth_token',
        value: JSON.stringify(sessionData),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        domain: process.env.NODE_ENV === 'development' ? undefined : '.orchardhillsbiblechurch.com',
        priority: 'high'
      });
      
      // Add debug headers in development
      if (process.env.NODE_ENV === 'development') {
        response.headers.set('X-Debug-Auth', 'login-success');
        response.headers.set('X-Debug-User', ADMIN_CREDENTIALS.user.name);
      }

      return response;
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );

  } catch (error) {
    if (debug) {
      console.error('Login error:', error);
    }
    
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

// Add this to prevent caching of the login endpoint
export const dynamic = 'force-dynamic';
