import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { notification } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all read:', error);
    return NextResponse.json({ success: false, error: 'Failed to mark as read' }, { status: 500 });
  }
}
