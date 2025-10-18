// app/api/webhooks/assemblyai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { audioFiles, transcriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    const { transcript_id, status } = payload;

    if (!transcript_id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Find the audio file by assemblyaiId
    const [audioFile] = await db
      .select()
      .from(audioFiles)
      .where(eq(audioFiles.assemblyaiId, transcript_id))
      .limit(1);

    if (!audioFile) {
      console.error('Audio file not found for transcript:', transcript_id);
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    // Update audio file status
    const newStatus = status === 'completed' ? 'completed' : 
                     status === 'error' ? 'error' : 'processing';
    
    await db
      .update(audioFiles)
      .set({ 
        transcriptionStatus: newStatus,
        errorMessage: status === 'error' ? payload.error : null,
        updatedAt: new Date(),
      })
      .where(eq(audioFiles.id, audioFile.id));

    // If completed, upsert the transcription
    if (status === 'completed') {
      const existingTranscription = await db
        .select()
        .from(transcriptions)
        .where(eq(transcriptions.audioFileId, audioFile.id))
        .limit(1);

      if (existingTranscription.length > 0) {
        // Update existing transcription
        await db
          .update(transcriptions)
          .set({
            text: payload.text || null,
            confidence: payload.confidence || null,
            speakers: payload.utterances as any || null,
            sentiment: payload.sentiment_analysis_results as any || null,
            entities: payload.entities as any || null,
            keyPhrases: payload.auto_highlights as any || null,
            chapters: payload.chapters as any || null,
            words: payload.words as any || null,
            contentSafetyLabels: payload.content_safety_labels as any || null,
            languageCode: payload.language_code || null,
            rawResponse: payload as any,
            updatedAt: new Date(),
          })
          .where(eq(transcriptions.audioFileId, audioFile.id));
      } else {
        // Create new transcription
        await db.insert(transcriptions).values({
          audioFileId: audioFile.id,
          text: payload.text || null,
          confidence: payload.confidence || null,
          speakers: payload.utterances as any || null,
          sentiment: payload.sentiment_analysis_results as any || null,
          entities: payload.entities as any || null,
          keyPhrases: payload.auto_highlights as any || null,
          chapters: payload.chapters as any || null,
          words: payload.words as any || null,
          contentSafetyLabels: payload.content_safety_labels as any || null,
          languageCode: payload.language_code || null,
          rawResponse: payload as any,
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}