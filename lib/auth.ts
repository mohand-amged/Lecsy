import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import { schema } from "@/db/schema"; // your drizzle schema
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key-change-in-production",
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 6,
        maxPasswordLength: 128,
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    trustedOrigins: [
        "http://localhost:3000",
        "https://lecsy.vercel.app",
        "https://*.vercel.app"
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 1 week in seconds
        updateAge: 60 * 60 * 24, // Update session every 24 hours
    },
    advanced: {
        // CSRF protection is enabled by default in Better Auth
        useSecureCookies: process.env.NODE_ENV === "production",
        crossSubDomainCookies: {
            enabled: false,
        },
    },
    plugins: [nextCookies()],
});
