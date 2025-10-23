import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import { schema } from "@/db/schema"; // your drizzle schema
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key-change-in-production",
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
     trustedOrigins: [
     "http://localhost:3000",
     "https://lecsy.vercel.app"
    ],
    plugins: [nextCookies()],
});
