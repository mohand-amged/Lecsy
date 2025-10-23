import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API: Processing audio file (no storage)');
    
    // Get user session
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    console.log('Audio file received:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Simply return success - no storage or database operations
    return NextResponse.json({ 
      success: true,
      message: 'Audio file processed successfully',
      filename: file.name,
      size: file.size,
      type: file.type
    });
    
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process audio file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
