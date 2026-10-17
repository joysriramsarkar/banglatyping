/**
 * Coverage for prior-pass modules that the global gate counts but no test
 * imports: rate-limit, env, server-env, AI feedback, race engine, billing
 * stubs, specialized tests, certificates, progress-validation extras, and
 * the use-theme hook.
 */
import { renderHook, act } from '@testing-library/react';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { rateLimit, resetRateLimitForTesting } from '../lib/api/rate-limit';
import type { PublicEnv } from '../lib/env';
import type { ServerEnv } from '../lib/server-env';
import { generatePersonalizedFeedback, OFFLINE_FALLBACK_MESSAGE } from '../lib/ai/feedback-engine';
import {
  raceChannelName,
  subscribeToRace,
  broadcastPlayerUpdate,
  broadcastRoomState,
  type PlayerState,
  type RaceRoom,
} from '../lib/multiplayer/race-engine';
import { createBkashPayment } from '../lib/billing/bkash-integration';
import { createNagadPayment } from '../lib/billing/nagad-integration';
import { createSslcommerzPayment } from '../lib/billing/sslcommerz-integration';
import { SPECIALIZED_TESTS, getSpecializedTest } from '../lib/curriculum/specialized-tests';
import { getSupabase } from '@/lib/db';
import { getCertificateByVerificationId } from '../lib/certificates';
import {
  normalizeLessonId,
  saveProgressSchema,
  consumeIdempotencyKey,
  resetIdempotencyKeysForTesting,
} from '../lib/progress-validation';
import { useTheme } from '@/hooks/use-theme';

jest.mock('server-only', () => ({}));
jest.mock('@/lib/db', () => ({ getSupabase: jest.fn() }));

const getSupabaseMock = getSupabase as jest.Mock;

function loadEnvModule(): { env: PublicEnv } {
  let captured: { env: PublicEnv } | undefined;
  jest.isolateModules((): void => {
    captured = require('../lib/env') as { env: PublicEnv };
  });
  if (!captured) throw new Error('env module failed to load');
  return captured;
}

function loadServerEnvModule(): { serverEnv: ServerEnv } {
  let captured: { serverEnv: ServerEnv } | undefined;
  jest.isolateModules((): void => {
    captured = require('../lib/server-env') as { serverEnv: ServerEnv };
  });
  if (!captured) throw new Error('server-env module failed to load');
  return captured;
}

describe('rate-limit sliding window', () => {
  beforeEach(() => {
    resetRateLimitForTesting();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetRateLimitForTesting();
  });

  test('defaults to 100 requests per minute', () => {
    const first = rateLimit('defaults-key');
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(99);
    expect(first.resetAt).toBeGreaterThan(Date.now());
  });

  test('custom limit blocks when exhausted and counts remaining', () => {
    expect(rateLimit('custom', { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    const second = rateLimit('custom', { limit: 2, windowMs: 60_000 });
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    const third = rateLimit('custom', { limit: 2, windowMs: 60_000 });
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  test('keys are independent', () => {
    rateLimit('key-a', { limit: 1 });
    expect(rateLimit('key-a', { limit: 1 }).allowed).toBe(false);
    expect(rateLimit('key-b', { limit: 1 }).allowed).toBe(true);
  });

  test('expired buckets reset and the lazy sweep drops them', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    rateLimit('sweep-me', { limit: 1, windowMs: 100 });
    rateLimit('fresh', { limit: 5, windowMs: 60_000 });
    jest.spyOn(Date, 'now').mockReturnValue(5_000);
    // 'sweep-me' expired -> swept and recreated; 'fresh' still counts.
    const reused = rateLimit('sweep-me', { limit: 1, windowMs: 100 });
    expect(reused.allowed).toBe(true);
    expect(reused.remaining).toBe(0);
    expect(rateLimit('fresh', { limit: 5, windowMs: 60_000 }).allowed).toBe(true);
  });
});

describe('public env validation', () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SITE_URL',
    ]) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of Object.keys(saved)) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  test('parses valid env and defaults the site URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'a'.repeat(21);
    const { env } = loadEnvModule();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://example.supabase.co');
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://typing.onuron.org');
  });

  test('throws on missing values', () => {
    expect(() => loadEnvModule()).toThrow();
  });

  test('throws on invalid URL and short anon key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'short';
    expect(() => loadEnvModule()).toThrow();
  });
});

describe('server env validation', () => {
  const savedKey = process.env.SUPABASE_SERVICE_KEY;

  afterEach(() => {
    if (savedKey === undefined) delete process.env.SUPABASE_SERVICE_KEY;
    else process.env.SUPABASE_SERVICE_KEY = savedKey;
  });

  test('parses a valid service key', () => {
    process.env.SUPABASE_SERVICE_KEY = 's'.repeat(21);
    const { serverEnv } = loadServerEnvModule();
    expect(serverEnv.SUPABASE_SERVICE_KEY).toBe('s'.repeat(21));
  });

  test('throws when the service key is missing', () => {
    delete process.env.SUPABASE_SERVICE_KEY;
    expect(() => loadServerEnvModule()).toThrow();
  });
});

