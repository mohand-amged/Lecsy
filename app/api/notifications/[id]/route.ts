import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { notification } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const read = body?.read;

    if (typeof read !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const res = await db
      .update(notification)
      .set({ read })
      .where(and(eq(notification.id, id), eq(notification.userId, session.user.id)))
      .returning();

    if (!res.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification: res[0] });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const res = await db
      .delete(notification)
      .where(and(eq(notification.id, id), eq(notification.userId, session.user.id)))
      .returning();

    if (!res.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 });
  }
}
