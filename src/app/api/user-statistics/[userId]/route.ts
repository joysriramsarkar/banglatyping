// API endpoint to get user statistics
import { NextRequest, NextResponse } from 'next/server';
import { getUserStatistics, analyzeUserErrors } from '@/lib/user-progress';
import { authenticate, isOwnResource } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const includeAnalysis = request.nextUrl.searchParams.get('includeAnalysis') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Only the owner may read these statistics.
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

    const stats = await getUserStatistics(userId, auth.accessToken);

    if (!stats) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user statistics' },
        { status: 500 }
      );
    }

    const response: any = {
      success: true,
      data: stats,
    };

    // Optionally include error analysis
    if (includeAnalysis) {
      const analysis = await analyzeUserErrors(userId, auth.accessToken);
      response.analysis = analysis;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/user-statistics/[userId]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
