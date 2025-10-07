# Speechmatics Implementation Guide for Lecsy

## Project Specifications

### Confirmed Requirements
1. **Languages**: English (en) + Arabic (ar) only
2. **Operating Point**: Standard (balanced cost/quality)
3. **Output**: Plain text transcripts
4. **Storage**: MongoDB database
5. **UX**: Auto-transcription on upload, notifications on complete
6. **Error Handling**: Automatic retry on failure
7. **Cost Management**: Usage tracking and limits per user

---

## Critical Fixes Needed

### 1. Fix API Route Config

**File**: `app/api/transcribe/route.ts`

**Current Issue**: Lines 36-37 have invalid properties
```typescript
// ❌ REMOVE THESE:
enable_partials: false,
max_delay: 3,
```

**Fixed Config**:
```typescript
const config = {
  type: 'transcription',
  transcription_config: {
    language: language, // 'en' or 'ar'
    operating_point: 'standard', // Changed from 'enhanced'
  },
};
```

### 2. Fix Environment Variable

**File**: `.env`

Ensure:
```bash
SPEECHMATICS_API_KEY=hnssF3fJKGp3nZWmKS8gRJRjOuJF2JZb
SPEECHMATICS_API_URL=https://asr.api.speechmatics.com/v2
```

Note: URL should NOT end with `/jobs`

---

## Database Schema Updates

**File**: `prisma/schema.prisma`

Add these models:

```prisma
model Transcription {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  userId            String    @db.ObjectId
  fileName          String
  fileSize          Int
  fileDuration      Float?
  language          String
  transcript        String?   @db.String
  jobId             String    @unique
  status            String    // 'pending', 'processing', 'completed', 'failed'
  estimatedCost     Float?
  retryCount        Int       @default(0)
  errorMessage      String?
  createdAt         DateTime  @default(now())
  completedAt       DateTime?
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
}

model UsageStats {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  userId                String    @unique @db.ObjectId
  totalTranscriptions   Int       @default(0)
  totalMinutesProcessed Float     @default(0)
  totalCost             Float     @default(0)
  monthlyTranscriptions Int       @default(0)
  monthlyMinutes        Float     @default(0)
  monthlyCost           Float     @default(0)
  lastResetDate         DateTime  @default(now())
  maxMonthlyMinutes     Float     @default(60)
  maxMonthlyCost        Float     @default(10)
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Update User model:
```prisma
model User {
  id              String           @id @default(auto()) @map("_id") @db.ObjectId
  email           String           @unique
  name            String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  transcriptions  Transcription[]
  usageStats      UsageStats?
}
```

Run: `npx prisma generate && npx prisma db push`

---

## Implementation Steps

### Step 1: Fix Current API Route

Apply the config fix above, then add:

```typescript
// Add retry logic
const MAX_RETRIES = 3;
let retryCount = 0;

while (retryCount < MAX_RETRIES) {
  try {
    jobId = await submitToSpeechmatics(buffer, file.name, file.type, language);
    break;
  } catch (error) {
    retryCount++;
    if (retryCount >= MAX_RETRIES) throw error;
    await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
  }
}
```

### Step 2: Add Usage Tracking API

Create `app/api/transcribe/usage/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await prisma.usageStats.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(stats || {
    monthlyMinutes: 0,
    maxMonthlyMinutes: 60,
  });
}
```

### Step 3: Update FileUpload Component

Add usage display at the top:

```typescript
const [usageStats, setUsageStats] = React.useState<any>(null);

React.useEffect(() => {
  fetch('/api/transcribe/usage')
    .then(res => res.json())
    .then(setUsageStats)
    .catch(console.error);
}, []);

// In JSX, add before upload area:
{usageStats && (
  <div className="mb-4 p-4 bg-muted rounded-lg">
    <div className="flex justify-between mb-2">
      <span className="text-sm">Monthly Usage</span>
      <span className="text-sm">{usageStats.monthlyMinutes.toFixed(1)} / {usageStats.maxMonthlyMinutes} min</span>
    </div>
    <Progress value={(usageStats.monthlyMinutes / usageStats.maxMonthlyMinutes) * 100} />
  </div>
)}
```

---

## Testing

1. **Restart dev server** after env changes
2. **Test with small audio file** (< 1 minute)
3. **Check terminal for errors**
4. **Verify transcript appears in UI**

---

## Quick Reference

### API Endpoints
- `POST /api/transcribe` - Submit audio file
- `GET /api/transcribe/usage` - Get user quota

### Environment Variables
```bash
SPEECHMATICS_API_KEY=your_key
SPEECHMATICS_API_URL=https://asr.api.speechmatics.com/v2
```

### Supported Languages
- `en` - English
- `ar` - Arabic (العربية)

### Cost Estimation
- Standard: ~$0.0125 per minute
- Free tier: 60 minutes/month

---

## Common Issues

| Error | Solution |
|-------|----------|
| 404 path not found | Remove `/jobs` from SPEECHMATICS_API_URL |
| 401 Unauthorized | Check API key, restart server |
| 400 Invalid config | Remove `enable_partials` and `max_delay` |
| Quota exceeded | Check usage with `/api/transcribe/usage` |

---

## Next Steps

1. ✅ Apply config fixes
2. ✅ Add database models
3. ✅ Test transcription
4. ⏳ Add usage dashboard
5. ⏳ Implement transcription history
6. ⏳ Add email notifications

**File locations**:
- API Route: `app/api/transcribe/route.ts`
- Component: `components/FileUpload.tsx`
- Schema: `prisma/schema.prisma`
- Env: `.env`
