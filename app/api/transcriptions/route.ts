import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { transcription } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// GET - List all transcriptions for the current user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transcriptions = await db
      .select()
      .from(transcription)
      .where(eq(transcription.userId, session.user.id))
      .orderBy(desc(transcription.createdAt));

    return NextResponse.json({
      success: true,
      transcriptions,
    });
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transcriptions' },
      { status: 500 }
    );
  }
}

// POST - Create a new transcription record
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transcriptId, name, audioUrl, text, status, language, confidence, duration } = body;

    if (!transcriptId) {
      return NextResponse.json(
        { success: false, error: 'transcriptId is required' },
        { status: 400 }
      );
    }

    const newTranscription = await db.insert(transcription).values({
      id: uuidv4(),
      userId: session.user.id,
      transcriptId,
      name: name || `Transcription ${new Date().toLocaleString()}`,
      audioUrl,
      text,
      status: status || 'queued',
      language,
      confidence,
      duration,
    }).returning();

    return NextResponse.json({
      success: true,
      transcription: newTranscription[0],
    });
  } catch (error) {
    console.error('Error creating transcription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transcription' },
      { status: 500 }
    );
  }
}
