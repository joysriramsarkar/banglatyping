// API endpoint to manage custom drills
import { NextRequest, NextResponse } from 'next/server';
import { 
  createWeakCharacterDrill, 
  getUserCustomDrills,
  updateCustomDrillUsage,
  deleteCustomDrill,
  getDrillRecommendations
} from '@/lib/custom-drill-generator';

// GET: Retrieve custom drills for a user or recommendations
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const action = request.nextUrl.searchParams.get('action'); // 'list', 'recommendations'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (action === 'recommendations') {
      const recommendations = await getDrillRecommendations(userId);
      return NextResponse.json({
        success: true,
        data: recommendations,
      });
    }

    // Default: List custom drills
    const customDrills = await getUserCustomDrills(userId);

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
    const body = await request.json();
    const { userId, threshold = 85, minCharacters = 5, maxCharacters = 20, drillCount = 100 } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const customDrill = await createWeakCharacterDrill(
      userId,
      threshold,
      minCharacters,
      maxCharacters,
      drillCount
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
    const body = await request.json();
    const { drillId, action = 'recordUsage' } = body;

    if (!drillId) {
      return NextResponse.json(
        { success: false, error: 'drillId is required' },
        { status: 400 }
      );
    }

    if (action === 'recordUsage') {
      const updated = await updateCustomDrillUsage(drillId);
      
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
    const drillId = request.nextUrl.searchParams.get('drillId');

    if (!drillId) {
      return NextResponse.json(
        { success: false, error: 'drillId is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteCustomDrill(drillId);

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
