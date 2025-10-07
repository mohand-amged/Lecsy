# Speechmatics API Implementation - 4 Phase Guide

## Overview
This guide breaks down implementing Speechmatics API for batch audio transcription in Next.js into four manageable phases.

**Architecture:**
```
Frontend (React) → Next.js API Route → Speechmatics API
```

---

# Phase 1: Project Setup & Configuration

## Goal
Set up the foundation with dependencies and environment configuration.

### 1.1 Install Required Dependencies

```bash
npm install axios form-data
# or
yarn add axios form-data
```

**For Pages Router only (if not using App Router):**
```bash
npm install formidable
```

### 1.2 Create Environment Variables

Create `.env.local` in your project root:

```env
SPEECHMATICS_API_KEY=your_api_key_here
SPEECHMATICS_API_URL=https://asr.api.speechmatics.com/v2
```

⚠️ **Important:** Add `.env.local` to your `.gitignore` file to keep your API key secure.

### 1.3 Project Structure

Create the following folder structure:

```
your-project/
├── app/                      # (App Router)
│   └── api/
│       └── transcribe/
│           └── route.ts
├── pages/                    # (Pages Router - alternative)
│   └── api/
│       └── transcribe.ts
├── components/
│   └── AudioTranscriber.tsx
└── .env.local
```

### ✅ Phase 1 Checklist
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Project structure created
- [ ] API key obtained from Speechmatics

---

# Phase 2: Backend API Implementation

## Goal
Create the API endpoint that handles file uploads and communicates with Speechmatics.

### 2.1 Choose Your Router

**Option A: App Router (Recommended for Next.js 13+)**
**Option B: Pages Router (Next.js 12 or earlier)**

### 2.2 Create the Transcription Endpoint

**App Router Version (`app/api/transcribe/route.ts`):**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare form data for Speechmatics
    const speechmaticsForm = new FormData();
    speechmaticsForm.append('data_file', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // Configuration for Speechmatics
    const config = {
      type: 'transcription',
      transcription_config: {
        language: language,
        operating_point: 'enhanced',
        enable_partials: false,
        max_delay: 3,
      },
    };

    speechmaticsForm.append('config', JSON.stringify(config));

    // Send to Speechmatics
    const response = await axios.post(
      `${process.env.SPEECHMATICS_API_URL}/jobs`,
      speechmaticsForm,
      {
        headers: {
          ...speechmaticsForm.getHeaders(),
          Authorization: `Bearer ${process.env.SPEECHMATICS_API_KEY}`,
        },
      }
    );

    const jobId = response.data.id;

    // Poll for results
    const transcript = await pollForResults(jobId);

    return NextResponse.json({
      success: true,
      jobId,
      transcript,
    });

  } catch (error: any) {
    console.error('Transcription error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Transcription failed',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}

async function pollForResults(jobId: string, maxAttempts = 60): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(
        `${process.env.SPEECHMATICS_API_URL}/jobs/${jobId}/transcript`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SPEECHMATICS_API_KEY}`,
          },
        }
      );

      if (response.data) {
        return response.data;
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Job not ready yet, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Transcription timeout');
}
```

**Pages Router Version (`pages/api/transcribe.ts`):**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const audioFile = files.audio?.[0];
    const language = fields.language?.[0] || 'en';

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Prepare form data for Speechmatics
    const speechmaticsForm = new FormData();
    speechmaticsForm.append('data_file', fs.createReadStream(audioFile.filepath), {
      filename: audioFile.originalFilename || 'audio.wav',
      contentType: audioFile.mimetype || 'audio/wav',
    });

    const config = {
      type: 'transcription',
      transcription_config: {
        language: language,
        operating_point: 'enhanced',
        enable_partials: false,
      },
    };

    speechmaticsForm.append('config', JSON.stringify(config));

    // Send to Speechmatics
    const response = await axios.post(
      `${process.env.SPEECHMATICS_API_URL}/jobs`,
      speechmaticsForm,
      {
        headers: {
          ...speechmaticsForm.getHeaders(),
          Authorization: `Bearer ${process.env.SPEECHMATICS_API_KEY}`,
        },
      }
    );

    const jobId = response.data.id;
    const transcript = await pollForResults(jobId);

    // Clean up temp file
    fs.unlinkSync(audioFile.filepath);

    return res.status(200).json({
      success: true,
      jobId,
      transcript,
    });

  } catch (error: any) {
    console.error('Transcription error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Transcription failed',
      details: error.response?.data || error.message,
    });
  }
}

