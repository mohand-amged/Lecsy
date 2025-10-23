# Lecsy Security & Authorization Improvement Roadmap

**Timeline**: 2 Weeks + 1 Day (11 Working Days Total)  
**Last Updated**: 2025-10-23  
**Status**: Planning Phase

**Phase 0**: Day 0 - Next.js 16 Upgrade (MUST DO FIRST)  
**Phase 1**: Week 1 (Days 1-5) - Critical Security Foundations  
**Phase 2**: Week 2 (Days 6-10) - Enhanced Security Features

---

## Overview

This roadmap addresses critical security gaps in the Lecsy authentication and authorization system. The implementation is divided into two weeks with specific, actionable tasks.

**⚠️ CRITICAL**: You must complete the Next.js 16 upgrade (Day 0) BEFORE starting Week 1 to ensure compatibility with all security implementations.

---

## Day 0: Next.js 16 Upgrade (Prerequisite)

**Priority**: 🔴 Critical  
**Estimated Time**: 3-4 hours  
**Must Complete Before**: Starting Week 1

### Why This is Important:
Next.js 16.0 was released and includes:
- **Security improvements** in middleware and authentication handling
- **Performance optimizations** for server components
- **Better TypeScript support** (required for Better Auth compatibility)
- **Enhanced App Router stability** (critical for protected routes)
- **Breaking changes** that could conflict with security implementations

⚠️ **IMPORTANT**: Upgrade BEFORE implementing security features to avoid rework and compatibility issues.

### Tasks:
- [ ] Backup current codebase
  ```bash
  git checkout -b upgrade/nextjs-16
  git commit -am "Pre-upgrade checkpoint"
  ```
- [ ] Review Next.js 16 breaking changes
  - Visit: https://nextjs.org/blog/next-16
  - Check migration guide for App Router changes
  - Note any API changes affecting middleware
- [ ] Update Next.js and related dependencies
  ```bash
  npm install next@latest react@latest react-dom@latest
  npm install eslint-config-next@latest
  ```
- [ ] Update other critical dependencies
  ```bash
  npm install better-auth@latest
  npm install @types/node@latest
  npm install eslint@latest
  npm install tailwindcss@latest @tailwindcss/postcss@latest
  ```
- [ ] Check for deprecated APIs in your code
  - Search for `headers()` usage - may have changed
  - Check `middleware.ts` for API updates
  - Review `route.ts` handlers for changes
- [ ] Update TypeScript configuration if needed
  ```json
  // tsconfig.json - May need updates for Next.js 16
  {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["ES2022", "DOM", "DOM.Iterable"],
      // Check Next.js 16 docs for required settings
    }
  }
  ```
- [ ] Test core functionality
  ```bash
  npm run dev
  # Test:
  # - Login/Signup flows
  # - Dashboard access
  # - File upload
  # - API routes
  ```
- [ ] Run build to check for errors
  ```bash
  npm run build
  ```
- [ ] Fix any type errors or warnings
- [ ] Update middleware.ts if API changed
  ```typescript
  // Next.js 16 may have new middleware patterns
  // Check official docs for updates
  ```
- [ ] Test in production mode
  ```bash
  npm run build
  npm run start
  ```
- [ ] Run linting
  ```bash
  npm run lint
  ```
- [ ] Commit upgrade
  ```bash
  git add .
  git commit -m "Upgrade to Next.js 16 and related dependencies"
  ```
- [ ] Merge to main after testing

### Potential Breaking Changes to Watch:
1. **Middleware API changes** - May affect authentication flow
2. **Headers API** - Better Auth uses headers heavily
3. **Route handlers** - API route signatures might change
4. **Server Components** - Default behavior changes
5. **Cookies handling** - Session management affected

### Rollback Plan:
```bash
# If upgrade causes issues:
git checkout main
git branch -D upgrade/nextjs-16
```

### Files Likely Affected:
- `middleware.ts` - Core authentication middleware
- `app/api/*/route.ts` - All API routes
- `lib/auth.ts` - Auth configuration
- All Server Components using headers/cookies

### Success Criteria:
- ✅ Next.js 16.0+ installed
- ✅ No TypeScript errors
- ✅ Build succeeds without warnings
- ✅ Dev server runs without errors
- ✅ All existing features work (login, signup, upload)
- ✅ No console errors in browser
- ✅ Tests pass (if you have any)

---

## Week 1: Critical Security Foundations (Days 1-5)

### Day 1: Email Verification System

**Priority**: 🔴 Critical  
**Estimated Time**: 6-8 hours

