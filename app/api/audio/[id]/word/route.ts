import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { auth } from '@/lib/auth';
import { AudioService } from '@/lib/AssemblyAI/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user session for authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get audio file with transcript from database
    const audioFile = await AudioService.getAudioFileWithTranscription(id);
    if (!audioFile || audioFile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
    }

    // Get transcript text
    const transcriptText = audioFile.transcription?.text || 'Transcript not available yet. Please wait for transcription to complete.';
    const fileName = audioFile.originalName || `audio-${id}`;
    const createdDate = audioFile.createdAt ? new Date(audioFile.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

    // Create Word document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'Audio Transcript',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `File Name: ${fileName}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Upload Date: ${createdDate}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `File Size: ${(audioFile.fileSize / 1024 / 1024).toFixed(2)} MB`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Transcription Status: ${audioFile.transcriptionStatus}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              text: 'Transcript Content',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: transcriptText,
            }),
          ],
        },
      ],
    });

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc);

    // Return Word document with proper headers
    return new NextResponse(Uint8Array.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="transcript-${fileName.replace(/\.[^/.]+$/, '')}.docx"`,
      },
    });
  } catch (error) {
    console.error('Word generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Word document' },
      { status: 500 }
    );
  }
}