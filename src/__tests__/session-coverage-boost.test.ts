/**
 * Session coverage boost — branch/function coverage for src/lib/typing/session.ts.
 *
 * Targets the per-file gate (lines/statements 90, functions 90, branches 80):
 * PAUSE/RESUME accounting, FINISH with empty events, graphemeLimit boundary,
 * timeLimitMs=null path, COMPOSITION branches, RESET, getLiveMetrics edge
 * cases, isSessionComplete branches, getCorrectedCount legacy flags, and
 * clock injection via createSessionReducer / setSessionClock.
 */
import {
  sessionReducer,
  INITIAL_SESSION_STATE,
  createSessionReducer,
  setSessionClock,
  resetSessionClock,
  getEffectiveDurationMs,
  getLiveMetrics,
  getCorrectedCount,
  isSessionComplete,
  isEmptySession,
  shouldSaveSession,
  computeSessionMetrics,
  type SessionState,
  type SessionAction,
} from '../lib/typing/session';
import type { TypingEvent } from '../lib/types';
import { segmentGraphemes } from '../lib/typing/comparator';

function startSession(text: string, extra: Record<string, unknown> = {}): SessionState {
  return sessionReducer(INITIAL_SESSION_STATE, {
    type: 'START',
    payload: { text, layout: 'banglaword', ...extra },
  });
}

function fakeEvent(overrides: Partial<TypingEvent> = {}): TypingEvent {
  return {
    sequence: 0,
    graphemeIndex: 0,
    expectedGrapheme: 'ক',
    actualInput: 'ক',
    timestamp: 0,
    latencyMs: 0,
    correct: true,
    errorType: null,
    layout: 'banglaword',
    corrected: false,
    ...overrides,
  };
}

