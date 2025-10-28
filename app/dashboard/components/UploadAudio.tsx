'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Loader2, Link, Settings } from 'lucide-react';
import { TranscribeStartResponse } from '@/lib/types/transcription';
import { LanguageSelector, SupportedLanguage } from '@/components/LanguageSelector';
import { detectLanguageForAudio } from '@/lib/language-detection';

export function UploadAudio() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [useUrl, setUseUrl] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('auto');
  const [enhancedAccuracy, setEnhancedAccuracy] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const router = useRouter();

  const handleTranscription = async (file?: File, url?: string) => {
    if (!file && !url) {
      alert('Please provide either an audio file or URL');
      return;
    }

    // Validate file size (100MB limit)
    if (file && file.size > 100 * 1024 * 1024) {
      alert('File size too large. Please upload a file smaller than 100MB.');
      return;
    }

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
      }
      if (url) {
        formData.append('audioUrl', url);
      }
      
      // Add language and accuracy settings
      formData.append('language', selectedLanguage);
      formData.append('enhancedAccuracy', enhancedAccuracy.toString());

      console.log('Starting transcription request...');
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Error response data:', errorData);
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          try {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
          } catch (textError) {
            console.error('Failed to read error response as text:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const result: TranscribeStartResponse = await response.json();
      
      if (result.success && result.transcriptId) {
        // Redirect to chat page with transcript ID
        router.push(`/chat?transcriptId=${result.transcriptId}`);
      } else {
        throw new Error(result.error || 'Failed to start transcription');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      
      let errorMessage = 'Failed to start transcription. Please try again.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout: The upload is taking too long. Please try with a smaller file or check your internet connection.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else if (error.message.includes('TypeError')) {
          errorMessage = 'Request error: Please try refreshing the page and uploading again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    // Check if a URL was dropped
    const droppedUrl = e.dataTransfer.getData('text/plain');
    if (droppedUrl && (droppedUrl.startsWith('http://') || droppedUrl.startsWith('https://'))) {
      // If URL is dropped, switch to URL mode and populate the field
      setUseUrl(true);
      setAudioUrl(droppedUrl);
      return;
    }

    // Otherwise, handle file drop
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleTranscription(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleTranscription(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (audioUrl.trim()) {
      handleTranscription(undefined, audioUrl.trim());
    }
  };

  return (
    <div className="bg-black rounded-xl shadow-xl p-8 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg">
          <Upload className="h-6 w-6 text-black" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Transcribe Audio</h3>
          <p className="text-gray-400 text-sm">Upload a file or provide a URL to get started 🚀</p>
        </div>
      </div>
      
      {/* Toggle between file upload and URL input */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={!useUrl ? "default" : "outline"}
          onClick={() => setUseUrl(false)}
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
        <Button
          variant={useUrl ? "default" : "outline"}
          onClick={() => setUseUrl(true)}
          className="flex-1"
        >
          <Link className="mr-2 h-4 w-4" />
          Audio URL
        </Button>
      </div>
      
      {/* Language Selection */}
      <div className="flex items-center gap-3 mb-6">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        {useUrl && (
          <Button
            variant="outline"
            onClick={async () => {
              if (!audioUrl.trim()) {
                alert('Enter an audio URL to detect language.');
                return;
              }
              setIsDetecting(true);
              try {
                const lang = await detectLanguageForAudio({ audioUrl: audioUrl.trim() });
                setSelectedLanguage(lang);
              } catch (e) {
                alert(e instanceof Error ? e.message : 'Language detection failed');
              } finally {
                setIsDetecting(false);
              }
            }}
            disabled={isDetecting}
            className="border-white text-white hover:bg-white hover:text-black"
          >
            {isDetecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>Detect Language</>
            )}
          </Button>
        )}
      </div>
      
      {!useUrl ? (
        /* File Upload Section */
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-white bg-gray-800 scale-105'
              : 'border-gray-600 hover:border-white hover:bg-gray-900'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-800 rounded-full mb-4">
              <Upload className="h-16 w-16 text-white" />
            </div>
            <p className="text-lg text-white mb-2 font-medium">
              Drop your audio file here
            </p>
            <p className="text-sm text-gray-400 mb-6">
              or click to browse from your device
            </p>
            
            <input
              type="file"
              accept="audio/*"
              onChange={handleInputChange}
              className="hidden"
              id="audio-upload"
              disabled={isTranscribing}
            />
            
            <Button
              asChild
              disabled={isTranscribing}
              className="bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <label htmlFor="audio-upload" className="cursor-pointer">
                {isTranscribing ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Starting transcription...
                  </>
                ) : (
                  <>
                    <Upload className="mr-3 h-5 w-5" />
                    Choose Audio File
                  </>
                )}
              </label>
            </Button>
          </div>
        </div>
      ) : (
        /* URL Input Section */
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-800 rounded-full mb-4">
              <Link className="h-16 w-16 text-white" />
            </div>
            <p className="text-lg text-white mb-2 font-medium">
              Enter audio URL
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Provide a direct link to your audio file
            </p>
            
            <div className="flex gap-3 w-full max-w-md">
              <Input
                type="url"
                placeholder="https://example.com/audio.mp3"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                disabled={isTranscribing}
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <Button
              onClick={handleUrlSubmit}
              disabled={isTranscribing || !audioUrl.trim()}
              className="bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 mt-4"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Starting transcription...
                </>
              ) : (
                <>
                  <Link className="mr-3 h-5 w-5" />
                  Transcribe from URL
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">Tip: Use Detect Language above to auto-select Arabic or English before transcribing.</p>
          </div>
        </div>
      )}
      
      {/* Enhanced Accuracy Option */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 mt-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium">Enhanced Accuracy</h4>
            <p className="text-gray-400 text-sm">Enable speaker labels, highlights, and sentiment analysis</p>
          </div>
          <Checkbox
            checked={enhancedAccuracy}
            onCheckedChange={(checked) => setEnhancedAccuracy(checked === true)}
            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          Supported: MP3, WAV, M4A, AAC, OGG • Max size: 100MB
        </p>
      </div>
    </div>
  );
}