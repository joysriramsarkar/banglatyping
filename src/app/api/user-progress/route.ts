// API endpoint to save user typing session progress
import { NextRequest, NextResponse } from 'next/server';
import { saveTypingSession, updateLessonCompletion } from '@/lib/user-progress';
import type { ErredCharacter } from '@/lib/types';

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
    const body: SaveProgressRequest = await request.json();

    const { userId, lessonId, wpm, accuracy, errors, timeElapsed, erredCharacters } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId and lessonId are required' },
        { status: 400 }
      );
    }

    // Validate lessonId is a valid UUID, otherwise use null
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validLessonId = lessonId && uuidRegex.test(lessonId) ? lessonId : null;

    // Save the typing session
    const progress = await saveTypingSession(
      userId,
      validLessonId,
      wpm,
      accuracy,
      errors,
      timeElapsed,
      erredCharacters || []
    );

    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Failed to save progress' },
        { status: 500 }
      );
    }

    // Update lesson completion stats
    const completionUpdated = validLessonId
      ? await updateLessonCompletion(userId, validLessonId, accuracy, wpm)
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
    const lessonId = request.nextUrl.searchParams.get('lessonId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
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
