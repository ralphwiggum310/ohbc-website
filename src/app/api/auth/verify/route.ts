import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const authToken = (await cookies()).get('auth_token')?.value;
    
    console.log('Session verification - auth token:', authToken ? 'present' : 'missing');
    
    if (!authToken) {
      return NextResponse.json(
        { authenticated: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Parse the JSON session token
    let sessionData;
    try {
      sessionData = JSON.parse(authToken);
    } catch (error) {
      return NextResponse.json(
        { authenticated: false, message: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Check if session has expired
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      return NextResponse.json(
        { authenticated: false, message: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: sessionData.user
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
