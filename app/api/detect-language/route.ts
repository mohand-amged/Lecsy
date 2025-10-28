import { NextRequest, NextResponse } from 'next/server';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

export async function POST(request: NextRequest) {
  try {
    if (!ASSEMBLYAI_API_KEY || ASSEMBLYAI_API_KEY.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'AssemblyAI API key not configured' },
        { status: 500 }
      );
    }

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const audioUrl = form.get('audioUrl') as string | null;

    if (!file && !audioUrl) {
      return NextResponse.json(
        { success: false, error: 'Either file or audioUrl must be provided' },
        { status: 400 }
      );
    }

    let finalAudioUrl = audioUrl as string | null;

    // If file is provided, upload it first to AssemblyAI temporary storage
    if (file) {
      if (file.type && !file.type.startsWith('audio')) {
        return NextResponse.json(
          { success: false, error: 'Audio format not supported' },
          { status: 400 }
        );
      }

      const uploadResponse = await fetch(`${ASSEMBLYAI_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': ASSEMBLYAI_API_KEY },
        body: file,
      });

      if (!uploadResponse.ok) {
        return NextResponse.json(
          { success: false, error: `Upload failed: ${uploadResponse.statusText}` },
          { status: 502 }
        );
      }

      const uploadData = await uploadResponse.json();
      finalAudioUrl = uploadData.upload_url;
    }

    // Create a lightweight transcript request with language detection enabled
    const createResp = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: finalAudioUrl,
        language_detection: true,
        punctuate: false,
        format_text: false,
      }),
    });

    if (!createResp.ok) {
      let msg = `Detection request failed: ${createResp.statusText}`;
      try { msg += ` - ${JSON.stringify(await createResp.json())}`; } catch {}
      return NextResponse.json({ success: false, error: msg }, { status: 502 });
    }

    const { id } = await createResp.json();

    // Poll a few times for quick detection result
    const maxAttempts = 6;
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    let detectedLanguage: string | null = null;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusResp = await fetch(`${ASSEMBLYAI_BASE_URL}/transcript/${id}`, {
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY,
        },
      });

      if (!statusResp.ok) {
        lastError = `Status check failed: ${statusResp.statusText}`;
        break;
      }

      const data = await statusResp.json();
      if (data.status === 'completed' || data.status === 'error') {
        // AssemblyAI returns language_code when detection is enabled
        detectedLanguage = data.language_code || data.language || null;
        if (data.status === 'error') {
          lastError = data.error || 'Language detection failed';
        }
        break;
      }

      await delay(1500);
    }

    if (!detectedLanguage) {
      return NextResponse.json(
        { success: false, error: lastError || 'Language detection timed out' },
        { status: 504 }
      );
    }

    // Normalize to en/ar only for this app's routing
    const normalized = detectedLanguage.startsWith('ar') ? 'ar' : 'en';

    return NextResponse.json({ success: true, language: normalized });
  } catch (error) {
    console.error('Detect language error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}