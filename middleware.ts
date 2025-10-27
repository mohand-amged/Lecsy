import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Define protected paths that require authentication
const protectedPaths = ["/dashboard", "/profile", "/settings", "/history", "/chat", "/subscription"];

// Define public paths that should be accessible without authentication
const publicPaths = ["/", "/login", "/signup", "/forget-password", "/api/auth"];

/**
 * Middleware to handle authentication and route protection
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if the current path is public
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // Allow public paths without session check
  if (isPublic && !isProtected) {
    return NextResponse.next();
  }

  // For protected paths, validate session
  if (isProtected) {
    try {
      // Get session using Better Auth API
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // If no valid session, redirect to login
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        
        console.warn(`Unauthorized access attempt to ${pathname}`);
        return NextResponse.redirect(loginUrl);
      }

      // Session refresh logic - check if session needs updating
      if (session.session) {
        const now = Date.now();
        const sessionAge = now - new Date(session.session.createdAt).getTime();
        const updateAge = 60 * 60 * 24 * 1000; // 24 hours in milliseconds

        // If session is older than updateAge, it will be automatically refreshed by Better Auth
        if (sessionAge > updateAge) {
          console.info(`Session refresh triggered for user ${session.user.id}`);
        }
      }

      // Log successful authentication for monitoring
      console.info(`Authenticated request to ${pathname} by user ${session.user.id}`);
    } catch (error) {
      // Log the session validation error
      console.error(`Session validation error for ${pathname}:`, error);
      
      // Only show session_error if it's actually a session/auth issue
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      
      // Only add error param if it looks like an actual session issue
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes('session') || 
          errorMessage.toLowerCase().includes('auth') ||
          errorMessage.toLowerCase().includes('token')) {
        loginUrl.searchParams.set("error", "session_error");
      }
      
      return NextResponse.redirect(loginUrl);
    }
  }

  // For non-protected paths, continue
  return NextResponse.next();
}

// Configure which routes should be processed by this proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

