// API endpoint to get all lessons
import { NextRequest, NextResponse } from 'next/server';
import { getAllLessons } from '@/lib/lesson-service';

export async function GET(request: NextRequest) {
  try {
    const lessons = await getAllLessons();
    
    return NextResponse.json({
      success: true,
      data: lessons,
      count: lessons.length,
    });
  } catch (error) {
    console.error('Error in GET /api/lessons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}
