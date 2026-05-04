import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';
import * as userProgressLib from '@/lib/user-progress';

// Mock the next/server
vi.mock('next/server', () => {
  return {
    NextRequest: vi.fn(),
    NextResponse: {
      json: vi.fn((body, init) => {
        return {
          status: init?.status || 200,
          json: async () => body,
        };
      }),
    },
  };
});

// Mock the lib
vi.mock('@/lib/user-progress', () => ({
  saveTypingSession: vi.fn(),
  updateLessonCompletion: vi.fn(),
}));

describe('User Progress API POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if userId is missing', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        lessonId: '123e4567-e89b-12d3-a456-426614174000',
        wpm: 60,
        accuracy: 95,
        errors: 2,
        timeElapsed: 60,
        erredCharacters: []
      })
    } as unknown as NextRequest;

    const response = await POST(mockRequest) as any;
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('userId and lessonId are required');
  });

  it('should return 500 if saveTypingSession returns null', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        userId: 'user-1',
        lessonId: '123e4567-e89b-12d3-a456-426614174000',
        wpm: 60,
        accuracy: 95,
        errors: 2,
        timeElapsed: 60,
        erredCharacters: []
      })
    } as unknown as NextRequest;

    vi.mocked(userProgressLib.saveTypingSession).mockResolvedValue(null);

    const response = await POST(mockRequest) as any;
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to save progress');
  });

  it('should return 500 if an error is thrown during execution', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
    } as unknown as NextRequest;

    const response = await POST(mockRequest) as any;
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to save progress');
  });

  it('should return 200 and save progress successfully', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        userId: 'user-1',
        lessonId: '123e4567-e89b-12d3-a456-426614174000',
        wpm: 60,
        accuracy: 95,
        errors: 2,
        timeElapsed: 60,
        erredCharacters: []
      })
    } as unknown as NextRequest;

    const mockProgress = { id: 'progress-1' };
    vi.mocked(userProgressLib.saveTypingSession).mockResolvedValue(mockProgress as any);
    vi.mocked(userProgressLib.updateLessonCompletion).mockResolvedValue(true);

    const response = await POST(mockRequest) as any;
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockProgress);
    expect(data.completionUpdated).toBe(true);

    expect(userProgressLib.saveTypingSession).toHaveBeenCalledWith(
      'user-1',
      '123e4567-e89b-12d3-a456-426614174000',
      60,
      95,
      2,
      60,
      []
    );
  });
});

describe('User Progress API GET', () => {
  it('should return 400 if userId is missing', async () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams()
      }
    } as unknown as NextRequest;

    const response = await GET(mockRequest) as any;
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('userId is required');
  });

  it('should return 200 and success message if userId is provided', async () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('userId=user-1')
      }
    } as unknown as NextRequest;

    const response = await GET(mockRequest) as any;
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Use GET /api/user-progress/[userId] for detailed progress');
  });

  it('should return 500 if an error is thrown', async () => {
    const mockRequest = {
      get nextUrl() {
        throw new Error('Test error');
      }
    } as unknown as NextRequest;

    const response = await GET(mockRequest) as any;
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch progress');
  });
});
