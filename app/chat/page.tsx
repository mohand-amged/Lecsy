'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { TranscribeStatusResponse } from '@/lib/types/transcription';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import html2canvas from 'html2canvas';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transcriptId = searchParams.get('transcriptId');
  
  const [transcriptionData, setTranscriptionData] = useState<TranscribeStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscriptionStatus = useCallback(async () => {
    if (!transcriptId) {
      setError('No transcript ID provided');
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(`/api/transcribe/${transcriptId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transcription: ${response.statusText}`);
      }

      const data: TranscribeStatusResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transcription');
      }

      setTranscriptionData(data);
      
      // Return the status so we can check it in the effect
      if (data.status === 'completed' || data.status === 'error') {
        setLoading(false);
      }
      
      if (data.status === 'error') {
        setError(data.error || 'Transcription failed');
      }

      return data.status;
    } catch (err) {
      console.error('Error fetching transcription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transcription');
      setLoading(false);
      return 'error';
    }
  }, [transcriptId]);

  useEffect(() => {
    if (!transcriptId) {
      setError('No transcript ID provided');
      setLoading(false);
      return;
    }

    let interval: NodeJS.Timeout;
    let isActive = true;

    const startPolling = async () => {
      // Initial fetch
      const status = await fetchTranscriptionStatus();
      
      // Only start polling if still active and not completed/error
      if (isActive && status !== 'completed' && status !== 'error') {
        // Start polling every 3 seconds for status updates
        interval = setInterval(async () => {
          const newStatus = await fetchTranscriptionStatus();
          if (newStatus === 'completed' || newStatus === 'error') {
            clearInterval(interval);
          }
        }, 3000);
      }
    };

    startPolling();
    
    return () => {
      isActive = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [transcriptId, fetchTranscriptionStatus]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-400" />;
      case 'processing':
      case 'queued':
        return <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />;
      default:
        return <FileText className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'queued':
        return 'Transcription queued...';
      case 'processing':
        return 'Processing audio...';
      case 'completed':
        return 'Transcription completed!';
      case 'error':
        return 'Transcription failed';
      default:
        return 'Checking status...';
    }
  };

  if (!transcriptId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-8 text-center max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid Request</h2>
          <p className="text-gray-400 mb-6">No transcript ID provided.</p>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Audio Transcription</h1>
            <p className="text-gray-400 text-sm">ID: {transcriptId}</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            {getStatusIcon(transcriptionData?.status)}
            <div>
              <h3 className="text-xl font-semibold text-white">
                {getStatusText(transcriptionData?.status)}
              </h3>
              {transcriptionData?.confidence && (
                <p className="text-gray-400 text-sm">
                  Confidence: {Math.round(transcriptionData.confidence * 100)}%
                </p>
              )}
            </div>
          </div>
          
          {loading && transcriptionData?.status !== 'completed' && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                <p className="text-gray-300">
                  This may take a few minutes depending on the audio length...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Transcription Result */}
{transcriptionData?.status === 'completed' && transcriptionData.text && (
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-white" />
              <h3 className="text-xl font-semibold text-white">Transcription Result</h3>
            </div>
            
            <div className="bg-black rounded-lg p-6 border border-gray-600">
              <p 
                className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                dir={transcriptionData.language === 'ar' ? 'rtl' : 'ltr'}
                style={transcriptionData.language === 'ar' ? { textAlign: 'right' } : undefined}
              >
                {transcriptionData.text}
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Button 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(transcriptionData.text || '');
                    toast.success('Transcript copied to clipboard');
                  } catch {
                    toast.error('Failed to copy transcript');
                  }
                }}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Copy Transcript
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    // Ensure html2canvas is available for jsPDF html plugin
                    (window as any).html2canvas = html2canvas;

                    const isArabic = /[\u0600-\u06FF]/.test(transcriptionData.language || '') || /[\u0600-\u06FF]/.test(transcriptionData.text || '');

                    // Build an off-DOM container to render the transcript as HTML for accurate RTL shaping
                    const container = document.createElement('div');
                    container.style.position = 'fixed';
                    container.style.left = '-10000px';
                    container.style.top = '0';
                    container.style.width = '800px';
                    container.style.padding = '24px';
                    container.style.background = '#ffffff';
                    container.style.color = '#000000';
                    container.style.lineHeight = '1.6';
                    container.style.fontSize = '12pt';
                    container.style.whiteSpace = 'pre-wrap';
                    if (isArabic) {
                      container.setAttribute('dir', 'rtl');
                      container.style.textAlign = 'right';
                      container.style.fontFamily = `'Noto Naskh Arabic', 'Amiri', system-ui, -apple-system, Segoe UI, Arial`;
                    } else {
                      container.style.fontFamily = `Georgia, 'Times New Roman', Times, serif`;
                    }
                    container.textContent = transcriptionData.text || '';

                    document.body.appendChild(container);

                    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const margin = 40;

                    await doc.html(container, {
                      x: margin,
                      y: margin,
                      width: pageWidth - margin * 2,
                      windowWidth: 800,
                      callback: (doc) => {
                        doc.save(`transcript-${transcriptId}.pdf`);
                        toast.success('PDF downloaded');
                        document.body.removeChild(container);
                      },
                      autoPaging: 'text',
                      html2canvas: { scale: 2, useCORS: true },
                    });
                  } catch (e) {
                    console.error(e);
                    toast.error('Failed to generate PDF');
                  }
                }}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Download as PDF
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const content = (transcriptionData.text || '').split('\n').map(line => new Paragraph({
                      children: [new TextRun(line)],
                    }));
                    const doc = new Document({
                      sections: [{ properties: {}, children: content }],
                    });
                    const blob = await Packer.toBlob(doc);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `transcript-${transcriptId}.docx`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('Word document downloaded');
                  } catch {
                    toast.error('Failed to generate Word document');
                  }
                }}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Download as Word
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Error</h3>
            </div>
            <p className="text-red-300">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4 border-red-600 text-red-400 hover:bg-red-900/20"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPageLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-8 text-center max-w-md w-full">
        <Loader2 className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-bold text-white mb-2">Loading</h2>
        <p className="text-gray-400">Preparing transcription page...</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageLoading />}>
      <ChatPageContent />
    </Suspense>
  );
}
