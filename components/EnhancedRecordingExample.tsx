'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AudioRecorder } from '@/components/AudioRecorder';
import { SupportedLanguage } from '@/components/LanguageSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';

export function EnhancedRecordingExample() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const router = useRouter();

  const handleRecordingComplete = (audioBlob: Blob, duration: number, language: SupportedLanguage) => {
    console.log('Recording completed:', {
      duration: `${duration} seconds`,
      language,
      size: `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`
    });
  };

  const handleTranscribeRecording = async (audioBlob: Blob, language: SupportedLanguage) => {
    setIsTranscribing(true);
    
    try {
      // Create FormData with the recorded audio
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('language', language);
      formData.append('enhancedAccuracy', 'true');

      // Send to transcription API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.transcriptId) {
        // Redirect to chat page to view transcription progress
        router.push(`/chat?transcriptId=${result.transcriptId}`);
      } else {
        throw new Error(result.error || 'Failed to start transcription');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-black border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Mic className="h-6 w-6 mr-3" />
            Enhanced Recording & Transcription
          </CardTitle>
          <p className="text-gray-400">
            Record audio with language selection and direct transcription
          </p>
        </CardHeader>
        <CardContent>
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            onTranscribeRecording={handleTranscribeRecording}
            showLanguageSelector={true}
            showTranscribeButton={true}
            className="w-full"
          />
          
          {isTranscribing && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">
                🎤 Starting transcription... You&apos;ll be redirected to view progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="text-green-400 font-medium mb-1">🇺🇸 English</div>
          <div className="text-gray-400">Optimized for English speech</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="text-green-400 font-medium mb-1">🇸🇦 Arabic</div>
          <div className="text-gray-400">Arabic speech support</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="text-blue-400 font-medium mb-1">🌍 Auto-detect</div>
          <div className="text-gray-400">Automatic language detection</div>
        </div>
      </div>
    </div>
  );
}