// hooks/useTranscription.ts
import { useState, useCallback, useRef, useEffect } from 'react';

interface TranscriptionData {
  text: string;
  confidence?: number;
  summary?: string;
  speakers?: any[];
  sentiment?: any[];
  entities?: any[];
  keyPhrases?: any[];
  chapters?: any[];
  words?: any[];
  languageCode?: string;
}

interface TranscriptionStatus {
  status: 'pending' | 'processing' | 'completed' | 'error';
  transcription?: TranscriptionData;
  error?: string;
  message?: string;
  progress?: number;
  estimatedTime?: string;
}

export function useTranscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus | null>(null);
  const [polling, setPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setPolling(false);
  }, []);

  const startTranscription = async (audioFileId: string) => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      abortControllerRef.current = new AbortController();
      
      const res = await fetch(`/api/transcribe/${audioFileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to start transcription');
      }

      const data = await res.json();
      
      setStatus({
        status: data.status,
        message: data.message,
        estimatedTime: data.estimatedTime
      });

      // If processing, start polling for status
      if (data.status === 'processing') {
        startPolling(audioFileId);
      }

      return data;

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (audioFileId: string): Promise<TranscriptionStatus> => {
    try {
      abortControllerRef.current = new AbortController();
      
      const res = await fetch(`/api/transcribe/${audioFileId}`, {
        method: 'GET',
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to check transcription status');
      }

      const data = await res.json();
      return data;

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Status check error:', err);
        throw err;
      }
      throw err;
    }
  };

  const startPolling = useCallback((audioFileId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setPolling(true);
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const statusData = await checkStatus(audioFileId);
        setStatus(statusData);

        // Stop polling if completed or error
        if (statusData.status === 'completed' || statusData.status === 'error') {
          stopPolling();
          
          if (statusData.status === 'error') {
            setError(statusData.error || 'Transcription failed');
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Polling error:', err);
          setError(err.message);
          stopPolling();
        }
      }
    }, 3000); // Poll every 3 seconds
  }, [stopPolling]);

  const getTranscription = async (audioFileId: string) => {
    setLoading(true);
    setError(null);

    try {
      const statusData = await checkStatus(audioFileId);
      setStatus(statusData);
      
      // If still processing, start polling
      if (statusData.status === 'processing') {
        startPolling(audioFileId);
      } else if (statusData.status === 'error') {
        setError(statusData.error || 'Transcription failed');
      }
      
      return statusData;

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelTranscription = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopPolling();
    setLoading(false);
    setError(null);
  }, [stopPolling]);

  return {
    // Actions
    startTranscription,
    getTranscription,
    checkStatus,
    cancelTranscription,
    
    // State
    loading,
    error,
    status,
    polling,
    
    // Computed values
    isCompleted: status?.status === 'completed',
    isProcessing: status?.status === 'processing',
    isError: status?.status === 'error',
    transcription: status?.transcription,
    progress: status?.progress,
  };
}