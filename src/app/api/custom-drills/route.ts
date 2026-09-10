// API endpoint to manage custom drills
import { NextRequest, NextResponse } from 'next/server';
import { 
  createWeakCharacterDrill, 
  getUserCustomDrills,
  updateCustomDrillUsage,
  deleteCustomDrill,
  getDrillRecommendations
} from '@/lib/custom-drill-generator';
import { authenticate, isOwnResource } from '@/lib/api-auth';

// GET: Retrieve custom drills for a user or recommendations
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const requestedUserId = request.nextUrl.searchParams.get('userId');
    const action = request.nextUrl.searchParams.get('action'); // 'list', 'recommendations'
    const userId = auth.user.id;

    if (requestedUserId && !isOwnResource(auth.user, requestedUserId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (action === 'recommendations') {
      const recommendations = await getDrillRecommendations(userId, auth.accessToken);
      return NextResponse.json({
        success: true,
        data: recommendations,
      });
    }

    // Default: List custom drills
    const customDrills = await getUserCustomDrills(userId, 10, auth.accessToken);

    return NextResponse.json({
      success: true,
      data: customDrills,
      count: customDrills.length,
    });
  } catch (error) {
    console.error('Error in GET /api/custom-drills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch custom drills' },
      { status: 500 }
    );
  }
}

// POST: Create a new custom drill
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { threshold = 85, minCharacters = 5, maxCharacters = 20, drillCount = 100 } = body;

    // Drills are always created for the verified caller.
    const resolvedUserId = auth.user.id;

    const customDrill = await createWeakCharacterDrill(
      resolvedUserId,
      threshold,
      minCharacters,
      maxCharacters,
      drillCount,
      auth.accessToken
    );

    if (!customDrill) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Could not create custom drill. You may not have enough weak characters yet.' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customDrill,
      message: 'Custom drill created successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/custom-drills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create custom drill' },
      { status: 500 }
    );
  }
}

// PATCH: Update custom drill usage
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { drillId, action = 'recordUsage' } = body;

    if (!drillId) {
      return NextResponse.json(
        { success: false, error: 'drillId is required' },
        { status: 400 }
      );
    }

    if (action === 'recordUsage') {
      const updated = await updateCustomDrillUsage(drillId, auth.user.id, auth.accessToken);
      
      return NextResponse.json({
        success: updated,
        message: updated ? 'Drill usage recorded' : 'Failed to update drill usage',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/custom-drills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update custom drill' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a custom drill
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const drillId = request.nextUrl.searchParams.get('drillId');

    if (!drillId) {
      return NextResponse.json(
        { success: false, error: 'drillId is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteCustomDrill(drillId, auth.user.id, auth.accessToken);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete custom drill' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Custom drill deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/custom-drills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete custom drill' },
      { status: 500 }
    );
  }
}
