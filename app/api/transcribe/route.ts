import { NextRequest, NextResponse } from 'next/server';
import type { TranscribeStartResponse, AssemblyAIUploadResponse, AssemblyAITranscriptResponse } from '@/lib/types/transcription';
import { db } from '@/db/drizzle';
import { transcription } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

export async function POST(request: NextRequest) {
  try {
    console.log('Transcribe API: Request received');
    
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!ASSEMBLYAI_API_KEY || ASSEMBLYAI_API_KEY.trim() === '') {
      console.error('Transcribe API: AssemblyAI API key not configured');
      return NextResponse.json(
        { success: false, error: 'AssemblyAI API key not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const audioUrl = formData.get('audioUrl') as string | null;
    const language = formData.get('language') as string | null;
    const enhancedAccuracy = formData.get('enhancedAccuracy') === 'true';

    // Validate input - must have either file or URL
    if (!file && !audioUrl) {
      return NextResponse.json(
        { success: false, error: 'Either file or audioUrl must be provided' },
        { status: 400 }
      );
    }

    let finalAudioUrl = audioUrl;

    // If file is provided, upload it to AssemblyAI first
    if (file) {
      console.log(`Transcribe API: Uploading file - ${file.name}, size: ${file.size}, type: ${file.type}`);
      try {
        // Upload file to AssemblyAI
        const uploadResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/upload`, {
          method: 'POST',
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
        },
          body: file,
        });
        
        console.log(`Transcribe API: Upload response status: ${uploadResponse.status}`);

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        const uploadResult: AssemblyAIUploadResponse = await uploadResponse.json();
        finalAudioUrl = uploadResult.upload_url;
      } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to upload audio file' },
          { status: 500 }
        );
      }
    }

    // Start transcription job
    try {
      const transcriptResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: finalAudioUrl,
          language_code: language && language !== 'auto' ? language : undefined,
          punctuate: true,
          format_text: true,
          // Enhanced features only work with English (and some other supported languages)
          speaker_labels: enhancedAccuracy && (!language || language === 'auto' || language === 'en'),
          auto_highlights: enhancedAccuracy && (!language || language === 'auto' || language === 'en'),
          sentiment_analysis: enhancedAccuracy && (!language || language === 'auto' || language === 'en'),
        }),
      });

      if (!transcriptResponse.ok) {
        let errorDetails = `Transcription request failed: ${transcriptResponse.statusText}`;
        try {
          const errorBody = await transcriptResponse.json();
          errorDetails += ` - Details: ${JSON.stringify(errorBody)}`;
        } catch {
          const errorText = await transcriptResponse.text();
          errorDetails += ` - Raw Response: ${errorText}`;
        }
        throw new Error(errorDetails);
      }

      const transcriptResult: AssemblyAITranscriptResponse = await transcriptResponse.json();

      // Save to database
      try {
        await db.insert(transcription).values({
          id: uuidv4(),
          userId: session.user.id,
          transcriptId: transcriptResult.id,
          name: `Transcription ${new Date().toLocaleString()}`,
          audioUrl: finalAudioUrl,
          status: transcriptResult.status,
          language: language || 'auto',
        });
      } catch (dbError) {
        console.error('Failed to save transcription to database:', dbError);
        // Continue anyway - transcription is already started
      }

      const response: TranscribeStartResponse = {
        success: true,
        transcriptId: transcriptResult.id,
        status: transcriptResult.status,
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Transcription start error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to start transcription' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}