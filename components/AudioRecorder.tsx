'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { LanguageSelector, SupportedLanguage } from '@/components/LanguageSelector';
import { detectLanguageForAudio } from '@/lib/language-detection';

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number, language: SupportedLanguage) => void;
  onTranscribeRecording?: (audioBlob: Blob, language: SupportedLanguage) => void;
  className?: string;
  showLanguageSelector?: boolean;
  showTranscribeButton?: boolean;
}

export function AudioRecorder({ 
  onRecordingComplete,
  onTranscribeRecording,
  className,
  showLanguageSelector = true,
  showTranscribeButton = false
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('auto');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Call callback with blob, duration, and language
        onRecordingComplete?.(blob, duration, selectedLanguage);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setError(null);
      startTimer();

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const handleTranscribe = async () => {
    if (audioBlob && onTranscribeRecording) {
      setIsTranscribing(true);
      try {
        await onTranscribeRecording(audioBlob, selectedLanguage);
      } catch (error) {
        console.error('Transcription error:', error);
        setError('Failed to start transcription');
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleDetectLanguage = async () => {
    if (!audioBlob) {
      setError('No recording available to detect language.');
      return;
    }
    setIsDetecting(true);
    setError(null);
    try {
      const lang = await detectLanguageForAudio({ file: audioBlob });
      setSelectedLanguage(lang);
    } catch (e) {
      console.error('Language detection error:', e);
      setError(e instanceof Error ? e.message : 'Language detection failed');
    } finally {
      setIsDetecting(false);
    }
  };


  return (
    <Card className={`bg-black border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Mic className="h-5 w-5 mr-2" />
          Audio Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-900 border border-red-600 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Timer */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-white mb-2">
            {formatTime(duration)}
          </div>
          <div className={`text-sm ${
            isRecording && !isPaused ? 'text-red-400' : 
            isPaused ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {isRecording && !isPaused ? '● Recording...' :
             isPaused ? '⏸ Paused' :
             audioBlob ? '✓ Recording Complete' : 'Ready to Record'}
          </div>
        </div>

        {/* Language Selection */}
        {showLanguageSelector && (
          <div className="mb-4">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              variant="compact"
            />
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex justify-center space-x-3">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && !isPaused && (
            <>
              <Button
                onClick={pauseRecording}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                size="lg"
              >
                <Pause className="h-5 w-5" />
              </Button>
              <Button
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white"
                size="lg"
              >
                <Square className="h-5 w-5" />
              </Button>
            </>
          )}

          {isRecording && isPaused && (
            <>
              <Button
                onClick={resumeRecording}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white"
                size="lg"
              >
                <Square className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Playback Controls */}
        {audioBlob && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-center space-x-3 mb-4">
              {!isPlaying ? (
                <Button
                  onClick={playRecording}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
              ) : (
                <Button
                  onClick={pausePlayback}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button
                onClick={clearRecording}
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                disabled={isTranscribing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              
              {showTranscribeButton && (
                <>
                  <Button
                    onClick={handleDetectLanguage}
                    variant="outline"
                    disabled={isDetecting || !audioBlob}
                    className="border-white text-white hover:bg-white hover:text-black"
                  >
                    {isDetecting ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Detecting...
                      </>
                    ) : (
                      <>Detect Language</>
                    )}
                  </Button>
                  <Button
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isTranscribing ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Transcribe
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            <audio
              ref={audioRef}
              src={audioUrl || ''}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}