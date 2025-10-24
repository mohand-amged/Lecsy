import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
    // Get session from Better Auth
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // Check if user is authenticated
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if email is verified
    if (!session.user.emailVerified) {
        // Allow access to verify-email page
        if (request.nextUrl.pathname !== "/verify-email") {
            return NextResponse.redirect(new URL("/verify-email?message=Please verify your email to continue", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard"], // Specify the routes the middleware applies to
};

