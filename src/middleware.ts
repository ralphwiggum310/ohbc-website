import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that should bypass certain security restrictions
const UNPROTECTED_PATHS = [
  '/_next/static',
  '/_next/webpack-hmr',
  '/_next/webpack',
  '/_next/on-demand-entries-ping',
  '/_next/data',
  '/favicon.ico'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  
  // Skip middleware for static files
  if (UNPROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    // Add basic security headers to all responses
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
