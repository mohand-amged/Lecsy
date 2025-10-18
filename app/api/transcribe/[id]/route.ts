// app/api/audio/[id]/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { audioFiles, transcriptions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { assemblyaiClient } from '@/lib/AssemblyAI/assemblyai';

// GET method for checking transcription status
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
    const result = await db
      .select()
      .from(audioFiles)
      .leftJoin(transcriptions, eq(audioFiles.id, transcriptions.audioFileId))
      .where(and(
        eq(audioFiles.id, id),
        eq(audioFiles.userId, session.user.id)
      ))
      .limit(1);

    if (!result[0]?.audio_files) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    const audioFile = result[0].audio_files;
    const existingTranscription = result[0].transcriptions;

    // If already completed, return the transcription
    if (audioFile.transcriptionStatus === 'completed' && existingTranscription) {
      return NextResponse.json({
        status: 'completed',
        transcription: {
          text: existingTranscription.text,
          confidence: existingTranscription.confidence,
          summary: existingTranscription.summary,
          speakers: existingTranscription.speakers,
          sentiment: existingTranscription.sentiment,
          entities: existingTranscription.entities,
          keyPhrases: existingTranscription.keyPhrases,
          chapters: existingTranscription.chapters,
          words: existingTranscription.words,
          languageCode: existingTranscription.languageCode,
        }
      });
    }

    // If error status, return error
    if (audioFile.transcriptionStatus === 'error') {
      return NextResponse.json({
        status: 'error',
        error: audioFile.errorMessage || 'Transcription failed'
      });
    }

    // If processing, check AssemblyAI status
    if (audioFile.transcriptionStatus === 'processing' && audioFile.assemblyaiId) {
      try {
        // Check if it's a mock transcription
        if (audioFile.assemblyaiId.startsWith('mock-')) {
          return NextResponse.json({
            status: 'processing',
            message: 'Mock transcription in progress',
            progress: 75
          });
        }

        // Check actual AssemblyAI status
        if (process.env.ASSEMBLYAI_API_KEY) {
          const transcript = await assemblyaiClient.transcripts.get(audioFile.assemblyaiId);
          
          console.log('Transcription status check:', {
            id: audioFile.assemblyaiId,
            status: transcript.status
          });

          if (transcript.status === 'completed') {
            // Save the completed transcription
            const transcriptionData = {
              text: transcript.text || null,
              confidence: transcript.confidence || null,
              speakers: transcript.utterances as any || null,
              sentiment: transcript.sentiment_analysis_results as any || null,
              entities: transcript.entities as any || null,
              keyPhrases: transcript.auto_highlights as any || null,
              summary: transcript.summary || null,
              chapters: transcript.chapters as any || null,
              words: transcript.words as any || null,
              contentSafetyLabels: transcript.content_safety_labels as any || null,
              languageCode: transcript.language_code || null,
              rawResponse: transcript as any,
            };

            if (existingTranscription) {
              await db
                .update(transcriptions)
                .set({ ...transcriptionData, updatedAt: new Date() })
                .where(eq(transcriptions.id, existingTranscription.id));
            } else {
              await db.insert(transcriptions).values({
                audioFileId: id,
                ...transcriptionData,
              });
            }

            // Update audio file status
            await db
              .update(audioFiles)
              .set({ 
                transcriptionStatus: 'completed',
                updatedAt: new Date()
              })
              .where(eq(audioFiles.id, id));

            return NextResponse.json({
              status: 'completed',
              transcription: {
                text: transcriptionData.text,
                confidence: transcriptionData.confidence,
                summary: transcriptionData.summary,
                speakers: transcriptionData.speakers,
                sentiment: transcriptionData.sentiment,
                entities: transcriptionData.entities,
                keyPhrases: transcriptionData.keyPhrases,
                chapters: transcriptionData.chapters,
                words: transcriptionData.words,
                languageCode: transcriptionData.languageCode,
              }
            });
          } else if (transcript.status === 'error') {
            // Update error status
            await db
              .update(audioFiles)
              .set({ 
                transcriptionStatus: 'error',
                errorMessage: transcript.error || 'Transcription failed',
                updatedAt: new Date()
              })
              .where(eq(audioFiles.id, id));

            return NextResponse.json({
              status: 'error',
              error: transcript.error || 'Transcription failed'
            });
          } else {
            // Still processing
            return NextResponse.json({
              status: 'processing',
              message: 'Transcription in progress',
              progress: transcript.status === 'queued' ? 25 : 50
            });
          }
        }
      } catch (assemblyError) {
        console.error('Error checking AssemblyAI status:', assemblyError);
        // Don't fail the request, just return current status
      }
    }

    // Default response for pending or unknown status
    return NextResponse.json({
      status: audioFile.transcriptionStatus || 'pending',
      message: 'Transcription status unknown'
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check transcription status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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

    // Get audio file with existing transcription
    const result = await db
      .select()
      .from(audioFiles)
      .leftJoin(transcriptions, eq(audioFiles.id, transcriptions.audioFileId))
      .where(and(
        eq(audioFiles.id, id),
        eq(audioFiles.userId, session.user.id)
      ))
      .limit(1);

    if (!result[0]?.audio_files) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    const audioFile = result[0].audio_files;

    // Check if already transcribing or completed
    if (audioFile.transcriptionStatus === 'processing') {
      return NextResponse.json({ 
        error: 'Transcription already in progress',
        transcriptId: audioFile.assemblyaiId 
      }, { status: 409 });
    }

    console.log('Transcription: Processing audio file:', audioFile.filePath);
    
    let transcript;
    try {
      // Use the file path (Vercel Blob URL or local path)
      const audioUrl = audioFile.assemblyaiUploadUrl || audioFile.filePath;
      
      // Configure webhook URL for async processing
      const webhookUrl = process.env.NEXT_PUBLIC_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/assemblyai`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/webhooks/assemblyai`
        : undefined;
      
      // Optimized configuration - fewer features for faster processing
      const transcriptionConfig = {
        audio: audioUrl,
        // Core features only for faster processing
        speaker_labels: true,
        punctuate: true,
        format_text: true,
        // Add webhook for async completion
        ...(webhookUrl && { webhook_url: webhookUrl }),
        // Optional: Enable additional features based on needs
        // sentiment_analysis: true,
        // entity_detection: true,
        // auto_chapters: true,
        // language_detection: true,
      };
      
      console.log('Transcription: Starting with config:', {
        audioUrl,
        webhookUrl,
        features: Object.keys(transcriptionConfig).filter(k => k !== 'audio')
      });
      
      transcript = await assemblyaiClient.transcripts.transcribe(transcriptionConfig);
      
      console.log('Transcription: Started with ID:', transcript.id);
      
      // Update audio file status
      await db
        .update(audioFiles)
        .set({ 
          transcriptionStatus: 'processing',
          assemblyaiId: transcript.id,
          updatedAt: new Date()
        })
        .where(eq(audioFiles.id, id));

      return NextResponse.json({ 
        transcriptId: transcript.id,
        status: 'processing',
        message: 'Transcription started successfully. You will be notified when complete.',
        estimatedTime: '2-5 minutes'
      });
      
    } catch (assemblyError) {
      console.error('AssemblyAI Error:', assemblyError);
      
      // Check if account is disabled
      if (assemblyError instanceof Error && 
          (assemblyError.message.includes('account is disabled') || 
           assemblyError.message.includes('account has been disabled'))) {
        
        console.log('Transcription: Using mock transcription due to disabled account');
        
        const mockTranscriptId = `mock-${Date.now()}`;
        const mockText = `This is a mock transcription for the audio file "${audioFile.originalName}".

The actual transcription service (AssemblyAI) is currently unavailable due to account issues. Please contact support@assemblyai.com to resolve your account status.

Once your AssemblyAI account is active, this will be replaced with the real transcription of your audio content.

Mock transcription generated at: ${new Date().toLocaleString()}`;

        // Create or update transcription
        const existingTranscription = result[0].transcriptions;
        
        if (existingTranscription) {
          await db
            .update(transcriptions)
            .set({
              text: mockText,
              confidence: 0.95,
              summary: 'Mock transcription - AssemblyAI account disabled',
              updatedAt: new Date()
            })
            .where(eq(transcriptions.id, existingTranscription.id));
        } else {
          await db.insert(transcriptions).values({
            audioFileId: id,
            text: mockText,
            confidence: 0.95,
            summary: 'Mock transcription - AssemblyAI account disabled',
          });
        }
        
        // Update audio file status
        await db
          .update(audioFiles)
          .set({ 
            transcriptionStatus: 'completed',
            assemblyaiId: mockTranscriptId,
            updatedAt: new Date()
          })
          .where(eq(audioFiles.id, id));
        
        return NextResponse.json({ 
          transcriptId: mockTranscriptId,
          status: 'completed',
          message: 'Mock transcription created - AssemblyAI account disabled'
        });
      }
      
      // Handle other AssemblyAI errors
      let errorMessage = 'Failed to start transcription';
      let errorDetails = assemblyError instanceof Error ? assemblyError.message : 'Unknown error';
      
      // Update audio file with error
      await db
        .update(audioFiles)
        .set({ 
          transcriptionStatus: 'error',
          errorMessage: errorDetails,
          updatedAt: new Date()
        })
        .where(eq(audioFiles.id, id));
      
      throw assemblyError;
    }
    
  } catch (error) {
    console.error('Transcription error:', error);
    
    let errorMessage = 'Failed to start transcription';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    // Categorize errors
    if (errorDetails.includes('ENOENT')) {
      errorMessage = 'Audio file not found on disk';
      errorDetails = 'The uploaded audio file could not be found';
    } else if (errorDetails.includes('API key') || errorDetails.includes('401')) {
      errorMessage = 'Transcription service authentication error';
      errorDetails = 'Please check your AssemblyAI API key configuration';
    } else if (errorDetails.includes('network') || errorDetails.includes('fetch')) {
      errorMessage = 'Network error';
      errorDetails = 'Unable to connect to transcription service';
    } else if (errorDetails.includes('402')) {
      errorMessage = 'Insufficient credits';
      errorDetails = 'Your AssemblyAI account has run out of credits';
    } else if (errorDetails.includes('429')) {
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'Too many requests. Please try again later';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}