⚠️ **PREREQUISITE**: Ensure Next.js 16 upgrade (Day 0) is completed and tested before starting.

#### Tasks:
- [ ] Configure Better Auth email verification plugin
  ```typescript
  // lib/auth.ts - Add verification plugin
  import { verification } from "better-auth/plugins";
  ```
- [ ] Set up email service (Resend, SendGrid, or NodeMailer)
  - Create account and obtain API keys
  - Add `EMAIL_SERVICE_API_KEY` to `.env`
  - Configure email templates
- [ ] Update auth configuration to require email verification
  ```typescript
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // Change to require verification
    requireEmailVerification: true,
  }
  ```
- [ ] Create email verification UI components:
  - `app/verify-email/page.tsx` - Verification success/error page
  - Email sent confirmation message in signup flow
- [ ] Add middleware check for unverified users
  ```typescript
  // middleware.ts - Block unverified users from dashboard
  if (session?.user && !session.user.emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }
  ```
- [ ] Update signup flow to show "Check your email" message
- [ ] Test complete verification flow

#### Files to Modify:
- `lib/auth.ts`
- `middleware.ts`
- `app/signup/page.tsx`
- Create: `app/verify-email/page.tsx`
- `.env` (add email service config)

---

### Day 2: Secure Middleware Implementation

**Priority**: 🔴 Critical  
**Estimated Time**: 4-6 hours

#### Tasks:
- [ ] Replace insecure cookie check with proper session validation
  ```typescript
  // middleware.ts - Proper session validation
  const session = await auth.api.getSession({
    headers: request.headers
  });
  
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  ```
- [ ] Add CSRF protection
  - Enable Better Auth CSRF plugin
  - Add CSRF token to forms
- [ ] Implement session refresh logic
- [ ] Add path-based protection rules
  ```typescript
  const protectedPaths = ['/dashboard', '/profile', '/settings', '/history'];
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  ```
- [ ] Add proper error handling and logging
- [ ] Test middleware with various routes and edge cases

#### Files to Modify:
- `middleware.ts`
- `lib/auth.ts` (add CSRF plugin)

---

### Day 3: Role-Based Access Control (RBAC) - Schema & Database

**Priority**: 🔴 Critical  
**Estimated Time**: 5-7 hours

#### Tasks:
- [ ] Update database schema with user roles
  ```typescript
  // db/schema.ts
  export const userRoleEnum = pgEnum('user_role', ['user', 'premium', 'admin']);
  
  export const user = pgTable("user", {
    // ... existing fields
    role: userRoleEnum('role').default('user').notNull(),
    subscriptionTier: text('subscription_tier').default('free'),
    subscriptionExpiresAt: timestamp('subscription_expires_at'),
  });
  ```
- [ ] Create permissions mapping
  ```typescript
  // lib/permissions.ts
  export const PERMISSIONS = {
    user: ['upload', 'transcribe', 'view_own'],
    premium: ['upload', 'transcribe', 'view_own', 'export_pdf', 'speaker_labels'],
    admin: ['*'], // All permissions
  };
  ```
- [ ] Generate and run database migration
  ```bash
  npm run db:generate
  npm run db:push
  ```
- [ ] Create database seed script to set first user as admin
  ```typescript
  // scripts/seed-admin.ts
  ```
- [ ] Update User type definitions
- [ ] Test schema changes locally

#### Files to Create/Modify:
- `db/schema.ts`
- Create: `lib/permissions.ts`
- Create: `scripts/seed-admin.ts`
- Update: `db/schema.ts` (type exports)

---

### Day 4: RBAC Implementation - Middleware & Utilities

**Priority**: 🔴 Critical  
**Estimated Time**: 6-8 hours

#### Tasks:
- [ ] Create authorization utility functions
  ```typescript
  // lib/authorization.ts
  export function hasPermission(userRole: string, permission: string): boolean
  export function requireRole(requiredRole: string)
  export function requirePermission(permission: string)
  ```
- [ ] Create role-checking middleware
  ```typescript
  // lib/middleware/role-check.ts
  export async function checkRole(request: NextRequest, allowedRoles: string[])
  ```
- [ ] Update API routes to check roles
  - `/api/transcribe/route.ts` - Check user limits
  - `/api/upload/route.ts` - Validate permissions
  - Create: `/api/admin/*` routes (admin-only)
- [ ] Add role-based UI components
  ```typescript
  // components/auth/RequireRole.tsx
  // components/auth/HasPermission.tsx
  ```
