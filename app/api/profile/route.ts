import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, image, bio } = body

    // Validate input
    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    if (email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (bio && (typeof bio !== 'string' || bio.length > 500)) {
      return NextResponse.json({ error: 'Bio must be 500 characters or less' }, { status: 400 })
    }

    if (image && (typeof image !== 'string' || !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(image))) {
      return NextResponse.json({ error: 'Invalid image URL format' }, { status: 400 })
    }

    // Check if email is already taken by another user
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim() }),
        ...(image !== undefined && { image: image.trim() || null }),
        // Note: bio field might need to be added to your Prisma schema
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ 
      user: updatedUser,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
