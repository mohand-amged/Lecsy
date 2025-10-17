import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AudioService } from '@/lib/AssemblyAI/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get audio file with transcription
    const audioFile = await AudioService.getAudioFileWithTranscription(id);
    
    if (!audioFile || audioFile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    // Format response
    const response = {
      id: audioFile.id,
      originalName: audioFile.originalName,
      transcriptionStatus: audioFile.transcriptionStatus,
      uploadStatus: audioFile.uploadStatus,
      createdAt: audioFile.createdAt,
      transcription: audioFile.transcription ? {
        text: audioFile.transcription.text,
        confidence: audioFile.transcription.confidence,
        summary: audioFile.transcription.summary,
        speakers: audioFile.transcription.speakers,
        sentiment: audioFile.transcription.sentiment,
        keyPhrases: audioFile.transcription.keyPhrases,
      } : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Audio fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch audio data' }, { status: 500 });
  }
}