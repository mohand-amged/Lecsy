import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import axios from 'axios';

interface SpeechmaticsResponse {
  id: string;
}

interface TranscriptResponse {
  results: {
    transcripts: Array<{
      text: string;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'en';

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare form data for Speechmatics
    const speechmaticsForm = new FormData();
    speechmaticsForm.append('data_file', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // Configuration for Speechmatics
    const config = {
      type: 'transcription',
      transcription_config: {
        language,
        operating_point: 'enhanced',
      },
    };

    speechmaticsForm.append('config', JSON.stringify(config));

    // Send to Speechmatics
    const response = await axios.post<SpeechmaticsResponse>(
      `${process.env.SPEECHMATICS_API_URL}/jobs`,
      speechmaticsForm,
      {
        headers: {
          ...speechmaticsForm.getHeaders(),
          Authorization: `Bearer ${process.env.SPEECHMATICS_API_KEY}`,
        },
      }
    );

    const jobId = response.data.id;

    // Poll for results
    const transcript = await pollForResults(jobId);

    return NextResponse.json({
      success: true,
      jobId,
      transcript,
    });

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Transcription error:', error.response?.data || error.message);
      return NextResponse.json(
        {
          error: 'Transcription failed',
          details: error.response?.data || error.message,
        },
        { status: 500 }
      );
    }

    console.error('Unknown error:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

async function pollForResults(jobId: string, maxAttempts = 60): Promise<TranscriptResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get<TranscriptResponse>(
        `${process.env.SPEECHMATICS_API_URL}/jobs/${jobId}/transcript`,
        {
          headers: {
            Authorization: `Bearer ${process.env.SPEECHMATICS_API_KEY}`,
          },
        }
      );

      if (response.data) {
        return response.data;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Job not ready yet, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Transcription timeout');
}