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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Audio</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchAudioData();
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            {audioData?.originalName || 'Audio Recording'}
          </h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                audioData?.transcriptionStatus === 'completed' ? 'bg-green-400' :
                audioData?.transcriptionStatus === 'processing' ? 'bg-yellow-400' :
                audioData?.transcriptionStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
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
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={() => window.open(`/api/audio/${id}/word`)}
                className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Word
              </Button>
            </div>

            {/* Transcript Section */}
            <Card className="mb-8 bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Transcript
                  {audioData.transcription.confidence && (
                    <span className="ml-auto text-sm text-gray-400">
                      {Math.round(audioData.transcription.confidence * 100)}% confidence
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {audioData.transcription.text}
                  </p>
                  {audioData.transcription.summary && (
                    <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="text-blue-400 font-semibold mb-2">Summary</h4>
                      <p className="text-gray-300">{audioData.transcription.summary}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : audioData?.transcriptionStatus === 'processing' ? (
          <Card className="mb-8 bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-16 w-16 animate-spin text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Processing Your Audio</h3>
              <p className="text-gray-400">This usually takes a few minutes...</p>
            </CardContent>
          </Card>
        ) : audioData?.transcriptionStatus === 'pending' ? (
          <Card className="mb-8 bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Transcribe</h3>
              <p className="text-gray-400 mb-6">Start processing your audio to generate transcript</p>
              <Button
                onClick={startTranscription}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Transcription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-12 text-center">
              <div className="text-red-400 mb-4">❌</div>
              <h3 className="text-xl font-bold text-white mb-2">Transcription Failed</h3>
              <p className="text-gray-400 mb-6">Something went wrong processing your audio</p>
              <Button
                onClick={startTranscription}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Retry Transcription
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Chat Section - Only show when transcription is complete */}
        {audioData?.transcriptionStatus === 'completed' && (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                Chat with AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-12 text-center border border-gray-700/30">
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-6 w-fit mx-auto">
                  <MessageSquare className="h-16 w-16 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  AI Study Assistant Coming Soon! 🤖
                </h3>
                <p className="text-gray-400 mb-2 text-lg">
                  Get ready to chat with your transcript
                </p>
                <p className="text-sm text-gray-500">
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