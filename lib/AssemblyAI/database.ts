import { db } from '@/db/drizzle';
import { audioFiles, transcriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Type definitions for AssemblyAI response data
interface SpeakerData {
  speaker: string;
  start: number;
  end: number;
  text: string;
  confidence: number;
}

interface SentimentData {
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
  start: number;
  end: number;
}

interface KeyPhraseData {
  text: string;
  count: number;
  rank: number;
  timestamps: Array<{ start: number; end: number }>;
}

interface WordData {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string;
}

export class AudioService {
  static async createAudioFile(data: {
    userId: string;
    originalName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }) {
    const [audioFile] = await db.insert(audioFiles).values(data).returning();
    return audioFile;
  }

  static async updateTranscriptionStatus(
    id: string, 
    status: 'pending' | 'processing' | 'completed' | 'error',
    assemblyaiId?: string
  ) {
    await db.update(audioFiles)
      .set({ 
        transcriptionStatus: status,
        assemblyaiId,
        updatedAt: new Date()
      })
      .where(eq(audioFiles.id, id));
  }

  static async saveTranscription(data: {
    audioFileId: string;
    text: string;
    confidence?: number;
    speakers?: SpeakerData[];
    sentiment?: SentimentData[];
    keyPhrases?: KeyPhraseData[];
    summary?: string;
    words?: WordData[];
  }) {
    const [transcription] = await db.insert(transcriptions).values(data).returning();
    return transcription;
  }

  static async getAudioFileWithTranscription(id: string) {
    const audioFile = await db.query.audioFiles.findFirst({
      where: eq(audioFiles.id, id),
      with: {
        transcription: true,
      },
    });
    return audioFile;
  }
}