// API endpoint to save user typing session progress
import { NextRequest, NextResponse } from 'next/server';
import { saveTypingSession, updateLessonCompletion } from '@/lib/user-progress';
import type { ErredCharacter } from '@/lib/types';
import { authenticate, isOwnResource } from '@/lib/api-auth';
import {
  saveProgressSchema,
  normalizeLessonId,
  consumeIdempotencyKey,
} from '@/lib/progress-validation';

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

    const idempotencyKey = request.headers.get('x-idempotency-key');
    if (idempotencyKey && consumeIdempotencyKey(idempotencyKey)) {
      return NextResponse.json(
        { success: true, duplicate: true, message: 'Duplicate request ignored' },
        { status: 200 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'অকার্যকর অনুরোধ: JSON পড়া যায়নি' },
        { status: 422 }
      );
    }

    const parsed = saveProgressSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message = firstIssue?.message ?? 'অকার্যকর অনুরোধ: তথ্য যাচাই ব্যর্থ হয়েছে';
      return NextResponse.json(
        { success: false, error: message, details: parsed.error.issues },
        { status: 422 }
      );
    }

    const { userId, wpm, accuracy, errors, timeElapsed, erredCharacters, attemptedCharacters } =
      parsed.data;

    if (userId && userId !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Reject physically implausible sessions: a sub-2s burst claiming 200+ WPM
    // is a scripted payload, not a typing session.
    if (timeElapsed < 2000 && wpm >= 200) {
      return NextResponse.json(
        { success: false, error: 'অকার্যকর সেশন: এত কম সময়ে এত গতি সম্ভব নয়' },
        { status: 422 }
      );
    }

    // Invalid UUID -> null (general practice session). Never the nil UUID.
    const rawLessonId = (body as { lessonId?: unknown }).lessonId;
    const validLessonId: string | null = normalizeLessonId(rawLessonId);

    // Save the typing session. The attemptedCharacters argument is only
    // passed when the client sent it, keeping the 8-arg call shape for
    // older callers.
    const erred = (erredCharacters ?? []) as ErredCharacter[];
    const progress =
      attemptedCharacters !== undefined
        ? await saveTypingSession(
            auth.user.id,
            validLessonId,
            wpm,
            accuracy,
            errors,
            timeElapsed,
            erred,
            auth.accessToken,
            attemptedCharacters as ErredCharacter[]
          )
        : await saveTypingSession(
            auth.user.id,
            validLessonId,
            wpm,
            accuracy,
            errors,
            timeElapsed,
            erred,
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
    // Cap pagination params so a crafted query cannot request an unbounded scan.
    const _limit = Math.min(
      Math.max(parseInt(request.nextUrl.searchParams.get('limit') || '50', 10) || 50, 1),
      100
    );
    const _offset = Math.max(parseInt(request.nextUrl.searchParams.get('offset') || '0', 10) || 0, 0);
    const rawThreshold = request.nextUrl.searchParams.get('threshold');
    const _threshold =
      rawThreshold === null ? undefined : Math.min(Math.max(Number(rawThreshold) || 0, 0), 100);

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
