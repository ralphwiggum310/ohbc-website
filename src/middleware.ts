import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const debug = process.env.NODE_ENV === 'development';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/admin',
];

// Public paths that should be accessible without authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/signin',
  '/auth/error',
  '/bible',
  '/announcements',
  '/what-we-believe',
  '/visit',
  '/give'
];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if the current path is protected or public
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const isAuthPage = pathname.startsWith('/auth/');
  
  // Get the session token from cookies
  const sessionToken = request.cookies.get('__Secure-next-auth.session-token')?.value || 
                      request.cookies.get('next-auth.session-token')?.value;
  
  const isAuthenticated = !!sessionToken;
  
  if (debug) {
    console.log('Middleware check:', {
      pathname,
      isProtectedPath,
      isPublicPath,
      isAuthPage,
      isAuthenticated,
      hasSessionToken: !!sessionToken
    });
  }
  
  // If it's a protected route and there's no session, redirect to signin
  if (isProtectedPath && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', origin);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // If user is signed in and tries to access signin page, redirect to dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', origin));
  }
  
  // For all other paths, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