describe('AI feedback engine', () => {
  const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const realFetch = global.fetch;

  afterEach(() => {
    if (savedUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
    if (savedKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey;
    global.fetch = realFetch;
    jest.restoreAllMocks();
  });

  test('falls back offline when env is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const res = await generatePersonalizedFeedback({ wpm: 20, accuracy: 90, erredCharacters: [] });
    expect(res).toEqual({ message: OFFLINE_FALLBACK_MESSAGE, offline: true });
  });

  test('returns the coach message on success', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co/';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'k'.repeat(21);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async (): Promise<{ message: string }> => ({ message: 'ভালো করছেন!' }),
    }) as unknown as typeof fetch;
    const res = await generatePersonalizedFeedback({ wpm: 20, accuracy: 90, erredCharacters: [] });
    expect(res.offline).toBe(false);
    expect(res.message).toBe('ভালো করছেন!');
  });

  test('missing message field uses the fallback but stays online', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'k'.repeat(21);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async (): Promise<Record<string, never>> => ({}),
    }) as unknown as typeof fetch;
    const res = await generatePersonalizedFeedback({ wpm: 20, accuracy: 90, erredCharacters: [] });
    expect(res).toEqual({ message: OFFLINE_FALLBACK_MESSAGE, offline: false });
  });

  test('HTTP errors and network failures fall back offline', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'k'.repeat(21);
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    expect(
      (await generatePersonalizedFeedback({ wpm: 20, accuracy: 90, erredCharacters: [] })).offline,
    ).toBe(true);
    global.fetch = jest.fn().mockRejectedValue(new Error('down')) as unknown as typeof fetch;
    expect(
      (await generatePersonalizedFeedback({ wpm: 20, accuracy: 90, erredCharacters: [] })).offline,
    ).toBe(true);
  });
});

describe('race engine', () => {
  test('channel names are namespaced by room', () => {
    expect(raceChannelName('room-1')).toBe('race:room-1');
  });

  test('subscribe wires broadcast handlers and broadcasts send payloads', async () => {
    const handlers: Record<string, (msg: { payload: unknown }) => void> = {};
    const channel = {
      on: jest.fn((...args: unknown[]): unknown => {
        const filter = args[1] as { event: string };
        handlers[filter.event] = args[2] as (msg: { payload: unknown }) => void;
        return channel;
      }),
      subscribe: jest.fn((): unknown => channel),
      send: jest.fn((): Promise<string> => Promise.resolve('ok')),
    };
    const supabase = { channel: jest.fn((): unknown => channel) } as unknown as SupabaseClient;
    const rooms: RaceRoom[] = [];
    const players: PlayerState[] = [];
    const returned = subscribeToRace(
      supabase,
      'room-9',
      (room: RaceRoom): void => {
        rooms.push(room);
      },
      (player: PlayerState): void => {
        players.push(player);
      },
    );
    expect(supabase.channel).toHaveBeenCalledWith('race:room-9');
    expect(returned).toBe(channel);

    const room: RaceRoom = { id: 'room-9', targetText: 'কখ', players: {}, status: 'racing' };
    const player: PlayerState = {
      userId: 'u1',
      displayName: 'করিম',
      progress: 50,
      wpm: 20,
      accuracy: 95,
      finished: false,
    };
    handlers['room-state']({ payload: room });
    handlers['player-update']({ payload: player });
    expect(rooms).toEqual([room]);
    expect(players).toEqual([player]);

    await broadcastPlayerUpdate(channel as unknown as RealtimeChannel, player);
    expect(channel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'player-update',
      payload: player,
    });
    await broadcastRoomState(channel as unknown as RealtimeChannel, room);
    expect(channel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'room-state',
      payload: room,
    });
  });
});

