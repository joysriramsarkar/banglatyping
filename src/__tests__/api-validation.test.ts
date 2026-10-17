import { NextRequest } from 'next/server';
import { POST } from '@/app/api/user-progress/route';
import { normalizeLessonId, resetIdempotencyKeysForTesting } from '@/lib/progress-validation';

// NextResponse.json relies on edge-runtime cookies unavailable in jsdom;
// mirror the approach in protected-routes.test.ts.
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn().mockImplementation((body, init) => ({
        status: init?.status || 200,
        json: async () => body,
      })),
    },
  };
});

const mockSaveTypingSession = jest.fn();
const mockUpdateLessonCompletion = jest.fn();
const mockAuthenticate = jest.fn();

jest.mock('@/lib/user-progress', () => ({
  saveTypingSession: (...args: unknown[]) => mockSaveTypingSession(...args),
  updateLessonCompletion: (...args: unknown[]) => mockUpdateLessonCompletion(...args),
}));

jest.mock('@/lib/api-auth', () => ({
  authenticate: (...args: unknown[]) => mockAuthenticate(...args),
  isOwnResource: (user: { id: string }, id: string | null | undefined) =>
    Boolean(id) && id === user.id,
}));

const OWNER_ID = 'user-1';

function postRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  // Build a minimal request shape (same approach as protected-routes.test.ts):
  // the route only touches headers.get() and json().
  const h = new Headers({ 'content-type': 'application/json', ...(headers ?? {}) });
  return {
    headers: h,
    json: async () => body,
  } as unknown as NextRequest;
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    userId: OWNER_ID,
    lessonId: null,
    wpm: 45,
    accuracy: 97.5,
    errors: 2,
    timeElapsed: 60000,
    erredCharacters: [{ char: 'ক', count: 1 }],
    ...overrides,
  };
}

describe('POST /api/user-progress validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetIdempotencyKeysForTesting();
    mockAuthenticate.mockResolvedValue({ user: { id: OWNER_ID }, accessToken: 'tok' });
    mockSaveTypingSession.mockResolvedValue({ id: 'progress-1' });
    mockUpdateLessonCompletion.mockResolvedValue(true);
  });

  it('returns 422 for an impossible wpm (9999)', async () => {
    const res = await POST(postRequest(validBody({ wpm: 9999 })));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(typeof json.error).toBe('string');
    expect(mockSaveTypingSession).not.toHaveBeenCalled();
  });

  it('returns 422 for accuracy above 100 (150)', async () => {
    const res = await POST(postRequest(validBody({ accuracy: 150 })));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(mockSaveTypingSession).not.toHaveBeenCalled();
  });

  it('returns 422 for negative timeElapsed', async () => {
    const res = await POST(postRequest(validBody({ timeElapsed: -5 })));
    expect(res.status).toBe(422);
    expect(mockSaveTypingSession).not.toHaveBeenCalled();
  });

  it('coerces an invalid lessonId to null instead of rejecting or using a nil UUID', async () => {
    expect(normalizeLessonId('not-a-uuid')).toBeNull();

    const res = await POST(postRequest(validBody({ lessonId: 'not-a-uuid' })));
    expect(res.status).toBe(200);
    expect(mockSaveTypingSession).toHaveBeenCalled();
    // lessonId is the 2nd positional arg of saveTypingSession
    expect(mockSaveTypingSession.mock.calls[0][1]).toBeNull();
  });

  it('rejects a sub-2s session claiming 200+ WPM', async () => {
    const res = await POST(postRequest(validBody({ timeElapsed: 1000, wpm: 250 })));
    expect(res.status).toBe(422);
    expect(mockSaveTypingSession).not.toHaveBeenCalled();
  });

  it('ignores a duplicate request replayed with the same Idempotency-Key', async () => {
    const headers = { 'x-idempotency-key': 'key-123' };
    const first = await POST(postRequest(validBody(), headers));
    expect(first.status).toBe(200);
    expect(mockSaveTypingSession).toHaveBeenCalledTimes(1);

    const second = await POST(postRequest(validBody(), headers));
    expect(second.status).toBe(200);
    const json = await second.json();
    expect(json.duplicate).toBe(true);
    expect(mockSaveTypingSession).toHaveBeenCalledTimes(1);
  });

  it('accepts a valid payload', async () => {
    const res = await POST(postRequest(validBody()));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