describe('module clock injection (set/resetSessionClock, defaultNow)', () => {
  afterEach(() => {
    resetSessionClock();
  });

  test('setSessionClock drives sessionReducer durations', () => {
    let now = 1234;
    setSessionClock(() => now);
    let s = startSession('কখ');
    s = sessionReducer(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখ')[0] } });
    expect(s.startedAt).toBe(1234);
    now = 2234;
    expect(getEffectiveDurationMs(s)).toBe(1000);
  });

  test('defaultNow falls back to Date.now when performance is missing', () => {
    const saved = (globalThis as unknown as Record<string, unknown>).performance;
    try {
      Object.defineProperty(globalThis, 'performance', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      resetSessionClock();
      let s = startSession('ক');
      s = sessionReducer(s, { type: 'INPUT', payload: { grapheme: 'ক' } });
      expect(typeof s.startedAt).toBe('number');
    } finally {
      Object.defineProperty(globalThis, 'performance', {
        value: saved,
        configurable: true,
        writable: true,
      });
      resetSessionClock();
    }
  });

  test('defaultNow falls back to Date.now when performance.now is missing', () => {
    const saved = (globalThis as unknown as Record<string, unknown>).performance;
    try {
      Object.defineProperty(globalThis, 'performance', {
        value: {},
        configurable: true,
        writable: true,
      });
      resetSessionClock();
      let s = startSession('ক');
      s = sessionReducer(s, { type: 'INPUT', payload: { grapheme: 'ক' } });
      expect(typeof s.startedAt).toBe('number');
    } finally {
      Object.defineProperty(globalThis, 'performance', {
        value: saved,
        configurable: true,
        writable: true,
      });
      resetSessionClock();
    }
  });
});

describe('PAUSE/RESUME guards and duration accounting', () => {
  test('PAUSE on IDLE/PAUSED/COMPLETED returns the same state', () => {
    const idle = startSession('কখ');
    expect(sessionReducer(idle, { type: 'PAUSE' })).toBe(idle);

    const now = 1000;
    const reduce = createSessionReducer(() => now);
    let s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    s = reduce(s, { type: 'PAUSE' });
    expect(sessionReducer(s, { type: 'PAUSE' })).toBe(s);
    const done = reduce(s, { type: 'RESUME' });
    const finished = reduce(done, { type: 'FINISH' });
    expect(sessionReducer(finished, { type: 'PAUSE' })).toBe(finished);
  });

  test('PAUSE honors meta.now override', () => {
    const now = 1000;
    const reduce = createSessionReducer(() => now);
    let s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    s = reduce(s, { type: 'PAUSE', meta: { now: 1500 } });
    expect(s.status).toBe('PAUSED');
    expect(s.pausedAt).toBe(1500);
  });

  test('RESUME when not paused or pausedAt null returns the same state', () => {
    const active = createSessionReducer(() => 2000)(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    expect(active.status).toBe('ACTIVE');
    expect(sessionReducer(active, { type: 'RESUME' })).toBe(active);

    const broken: SessionState = { ...active, status: 'PAUSED', pausedAt: null };
    expect(sessionReducer(broken, { type: 'RESUME' })).toBe(broken);
  });

  test('RESUME clamps backwards clock to zero pause', () => {
    let now = 5000;
    const reduce = createSessionReducer(() => now);
    let s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    s = reduce(s, { type: 'PAUSE' });
    now = 4000; // clock moved backwards
    s = reduce(s, { type: 'RESUME' });
    expect(s.status).toBe('ACTIVE');
    expect(s.totalPausedMs).toBe(0);
  });

  test('RESUME honors meta.now and accumulates across pauses', () => {
    let now = 500;
    const reduce = createSessionReducer(() => now);
    let s = reduce(startSession('কখগ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখগ')[0] },
    });
    now = 1000;
    s = reduce(s, { type: 'PAUSE' });
    s = reduce(s, { type: 'RESUME', meta: { now: 1500 } });
    expect(s.totalPausedMs).toBe(500);
    now = 2000;
    s = reduce(s, { type: 'PAUSE' });
    now = 2600;
    s = reduce(s, { type: 'RESUME' });
    expect(s.totalPausedMs).toBe(1100);
    now = 3000;
    s = reduce(s, { type: 'FINISH' });
    // raw 3000-500=2500 minus 1100 paused = 1400
    expect(getEffectiveDurationMs(s)).toBe(1400);
  });
});

describe('FINISH branches', () => {
  test('FINISH on fresh IDLE session with empty events completes', () => {
    const now = 9000;
    const reduce = createSessionReducer(() => now);
    const s = reduce(startSession('কখ'), { type: 'FINISH' });
    expect(s.status).toBe('COMPLETED');
    expect(s.endedAt).toBe(9000);
    expect(s.events.length).toBe(0);
  });

  test('FINISH when already COMPLETED returns the same state', () => {
    const reduce = createSessionReducer(() => 9500);
    const done = reduce(startSession('কখ'), { type: 'FINISH' });
    expect(reduce(done, { type: 'FINISH' })).toBe(done);
  });

  test('FINISH honors meta.now override', () => {
    const reduce = createSessionReducer(() => 1000);
    const s = reduce(startSession('কখ'), { type: 'FINISH', meta: { now: 7777 } });
    expect(s.endedAt).toBe(7777);
  });
});

describe('INPUT guards and latency branches', () => {
  test('INPUT on PAUSED/COMPLETED returns the same state', () => {
    const now = 11000;
    const reduce = createSessionReducer(() => now);
    const s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    const paused = reduce(s, { type: 'PAUSE' });
    expect(
      reduce(paused, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখ')[1] } }),
    ).toBe(paused);
    const done = reduce(paused, { type: 'RESUME' });
    const finished = reduce(done, { type: 'FINISH' });
    expect(
      reduce(finished, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখ')[1] } }),
    ).toBe(finished);
  });

  test('INPUT honors meta.now override for startedAt', () => {
    const reduce = createSessionReducer(() => 1000);
    const s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
      meta: { now: 4321 },
    });
    expect(s.startedAt).toBe(4321);
    expect(s.events[0].timestamp).toBe(0);
  });

  test('INPUT clamps negative latency to zero when clock goes backwards', () => {
    let now = 20000;
    const reduce = createSessionReducer(() => now);
    let s = reduce(startSession('কখগ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখগ')[0] },
    });
    now = 19000; // backwards
    s = reduce(s, { type: 'INPUT', payload: { grapheme: 'X' } });
    expect(s.events[1].latencyMs).toBe(0);
  });

  test('INPUT on empty expected text records an incorrect event', () => {
    const reduce = createSessionReducer(() => 21000);
    const s = reduce(startSession(''), { type: 'INPUT', payload: { grapheme: 'X' } });
    expect(s.status).toBe('ACTIVE');
    expect(s.events.length).toBe(1);
    expect(s.events[0].correct).toBe(false);
  });

  test('wrong then correct marks the retry as corrected', () => {
    const reduce = createSessionReducer(() => 22000);
    const g = segmentGraphemes('কখ');
    let s = reduce(startSession('কখ'), { type: 'INPUT', payload: { grapheme: 'X' } });
    expect(s.currentGraphemeIndex).toBe(0);
    s = reduce(s, { type: 'INPUT', payload: { grapheme: g[0] } });
    expect(s.events[1].corrected).toBe(true);
    expect(s.currentGraphemeIndex).toBe(1);
  });
});