async function pollForResults(jobId: string, maxAttempts = 60): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(
        `${process.env.SPEECHMATICS_API_URL}/jobs/${jobId}/transcript`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SPEECHMATICS_API_KEY}`,
          },
        }
      );

      if (response.data) {
        return response.data;
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Transcription timeout');
}
```

### 2.3 Test the API Endpoint

Use curl or Postman to test:

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@path/to/your/audio.wav" \
  -F "language=en"
```

### ✅ Phase 2 Checklist
- [ ] API route created
- [ ] Polling function implemented
- [ ] Basic error handling added
- [ ] API endpoint tested with curl/Postman

---

# Phase 3: Frontend UI Component

## Goal
Create a user-friendly interface for uploading audio files and viewing transcriptions.

### 3.1 Create the AudioTranscriber Component

Create `components/AudioTranscriber.tsx`:

```typescript
'use client'; // Add this if using App Router

import { useState } from 'react';

interface TranscriptionResult {
  jobId: string;
  transcript: any;
}

export default function AudioTranscriber() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', language);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractText = (transcript: any): string => {
    if (!transcript?.results) return '';
    
    return transcript.results
      .map((result: any) => result.alternatives?.[0]?.content || '')
      .join(' ');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Audio Transcription</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Audio File
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Transcribing...' : 'Transcribe'}
        </button>
      </form>

      {loading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-700">Processing your audio file...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-green-700 font-medium">
              Transcription Complete!
            </p>
            <p className="text-sm text-gray-600">Job ID: {result.jobId}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Transcript:</h3>
            <p className="whitespace-pre-wrap">{extractText(result.transcript)}</p>
          </div>

          <button
            onClick={() => {
              const text = extractText(result.transcript);
              navigator.clipboard.writeText(text);
              alert('Copied to clipboard!');
            }}
            className="text-blue-600 hover:underline"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
```

### 3.2 Add Component to Your Page

**App Router (`app/page.tsx`):**

```typescript
import AudioTranscriber from '@/components/AudioTranscriber';

export default function Home() {
  return (
    <main className="min-h-screen py-12 bg-gray-50">
      <AudioTranscriber />
    </main>
  );
}
```

**Pages Router (`pages/index.tsx`):**

```typescript
import AudioTranscriber from '@/components/AudioTranscriber';

export default function Home() {
  return (
    <main className="min-h-screen py-12 bg-gray-50">
      <AudioTranscriber />
    </main>
  );
}
```

### 3.3 Test the Complete Flow

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Upload a test audio file
4. Verify transcription works for both English and Arabic

### ✅ Phase 3 Checklist
- [ ] Component created and styled
- [ ] File upload working
- [ ] Language selection functional
- [ ] Results display correctly
- [ ] Copy to clipboard works

---

# Phase 4: Enhancement & Production Ready

## Goal
Add advanced features, error handling, and production optimizations.

### 4.1 Enhanced Error Handling

Update your API route with better error messages:

```typescript
// Add to your API route
const ERROR_MESSAGES: { [key: number]: string } = {
  400: 'Invalid request. Please check your audio file format.',
  401: 'Authentication failed. Please check your API key.',
  413: 'File too large. Please use a smaller audio file.',
  422: 'Invalid language code or configuration.',
  429: 'Too many requests. Please try again later.',
};

// In catch block:
catch (error: any) {
  const status = error.response?.status || 500;
  const message = ERROR_MESSAGES[status] || 'Transcription failed';
  
  console.error('Transcription error:', error.response?.data || error.message);
  
  return NextResponse.json(
    { 
      error: message,
      details: error.response?.data || error.message 
    },
    { status }
  );
}
```

### 4.2 File Validation

Add validation to your component:

```typescript
// Add to AudioTranscriber component
const SUPPORTED_FORMATS = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/m4a'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const selectedFile = e.target.files[0];
    
    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 100MB.');
      return;
    }
    
    // Check file format
    if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
      setError('Unsupported file format. Please use WAV, MP3, or M4A.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setResult(null);
  }
};
```

### 4.3 Advanced Configuration Options

Enhance the transcription config in your API route:

```typescript
const config = {
  type: 'transcription',
  transcription_config: {
    language: language,
    operating_point: 'enhanced', // or 'standard' for lower cost
    enable_partials: false,
    max_delay: 3,
    
    // Advanced features:
    diarization: 'speaker', // Identify different speakers
    enable_entities: true, // Detect names, places, etc.
    punctuation_overrides: {
      permitted_marks: ['.', '?', '!', ','],
    },
  },
};
```

### 4.4 Progress Indicator

Add a better loading state:

```typescript
// Add to component state
const [progress, setProgress] = useState(0);

