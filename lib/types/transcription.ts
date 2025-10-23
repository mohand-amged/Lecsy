// AssemblyAI API Types
export interface AssemblyAIUploadResponse {
  upload_url: string;
}

export interface AssemblyAITranscriptRequest {
  audio_url: string;
  language_code?: string;
  punctuate?: boolean;
  format_text?: boolean;
  speaker_labels?: boolean;
  auto_highlights?: boolean;
  sentiment_analysis?: boolean;
}

export interface AssemblyAITranscriptResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
  confidence?: number;
}

// API Route Response Types
export interface TranscribeStartResponse {
  success: boolean;
  transcriptId?: string;
  status?: string;
  error?: string;
}

export interface TranscribeStatusResponse {
  success: boolean;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
  confidence?: number;
}

// Form Data Types
export interface TranscribeFormData {
  file?: File;
  audioUrl?: string;
  language?: string;
  enhancedAccuracy?: boolean;
}
