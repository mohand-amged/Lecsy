import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for session cookie
  const sessionCookie = request.cookies.get('better-auth.session_token')
  const isAuthenticated = !!sessionCookie
  
  // Define public routes
  const publicRoutes = ['/', '/landing', '/auth/signin', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(pathname) || 
                       pathname.startsWith('/api/auth') || 
                       pathname.startsWith('/_next') ||
                       pathname.includes('favicon')
  
  // Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL('/auth/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Redirect root to landing for unauthenticated users
  if (pathname === '/' && !isAuthenticated) {
    const landingUrl = new URL('/landing', request.url)
    return NextResponse.redirect(landingUrl)
  }
  
  // Redirect root to dashboard for authenticated users
  if (pathname === '/' && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
