// API endpoint to save user typing session progress
import { NextRequest, NextResponse } from 'next/server';
import { saveTypingSession, updateLessonCompletion, DEFAULT_PRACTICE_LESSON_ID } from '@/lib/user-progress';
import type { ErredCharacter } from '@/lib/types';
import { authenticate, isOwnResource } from '@/lib/api-auth';

interface SaveProgressRequest {
  userId: string;
  lessonId: string;
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  erredCharacters: ErredCharacter[];
}

export async function POST(request: NextRequest) {
  try {
    // Progress is always written against the verified caller, never against a
    // user id supplied in the request body.
    const auth = await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: SaveProgressRequest = await request.json();

    const { userId, lessonId, wpm, accuracy, errors, timeElapsed, erredCharacters } = body;

    if (userId && userId !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate lessonId is a valid UUID, otherwise use default practice lesson UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validLessonId = lessonId && uuidRegex.test(lessonId) ? lessonId : null;
    const sessionLessonId = validLessonId || DEFAULT_PRACTICE_LESSON_ID;

    // Save the typing session
    const progress = await saveTypingSession(
      auth.user.id,
      sessionLessonId,
      wpm,
      accuracy,
      errors,
      timeElapsed,
      erredCharacters || [],
      auth.accessToken
    );

    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Failed to save progress' },
        { status: 500 }
      );
    }

    // Update lesson completion stats
    const completionUpdated = validLessonId
      ? await updateLessonCompletion(auth.user.id, validLessonId, accuracy, wpm, auth.accessToken)
      : false;

    return NextResponse.json({
      success: true,
      data: progress,
      completionUpdated,
      message: 'Progress saved successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/user-progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's progress
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const _lessonId = request.nextUrl.searchParams.get('lessonId');
    const _limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const _offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const auth = await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!isOwnResource(auth.user, userId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Note: For GET, implement query logic based on filters
    // This would typically fetch from database with pagination
    
    return NextResponse.json({
      success: true,
      message: 'Use GET /api/user-progress/[userId] for detailed progress',
    });
  } catch (error) {
    console.error('Error in GET /api/user-progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
