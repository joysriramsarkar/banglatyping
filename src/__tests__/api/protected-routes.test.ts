import type { NextRequest } from 'next/server';
import { GET as getStatistics } from '@/app/api/user-statistics/[userId]/route';
import { GET as getWeakCharacters } from '@/app/api/weak-characters/[userId]/route';
import { POST as saveProgress } from '@/app/api/user-progress/route';
import {
  getUserStatistics,
  analyzeUserErrors,
  getUserWeakCharacters,
  saveTypingSession,
  updateLessonCompletion,
} from '@/lib/user-progress';
import { SUPABASE_AUTH_HEADER } from '@/lib/auth-header';

const mockGetUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: { getUser: mockGetUser } })),
}));

jest.mock('@/lib/user-progress', () => ({
  getUserStatistics: jest.fn(),
  analyzeUserErrors: jest.fn(),
  getUserWeakCharacters: jest.fn(),
  saveTypingSession: jest.fn(),
  updateLessonCompletion: jest.fn(),
}));

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

const OWNER = 'user-1';
const INTRUDER = 'user-2';

function signedInAs(userId: string) {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
}

function request(url: string, options: { token?: string; body?: unknown } = {}): NextRequest {
  const headers = new Headers();
  if (options.token) headers.set(SUPABASE_AUTH_HEADER, options.token);

  return {
    headers,
    nextUrl: new URL(url),
    json: async () => options.body,
  } as unknown as NextRequest;
}

const statsParams = (userId: string) => ({ params: Promise.resolve({ userId }) });

describe('GET /api/user-statistics/[userId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserStatistics as jest.Mock).mockResolvedValue({ user_id: OWNER, best_wpm: 42 });
  });

  it('returns 401 without a token and never touches the database', async () => {
    const res: any = await getStatistics(request(`http://localhost/api/user-statistics/${OWNER}`), statsParams(OWNER) as any);

    expect(res.status).toBe(401);
    expect(getUserStatistics).not.toHaveBeenCalled();
  });

  it('returns 403 when asking for somebody else\'s statistics', async () => {
    signedInAs(OWNER);

    const res: any = await getStatistics(
      request(`http://localhost/api/user-statistics/${INTRUDER}`, { token: 'owner-token' }),
      statsParams(INTRUDER) as any
    );

    expect(res.status).toBe(403);
    expect(getUserStatistics).not.toHaveBeenCalled();
  });

  it('returns the statistics to their owner and forwards the access token', async () => {
    signedInAs(OWNER);

    const res: any = await getStatistics(
      request(`http://localhost/api/user-statistics/${OWNER}`, { token: 'owner-token' }),
      statsParams(OWNER) as any
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, data: { user_id: OWNER, best_wpm: 42 } });
    expect(getUserStatistics).toHaveBeenCalledWith(OWNER, 'owner-token');
  });

  it('includes the error analysis only when asked for', async () => {
    signedInAs(OWNER);
    (analyzeUserErrors as jest.Mock).mockResolvedValue({ totalWeakChars: 3 });

    await getStatistics(
      request(`http://localhost/api/user-statistics/${OWNER}?includeAnalysis=true`, { token: 'owner-token' }),
      statsParams(OWNER) as any
    );

    expect(analyzeUserErrors).toHaveBeenCalledWith(OWNER, 'owner-token');
  });
});

describe('GET /api/weak-characters/[userId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserWeakCharacters as jest.Mock).mockResolvedValue([]);
  });

  it('returns 401 without a token', async () => {
    const res: any = await getWeakCharacters(request(`http://localhost/api/weak-characters/${OWNER}`), statsParams(OWNER) as any);

    expect(res.status).toBe(401);
    expect(getUserWeakCharacters).not.toHaveBeenCalled();
  });

  it('returns 403 for another user\'s weak characters', async () => {
    signedInAs(OWNER);

    const res: any = await getWeakCharacters(
      request(`http://localhost/api/weak-characters/${INTRUDER}`, { token: 'owner-token' }),
      statsParams(INTRUDER) as any
    );

    expect(res.status).toBe(403);
    expect(getUserWeakCharacters).not.toHaveBeenCalled();
  });

  it('returns the caller\'s own weak characters with the threshold applied', async () => {
    signedInAs(OWNER);

    const res: any = await getWeakCharacters(
      request(`http://localhost/api/weak-characters/${OWNER}?threshold=80`, { token: 'owner-token' }),
      statsParams(OWNER) as any
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, data: [], count: 0, threshold: 80 });
    expect(getUserWeakCharacters).toHaveBeenCalledWith(OWNER, 80, 'owner-token');
  });
});

describe('POST /api/user-progress', () => {
  const progressBody = (userId: string) => ({
    userId,
    lessonId: '11111111-1111-1111-1111-111111111111',
    wpm: 30,
    accuracy: 96,
    errors: 2,
    timeElapsed: 60,
    erredCharacters: [{ char: 'ক', count: 2 }],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (saveTypingSession as jest.Mock).mockResolvedValue({ id: 'session-1' });
    (updateLessonCompletion as jest.Mock).mockResolvedValue(true);
  });

  it('returns 401 without a token and writes nothing', async () => {
    const res: any = await saveProgress(
      request('http://localhost/api/user-progress', { body: progressBody(OWNER) })
    );

    expect(res.status).toBe(401);
    expect(saveTypingSession).not.toHaveBeenCalled();
  });

  it('returns 403 when the body names a different user', async () => {
    signedInAs(OWNER);

    const res: any = await saveProgress(
      request('http://localhost/api/user-progress', { token: 'owner-token', body: progressBody(INTRUDER) })
    );

    expect(res.status).toBe(403);
    expect(saveTypingSession).not.toHaveBeenCalled();
  });

  it('writes against the verified caller, not the body', async () => {
    signedInAs(OWNER);

    const res: any = await saveProgress(
      request('http://localhost/api/user-progress', { token: 'owner-token', body: progressBody(OWNER) })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(saveTypingSession).toHaveBeenCalledWith(
      OWNER,
      '11111111-1111-1111-1111-111111111111',
      30,
      96,
      2,
      60,
      [{ char: 'ক', count: 2 }],
      'owner-token'
    );
    expect(updateLessonCompletion).toHaveBeenCalledWith(
      OWNER,
      '11111111-1111-1111-1111-111111111111',
      96,
      30,
      'owner-token'
    );
  });

  it('still saves when the client omits the userId entirely', async () => {
    signedInAs(OWNER);
    const { userId: _userId, ...withoutUserId } = progressBody(OWNER);

    const res: any = await saveProgress(
      request('http://localhost/api/user-progress', { token: 'owner-token', body: withoutUserId })
    );

    expect(res.status).toBe(200);
    expect((saveTypingSession as jest.Mock).mock.calls[0][0]).toBe(OWNER);
  });
});
