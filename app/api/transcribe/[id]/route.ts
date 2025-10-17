import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AudioService } from '@/lib/AssemblyAI/database';
import { assemblyAI, defaultConfig } from '@/lib/AssemblyAI/assemblyai';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if AssemblyAI API key is configured
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.error('Transcription error: ASSEMBLYAI_API_KEY not configured');
      return NextResponse.json({ 
        error: 'Transcription service not configured',
        details: 'Please add ASSEMBLYAI_API_KEY to your environment variables'
      }, { status: 500 });
    }
    
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get audio file
    const audioFile = await AudioService.getAudioFileWithTranscription(id);
    if (!audioFile || audioFile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    // Start transcription - upload file directly to AssemblyAI
    console.log('Transcription: Reading file from:', audioFile.filePath);
    
    // Read the audio file from disk
    const filePath = join(process.cwd(), 'public', audioFile.filePath.replace('/uploads/', 'uploads/'));
    console.log('Transcription: Full file path:', filePath);
    
    const audioBuffer = await readFile(filePath);
    console.log('Transcription: File read successfully, size:', audioBuffer.length);
    
    // Upload file to AssemblyAI and start transcription
    const transcript = await assemblyAI.transcripts.transcribe({
      audio: audioBuffer,
      ...defaultConfig,
    });
    
    console.log('Transcription: Started with ID:', transcript.id);

    // Update status
    await AudioService.updateTranscriptionStatus(id, 'processing', transcript.id);

    return NextResponse.json({ 
      transcriptId: transcript.id,
      status: 'processing' 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    
    let errorMessage = 'Failed to start transcription';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorDetails.includes('ENOENT')) {
      errorMessage = 'Audio file not found on disk';
      errorDetails = 'The uploaded audio file could not be found';
    } else if (errorDetails.includes('API key') || errorDetails.includes('401')) {
      errorMessage = 'Transcription service authentication error';
      errorDetails = 'Please check your AssemblyAI API key configuration';
    } else if (errorDetails.includes('network') || errorDetails.includes('fetch')) {
      errorMessage = 'Network error';
      errorDetails = 'Unable to connect to transcription service';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}