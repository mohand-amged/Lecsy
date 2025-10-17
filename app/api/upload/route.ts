import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';
import { auth } from '@/lib/auth';
import { AudioService } from '@/lib/AssemblyAI/database';

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

    // Save file
    console.log('Upload API: Saving file to disk');
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      console.log('Upload API: Creating uploads directory');
      await mkdir(uploadsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    console.log('Upload API: File saved to:', filePath);

    // Save to database
    console.log('Upload API: Saving to database via AudioService');
    const audioFile = await AudioService.createAudioFile({
      userId: session.user.id,
      originalName: file.name,
      fileName,
      filePath: `/uploads/${fileName}`,
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