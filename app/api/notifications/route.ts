import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { notification } from '@/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET: list notifications and unread count for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadCountOnly = searchParams.get('unreadCountOnly') === '1';

    const unread = await db
      .select({ count: notification.id })
      .from(notification)
      .where(and(eq(notification.userId, session.user.id), eq(notification.read, false)));

    const unreadCount = Array.isArray(unread) ? unread.length : 0; // drizzle returns rows; counting via length of selected ids

    if (unreadCountOnly) {
      return NextResponse.json({ success: true, unreadCount });
    }

    const items = await db
      .select()
      .from(notification)
      .where(eq(notification.userId, session.user.id))
      .orderBy(desc(notification.createdAt))
      .limit(50);

    return NextResponse.json({ success: true, notifications: items, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST: create a notification for current user
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, body: nBody, type, resourceId } = body || {};
    if (!title) return NextResponse.json({ success: false, error: 'title is required' }, { status: 400 });

    const { v4: uuidv4 } = await import('uuid');

    const [row] = await db
      .insert(notification)
      .values({
        id: id || uuidv4(),
        userId: session.user.id,
        title,
        body: nBody,
        type,
        resourceId,
      })
      .returning();

    return NextResponse.json({ success: true, notification: row });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}
