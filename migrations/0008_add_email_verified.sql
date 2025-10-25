-- Add emailVerified column to user table for better-auth email/password support
ALTER TABLE "user" ADD COLUMN "email_verified" timestamp;
