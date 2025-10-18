'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

interface AudioData {
  id: string;
  originalName: string;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'error';
  transcription?: {
    text: string;
    confidence: number;
    summary?: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAudioData();
  }, [id]);

  const fetchAudioData = async () => {
    try {
      const response = await fetch(`/api/audio/${id}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view this audio file.');
          return;
        }
        if (response.status === 404) {
          setError('Audio file not found.');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setAudioData(data);
      setError(null);
      
      // Poll for transcription updates if processing
      if (data.transcriptionStatus === 'processing') {
        setTimeout(fetchAudioData, 5000); // Poll every 5 seconds
      }
    } catch (error) {
      console.error('Failed to fetch audio data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load audio data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startTranscription = async () => {
    try {
      await fetch(`/api/transcribe/${id}`, { method: 'POST' });
      fetchAudioData(); // Refresh data
    } catch (error) {
      console.error('Failed to start transcription:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-black mb-2">Error Loading Audio</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchAudioData();
              }}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            {audioData?.originalName || 'Audio Recording'}
          </h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                audioData?.transcriptionStatus === 'completed' ? 'bg-white' :
                audioData?.transcriptionStatus === 'processing' ? 'bg-gray-400' :
                audioData?.transcriptionStatus === 'error' ? 'bg-gray-600' : 'bg-gray-400'
              }`}></div>
              Status: {audioData?.transcriptionStatus || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Transcription Content */}
        {audioData?.transcriptionStatus === 'completed' && audioData.transcription ? (
          <>
            {/* Download Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={() => window.open(`/api/audio/${id}/pdf`)}
                className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={() => window.open(`/api/audio/${id}/word`)}
                className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Word
              </Button>
            </div>

            {/* Transcript Section */}
            <Card className="mb-8 bg-white border border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center text-black">
                  <div className="p-2 bg-black rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Transcript
                  {audioData.transcription.confidence && (
                    <span className="ml-auto text-sm text-gray-600">
                      {Math.round(audioData.transcription.confidence * 100)}% confidence
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-black leading-relaxed text-lg">
                    {audioData.transcription.text}
                  </p>
                  {audioData.transcription.summary && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                      <h4 className="text-black font-semibold mb-2">Summary</h4>
                      <p className="text-gray-700">{audioData.transcription.summary}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : audioData?.transcriptionStatus === 'processing' ? (
          <Card className="mb-8 bg-black border border-gray-300">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-16 w-16 animate-spin text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Processing Your Audio</h3>
              <p className="text-gray-600">This usually takes a few minutes...</p>
            </CardContent>
          </Card>
        ) : audioData?.transcriptionStatus === 'pending' ? (
          <Card className="mb-8 bg-black border border-gray-300">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Transcribe</h3>
              <p className="text-gray-600 mb-6">Start processing your audio to generate transcript</p>
              <Button
                onClick={startTranscription}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Start Transcription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-black border border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="text-red-600 mb-4">❌</div>
              <h3 className="text-xl font-bold text-white mb-2">Transcription Failed</h3>
              <p className="text-gray-600 mb-6">Something went wrong processing your audio</p>
              <Button
                onClick={startTranscription}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                Retry Transcription
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Chat Section - Only show when transcription is complete */}
        {audioData?.transcriptionStatus === 'completed' && (
          <Card className="bg-black border border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <div className="p-2 bg-black rounded-lg mr-3">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                Chat with AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-xl p-12 text-center border border-gray-300">
                <div className="p-4 bg-gray-200 rounded-full mb-6 w-fit mx-auto">
                  <MessageSquare className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  AI Study Assistant Coming Soon! 🤖
                </h3>
                <p className="text-gray-700 mb-2 text-lg">
                  Get ready to chat with your transcript
                </p>
                <p className="text-sm text-gray-600">
                  Ask questions, get summaries, create study guides, and analyze your content with AI
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}