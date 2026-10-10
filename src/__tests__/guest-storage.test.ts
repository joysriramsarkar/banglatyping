/**
 * Unit Tests for Guest Session Storage & Sync
 */

import {
  getGuestSessions,
  saveGuestSession,
  getGuestStats,
  syncGuestSessionsToUser,
} from '../lib/guest-storage';
import { apiFetch } from '../lib/api-client';

jest.mock('../lib/api-client', () => ({
  apiFetch: jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  }),
}));

describe('Guest Storage Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('returns empty array when no guest sessions exist', () => {
    expect(getGuestSessions()).toEqual([]);
  });

  test('saves guest session and updates stats', () => {
    const session = saveGuestSession({
      lessonId: 'lesson-1',
      wpm: 35,
      accuracy: 96,
      errors: 2,
      timeElapsed: 30,
      erredCharacters: [{ char: 'ক', count: 2 }],
    });

    expect(session.id).toBeDefined();
    expect(session.wpm).toBe(35);
    expect(session.createdAt).toBeDefined();

    const stored = getGuestSessions();
    expect(stored.length).toBe(1);
    expect(stored[0].lessonId).toBe('lesson-1');

    const stats = getGuestStats();
    expect(stats.totalSessions).toBe(1);
    expect(stats.highestWpm).toBe(35);
    expect(stats.averageWpm).toBe(35);
    expect(stats.averageAccuracy).toBe(96);
  });

  test('aggregates stats for multiple guest sessions', () => {
    saveGuestSession({
      lessonId: 'l1',
      wpm: 20,
      accuracy: 90,
      errors: 5,
      timeElapsed: 25,
      erredCharacters: [],
    });
    saveGuestSession({
      lessonId: 'l2',
      wpm: 40,
      accuracy: 100,
      errors: 0,
      timeElapsed: 20,
      erredCharacters: [],
    });

    const stats = getGuestStats();
    expect(stats.totalSessions).toBe(2);
    expect(stats.highestWpm).toBe(40);
    expect(stats.averageWpm).toBe(30);
    expect(stats.averageAccuracy).toBe(95);
  });

  test('syncs guest sessions to user and clears local queue', async () => {
    saveGuestSession({
      lessonId: 'l1',
      wpm: 25,
      accuracy: 95,
      errors: 1,
      timeElapsed: 15,
      erredCharacters: [],
    });

    const synced = await syncGuestSessionsToUser('user-123');
    expect(synced).toBe(1);
    expect(apiFetch).toHaveBeenCalled();
    expect(getGuestSessions()).toEqual([]);
  });

  test('returns 0 when sync is called on empty sessions', async () => {
    const synced = await syncGuestSessionsToUser('user-123');
    expect(synced).toBe(0);
  });

  test('keeps only the failed sessions when upload partially fails', async () => {
    const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;

    saveGuestSession({ lessonId: 'ok-2', wpm: 40, accuracy: 98, errors: 0, timeElapsed: 25, erredCharacters: [] });
    saveGuestSession({ lessonId: 'fail', wpm: 30, accuracy: 90, errors: 2, timeElapsed: 20, erredCharacters: [] });
    saveGuestSession({ lessonId: 'ok-1', wpm: 25, accuracy: 95, errors: 1, timeElapsed: 15, erredCharacters: [] });

    // Iteration order is newest-first: ok-2 (ok), fail (rejected), ok-1 (ok).
    apiFetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) } as never)
      .mockResolvedValueOnce({ ok: false, json: async () => ({ success: false }) } as never)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) } as never);

    const synced = await syncGuestSessionsToUser('user-1');
    expect(synced).toBe(2);

    const remaining = getGuestSessions();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].lessonId).toBe('fail');
  });

  test('sends a stable client session id for idempotent retries', async () => {
    const apiFetchMock = apiFetch as jest.MockedFunction<typeof apiFetch>;
    saveGuestSession({ lessonId: 'l1', wpm: 25, accuracy: 95, errors: 1, timeElapsed: 15, erredCharacters: [] });

    await syncGuestSessionsToUser('user-1');

    const call = apiFetchMock.mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body.clientSessionId).toBeDefined();
  });
});
