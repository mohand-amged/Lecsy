import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { transcription } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query real data from database
    const userTranscriptions = await db
      .select()
      .from(transcription)
      .where(eq(transcription.userId, session.user.id))
      .orderBy(desc(transcription.createdAt));

    // Calculate total minutes from duration field
    const totalMinutes = userTranscriptions.reduce((sum, t) => {
      if (t.duration) {
        // Parse duration string (could be in seconds or "MM:SS" format)
        const durationInSeconds = parseFloat(t.duration);
        if (!isNaN(durationInSeconds)) {
          return sum + Math.floor(durationInSeconds / 60);
        }
      }
      return sum;
    }, 0);

    // Get recent recordings (last 5)
    const recentRecordings = userTranscriptions.slice(0, 5).map(t => ({
      id: t.id,
      originalName: t.name,
      transcriptionStatus: t.status as 'pending' | 'processing' | 'completed' | 'error',
      createdAt: t.createdAt.toISOString(),
      duration: t.duration ? parseFloat(t.duration) : undefined,
    }));

    const stats = {
      totalAudios: userTranscriptions.length,
      totalMinutes,
      lastUpload: userTranscriptions[0]?.createdAt.toISOString(),
      recentRecordings
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
