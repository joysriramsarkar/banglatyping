/**
 * offline-queue.test.ts — IndexedDB queue with in-memory fallback.
 *
 * jsdom ships no indexedDB, so these suites exercise the memory fallback
 * path; the IndexedDB path shares the same function bodies via runStore.
 */

import {
  clearQueueForTesting,
  dequeueSession,
  drainQueue,
  enqueueSession,
  listQueuedSessions,
  queuedSessionCount,
} from '../lib/offline/queue';

const payload = (n: number) =>
  JSON.stringify({ userId: 'u1', lessonId: null, wpm: 30 + n, accuracy: 95, errors: 1, timeElapsed: 60000, erredCharacters: [] });

beforeEach(async () => {
  await clearQueueForTesting();
});

describe('offline queue (memory fallback)', () => {
  it('enqueues and lists sessions oldest-first', async () => {
    await enqueueSession({ url: '/api/user-progress', body: payload(1) });
    await enqueueSession({ url: '/api/user-progress', body: payload(2) });

    const queued = await listQueuedSessions();
    expect(queued).toHaveLength(2);
    expect(queued[0].body).toBe(payload(1));
    expect(queued[1].body).toBe(payload(2));
    expect(await queuedSessionCount()).toBe(2);
  });

  it('dequeues a single session by id', async () => {
    const first = await enqueueSession({ url: '/api/user-progress', body: payload(1) });
    await enqueueSession({ url: '/api/user-progress', body: payload(2) });

    await dequeueSession(first.id);
    const queued = await listQueuedSessions();
    expect(queued).toHaveLength(1);
    expect(queued[0].body).toBe(payload(2));
  });

  it('drains in order and stops at the first failure', async () => {
    await enqueueSession({ url: '/api/user-progress', body: payload(1) });
    await enqueueSession({ url: '/api/user-progress', body: payload(2) });
    await enqueueSession({ url: '/api/user-progress', body: payload(3) });

    const sent: string[] = [];
    const synced = await drainQueue(async (session) => {
      if (session.body === payload(2)) return false; // network drops mid-flush
      sent.push(session.body);
      return true;
    });

    expect(synced).toBe(1);
    expect(sent).toEqual([payload(1)]);
    // Failed session stays queued with its successors, order preserved.
    expect((await listQueuedSessions()).map((s) => s.body)).toEqual([
      payload(2),
      payload(3),
    ]);
  });

  it('a throwing sender is treated as failure, not a crash', async () => {
    await enqueueSession({ url: '/api/user-progress', body: payload(1) });
    await expect(
      drainQueue(async () => {
        throw new Error('offline');
      })
    ).resolves.toBe(0);
    expect(await queuedSessionCount()).toBe(1);
  });
});