describe('BACKSPACE guards', () => {
  test('BACKSPACE on IDLE / empty ACTIVE / COMPLETED returns the same state', () => {
    const reduce = createSessionReducer(() => 23000);
    const idle = startSession('কখ');
    expect(reduce(idle, { type: 'BACKSPACE' })).toBe(idle);

    const emptyActive: SessionState = { ...idle, status: 'ACTIVE' };
    expect(reduce(emptyActive, { type: 'BACKSPACE' })).toBe(emptyActive);

    const done = reduce(startSession('ক'), { type: 'FINISH' });
    expect(reduce(done, { type: 'BACKSPACE' })).toBe(done);
  });
});

describe('graphemeLimit boundary', () => {
  test('limit reached exactly on the boundary completes', () => {
    const reduce = createSessionReducer(() => 24000);
    const g = segmentGraphemes('কখগ');
    let s = startSession('কখগ', { graphemeLimit: 2 });
    expect(s.graphemeLimit).toBe(2);
    s = reduce(s, { type: 'INPUT', payload: { grapheme: g[0] } });
    expect(s.status).toBe('ACTIVE');
    expect(s.currentGraphemeIndex).toBe(1);
    s = reduce(s, { type: 'INPUT', payload: { grapheme: g[1] } });
    expect(s.status).toBe('COMPLETED');
    expect(s.currentGraphemeIndex).toBe(2);
  });

  test('wrong inputs do not advance toward the limit', () => {
    const reduce = createSessionReducer(() => 25000);
    const g = segmentGraphemes('কখগ');
    let s = startSession('কখগ', { graphemeLimit: 1 });
    s = reduce(s, { type: 'INPUT', payload: { grapheme: 'X' } });
    expect(s.status).toBe('ACTIVE');
    expect(s.currentGraphemeIndex).toBe(0);
    s = reduce(s, { type: 'INPUT', payload: { grapheme: g[0] } });
    expect(s.status).toBe('COMPLETED');
  });
});

describe('timeLimitMs paths', () => {
  test('null limit never auto-completes, even after a long jump', () => {
    let now = 26000;
    const reduce = createSessionReducer(() => now);
    let s = startSession('কখগঘঙ');
    expect(s.timeLimitMs).toBeNull();
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগঘঙ')[0] } });
    now += 3600_000;
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগঘঙ')[1] } });
    expect(s.status).toBe('ACTIVE');
    expect(s.endedAt).toBeNull();
  });

  test('limit set but not exceeded stays ACTIVE', () => {
    let now = 27000;
    const reduce = createSessionReducer(() => now);
    let s = startSession('কখগঘঙ', { timeLimitMs: 60_000 });
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগঘঙ')[0] } });
    now += 1000;
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগঘঙ')[1] } });
    expect(s.status).toBe('ACTIVE');
    expect(s.endedAt).toBeNull();
  });
});

