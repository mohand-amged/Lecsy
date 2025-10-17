import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
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

    // Get transcript text and metadata
    const transcriptText = audioFile.transcription?.text || 'Transcript not available yet. Please wait for transcription to complete.';
    const fileName = audioFile.originalName || `audio-${id}`;
    const createdDate = audioFile.createdAt ? new Date(audioFile.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    const fileSize = (audioFile.fileSize / 1024 / 1024).toFixed(2);
    
    const transcript = `Transcript for ${fileName}\n\n${transcriptText}`;

    // Create PDF
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(16);
    pdf.text('Audio Transcript', 20, 20);
    
    // Add metadata
    pdf.setFontSize(10);
    pdf.text(`File Name: ${fileName}`, 20, 35);
    pdf.text(`Upload Date: ${createdDate}`, 20, 45);
    pdf.text(`File Size: ${fileSize} MB`, 20, 55);
    pdf.text(`Status: ${audioFile.transcriptionStatus}`, 20, 65);
    
    // Add transcript content
    pdf.setFontSize(12);
    const splitText = pdf.splitTextToSize(transcript, 170);
    pdf.text(splitText, 20, 80);

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="transcript-${fileName.replace(/\.[^/.]+$/, '')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}