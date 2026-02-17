import { NextResponse } from 'next/server';

// For debugging - log all requests
console.log('Login endpoint loaded');

export async function POST(request: Request) {
  console.log('Login request received');
  
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { username, password } = body;
    
    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Hardcoded credentials for now
    const isAuthenticated = username === 'Admin' && password === 'Ohbc@1970';
    console.log('Authentication result:', { isAuthenticated, username });
    
    if (isAuthenticated) {
      // Create a session token
      const sessionToken = `session_${Date.now()}`;
      console.log('Generated session token:', sessionToken);
      
      // Create response with user data
      const response = NextResponse.json({ 
        success: true,
        message: 'Authentication successful',
        user: {
          id: '1',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'admin'
        },
        timestamp: new Date().toISOString()
      });
      
      // Set the session cookie in the response
      const cookieOptions = {
        name: 'auth_token',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      };
      
      console.log('Setting cookie with options:', JSON.stringify(cookieOptions, null, 2));
      response.cookies.set(cookieOptions);
      
      // Add debug headers
      response.headers.set('X-Auth-Debug', 'session-created');
      response.headers.set('X-Session-Expires', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      
      console.log('Sending success response with cookie');
      return response;
    }
    
    console.log('Authentication failed: invalid credentials');
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid credentials',
        timestamp: new Date().toISOString()
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