describe('COMPOSITION branches', () => {
  test('START/UPDATE/END cycle manages composing flag and buffer', () => {
    const reduce = createSessionReducer(() => 28000);
    let s = startSession('কখ');
    s = reduce(s, { type: 'COMPOSITION_START' });
    expect(s.composing).toBe(true);
    expect(s.compositionBuffer).toBe('');
    s = reduce(s, { type: 'COMPOSITION_UPDATE', payload: { data: 'ক্ক' } });
    expect(s.compositionBuffer).toBe('ক্ক');
    expect(s.composing).toBe(true);
    s = reduce(s, { type: 'COMPOSITION_END', payload: { data: 'ক্ক' } });
    expect(s.composing).toBe(false);
    expect(s.compositionBuffer).toBe('');
    // Engine dispatches INPUT after composition ends
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখ')[0] } });
    expect(s.events.length).toBe(1);
  });
});

describe('RESET and unknown actions', () => {
  test('RESET restores the initial state after activity', () => {
    const now = 29000;
    const reduce = createSessionReducer(() => now);
    let s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    s = reduce(s, { type: 'PAUSE' });
    s = reduce(s, { type: 'RESET' });
    expect(s).toEqual(INITIAL_SESSION_STATE);
  });

  test('unknown action returns the same state (default branch)', () => {
    const s = startSession('কখ');
    expect(sessionReducer(s, { type: 'NOPE' } as unknown as SessionAction)).toBe(s);
  });

  test('START mid-session resets timer, events, and captures limits', () => {
    const reduce = createSessionReducer(() => 30000);
    let s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    expect(s.events.length).toBe(1);
    s = sessionReducer(s, {
      type: 'START',
      payload: { text: 'গঘ', layout: 'probhat', timeLimitMs: 5000, graphemeLimit: 2 },
    });
    expect(s.status).toBe('IDLE');
    expect(s.events.length).toBe(0);
    expect(s.startedAt).toBeNull();
    expect(s.expectedText).toBe('গঘ');
    expect(s.layout).toBe('probhat');
    expect(s.timeLimitMs).toBe(5000);
    expect(s.graphemeLimit).toBe(2);
  });
});

describe('getEffectiveDurationMs branches', () => {
  test('null startedAt returns 0', () => {
    expect(getEffectiveDurationMs(INITIAL_SESSION_STATE)).toBe(0);
  });

  test('endedAt ignores the now argument', () => {
    const reduce = createSessionReducer(() => 31000);
    let s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    s = reduce(s, { type: 'FINISH', meta: { now: 33000 } });
    expect(getEffectiveDurationMs(s, 999_999)).toBe(2000);
  });

  test('negative raw duration clamps to 0', () => {
    const s: SessionState = { ...INITIAL_SESSION_STATE, startedAt: 5000, endedAt: 1000 };
    expect(getEffectiveDurationMs(s)).toBe(0);
  });
});

describe('getLiveMetrics branches', () => {
  test('null startedAt returns zeroed metrics', () => {
    const live = getLiveMetrics(INITIAL_SESSION_STATE);
    expect(live).toEqual({
      currentGpm: 0,
      currentWpm: 0,
      currentSpm: 0,
      currentAccuracy: 100,
      elapsedSeconds: 0,
      progress: 0,
    });
  });

  test('started session with no events returns zeroed metrics', () => {
    expect(getLiveMetrics(startSession('কখ'))).toMatchObject({ currentGpm: 0, progress: 0 });
  });

  test('empty expected text yields zero progress and zero accuracy on miss', () => {
    const reduce = createSessionReducer(() => 32000);
    const s = reduce(startSession(''), { type: 'INPUT', payload: { grapheme: 'X' } });
    expect(s.events.length).toBe(1);
    const live = getLiveMetrics(s, 62000);
    expect(live.progress).toBe(0);
    expect(live.currentAccuracy).toBe(0);
  });

  test('corrected-flag events are excluded from live accuracy', () => {
    const base = startSession('কখ');
    const s: SessionState = {
      ...base,
      startedAt: 1000,
      events: [
        fakeEvent({ sequence: 0, correct: true, corrected: false }),
        fakeEvent({ sequence: 1, correct: true, corrected: true }),
      ],
    };
    const live = getLiveMetrics(s, 61000);
    // 1 counted correct / 1 counted attempt => 100%
    expect(live.currentAccuracy).toBe(100);
    expect(live.currentGpm).toBeGreaterThan(0);
  });

  test('live metrics on a paused session use explicit now', () => {
    let now = 40000;
    const reduce = createSessionReducer(() => now);
    let s = reduce(startSession('কখগঘ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখগঘ')[0] },
    });
    now = 70000;
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগঘ')[1] } });
    const live = getLiveMetrics(s, 70000);
    expect(live.elapsedSeconds).toBe(30);
    expect(live.progress).toBe(50);
  });
});

