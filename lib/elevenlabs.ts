import type { TranscribeStartResponse } from '@/lib/types/transcription';

/**
 * Client-side helper to transcribe Arabic audio via our server API (which calls ElevenLabs).
 * Keeps the ELEVENLABS_API_KEY secure on the server.
 */
export async function transcribeArabicWithElevenLabs(audioFile: File | Blob): Promise<TranscribeStartResponse> {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('language', 'ar');
  formData.append('enhancedAccuracy', 'false');

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const result = (await response.json()) as TranscribeStartResponse;
  if (!result.success) {
    throw new Error(result.error || 'Failed to start Arabic transcription');
  }
  return result;
}