- [ ] Update dashboard to show role-specific features
- [ ] Test permission checks across all routes

#### Files to Create/Modify:
- Create: `lib/authorization.ts`
- Create: `lib/middleware/role-check.ts`
- Create: `components/auth/RequireRole.tsx`
- Modify: `app/api/transcribe/route.ts`
- Modify: `app/api/upload/route.ts`
- Modify: `app/dashboard/page.tsx`

---

### Day 5: Resource Authorization & Ownership Validation

**Priority**: 🔴 Critical  
**Estimated Time**: 5-7 hours

#### Tasks:
- [ ] Create resource ownership middleware
  ```typescript
  // lib/middleware/resource-ownership.ts
  export async function validateTranscriptionOwnership(transcriptionId, userId)
  ```
- [ ] Update transcription routes with ownership checks
  - `/api/transcriptions/[id]/route.ts` - Add ownership validation
  - `/api/transcribe/[id]/route.ts` - Check user owns transcription
- [ ] Implement sharing functionality (optional)
  ```typescript
  // db/schema.ts - Add sharing table
  export const transcriptionShares = pgTable("transcription_shares", {
    id: text("id").primaryKey(),
    transcriptionId: text("transcription_id").references(() => transcription.id),
    sharedWithUserId: text("shared_with_user_id").references(() => user.id),
    permissions: text("permissions"), // 'view' | 'edit'
  });
  ```
- [ ] Add resource access logging
  ```typescript
  // lib/audit-log.ts
  export function logResourceAccess(userId, resourceId, action)
  ```
- [ ] Update frontend to handle 403 forbidden errors
- [ ] Test ownership validation edge cases
- [ ] Add error messages for unauthorized access

#### Files to Create/Modify:
- Create: `lib/middleware/resource-ownership.ts`
- Create: `lib/audit-log.ts`
- Modify: `app/api/transcriptions/[id]/route.ts`
- Modify: `app/api/transcribe/[id]/route.ts`
- Modify: `db/schema.ts` (if adding sharing)
- Create: `components/ui/ForbiddenError.tsx`

---

## Week 2: Enhanced Security Features (Days 6-10)

### Day 6: Rate Limiting & API Security

**Priority**: 🟡 High  
**Estimated Time**: 5-7 hours

#### Tasks:
- [ ] Install rate limiting library
  ```bash
  npm install @upstash/ratelimit @upstash/redis
  # OR use local solution
  npm install express-rate-limit
  ```
- [ ] Configure rate limiting for auth routes
  ```typescript
  // lib/rate-limit.ts
  export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
  });
  ```
- [ ] Add rate limits to critical endpoints:
  - `/api/auth/*` - 5 attempts per 15 min
  - `/api/transcribe` - 10 uploads per hour
  - `/api/forget-password` - 3 attempts per hour
- [ ] Implement request validation middleware
  ```typescript
  // lib/middleware/validate-request.ts
  export function validateFileUpload(file: File): ValidationResult
  ```
- [ ] Add input sanitization for all text inputs
- [ ] Create IP-based blocking for abuse
- [ ] Add security headers middleware
  ```typescript
  // middleware.ts - Add security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  ```
- [ ] Test rate limiting with multiple requests

#### Files to Create/Modify:
- Create: `lib/rate-limit.ts`
- Create: `lib/middleware/validate-request.ts`
- Modify: `app/api/auth/[...all]/route.ts`
- Modify: `app/api/transcribe/route.ts`
- Modify: `app/api/forget-password/route.ts`
- Modify: `middleware.ts`

---

### Day 7: Password Security Enhancements

**Priority**: 🟡 High  
**Estimated Time**: 4-6 hours

#### Tasks:
- [ ] Implement strong password validation
  ```typescript
  // lib/password-validation.ts
  export function validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number; // 0-5
    feedback: string[];
  }
  ```
- [ ] Add password requirements:
  - Minimum 12 characters (increase from 6)
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- [ ] Create password strength indicator component
  ```typescript
  // components/auth/PasswordStrengthIndicator.tsx
  ```
- [ ] Implement account lockout after failed attempts
  ```typescript
  // db/schema.ts - Add lockout fields
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  ```
- [ ] Add password history (prevent reuse of last 5 passwords)
  ```typescript
  // db/schema.ts
  export const passwordHistory = pgTable("password_history", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  });
  ```
- [ ] Update signup and password reset forms
- [ ] Add "password changed" notification email
- [ ] Test password validation and lockout mechanism

