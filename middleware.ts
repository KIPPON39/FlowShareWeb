import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

// Paths that require authentication
const protectedPaths = ['/upload'];
// Paths that are strictly for unauthenticated users
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Quick check if path needs protection
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // Allow unrestricted paths immediately
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  // Get and verify session
  const session = request.cookies.get('session')?.value;
  const payload = await decrypt(session);
  const isAuthenticated = !!payload;

  // Redirect to login if accessing protected path without auth
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard/home if accessing login/register while already authenticated
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/flows', request.url));
  }

  return NextResponse.next();
}

// Optimization: only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
