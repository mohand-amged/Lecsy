import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        // Note: bio field doesn't exist in the schema, you may need to add it
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's transcription sessions (completed ones with transcripts)
    const transcriptions = await prisma.transcription.findMany({
      where: {
        userId,
        status: 'completed',
        transcript: { not: null }
      },
      select: {
        id: true,
        fileName: true,
        transcript: true,
        createdAt: true,
        fileDuration: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform the data to match the dashboard component interface
    const sessions = transcriptions.map(transcription => ({
      id: transcription.id,
      title: transcription.fileName,
      transcript: transcription.transcript || '',
      timestamp: transcription.createdAt,
      duration: transcription.fileDuration || undefined,
      wordCount: transcription.transcript ? transcription.transcript.trim().split(/\s+/).filter(Boolean).length : 0,
      starred: false, // Default to false, you can add this field to the schema later
      archived: false, // Default to false, you can add this field to the schema later
      tags: [], // Default to empty array, you can add this field to the schema later
    }))

    return NextResponse.json({
      user: {
        ...user,
        bio: '', // Add default bio since it's not in schema yet
      },
      sessions,
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