#### Files to Create/Modify:
- Create: `lib/password-validation.ts`
- Create: `components/auth/PasswordStrengthIndicator.tsx`
- Modify: `db/schema.ts`
- Modify: `app/signup/page.tsx`
- Modify: `app/reset-password/page.tsx`
- Generate and run migrations

---

### Day 8: Session Management Improvements

**Priority**: 🟡 High  
**Estimated Time**: 5-7 hours

#### Tasks:
- [ ] Configure session timeout settings
  ```typescript
  // lib/auth.ts
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh daily
  }
  ```
- [ ] Add "Remember Me" functionality
  ```typescript
  // app/login/page.tsx - Add checkbox
  const [rememberMe, setRememberMe] = useState(false);
  // Extend session if checked
  ```
- [ ] Create active sessions management page
  ```typescript
  // app/settings/sessions/page.tsx
  // Show all active sessions with device info
  ```
- [ ] Add device/location tracking
  ```typescript
  // Extend session table with:
  deviceType: text('device_type'),
  browser: text('browser'),
  location: text('location'), // City/Country
  lastActive: timestamp('last_active'),
  ```
- [ ] Implement session revocation
  ```typescript
  // api/sessions/[id]/revoke/route.ts
  export async function DELETE(request, { params })
  ```
- [ ] Add "Log out all devices" functionality
- [ ] Create session activity log
- [ ] Update settings page with session management UI
- [ ] Test session lifecycle and revocation

#### Files to Create/Modify:
- Modify: `lib/auth.ts`
- Modify: `app/login/page.tsx`
- Create: `app/settings/sessions/page.tsx`
- Create: `app/api/sessions/[id]/revoke/route.ts`
- Create: `app/api/sessions/revoke-all/route.ts`
- Modify: `db/schema.ts`
- Create: `components/settings/SessionsList.tsx`

---

### Day 9: Audit Logging & Monitoring

**Priority**: 🟢 Medium  
**Estimated Time**: 5-7 hours

#### Tasks:
- [ ] Create audit log schema
  ```typescript
  // db/schema.ts
  export const auditLog = pgTable("audit_log", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id),
    action: text("action").notNull(), // 'login', 'upload', 'delete', etc.
    resourceType: text("resource_type"), // 'transcription', 'user', etc.
    resourceId: text("resource_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    metadata: text("metadata"), // JSON string
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });
  ```
- [ ] Implement audit logging utility
  ```typescript
  // lib/audit.ts
  export async function logAuditEvent({
    userId,
    action,
    resourceType,
    resourceId,
    metadata,
  })
  ```
- [ ] Add audit logging to critical operations:
  - User login/logout
  - Password changes
  - File uploads/deletes
  - Permission changes
  - Failed authentication attempts
- [ ] Create admin audit log viewer
  ```typescript
  // app/admin/audit-logs/page.tsx
  ```
- [ ] Implement security event alerts
  ```typescript
  // lib/security-alerts.ts
  export function alertSuspiciousActivity(event)
  ```
- [ ] Add monitoring for:
  - Multiple failed login attempts
  - Access from new locations
  - Unusual upload patterns
- [ ] Create security dashboard for admins
- [ ] Test audit logging across different actions

#### Files to Create/Modify:
- Modify: `db/schema.ts`
- Create: `lib/audit.ts`
- Create: `lib/security-alerts.ts`
- Create: `app/admin/audit-logs/page.tsx`
- Create: `components/admin/AuditLogTable.tsx`
- Modify: All API routes (add logging)
- Generate and run migrations

---

### Day 10: Testing, Documentation & Polish

**Priority**: 🟢 Medium  
**Estimated Time**: 6-8 hours

#### Tasks:
- [ ] Write comprehensive tests
  ```typescript
  // __tests__/auth/
  - email-verification.test.ts
  - role-permissions.test.ts
  - resource-ownership.test.ts
  - rate-limiting.test.ts
  - password-validation.test.ts
  ```
- [ ] Test all security features end-to-end
  - User registration with email verification
  - Login with rate limiting
  - Password reset flow
  - Role-based access on routes
  - Resource ownership validation
  - Session management
- [ ] Update project documentation
  - Update `README.md` with new env variables
  - Document role system
  - Document permission model
  - Add security best practices guide
- [ ] Create admin guide
  ```markdown
  // docs/ADMIN_GUIDE.md
  - How to manage users
  - How to assign roles
  - How to view audit logs
  ```
- [ ] Create user guide for security features
  ```markdown
  // docs/USER_SECURITY.md
  - Password requirements
  - Session management
  - Two-factor authentication (future)
  ```
