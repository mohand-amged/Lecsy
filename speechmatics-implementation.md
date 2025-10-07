# Speechmatics API Implementation Guide - Next.js

## Overview
This guide covers implementing Speechmatics API for batch audio transcription in a Next.js application with multi-language support (English/Arabic).

## Architecture

```
Frontend (React) → Next.js API Route → Speechmatics API
```

**Why use API routes?**
- Keeps API keys secure (never exposed to client)
- Handles file uploads and streaming
- Manages authentication
- Can add rate limiting and validation

---

## Setup

### 1. Install Dependencies

```bash
npm install axios form-data
# or
yarn add axios form-data
```

### 2. Environment Variables

Create `.env.local` in your project root:

```env
SPEECHMATICS_API_KEY=your_api_key_here
SPEECHMATICS_API_URL=https://asr.api.speechmatics.com/v2
```

---

## Implementation

### Step 1: Create API Route for Transcription

Create `app/api/transcribe/route.ts` (App Router) or `pages/api/transcribe.ts` (Pages Router)

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
  // Same polling function as above
}
```

If using Pages Router, install formidable:
```bash
npm install formidable
```

---

### Step 2: Create Upload Component

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

---

### Step 3: Use the Component

**App Router (`app/page.tsx`):**

```typescript
import AudioTranscriber from '@/components/AudioTranscriber';

export default function Home() {
  return (
    <main className="min-h-screen py-12">
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
    <main className="min-h-screen py-12">
      <AudioTranscriber />
    </main>
  );
}
```

---

## Supported Audio Formats

Speechmatics supports:
- WAV
- MP3
- MP4
- M4A
- FLAC
- OGG
- OPUS

---

## Language Codes

For your use case:
- English: `en`
- Arabic: `ar`

Full list available at: https://docs.speechmatics.com/introduction/supported-languages

---

## Advanced Configuration Options

You can enhance the transcription config with:

```typescript
const config = {
  type: 'transcription',
  transcription_config: {
    language: language,
    operating_point: 'enhanced', // or 'standard'
    enable_partials: false,
    max_delay: 3,
    
    // Additional options:
    diarization: 'speaker', // Enable speaker diarization
    enable_entities: true, // Detect entities (names, places)
    punctuation_overrides: {
      permitted_marks: ['.', '?', '!'],
    },
    additional_vocab: [
      { content: 'CustomWord', sounds_like: ['custom word'] }
    ],
  },
};
```

---

## Future: Real-Time Transcription

For real-time transcription, you'll need to:

1. Use WebSockets instead of batch API
2. Stream audio chunks from microphone
3. Use Speechmatics Real-Time API endpoint

**WebSocket endpoint:**
```
wss://eu2.rt.speechmatics.com/v2
```

**Basic structure for future implementation:**

```typescript
// This is for future reference
const ws = new WebSocket(
  `wss://eu2.rt.speechmatics.com/v2?jwt=${token}`
);

ws.onopen = () => {
  ws.send(JSON.stringify({
    message: 'StartRecognition',
    transcription_config: {
      language: 'en',
      enable_partials: true,
    },
  }));
};

// Send audio chunks
ws.send(audioChunk);
```

---

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check SPEECHMATICS_API_KEY in .env.local |
| 400 Bad Request | Invalid audio format | Ensure audio file is in supported format |
| 413 Payload Too Large | File too large | Compress audio or use different format |
| 422 Unprocessable | Invalid language code | Use correct language code (en, ar) |

---

## Testing

Test with a sample audio file:

```bash
# Download a sample audio file
curl -o test.wav "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav"
```

Then upload through your UI.

---

## Production Considerations

1. **Rate Limiting**: Add rate limiting to your API route
2. **File Size Limits**: Set max file size (e.g., 100MB)
3. **Progress Updates**: For large files, implement progress polling
4. **Caching**: Cache results by file hash to avoid re-processing
5. **Error Recovery**: Implement retry logic for failed transcriptions
6. **Monitoring**: Log job IDs and track success/failure rates

---

## Cost Optimization

- Use `operating_point: 'standard'` for lower costs (enhanced is more accurate but pricier)
- Process audio at lower sample rates if quality permits
- Batch similar jobs together
- Monitor usage through Speechmatics dashboard

---

## Next Steps

1. ✅ Test with sample audio files
2. ✅ Verify both English and Arabic transcription
3. Add error boundaries and better error messages
4. Implement file size validation
5. Add support for more languages
6. Prepare for real-time implementation

---

## Resources

- [Speechmatics Batch API Docs](https://docs.speechmatics.com/batch-api)
- [Speechmatics Real-Time API Docs](https://docs.speechmatics.com/rt-api)
- [Language Support](https://docs.speechmatics.com/introduction/supported-languages)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Questions or issues?** Check the Speechmatics documentation or reach out to their support team.