/**
 * Unit Tests for Full Typing Session Engine and Custom Drill Generator
 */

import {
  sessionReducer,
  INITIAL_SESSION_STATE,
  getEffectiveDurationMs,
  computeSessionMetrics,
  getLiveMetrics,
  isSessionComplete,
} from '../lib/typing/session';
import {
  generateCustomDrill,
  getUserCustomDrills,
  getCustomDrill,
  updateCustomDrillUsage,
  deleteCustomDrill,
  createWeakCharacterDrill,
  getDrillRecommendations,
} from '../lib/custom-drill-generator';
import type { WeakCharacterView } from '../lib/types';

jest.mock('@supabase/supabase-js', () => {
  const mockBuilder: any = {
    from: jest.fn(() => mockBuilder),
    select: jest.fn(() => mockBuilder),
    insert: jest.fn(() => mockBuilder),
    update: jest.fn(() => mockBuilder),
    delete: jest.fn(() => mockBuilder),
    eq: jest.fn(() => mockBuilder),
    lt: jest.fn(() => mockBuilder),
    order: jest.fn(() => mockBuilder),
    limit: jest.fn(() => mockBuilder),
    single: jest.fn().mockResolvedValue({
      data: { id: 'drill-1', user_id: 'user-1', usage_count: 1 },
      error: null,
    }),
  };
  return {
    createClient: jest.fn(() => mockBuilder),
  };
});

describe('Typing Session Reducer & Lifecycle', () => {
  test('handles START action', () => {
    const state = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'বাংলা', layout: 'probhat' },
    });
    expect(state.expectedText).toBe('বাংলা');
    expect(state.layout).toBe('probhat');
    expect(state.expectedGraphemes.length).toBeGreaterThan(0);
    expect(state.status).toBe('IDLE');
  });

  test('handles INPUT action with correct, incorrect, and completion flow', () => {
    let state = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'বাং', layout: 'probhat' },
    });

    const now = 1000;
    // Input incorrect
    state = sessionReducer(state, {
      type: 'INPUT',
      payload: { grapheme: 'কা', timestamp: now },
    });
    expect(state.status).toBe('ACTIVE');
    expect(state.currentGraphemeIndex).toBe(0);
    expect(state.events.length).toBe(1);
    expect(state.events[0].correct).toBe(false);

    // Input correct
    state = sessionReducer(state, {
      type: 'INPUT',
      payload: { grapheme: 'বাং', timestamp: now + 500 },
    });
    expect(state.status).toBe('COMPLETED');
    expect(state.currentGraphemeIndex).toBe(1);
  });

  test('handles BACKSPACE action and marks event corrected', () => {
    let state = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'পানি', layout: 'probhat' },
    });

    state = sessionReducer(state, {
      type: 'INPUT',
      payload: { grapheme: 'পা', timestamp: 1000 },
    });
    expect(state.currentGraphemeIndex).toBe(1);

    state = sessionReducer(state, {
      type: 'BACKSPACE',
      payload: { timestamp: 1200 },
    });
    expect(state.currentGraphemeIndex).toBe(0);
    expect(state.events[0].corrected).toBe(true);
  });

  test('handles PAUSE, RESUME, FINISH, and RESET actions', () => {
    let state = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'পানি', layout: 'probhat' },
    });
    state = sessionReducer(state, {
      type: 'INPUT',
      payload: { grapheme: 'পা', timestamp: 1000 },
    });
    expect(state.status).toBe('ACTIVE');

    state = sessionReducer(state, { type: 'PAUSE' });
    expect(state.status).toBe('PAUSED');

    state = sessionReducer(state, { type: 'RESUME' });
    expect(state.status).toBe('ACTIVE');

    state = sessionReducer(state, { type: 'FINISH' });
    expect(state.status).toBe('COMPLETED');

    state = sessionReducer(state, { type: 'RESET' });
    expect(state.status).toBe('IDLE');
  });

  test('computes live metrics, effective duration, and session metrics', () => {
    let state = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'পানি', layout: 'probhat' },
    });
    state = sessionReducer(state, {
      type: 'INPUT',
      payload: { grapheme: 'পা', timestamp: 1000 },
    });

    const live = getLiveMetrics(state);
    expect(live.currentAccuracy).toBe(100);
    expect(live.progress).toBeGreaterThan(0);

    const dur = getEffectiveDurationMs(state);
    expect(dur).toBeGreaterThanOrEqual(0);

    const metrics = computeSessionMetrics(state);
    expect(metrics).toBeDefined();

    expect(isSessionComplete(state)).toBe(false);
  });
});

describe('Custom Drill Generator Service', () => {
  const mockWeakChars: WeakCharacterView[] = [
    {
      user_id: 'user-1',
      character: 'ক',
      total_attempts: 10,
      error_count: 5,
      accuracy_rate: 50,
      strength_level: 'Very Weak',
    },
  ];

  test('generates custom drill from weak characters', async () => {
    const drill = await generateCustomDrill('user-1', mockWeakChars, 20);
    expect(drill).toBeDefined();
  });

  test('returns null if weak characters is empty', async () => {
    const drill = await generateCustomDrill('user-1', []);
    expect(drill).toBeNull();
  });

  test('fetches user custom drills, updates usage, deletes drill and gets recommendations', async () => {
    const drills = await getUserCustomDrills('user-1');
    expect(drills).toBeDefined();

    const single = await getCustomDrill('drill-1', 'user-1');
    expect(single).toBeDefined();

    const updated = await updateCustomDrillUsage('drill-1', 'user-1');
    expect(updated).toBe(true);

    const deleted = await deleteCustomDrill('drill-1', 'user-1');
    expect(deleted).toBe(true);

    const recs = await getDrillRecommendations('user-1');
    expect(recs).toBeDefined();

    const weakDrill = await createWeakCharacterDrill('user-1', 90, 1, 10, 20);
    expect(weakDrill).toBeDefined();
  });
});
