import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDatabaseForAuth } from "./db";
import nextConfig from "@/next.config";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: mongodbAdapter(await getDatabaseForAuth()),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: process.env.NODE_ENV === "production",
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        }
    },
    plugins: [nextCookies()],
    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
        crossSubDomainCookies: {
          enabled: true,
        },
    },
    trustedOrigins: [
        "http://localhost:3000", 
        "https://lecsy.vercel.app",
        ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : [])
    ],
    secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL,
});