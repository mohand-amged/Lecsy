# Email Verification Setup Guide

## ✅ Completed
- ✅ Installed Resend package
- ✅ Configured Better Auth with email verification
- ✅ Created verification email page (`/verify-email`)
- ✅ Updated signup flow with "Check your email" message
- ✅ Updated proxy.ts to block unverified users

## 🔑 Get Your Resend API Key

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email

### Step 2: Get API Key
1. Go to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Give it a name like "Lecsy Production"
4. Copy the API key (starts with `re_...`)

### Step 3: Add to Environment Variables
1. Open `.env` file
2. Replace `your_resend_api_key_here` with your actual API key:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   ```

### Step 4: Configure Email Domain (Optional for Testing)
For testing, you can use Resend's test domain: `onboarding@resend.dev`

For production:
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Add `lecsy.vercel.app` (or your domain)
4. Follow DNS verification steps
5. Update `lib/auth.ts` line 18 to use your domain:
   ```typescript
   from: "Lecsy <noreply@lecsy.vercel.app>",
   ```

## 🧪 Testing the Flow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Sign up for a new account:**
   - Go to `http://localhost:3000/signup`
   - Fill in name, email, and password
   - Submit the form

3. **Check for email:**
   - You should see "Check Your Email" message
   - Check your inbox for verification email from Lecsy
   - Check spam folder if not in inbox

4. **Verify email:**
   - Click the verification link in email
   - You should be redirected to `/verify-email`
   - After verification, you'll be redirected to `/login`

5. **Log in:**
   - Use your credentials to log in
   - You should now have access to `/dashboard`

## 🔒 Security Features

- ✅ Users cannot access dashboard without email verification
- ✅ Verification links expire after 24 hours
- ✅ Sessions last 1 week with auto-refresh every 24 hours
- ✅ All verification handled server-side via Better Auth

## 📧 Email Template

The verification email includes:
- Welcome message with user's name
- Blue "Verify Email" button
- Plain text backup link
- 24-hour expiration notice
- Lecsy branding

## 🐛 Troubleshooting

**Emails not sending?**
- Check RESEND_API_KEY is set correctly in `.env`
- Restart your dev server after adding the key
- Check Resend dashboard logs for errors

**Verification link not working?**
- Ensure link wasn't edited/truncated
- Check if link expired (24 hours)
- Try signing up again with a new account

**Still redirected to verify-email after verification?**
- Log out and log back in
- Clear browser cookies
- Check database that `emailVerified` is set to true

## 📝 Files Modified

- `lib/auth.ts` - Added email verification config
- `app/signup/page.tsx` - Added email sent confirmation
- `app/verify-email/page.tsx` - Created verification page
- `proxy.ts` - Added email verification check
- `.env` - Added RESEND_API_KEY

## 🚀 Production Deployment

When deploying to Vercel:
1. Add `RESEND_API_KEY` to Vercel environment variables
2. Update `BETTER_AUTH_URL` to your production URL
3. Add production domain to Resend
4. Update `from` email in `lib/auth.ts` to use your domain

---

**Need Help?** Check the Resend docs: https://resend.com/docs