- [ ] Security checklist review
  - [ ] All API routes have authentication
  - [ ] All resources have ownership checks
  - [ ] Rate limiting on all public endpoints
  - [ ] CSRF protection enabled
  - [ ] Security headers configured
  - [ ] Audit logging for sensitive operations
  - [ ] Email verification enforced
- [ ] Create migration guide for existing users
- [ ] Prepare rollout plan
- [ ] Code review and cleanup

#### Files to Create/Modify:
- Create: `__tests__/auth/*`
- Modify: `README.md`
- Create: `docs/ADMIN_GUIDE.md`
- Create: `docs/USER_SECURITY.md`
- Create: `docs/SECURITY_CHECKLIST.md`
- Create: `docs/MIGRATION_GUIDE.md`

---

## Environment Variables Required

Add these to your `.env` file:

```bash
# Existing
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
ASSEMBLYAI_API_KEY="..."

# NEW - Email Service (choose one)
EMAIL_SERVICE="resend" # or "sendgrid" or "nodemailer"
RESEND_API_KEY="re_..."
# OR
SENDGRID_API_KEY="SG..."
# OR
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASSWORD="..."
EMAIL_FROM="noreply@lecsy.com"

# NEW - Rate Limiting (if using Upstash)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# NEW - Security
CSRF_SECRET="..." # Generate with: openssl rand -base64 32
SESSION_MAX_AGE="604800" # 7 days in seconds

# NEW - Monitoring (optional)
SENTRY_DSN="..." # For error tracking
```

---

## Dependencies to Install

### Phase 0 (Day 0) - Core Upgrades:
```bash
# Next.js 16 and React 19 upgrades (REQUIRED FIRST)
npm install next@latest react@latest react-dom@latest
npm install eslint-config-next@latest
npm install better-auth@latest
npm install @types/node@latest
npm install eslint@latest
npm install tailwindcss@latest @tailwindcss/postcss@latest
```

### Phase 1 & 2 (Weeks 1-2) - Security Features:
```bash
# Email services (choose one)
npm install resend
# OR
npm install @sendgrid/mail
# OR
npm install nodemailer

# Rate limiting
npm install @upstash/ratelimit @upstash/redis
# OR for local development
npm install express-rate-limit

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Optional monitoring
npm install @sentry/nextjs
```

---

## Success Metrics

### Phase 0 Completion:
- ✅ Next.js 16.0+ installed and working
- ✅ All dependencies updated to latest compatible versions
- ✅ Zero breaking changes or TypeScript errors
- ✅ Application runs without errors in dev and production

### Full Implementation Completion:
- ✅ 100% of users verified via email
- ✅ 0 security warnings in middleware
- ✅ Role-based access control implemented
- ✅ All API endpoints protected with rate limiting
- ✅ Password strength score average >3/5
- ✅ Complete audit log for admin actions
- ✅ Session management UI functional
- ✅ All tests passing (>80% coverage)

---

## Post-Implementation (Week 3+)

### Optional Enhancements:
1. **Two-Factor Authentication (2FA)**
   - Implement TOTP with Better Auth
   - Add SMS backup option
   - Make mandatory for admins

2. **Advanced OAuth**
   - Complete Google OAuth integration
   - Add GitHub, Microsoft providers
   - Implement account linking

3. **API Keys for Developers**
   - Create API key management
   - Add API key authentication
   - Implement key rotation

4. **Advanced Monitoring**
   - Integrate Sentry for error tracking
   - Set up log aggregation (Datadog, LogRocket)
   - Create security dashboard

5. **Compliance**
   - GDPR compliance features
   - Data export functionality
   - Account deletion workflow

---

## Emergency Rollback Plan

If issues arise during implementation:

1. **Database Rollback**
   ```bash
   # Revert last migration
   npm run db:rollback
   ```

2. **Code Rollback**
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Feature Flags**
   - Implement feature flags for gradual rollout
   - Disable problematic features without full rollback

---

## Contact & Support

- **Project Lead**: [Your Name]
- **Security Questions**: security@lecsy.com
- **Implementation Issues**: Create GitHub issue with `security` label

---

## Notes

- **⚠️ CRITICAL: Complete Next.js 16 upgrade (Day 0) FIRST**
- **Backup database before each major change**
- **Test in development environment first**
- **Deploy during low-traffic hours**
- **Monitor error logs closely after deployment**
- **Have rollback plan ready**
- **Keep Next.js and Better Auth versions in sync**

---

**Last Reviewed**: 2025-10-23  
**Next Review**: After Week 1 completion