describe('billing stubs', () => {
  const keys = [
    'BKASH_APP_KEY',
    'BKASH_APP_SECRET',
    'BKASH_USERNAME',
    'BKASH_PASSWORD',
    'NAGAD_MERCHANT_ID',
    'NAGAD_PRIVATE_KEY',
    'SSLCOMMERZ_STORE_ID',
    'SSLCOMMERZ_STORE_PASSWORD',
  ];
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of keys) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key] as string;
    }
  });

  test('bKash requires env then returns a sandbox payment', async () => {
    await expect(
      createBkashPayment({ amount: 100, merchantInvoiceNumber: 'INV-1' }),
    ).rejects.toThrow('bKash env keys missing');
    process.env.BKASH_APP_KEY = 'k';
    process.env.BKASH_APP_SECRET = 's';
    process.env.BKASH_USERNAME = 'u';
    process.env.BKASH_PASSWORD = 'p';
    const res = await createBkashPayment({ amount: 100, merchantInvoiceNumber: 'INV-1' });
    expect(res).toEqual({
      paymentID: 'SANDBOX-INV-1',
      bkashURL: expect.stringContaining('SANDBOX-INV-1') as string,
      status: 'initiated',
    });
  });

  test('Nagad requires env then returns a sandbox payment', async () => {
    await expect(createNagadPayment({ amount: 50, merchantInvoiceNumber: 'N-1' })).rejects.toThrow(
      'Nagad env keys missing',
    );
    process.env.NAGAD_MERCHANT_ID = 'm';
    process.env.NAGAD_PRIVATE_KEY = 'k';
    const res = await createNagadPayment({ amount: 50, merchantInvoiceNumber: 'N-1' });
    expect(res.paymentID).toBe('SANDBOX-N-1');
    expect(res.nagadURL).toContain('SANDBOX-N-1');
    expect(res.status).toBe('initiated');
  });

  test('SSLCommerz requires env then returns a sandbox payment', async () => {
    await expect(
      createSslcommerzPayment({ amount: 75, merchantInvoiceNumber: 'S-1' }),
    ).rejects.toThrow('SSLCommerz env keys missing');
    process.env.SSLCOMMERZ_STORE_ID = 'id';
    process.env.SSLCOMMERZ_STORE_PASSWORD = 'pw';
    const res = await createSslcommerzPayment({ amount: 75, merchantInvoiceNumber: 'S-1' });
    expect(res.paymentID).toBe('SANDBOX-S-1');
    expect(res.gatewayURL).toContain('SANDBOX-S-1');
    expect(res.status).toBe('initiated');
  });
});

describe('specialized tests catalog', () => {
  test('every test is retrievable and the catalog is well-formed', () => {
    expect(SPECIALIZED_TESTS.length).toBeGreaterThan(0);
    const ids = SPECIALIZED_TESTS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of SPECIALIZED_TESTS) {
      expect(getSpecializedTest(t.id)).toBe(t);
      expect(t.passages.length).toBeGreaterThan(0);
      expect(t.targetWpm).toBeGreaterThan(0);
      expect(t.minAccuracy).toBeGreaterThan(0);
      expect(t.durationMinutes).toBeGreaterThan(0);
    }
  });

  test('unknown id returns undefined', () => {
    expect(getSpecializedTest('no-such-test')).toBeUndefined();
  });
});

describe('certificates lookup', () => {
  const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const savedKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  function mockMaybeSingle(
    impl: () => Promise<{ data: unknown; error: { message: string } | null }>,
  ): void {
    const chain: Record<string, jest.Mock> = {};
    chain.select = jest.fn((): unknown => chain);
    chain.eq = jest.fn((): unknown => chain);
    chain.maybeSingle = jest.fn((): Promise<unknown> => impl() as Promise<unknown>);
    getSupabaseMock.mockReturnValue({ from: jest.fn((): unknown => chain) });
  }

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'k'.repeat(21);
    getSupabaseMock.mockReset();
  });

  afterEach(() => {
    if (savedUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
    if (savedKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedKey;
  });

  test('blank ids and missing env fail closed to null', async () => {
    expect(await getCertificateByVerificationId('')).toBeNull();
    expect(await getCertificateByVerificationId('   ')).toBeNull();
    expect(getSupabaseMock).not.toHaveBeenCalled();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(await getCertificateByVerificationId('abc')).toBeNull();
  });

  test('public view hit returns the row', async () => {
    const row = {
      verification_id: 'v1',
      recipient_name: 'করিম',
      gpm: 30,
      wpm: 6,
      accuracy: 98,
      layout: 'x',
      issued_at: 't',
    };
    mockMaybeSingle(() => Promise.resolve({ data: row, error: null }));
    expect(await getCertificateByVerificationId(' v1 ')).toEqual(row);
  });

  test('view miss falls back to the base table', async () => {
    const row = {
      verification_id: 'v2',
      recipient_name: null,
      gpm: 10,
      wpm: 2,
      accuracy: 90,
      layout: null,
      issued_at: null,
    };
    let calls = 0;
    mockMaybeSingle(() => {
      calls += 1;
      if (calls === 1) return Promise.resolve({ data: null, error: { message: 'no view' } });
      return Promise.resolve({ data: row, error: null });
    });
    expect(await getCertificateByVerificationId('v2')).toEqual(row);
  });

  test('table miss and db throws both return null', async () => {
    mockMaybeSingle(() => Promise.resolve({ data: null, error: null }));
    expect(await getCertificateByVerificationId('missing')).toBeNull();
    mockMaybeSingle(() => Promise.resolve({ data: null, error: { message: 'nope' } }));
    expect(await getCertificateByVerificationId('missing')).toBeNull();
    getSupabaseMock.mockImplementation((): never => {
      throw new Error('db down');
    });
    expect(await getCertificateByVerificationId('v3')).toBeNull();
  });
});

