import { createAuthClient } from "better-auth/react"

// Auto-detect the base URL based on environment
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // Browser: use current origin
        return window.location.origin;
    }
    // Server: use env var or localhost
    return process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : "http://localhost:3000";
};

export const authClient = createAuthClient({
    baseURL: getBaseURL()
})

export const { signIn, signUp, signOut, useSession } = authClient
