import { NextRequest, NextResponse } from 'next/server';
import type { TranscribeStatusResponse, AssemblyAITranscriptResponse } from '@/lib/types/transcription';
import { db } from '@/db/drizzle';
import { transcription } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transcriptId } = await params;

    if (!transcriptId) {
      return NextResponse.json(
        { success: false, error: 'Transcript ID is required' },
        { status: 400 }
      );
    }

    // First, attempt to load from DB (handles ElevenLabs immediate transcriptions)
    try {
      const [row] = await db.select().from(transcription).where(eq(transcription.transcriptId, transcriptId)).limit(1);
      if (row) {
        const rowStatus = (row.status as 'queued' | 'processing' | 'completed' | 'error') || 'completed';
        const result: TranscribeStatusResponse = {
          success: true,
          status: rowStatus,
          text: row.text ?? undefined,
          language: row.language ?? undefined,
        };
        // If it's Arabic (ElevenLabs), we can return immediately without calling AssemblyAI
        if (row.language === 'ar' || transcriptId.startsWith('el-')) {
          return NextResponse.json(result);
        }
        // If completed and text exists, just return it (even for AssemblyAI completed)
        if (rowStatus === 'completed' && row.text) {
          return NextResponse.json(result);
        }
      }
    } catch {
      // Non-fatal; continue to external API
    }

    if (!ASSEMBLYAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AssemblyAI API key not configured' },
        { status: 500 }
      );
    }

    try {
      // Fetch transcription status from AssemblyAI
      const response = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`, {
        method: 'GET',
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { success: false, error: 'Transcript not found' },
            { status: 404 }
          );
        }
        throw new Error(`AssemblyAI API error: ${response.statusText}`);
      }

      const transcriptData: AssemblyAITranscriptResponse = await response.json();

      const result: TranscribeStatusResponse = {
        success: true,
        status: transcriptData.status,
      };

      // Include text if transcription is completed
      if (transcriptData.status === 'completed' && transcriptData.text) {
        result.text = transcriptData.text;
      }

      // Include confidence score if available
      if (transcriptData.confidence !== undefined) {
        result.confidence = transcriptData.confidence;
      }

      // Include error if transcription failed
      if (transcriptData.status === 'error' && transcriptData.error) {
        result.error = transcriptData.error;
      }

      // Update database with latest status and text (if authenticated)
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });

        if (session?.user) {
          const updateData: Record<string, string> = {
            status: transcriptData.status,
          };

          if (transcriptData.text) {
            updateData.text = transcriptData.text;
          }
          if (transcriptData.confidence !== undefined) {
            updateData.confidence = transcriptData.confidence.toString();
          }

          await db
            .update(transcription)
            .set(updateData)
            .where(eq(transcription.transcriptId, transcriptId));
        }
      } catch (dbError) {
        console.error('Failed to update transcription in database:', dbError);
        // Continue anyway - we still return the result from AssemblyAI
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error('Transcription status fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transcription status' },
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
