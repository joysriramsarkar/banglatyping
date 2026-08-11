// API endpoint to manage custom drills
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { 
  createWeakCharacterDrill, 
  getUserCustomDrills,
  updateCustomDrillUsage,
  deleteCustomDrill,
  getDrillRecommendations
} from '@/lib/custom-drill-generator';

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('x-supabase-access-token');

  if (!authHeader) {
    return null;
  }

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data: { user }, error } = await supabaseClient.auth.getUser(authHeader);

  if (error || !user) {
    return null;
  }

  return user;
}

// GET: Retrieve custom drills for a user or recommendations
export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const requestedUserId = request.nextUrl.searchParams.get('userId');
    const action = request.nextUrl.searchParams.get('action'); // 'list', 'recommendations'
    const userId = authenticatedUser.id;

    if (requestedUserId && requestedUserId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
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
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, threshold = 85, minCharacters = 5, maxCharacters = 20, drillCount = 100 } = body;
    const resolvedUserId = userId && userId !== authenticatedUser.id ? authenticatedUser.id : authenticatedUser.id;

    if (!resolvedUserId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const customDrill = await createWeakCharacterDrill(
      resolvedUserId,
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
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
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
      const updated = await updateCustomDrillUsage(drillId, authenticatedUser.id);
      
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
    const authenticatedUser = await getAuthenticatedUser(request);

    if (!authenticatedUser) {
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

    const deleted = await deleteCustomDrill(drillId, authenticatedUser.id);

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
