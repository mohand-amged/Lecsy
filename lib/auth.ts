import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import { schema } from "@/db/schema"; // your drizzle schema
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key-change-in-production",
    emailAndPassword: {
        enabled: true,
        autoSignIn: false, // Require email verification
        requireEmailVerification: true,
sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
            await resend.emails.send({
                from: "Lecsy <onboarding@resend.dev>", // Use resend.dev domain for testing, change to your domain later
                to: user.email,
                subject: "Verify your email for Lecsy",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Welcome to Lecsy!</h2>
                        <p>Hi ${user.name},</p>
                        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
                        <a href="${url}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="color: #666; word-break: break-all;">${url}</p>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't create an account, you can safely ignore this email.</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px;">© 2025 Lecsy. All rights reserved.</p>
                    </div>
                `,
            });
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
     trustedOrigins: [
     "http://localhost:3000",
     "https://lecsy.vercel.app"
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 1 week in seconds
        updateAge: 60 * 60 * 24, // Update session every 24 hours
    },
    plugins: [nextCookies()],
});
