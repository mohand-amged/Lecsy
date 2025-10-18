import { AssemblyAI } from 'assemblyai';

if (!process.env.ASSEMBLYAI_API_KEY) {
  console.warn('ASSEMBLYAI_API_KEY is not set in environment variables');
}

export const assemblyaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || 'dummy-key-for-development',
});

// Default configuration for transcription with all features enabled
export const defaultTranscriptionConfig = {
  // Core transcription settings
  language_code: 'en_us', // Auto-detect if not specified
  punctuate: true,
  format_text: true,
  
  // Speaker diarization
  speaker_labels: true,
  speakers_expected: 2, // Can be adjusted based on expected speakers
  
  // Advanced features
  sentiment_analysis: true,
  entity_detection: true,
  auto_highlights: true,
  summarization: true,
  auto_chapters: true,
  
  // Content safety
  content_safety: true,
  
  // Word-level timestamps
  word_boost: [], // Can add custom vocabulary
  boost_param: 'default',
  
  // Language detection
  language_detection: true,
};

// Export both for convenience
export const assemblyAI = assemblyaiClient;
export const defaultConfig = defaultTranscriptionConfig;
export default assemblyaiClient;