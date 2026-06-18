import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the authentication cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear cookies by setting them to expire in the past
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Delete the cookie
      path: '/'
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Delete the cookie
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
