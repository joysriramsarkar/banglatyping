/**
 * Unit Tests for Database, User Progress & Lesson Services
 */

import { getSupabase, getSupabaseAdmin, createRequestClient } from '../lib/db';
import {
  saveTypingSession,
  getUserWeakCharacters,
  getUserStatistics,
  getCharacterError,
  getUserLessonProgress,
  getUserProgressHistory,
  updateLessonCompletion,
  analyzeUserErrors,
} from '../lib/user-progress';
import {
  getAllLessons,
  getLessonWithDrills,
  getLessonsByLevel,
  getLessonsByCategory,
  getWordDrills,
  getParagraphLessons,
  getLessonsByRow,
  searchLessons,
  getLessonDrills,
} from '../lib/lesson-service';

// Mock supabase client operations
jest.mock('@supabase/supabase-js', () => {
  const createMockBuilder = () => {
    const mockData = [{ id: 'prog-1', user_id: 'user-1', wpm: 40, accuracy: 98, strength_level: 'Weak', character: 'ক', accuracy_rate: 80 }];
    const builder: any = {
      from: jest.fn(() => builder),
      select: jest.fn(() => builder),
      insert: jest.fn(() => builder),
      upsert: jest.fn(() => builder),
      eq: jest.fn(() => builder),
      lt: jest.fn(() => builder),
      order: jest.fn(() => builder),
      limit: jest.fn(() => builder),
      range: jest.fn(() => builder),
      or: jest.fn(() => builder),
      single: jest.fn().mockResolvedValue({
        data: { id: 'prog-1', user_id: 'user-1', wpm: 40, accuracy: 98, usage_count: 1 },
        error: null,
      }),
      then: (resolve: any) => resolve({ data: mockData, count: 1, error: null }),
    };
    return builder;
  };

  return {
    createClient: jest.fn(() => createMockBuilder()),
  };
});

describe('Database Client & Utilities', () => {
  test('creates client instances correctly', () => {
    const client = getSupabase();
    expect(client).toBeDefined();

    const admin = getSupabaseAdmin();
    expect(admin === null || admin !== undefined).toBe(true);

    const requestClient = createRequestClient('mock-token');
    expect(requestClient).toBeDefined();
  });
});

describe('User Progress Service', () => {
  test('saves typing session', async () => {
    const res = await saveTypingSession(
      'user-1',
      'lesson-1',
      45,
      98,
      1,
      60,
      [{ char: 'ক', count: 1 }],
      'token-123'
    );
    expect(res).toBeDefined();
    expect(res?.user_id).toBe('user-1');
  });

  test('fetches weak characters and analyzes user errors', async () => {
    const weakChars = await getUserWeakCharacters('user-1', 90);
    expect(Array.isArray(weakChars)).toBe(true);

    const analysis = await analyzeUserErrors('user-1');
    expect(analysis).toBeDefined();
    expect(analysis?.totalWeakChars).toBeDefined();
  });

  test('fetches user statistics', async () => {
    const stats = await getUserStatistics('user-1');
    expect(stats).toBeDefined();
    expect(stats?.user_id).toBe('user-1');
  });

  test('fetches character error detail', async () => {
    const charErr = await getCharacterError('user-1', 'ক্ষ');
    expect(charErr).toBeDefined();
  });

  test('fetches lesson progress and history', async () => {
    const lessonProg = await getUserLessonProgress('user-1', 'lesson-1');
    expect(lessonProg).toBeDefined();

    const history = await getUserProgressHistory('user-1', 20, 0);
    expect(history).toBeDefined();
    expect(history.total).toBe(1);
  });

  test('updates lesson completion', async () => {
    const success = await updateLessonCompletion('user-1', 'lesson-1', 99, 42);
    expect(success).toBe(true);
  });
});

describe('Lesson Database Service', () => {
  test('fetches all lessons and lessons by level/category', async () => {
    const all = await getAllLessons();
    expect(all).toBeDefined();

    const beginner = await getLessonsByLevel('Beginner');
    expect(beginner).toBeDefined();

    const category = await getLessonsByCategory('home-row');
    expect(category).toBeDefined();
  });

  test('fetches lesson with drills, word drills, paragraphs, and rows', async () => {
    const lesson = await getLessonWithDrills('lesson-1');
    expect(lesson).toBeDefined();
    expect(lesson?.id).toBe('prog-1');

    const wordDrills = await getWordDrills();
    expect(wordDrills).toBeDefined();

    const paragraphs = await getParagraphLessons();
    expect(paragraphs).toBeDefined();

    const homeRow = await getLessonsByRow('home-row');
    expect(homeRow).toBeDefined();

    const searched = await searchLessons('ক');
    expect(searched).toBeDefined();

    const drills = await getLessonDrills('lesson-1');
    expect(drills).toBeDefined();
  });
});
