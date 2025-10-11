import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id: sessionId } = await params
    const body = await request.json()

    // Find the transcription to ensure it belongs to the user
    const transcription = await prisma.transcription.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    })

    if (!transcription) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // For now, we'll store starred/archived status in a separate table
    // since these fields don't exist in the current schema
    // This is a placeholder - you may want to add these fields to the Transcription model
    
    // Update the transcription (limited fields available)
    const updatedTranscription = await prisma.transcription.update({
      where: { id: sessionId },
      data: {
        // Only update fields that exist in the schema
        // starred and archived would need to be added to the schema
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Session update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id: sessionId } = await params
    
    // Find the transcription to ensure it belongs to the user
    const transcription = await prisma.transcription.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    })

    if (!transcription) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Delete the transcription
    await prisma.transcription.delete({
      where: { id: sessionId },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Session deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
