import { AssemblyAI } from 'assemblyai';

// Create AssemblyAI instance with fallback
export const assemblyAI = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || 'dummy-key',
});

export interface TranscriptionConfig {
  speaker_labels: boolean;
  auto_highlights: boolean;
  sentiment_analysis: boolean;
  entity_detection: boolean;
  summarization: boolean;
  summary_model: 'informative' | 'conversational' | 'catchy';
  summary_type: 'bullets' | 'paragraph';
}

export const defaultConfig: TranscriptionConfig = {
  speaker_labels: true,
  auto_highlights: true,
  sentiment_analysis: true,
  entity_detection: true,
  summarization: true,
  summary_model: 'informative',
  summary_type: 'bullets',
};