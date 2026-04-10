// API endpoint to get user statistics
import { NextRequest, NextResponse } from 'next/server';
import { getUserStatistics, analyzeUserErrors } from '@/lib/user-progress';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const includeAnalysis = request.nextUrl.searchParams.get('includeAnalysis') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const stats = await getUserStatistics(userId);

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
      const analysis = await analyzeUserErrors(userId);
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
