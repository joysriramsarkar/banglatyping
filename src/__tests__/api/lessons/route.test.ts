import { NextRequest } from 'next/server';
import { GET } from '@/app/api/lessons/route';
import { getAllLessons } from '@/lib/lesson-service';

// Mock the dependencies
jest.mock('@/lib/lesson-service', () => ({
  getAllLessons: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn().mockImplementation((body, init) => {
        return {
          status: init?.status || 200,
          json: async () => body,
        };
      }),
    },
  };
});

describe('GET /api/lessons', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      url: 'http://localhost:3000/api/lessons',
      nextUrl: new URL('http://localhost:3000/api/lessons'),
    };
  });

  it('should return lessons successfully', async () => {
    // Arrange
    const mockLessons = [
      { id: '1', title: 'Lesson 1' },
      { id: '2', title: 'Lesson 2' }
    ];
    (getAllLessons as jest.Mock).mockResolvedValue(mockLessons);

    // Act
    const response: any = await GET(mockRequest as NextRequest);
    const data = await response.json();

    // Assert
    expect(getAllLessons).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: mockLessons,
      count: 2,
    });
  });

  it('should handle errors and return 500', async () => {
    // Arrange
    const mockError = new Error('Database error');
    (getAllLessons as jest.Mock).mockRejectedValue(mockError);

    // Spy on console.error to prevent it from cluttering the test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const response: any = await GET(mockRequest as NextRequest);
    const data = await response.json();

    // Assert
    expect(getAllLessons).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: 'Failed to fetch lessons',
    });

    // Cleanup
    consoleSpy.mockRestore();
  });
});
