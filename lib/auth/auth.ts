import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins"
import { sendEmail } from "../email"

const prisma = new PrismaClient()
export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseUrl: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "mongodb", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    plugins: [emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        overrideDefaultEmailVerification: true,
        async sendVerificationOTP({ email, otp }) {
            await sendEmail({
                to: email,
                subject: "Verify your email",
                text: `Your verification code is ${otp}`,
            });
        },
    })],
})