describe('isSessionComplete all branches', () => {
  afterEach(() => {
    resetSessionClock();
  });

  test('COMPLETED status short-circuits to true', () => {
    const reduce = createSessionReducer(() => 50000);
    const done = reduce(startSession('ক'), { type: 'FINISH' });
    expect(isSessionComplete(done)).toBe(true);
  });

  test('graphemeLimit branch returns true for an ACTIVE hand-built state', () => {
    const s: SessionState = {
      ...startSession('কখগ'),
      status: 'ACTIVE',
      startedAt: 1000,
      currentGraphemeIndex: 2,
      graphemeLimit: 2,
    };
    expect(isSessionComplete(s)).toBe(true);
  });

  test('state timeLimitMs triggers completion via the module clock', () => {
    let now = 60000;
    setSessionClock(() => now);
    let s = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'কখগ', layout: 'banglaword', timeLimitMs: 1000 },
    });
    s = sessionReducer(s, {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখগ')[0] },
    });
    expect(isSessionComplete(s)).toBe(false);
    now += 2000;
    expect(isSessionComplete(s)).toBe(true);
  });

  test('empty text with no limits is never complete', () => {
    expect(isSessionComplete(startSession(''))).toBe(false);
  });

  test('stored limit with null startedAt is not complete', () => {
    const s = startSession('কখ', { timeLimitMs: 1000 });
    expect(s.startedAt).toBeNull();
    expect(isSessionComplete(s)).toBe(false);
  });
});

describe('getCorrectedCount with legacy flags', () => {
  test('sums the pop counter and legacy corrected flags', () => {
    const base = startSession('কখ');
    const s: SessionState = {
      ...base,
      correctedCount: 1,
      events: [
        fakeEvent({ sequence: 0, correct: false, corrected: false }),
        fakeEvent({ sequence: 1, correct: true, corrected: true }),
        fakeEvent({ sequence: 2, correct: true, corrected: true }),
      ],
    };
    expect(getCorrectedCount(s)).toBe(3);
  });

  test('zero when nothing was corrected', () => {
    expect(getCorrectedCount(startSession('কখ'))).toBe(0);
  });
});

describe('empty/saveable guards and final metrics', () => {
  test('events present but startedAt null counts as empty and unsaveable', () => {
    const s: SessionState = { ...INITIAL_SESSION_STATE, events: [fakeEvent()] };
    expect(isEmptySession(s)).toBe(true);
    expect(shouldSaveSession(s)).toBe(false);
  });

  test('started non-empty session is not empty', () => {
    const reduce = createSessionReducer(() => 70000);
    const s = reduce(startSession('কখ'), {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0] },
    });
    expect(isEmptySession(s)).toBe(false);
  });

  test('computeSessionMetrics returns extended stats for a finished session', () => {
    let now = 80000;
    const reduce = createSessionReducer(() => now);
    const g = segmentGraphemes('কখ');
    let s = reduce(startSession('কখ'), { type: 'INPUT', payload: { grapheme: g[0] } });
    now += 30_000;
    s = reduce(s, { type: 'INPUT', payload: { grapheme: g[1] } });
    expect(s.status).toBe('COMPLETED');
    const stats = computeSessionMetrics(s);
    expect(stats.accuracy).toBe(100);
    expect(stats.gpm).toBeGreaterThan(0);
  });
});
