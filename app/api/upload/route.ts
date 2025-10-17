import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';
import { AudioService } from '@/lib/AssemblyAI/database';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload to Cloudinary
async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  originalName: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'video', // Use 'video' for audio files
        public_id: `audio/${fileName}`,
        folder: 'lecsy-audio',
        format: 'mp3',
        tags: ['audio', 'transcription'],
        context: {
          original_name: originalName,
          uploaded_at: new Date().toISOString(),
        },
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed - no result'));
        }
      }
    ).end(buffer);
  });
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

    // Upload to Cloudinary
    console.log('Upload API: Uploading to Cloudinary');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({
        error: 'Cloudinary not configured',
        details: 'Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables'
      }, { status: 500 });
    }
    
    const cloudinaryResult = await uploadToCloudinary(buffer, fileName, file.name);
    console.log('Upload API: File uploaded to Cloudinary:', cloudinaryResult.url);

    // Save to database
    console.log('Upload API: Saving to database via AudioService');
    const audioFile = await AudioService.createAudioFile({
      userId: session.user.id,
      originalName: file.name,
      fileName,
      filePath: cloudinaryResult.url,
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