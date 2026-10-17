/**
 * Session backspace / clock / guard regression tests.
 */
import {
  sessionReducer,
  INITIAL_SESSION_STATE,
  createSessionReducer,
  getEffectiveDurationMs,
  getLiveMetrics,
  isEmptySession,
  shouldSaveSession,
  isSessionComplete,
  computeSessionMetrics,
  getCorrectedCount,
  type SessionState,
} from '../lib/typing/session';
import { deriveWpmFromGpm, computeAccuracy } from '../lib/typing/metric-formulas';
import { BENGALI_WPM_LABEL, DURATION_UNIT, msToSec, secToMs } from '../lib/typing/metrics';
import { segmentGraphemes } from '../lib/typing/comparator';

function startText(text: string, extra: Record<string, unknown> = {}): SessionState {
  return sessionReducer(INITIAL_SESSION_STATE, {
    type: 'START',
    payload: { text, layout: 'banglaword', ...extra },
  });
}

describe('session backspace (pop strategy)', () => {
  test('wrong-then-backspace: index unchanged, event removed', () => {
    let s = startText('কখ');
    const now = 5000;
    const reduce = createSessionReducer(() => now);
    s = reduce(s, { type: 'INPUT', payload: { grapheme: ' WRONG ' } });
    expect(s.events.length).toBe(1);
    expect(s.currentGraphemeIndex).toBe(0);
    s = reduce(s, { type: 'BACKSPACE' });
    expect(s.events.length).toBe(0);
    expect(s.currentGraphemeIndex).toBe(0);
    expect(getCorrectedCount(s)).toBe(1);
  });

  test('correct-then-backspace decrements index and removes event', () => {
    let s = startText('কখ');
    const reduce = createSessionReducer(() => 8000);
    const first = segmentGraphemes('কখ')[0];
    s = reduce(s, { type: 'INPUT', payload: { grapheme: first } });
    expect(s.currentGraphemeIndex).toBe(1);
    expect(s.events.length).toBe(1);
    s = reduce(s, { type: 'BACKSPACE' });
    expect(s.events.length).toBe(0);
    expect(s.currentGraphemeIndex).toBe(0);
    expect(getCorrectedCount(s)).toBe(0);
  });

  test('index-0 wrong removed, index stays 0', () => {
    let s = startText('ক');
    const reduce = createSessionReducer(() => 9000);
    s = reduce(s, { type: 'INPUT', payload: { grapheme: 'X' } });
    expect(s.currentGraphemeIndex).toBe(0);
    s = reduce(s, { type: 'BACKSPACE' });
    expect(s.events.length).toBe(0);
    expect(s.currentGraphemeIndex).toBe(0);
  });
});

describe('time limit auto-complete', () => {
  test('INPUT auto-completes when effective duration >= timeLimitMs', () => {
    let now = 10000;
    const reduce = createSessionReducer(() => now);
    let s = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'কখগঘঙ', layout: 'banglaword', timeLimitMs: 2000 },
    });
    expect(s.timeLimitMs).toBe(2000);
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগঘঙ')[0] } });
    expect(s.status).toBe('ACTIVE');
    now += 2500; // exceed limit
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগঘঙ')[1] } });
    expect(s.status).toBe('COMPLETED');
    expect(s.endedAt).toBe(now);
  });

  test('isSessionComplete: explicit arg overrides state field (backward compat)', () => {
    const now = 20000;
    const reduce = createSessionReducer(() => now);
    let s = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'কখ', layout: 'banglaword' },
    });
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখ')[0] } });
    // No limit stored; explicit 0ms limit forces completion via elapsed>=0
    expect(isSessionComplete(s)).toBe(false);
    expect(isSessionComplete(s, 0)).toBe(true);
  });
});

describe('single clock determinism', () => {
  test('payload.timestamp ignored; clock drives duration', () => {
    let now = 30000;
    const reduce = createSessionReducer(() => now);
    let s = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'কখ', layout: 'banglaword' },
    });
    s = reduce(s, {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[0], timestamp: 1 },
    });
    // Event offset must be 0 (now - startedAt), not payload-derived
    expect(s.events[0].timestamp).toBe(0);
    now += 4000;
    expect(getEffectiveDurationMs(s, now)).toBe(4000);
    s = reduce(s, {
      type: 'INPUT',
      payload: { grapheme: segmentGraphemes('কখ')[1], timestamp: 2 },
    });
    expect(s.events[1].timestamp).toBe(4000);
  });

  test('PAUSE/RESUME/FINISH use clock, not performance.now', () => {
    let now = 40000;
    const reduce = createSessionReducer(() => now);
    let s = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'কখগ', layout: 'banglaword' },
    });
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগ')[0] } });
    s = reduce(s, { type: 'PAUSE' });
    expect(s.pausedAt).toBe(now);
    now += 5000;
    s = reduce(s, { type: 'RESUME' });
    expect(s.totalPausedMs).toBe(5000);
    now += 1000;
    s = reduce(s, { type: 'FINISH' });
    expect(s.endedAt).toBe(now);
    expect(getEffectiveDurationMs(s)).toBe(1000);
  });
});

describe('empty session guard', () => {
  test('empty session not saveable; 100% on empty must not be saved', () => {
    const s = startText('কখ');
    expect(isEmptySession(s)).toBe(true);
    expect(shouldSaveSession(s)).toBe(false);
    expect(getLiveMetrics(s).currentAccuracy).toBe(100); // convention, meaningless
  });

  test('short session (<3000ms) not saveable', () => {
    let now = 50000;
    const reduce = createSessionReducer(() => now);
    let s = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'কখ', layout: 'banglaword' },
    });
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখ')[0] } });
    now += 1000;
    expect(shouldSaveSession(s, now)).toBe(false);
    now += 3000;
    expect(shouldSaveSession(s, now)).toBe(true);
  });
});

describe('live vs final WPM consistency', () => {
  test('live WPM equals deriveWpmFromGpm(live GPM); accuracy canonical', () => {
    let now = 60000;
    const reduce = createSessionReducer(() => now);
    let s = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'কখগঘ', layout: 'banglaword' },
    });
    const g = segmentGraphemes('কখগঘ');
    s = reduce(s, { type: 'INPUT', payload: { grapheme: g[0] } });
    now += 30000; // 0.5 min, 1 correct => GPM 2
    const live = getLiveMetrics(s, now);
    expect(live.currentWpm).toBe(deriveWpmFromGpm(live.currentGpm));
    expect(live.currentAccuracy).toBe(computeAccuracy(1, 1));
    // Final metrics over same buffer agree on units
    const final = computeSessionMetrics({ ...s, endedAt: now });
    expect(final.timeElapsed).toBe(msToSec(30000));
  });

  test('graphemeLimit completes early', () => {
    const reduce = createSessionReducer(() => 70000);
    let s = sessionReducer(INITIAL_SESSION_STATE, {
      type: 'START',
      payload: { text: 'কখগঘঙ', layout: 'banglaword', graphemeLimit: 1 },
    });
    s = reduce(s, { type: 'INPUT', payload: { grapheme: segmentGraphemes('কখগঘঙ')[0] } });
    expect(s.status).toBe('COMPLETED');
  });

  test('duration unit contract exports', () => {
    expect(DURATION_UNIT).toBe('ms');
    expect(BENGALI_WPM_LABEL).toBe('WPM (আনুমানিক)');
    expect(msToSec(3500)).toBe(4);
    expect(secToMs(4)).toBe(4000);
  });
});
