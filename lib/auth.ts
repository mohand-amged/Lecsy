import { betterAuth } from "better-auth";
import { getDatabase } from "./db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export const auth = betterAuth({
    database: mongodbAdapter(await getDatabase()),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        }
    },
    secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
});