describe('progress-validation extras', () => {
  afterEach(() => {
    resetIdempotencyKeysForTesting();
    jest.restoreAllMocks();
  });

  test('normalizeLessonId coerces non-UUID input to null', () => {
    expect(normalizeLessonId(42)).toBeNull();
    expect(normalizeLessonId(undefined)).toBeNull();
    expect(normalizeLessonId('   ')).toBeNull();
    expect(normalizeLessonId('not-a-uuid')).toBeNull();
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(normalizeLessonId(`  ${uuid}  `)).toBe(uuid);
  });

  test('saveProgressSchema accepts a valid payload and rejects bad numbers', () => {
    const valid = {
      wpm: 25,
      accuracy: 95,
      errors: 2,
      timeElapsed: 60_000,
    };
    expect(saveProgressSchema.safeParse(valid).success).toBe(true);
    expect(saveProgressSchema.safeParse({ ...valid, wpm: -1 }).success).toBe(false);
    expect(saveProgressSchema.safeParse({ ...valid, accuracy: 101 }).success).toBe(false);
    expect(saveProgressSchema.safeParse({ ...valid, timeElapsed: 0 }).success).toBe(false);
  });

  test('idempotency keys collapse duplicates and expire', () => {
    resetIdempotencyKeysForTesting();
    expect(consumeIdempotencyKey(null)).toBe(false);
    expect(consumeIdempotencyKey('k1')).toBe(false);
    expect(consumeIdempotencyKey('k1')).toBe(true);
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    expect(consumeIdempotencyKey('old')).toBe(false);
    jest.spyOn(Date, 'now').mockReturnValue(1_000 + 11_000);
    // 'old' expired and pruned; a fresh key survives pruning checks.
    expect(consumeIdempotencyKey('new')).toBe(false);
    expect(consumeIdempotencyKey('old')).toBe(false);
    expect(consumeIdempotencyKey('new')).toBe(true);
  });
});

describe('use-theme hook', () => {
  function stubMatchMedia(initialMatches: boolean): {
    listeners: Array<(e: MediaQueryListEvent) => void>;
  } {
    const listeners: Array<(e: MediaQueryListEvent) => void> = [];
    const mql = {
      matches: initialMatches,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void): void => {
        listeners.push(listener);
      },
      removeEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void): void => {
        const i = listeners.indexOf(listener);
        if (i >= 0) listeners.splice(i, 1);
      },
      addListener: (listener: (e: MediaQueryListEvent) => void): void => {
        listeners.push(listener);
      },
      removeListener: (listener: (e: MediaQueryListEvent) => void): void => {
        const i = listeners.indexOf(listener);
        if (i >= 0) listeners.splice(i, 1);
      },
      dispatchEvent: (_e: Event): boolean => false,
    };
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn((): unknown => mql),
      configurable: true,
      writable: true,
    });
    return { listeners };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  test('resolves the system theme and toggles explicitly', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.mounted).toBe(true);
    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('light');
    act(() => {
      result.current.toggle();
    });
    expect(result.current.mode).toBe('dark');
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    act(() => {
      result.current.setMode('light');
    });
    expect(result.current.resolved).toBe('light');
  });

  test('dark system preference resolves dark and follows changes', () => {
    const { listeners } = stubMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('dark');
    act(() => {
      for (const listener of listeners) listener({ matches: false } as MediaQueryListEvent);
    });
    expect(result.current.resolved).toBe('light');
  });

  test('stored mode is restored on mount', () => {
    stubMatchMedia(false);
    localStorage.setItem('banglatyping-theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('dark');
    expect(result.current.resolved).toBe('dark');
  });

  test('storage failures fall back to defaults without crashing', () => {
    stubMatchMedia(false);
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((): never => {
      throw new Error('denied');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => {
      throw new Error('denied');
    });
    try {
      const { result } = renderHook(() => useTheme());
      expect(result.current.mounted).toBe(true);
      expect(result.current.mode).toBe('system');
      act(() => {
        result.current.toggle();
      });
      expect(result.current.mode).toBe('dark');
    } finally {
      jest.restoreAllMocks();
    }
  });

  test('invalid stored values fall back to system', () => {
    stubMatchMedia(false);
    localStorage.setItem('banglatyping-theme', 'neon');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('system');
  });
});
