'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

export function UploadAudio() {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed', details: 'Unknown error' }));
        throw new Error(`${errorData.error}: ${errorData.details}`);
      }

      const { id } = await response.json();
      router.push(`/chat/${id}`);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file. Please try again.';
      
      // Show more user-friendly error messages
      if (errorMessage.includes('Database connection failed')) {
        alert('Database connection error. Please contact support or try again later.');
      } else if (errorMessage.includes('Database table not found')) {
        alert('System configuration error. Please contact support.');
      } else if (errorMessage.includes('Unauthorized')) {
        alert('Please sign in again to upload files.');
        router.push('/auth/signin');
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsUploading(false);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-black rounded-xl shadow-xl p-8 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg">
          <Upload className="h-6 w-6 text-black" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Upload Audio</h3>
          <p className="text-gray-400 text-sm">Transform your lectures into interactive content 🚀</p>
        </div>
      </div>
      
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
            Drop your lecture recording here
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
            disabled={isUploading}
          />
          
          <Button
            asChild
            disabled={isUploading}
            className="bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <label htmlFor="audio-upload" className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Processing your audio...
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
      
      <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          Supported: MP3, WAV, M4A, AAC, OGG • Max size: 100MB
        </p>
      </div>
    </div>
  );
}