/**
 * Service error paths — failure contracts for user-progress, lesson-service
 * and custom-drill-generator.
 *
 * Complements db-user-progress.test.ts (happy paths with a fixed mock): this
 * file drives a scripted mock through every error, retry, cap and sanitizer
 * branch — including the PostgREST `.or()` injection sanitizer and the
 * foreign-key retry in saveTypingSession.
 */

import {
  analyzeUserErrors,
  getCharacterError,
  getUserLessonProgress,
  getUserProgressHistory,
  getUserStatistics,
  getUserWeakCharacters,
  saveTypingSession,
  updateLessonCompletion,
} from '../lib/user-progress';
import {
  getAllLessons,
  getLessonWithDrills,
  getLessonsByLevel,
  sanitizeLessonSearchQuery,
  searchLessons,
} from '../lib/lesson-service';
import {
  createWeakCharacterDrill,
  generateCustomDrill,
  updateCustomDrillUsage,
} from '../lib/custom-drill-generator';
import type { WeakCharacterView } from '../lib/types';

interface MockResponse {
  data: unknown;
  error: { code?: string; message?: string } | null;
  count?: number | null;
}

const mockLog: {
  queue: MockResponse[];
  orArgs: string[];
  ltArgs: unknown[];
  rangeArgs: Array<[number, number]>;
} = { queue: [], orArgs: [], ltArgs: [], rangeArgs: [] };

function nextResponse(): MockResponse {
  return (
    mockLog.queue.shift() ?? { data: null, error: null, count: 0 }
  );
}

function createChain(): Record<string, unknown> {
  const chain: Record<string, unknown> = {};
  chain.from = jest.fn((): unknown => createChain());
  chain.select = jest.fn((): unknown => chain);
  chain.insert = jest.fn((): unknown => chain);
  chain.upsert = jest.fn((): unknown => chain);
  chain.update = jest.fn((): unknown => chain);
  chain.delete = jest.fn((): unknown => chain);
  chain.eq = jest.fn((): unknown => chain);
  chain.lt = jest.fn((...args: unknown[]): unknown => {
    mockLog.ltArgs.push(args[1]);
    return chain;
  });
  chain.order = jest.fn((): unknown => chain);
  chain.limit = jest.fn((): unknown => chain);
  chain.range = jest.fn((...args: unknown[]): unknown => {
    mockLog.rangeArgs.push([args[0] as number, args[1] as number]);
    return chain;
  });
  chain.or = jest.fn((...args: unknown[]): unknown => {
    mockLog.orArgs.push(args[0] as string);
    return chain;
  });
  chain.single = jest.fn((): Promise<MockResponse> => Promise.resolve(nextResponse()));
  chain.then = jest.fn((resolve: (value: MockResponse) => void): void => {
    resolve(nextResponse());
  });
  return chain;
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createChain()),
}));

