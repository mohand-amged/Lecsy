import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';
import { AudioService } from '@/lib/AssemblyAI/database';
import { put } from '@vercel/blob';

// Helper function to upload to Vercel Blob
async function uploadToVercelBlob(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; pathname: string }> {
  const blob = await put(`audio/${fileName}`, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  });
  
  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API: Starting upload process');
    
    // Get user session
    console.log('Upload API: Getting user session');
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      console.log('Upload API: No session found - unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Upload API: Session found for user:', session.user.id);

    console.log('Upload API: Parsing form data');
    const formData = await request.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      console.log('Upload API: No audio file in form data');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    console.log('Upload API: File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Generate unique filename
    const id = uuidv4();
    const fileExtension = file.name.split('.').pop() || 'mp3';
    const fileName = `${id}.${fileExtension}`;

    // Upload to Vercel Blob
    console.log('Upload API: Uploading to Vercel Blob');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        error: 'Vercel Blob not configured',
        details: 'Please add BLOB_READ_WRITE_TOKEN to your environment variables'
      }, { status: 500 });
    }
    
    const blobResult = await uploadToVercelBlob(buffer, fileName, file.type);
    console.log('Upload API: File uploaded to Vercel Blob:', blobResult.url);

    // Save to database
    console.log('Upload API: Saving to database via AudioService');
    const audioFile = await AudioService.createAudioFile({
      userId: session.user.id,
      originalName: file.name,
      fileName,
      filePath: blobResult.url,
      fileSize: file.size,
      mimeType: file.type,
    });
    console.log('Upload API: Database record created with ID:', audioFile.id);

    // Trigger background transcription (we'll implement this next)
    // await triggerTranscription(audioFile.id);

    return NextResponse.json({ id: audioFile.id });
  } catch (error) {
    console.error('Upload API: Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload file';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorDetails.includes('connect') || errorDetails.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection failed';
      errorDetails = 'Please check your DATABASE_URL environment variable and ensure your database is running';
    } else if (errorDetails.includes('relation') || errorDetails.includes('table')) {
      errorMessage = 'Database table not found';
      errorDetails = 'Please run database migrations: npm run db:generate && npm run db:push';
    } else if (errorDetails.includes('permission') || errorDetails.includes('EACCES')) {
      errorMessage = 'File system permission error';
      errorDetails = 'Unable to create uploads directory or save file';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}