// Update loading display
{loading && (
  <div className="mt-4 p-4 bg-blue-50 rounded-md">
    <p className="text-blue-700 mb-2">Processing your audio file...</p>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
)}
```

### 4.5 Export Functionality

Add download transcript feature:

```typescript
const downloadTranscript = () => {
  if (!result) return;
  
  const text = extractText(result.transcript);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcript-${result.jobId}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

// Add button in results section
<button
  onClick={downloadTranscript}
  className="text-blue-600 hover:underline ml-4"
>
  Download Transcript
</button>
```

### 4.6 Production Environment Variables

For production deployment, add to your hosting platform:

**Vercel/Netlify:**
```
SPEECHMATICS_API_KEY=your_production_key
SPEECHMATICS_API_URL=https://asr.api.speechmatics.com/v2
```

### 4.7 Monitoring & Analytics

Add logging for production monitoring:

```typescript
// In API route after successful transcription
console.log({
  event: 'transcription_success',
  jobId,
  language,
  fileSize: file.size,
  duration: Date.now() - startTime,
});
```

### ✅ Phase 4 Checklist
- [ ] Enhanced error handling implemented
- [ ] File validation added
- [ ] Advanced configuration options available
- [ ] Progress indicator working
- [ ] Export functionality added
- [ ] Production environment configured
- [ ] Monitoring/logging in place

---

## Supported Audio Formats

- **WAV** - Recommended for best quality
- **MP3** - Good balance of quality/size
- **MP4/M4A** - Mobile recordings
- **FLAC** - Lossless compression
- **OGG/OPUS** - Web audio

## Language Codes Reference

| Language | Code |
|----------|------|
| English | `en` |
| Arabic | `ar` |
| Spanish | `es` |
| French | `fr` |
| German | `de` |

[Full list](https://docs.speechmatics.com/introduction/supported-languages)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Error | Check API key in `.env.local` |
| Timeout | Increase `maxAttempts` in polling function |
| Large files fail | Add file size validation (max 100MB) |
| Wrong language detected | Ensure correct language code is sent |

## Cost Optimization Tips

1. Use `operating_point: 'standard'` instead of `'enhanced'` for lower costs
2. Compress audio files before uploading
3. Use appropriate sample rates (16kHz often sufficient)
4. Monitor usage in Speechmatics dashboard

## Resources

- [Speechmatics Batch API](https://docs.speechmatics.com/batch-api)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supported Languages](https://docs.speechmatics.com/introduction/supported-languages)

## Next Steps After Completion

- [ ] Test with various audio formats
- [ ] Test with different languages
- [ ] Monitor API usage and costs
- [ ] Consider implementing real-time transcription
- [ ] Add user authentication if needed
- [ ] Set up error tracking (Sentry, etc.)

---

**Need help?** Check Speechmatics documentation or their support team.