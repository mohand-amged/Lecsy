import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'transcription_complete' | 'transcription_failed' | 'system' | 'info'
  read: boolean
  data?: {
    transcriptionId?: string
    fileName?: string
    duration?: number
    fileUrl?: string
    wordCount?: number
    error?: string
  }
  createdAt: Date
}

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock notifications until we set up proper storage
    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        userId: session.user.id,
        title: 'Transcription Complete',
        message: 'Your audio file "lecture_01.mp3" has been successfully transcribed.',
        type: 'transcription_complete',
        read: false,
        data: {
          transcriptionId: 'trans_123',
          fileName: 'lecture_01.mp3',
          duration: 1800, // 30 minutes
        },
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: 'notif_2',
        userId: session.user.id,
        title: 'Welcome to Lecsy!',
        message: 'Start by uploading your first audio file to get transcriptions.',
        type: 'info',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      }
    ]

    return NextResponse.json({ 
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.read).length
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type, data } = body

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, message, type' 
      }, { status: 400 })
    }

    // Create notification object
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.id,
      title,
      message,
      type,
      read: false,
      data: data || {},
      createdAt: new Date(),
    }

    // TODO: Store in database once Prisma is set up
    console.log('New notification created:', notification)

    return NextResponse.json({ 
      notification,
      message: 'Notification created successfully' 
    })
  } catch (error) {
    console.error('Notifications POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read
      console.log(`Marking all notifications as read for user: ${session.user.id}`)
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      console.log(`Marking notifications as read:`, notificationIds)
    } else {
      return NextResponse.json({ 
        error: 'Invalid request: provide notificationIds array or markAllAsRead flag' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Notifications marked as read successfully' 
    })
  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
