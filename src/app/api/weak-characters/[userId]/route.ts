// API endpoint to get user's weak characters
import { NextRequest, NextResponse } from 'next/server';
import { getUserWeakCharacters } from '@/lib/user-progress';
import { authenticate, isOwnResource } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const threshold = parseInt(request.nextUrl.searchParams.get('threshold') || '95');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Only the owner may read these weak characters.
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

    const weakCharacters = await getUserWeakCharacters(userId, threshold, auth.accessToken);

    return NextResponse.json({
      success: true,
      data: weakCharacters,
      count: weakCharacters.length,
      threshold,
    });
  } catch (error) {
    console.error('Error in GET /api/weak-characters/[userId]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weak characters' },
      { status: 500 }
    );
  }
}
