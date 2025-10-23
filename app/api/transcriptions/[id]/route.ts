import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { transcription } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Get a specific transcription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await db
      .select()
      .from(transcription)
      .where(
        and(
          eq(transcription.id, id),
          eq(transcription.userId, session.user.id)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transcription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transcription: result[0],
    });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transcription' },
      { status: 500 }
    );
  }
}

// PATCH - Update transcription (rename, update text, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, text, status } = body;

    // Build update object dynamically
    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (text !== undefined) updateData.text = text;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await db
      .update(transcription)
      .set(updateData)
      .where(
        and(
          eq(transcription.id, id),
          eq(transcription.userId, session.user.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transcription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transcription: result[0],
    });
  } catch (error) {
    console.error('Error updating transcription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update transcription' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a transcription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await db
      .delete(transcription)
      .where(
        and(
          eq(transcription.id, id),
          eq(transcription.userId, session.user.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transcription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transcription deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transcription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete transcription' },
      { status: 500 }
    );
  }
}