beforeEach(() => {
  mockLog.queue = [];
  mockLog.orArgs = [];
  mockLog.ltArgs = [];
  mockLog.rangeArgs = [];
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

function ok(data: unknown, count: number | null = null): MockResponse {
  return { data, error: null, count };
}

function fail(code: string): MockResponse {
  return { data: null, error: { code, message: 'boom' } };
}

describe('sanitizeLessonSearchQuery (PostgREST injection guard)', () => {
  test('strips filter-syntax characters but keeps Bengali text', () => {
    expect(sanitizeLessonSearchQuery('কবিতা')).toBe('কবিতা');
    expect(sanitizeLessonSearchQuery('ক,(title) "x" \'y\' % _ \\')).toBe('কtitle x y');
  });

  test('trims and caps length at 100 chars', () => {
    expect(sanitizeLessonSearchQuery('  কবিতা  ')).toBe('কবিতা');
    expect(sanitizeLessonSearchQuery('ক'.repeat(150))).toBe('ক'.repeat(100));
    expect(sanitizeLessonSearchQuery(',,,(((')).toBe('');
  });
});

describe('searchLessons', () => {
  test('empty or fully-stripped queries short-circuit without a filter', async () => {
    expect(await searchLessons('')).toEqual([]);
    expect(await searchLessons(',,,(((')).toEqual([]);
    expect(mockLog.orArgs).toHaveLength(0);
  });

  test('embeds the sanitized query in both ilike branches', async () => {
    mockLog.queue.push(ok([]));
    await searchLessons('কবিতা,(title)');
    expect(mockLog.orArgs).toEqual([
      'title.ilike.%কবিতাtitle%,description.ilike.%কবিতাtitle%',
    ]);
  });

  test('returns [] on query error', async () => {
    mockLog.queue.push(fail('PGRST001'));
    expect(await searchLessons('ক')).toEqual([]);
  });
});

describe('lesson-service error paths', () => {
  test('getAllLessons returns [] on error', async () => {
    mockLog.queue.push(fail('XX'));
    expect(await getAllLessons()).toEqual([]);
  });

  test('getLessonWithDrills returns null when the lesson is missing', async () => {
    mockLog.queue.push(fail('PGRST116'));
    expect(await getLessonWithDrills('nope')).toBeNull();
  });

  test('getLessonWithDrills tolerates drill fetch errors', async () => {
    mockLog.queue.push(ok({ id: 'l1' }));
    mockLog.queue.push(fail('XX'));
    const lesson = await getLessonWithDrills('l1');
    expect(lesson?.drills).toEqual([]);
  });

  test('getLessonsByLevel returns [] on error', async () => {
    mockLog.queue.push(fail('XX'));
    expect(await getLessonsByLevel('Beginner')).toEqual([]);
  });
});

describe('saveTypingSession failure contract', () => {
  const erred = [{ char: 'ক', count: 1 }];

  test('non-FK insert errors return null', async () => {
    mockLog.queue.push(fail('23505'));
    expect(
      await saveTypingSession('u', 'lesson-1', 40, 90, 1, 60, erred, 'tok'),
    ).toBeNull();
  });

  test('dangling lesson FK retries as a general session', async () => {
    mockLog.queue.push(fail('23503'));
    mockLog.queue.push(ok({ id: 'retry-1', user_id: 'u' }));
    const res = await saveTypingSession('u', 'lesson-1', 40, 90, 1, 60, erred, 'tok');
    expect(res).toMatchObject({ id: 'retry-1' });
  });

  test('null lessonId never retries, and a failed retry returns null', async () => {
    mockLog.queue.push(fail('23503'));
    mockLog.queue.push(fail('23503'));
    expect(
      await saveTypingSession('u', null, 40, 90, 1, 60, erred, 'tok'),
    ).toBeNull();
  });
});

describe('user-progress read failure contracts', () => {
  test('threshold is capped to a 0–100 percentage', async () => {
    mockLog.queue.push(ok([]));
    await getUserWeakCharacters('u', Number.NaN);
    expect(mockLog.ltArgs.at(-1)).toBe(95);
    mockLog.queue.push(ok([]));
    await getUserWeakCharacters('u', 200);
    expect(mockLog.ltArgs.at(-1)).toBe(100);
  });

  test('weak-character errors return []', async () => {
    mockLog.queue.push(fail('XX'));
    expect(await getUserWeakCharacters('u', 90)).toEqual([]);
  });

  test('missing statistics return defaults, other errors null', async () => {
    mockLog.queue.push(fail('PGRST116'));
    expect(await getUserStatistics('u')).toMatchObject({
      user_id: 'u',
      total_sessions: 0,
    });
    mockLog.queue.push(fail('XX'));
    expect(await getUserStatistics('u')).toBeNull();
  });

  test('character errors distinguish not-found from failure', async () => {
    mockLog.queue.push(fail('PGRST116'));
    expect(await getCharacterError('u', 'ক')).toBeNull();
    mockLog.queue.push(fail('XX'));
    expect(await getCharacterError('u', 'ক')).toBeNull();
  });

  test('lesson progress errors return null', async () => {
    mockLog.queue.push(fail('XX'));
    expect(await getUserLessonProgress('u', 'l')).toBeNull();
  });

  test('history count and data errors return empty pages', async () => {
    mockLog.queue.push(fail('XX'));
    expect(await getUserProgressHistory('u')).toEqual({ data: null, total: 0 });

    mockLog.queue.push(ok(null, 3));
    mockLog.queue.push(fail('XX'));
    expect(await getUserProgressHistory('u')).toEqual({ data: null, total: 0 });
  });

  test('pagination is capped and total falls back to 0', async () => {
    mockLog.queue.push(ok(null, null));
    mockLog.queue.push(ok([{ id: 'p1' }], null));
    const res = await getUserProgressHistory('u', 9999, -5);
    expect(res.total).toBe(0);
    expect(mockLog.rangeArgs.at(-1)).toEqual([0, 99]);
  });

  test('completion update errors return false', async () => {
    mockLog.queue.push(fail('XX'));
    expect(await updateLessonCompletion('u', 'l', 90, 30)).toBe(false);
  });

  test('error analysis degrades gracefully', async () => {
    const weak: WeakCharacterView[] = [
      {
        user_id: 'u',
        character: 'ক',
        accuracy_rate: 60,
        error_count: 4,
        total_attempts: 10,
        strength_level: 'Very Weak',
      },
    ];
    mockLog.queue.push(ok(weak));
    const analysis = await analyzeUserErrors('u');
    expect(analysis?.totalWeakChars).toBe(1);
    expect(analysis?.focusAreas[0]).toMatchObject({ char: 'ক', accuracy: 60 });
  });
});

describe('custom-drill-generator failure contracts', () => {
  test('empty weak-character lists refuse to generate', async () => {
    expect(await generateCustomDrill('u', [])).toBeNull();
  });

  test('usage updates require a user', async () => {
    expect(await updateCustomDrillUsage('d1')).toBe(false);
  });

  test('too few weak characters return null without generating', async () => {
    mockLog.queue.push(
      ok([
        { character: 'ক', accuracy_rate: 50, error_count: 5, total_attempts: 10 },
        { character: 'খ', accuracy_rate: 60, error_count: 4, total_attempts: 10 },
      ]),
    );
    expect(await createWeakCharacterDrill('u', 85, 5, 20, 10)).toBeNull();
  });
});
