/**
 * Bengali Typing Session Engine
 *
 * Manages the full lifecycle of a typing session:
 *   IDLE → ACTIVE → PAUSED → COMPLETED
 *
 * Key design principles (from পরিকল্পনা.md):
 *   - Timer starts only when first valid input is received
 *   - Raw events stored in local buffer (no per-keystroke DB calls)
 *   - Metrics computed in browser; aggregated result sent to DB on session end
 *   - IME / composition events handled separately from direct key events
 *   - Performance: uses refs and reducers, not per-keystroke re-renders
 *   - Single clock: durations come from an injectable nowProvider
 *     (default performance.now()); payload timestamps are NOT trusted
 *     for duration math and only survive as event-relative offsets.
 */

import type { TypingEvent, ExtendedTypingStats, ErrorType } from '../types';
import { normalizeBengaliString } from '../bengali-grapheme';
import { segmentGraphemes } from './comparator';
import { classifyGraphemeError } from './error-classifier';
import { computeMetrics } from './metrics';
import {
  computeAccuracy,
  computeGpm,
  computeSpm,
  deriveWpmFromGpm,
} from './metric-formulas';

// ── Session state ───────────────────────────────────────────────

export type SessionStatus = 'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface SessionState {
  status: SessionStatus;
  startedAt: number | null;      // nowProvider() at first input
  endedAt: number | null;        // nowProvider() at session end
  pausedAt: number | null;       // when current pause started
  totalPausedMs: number;         // cumulative pause time (excluded from duration)
  expectedText: string;
  expectedGraphemes: string[];
  currentGraphemeIndex: number;
  events: TypingEvent[];
  layout: string;                // keyboard layout id
  composing: boolean;            // true while IME composition is in progress
  compositionBuffer: string;     // current IME composition string
  /** Time limit captured from SessionConfig at START (ms). Null = no limit. */
  timeLimitMs: number | null;
  /** Grapheme target captured from SessionConfig at START. Null = type full text. */
  graphemeLimit: number | null;
  /**
   * Number of incorrect events removed via BACKSPACE (pop strategy).
   * Because popped events are deleted, this counter is the only record
   * that a correction happened. See BACKSPACE case for details.
   */
  correctedCount: number;
}

// ── Session configuration ───────────────────────────────────────

export interface SessionConfig {
  text: string;
  layout: string;
  /** If set, session ends when timer runs out (in ms) */
  timeLimitMs?: number;
  /** If set, session ends when all graphemes are typed */
  graphemeLimit?: number;
}

// ── Session actions (for use with useReducer) ───────────────────

/**
 * NOTE: `timestamp` in INPUT/BACKSPACE/COMPOSITION payloads is OPTIONAL and
 * never trusted for duration math. The reducer's clock (nowProvider) is the
 * single source of truth for startedAt/endedAt/pausedAt and for the
 * event-relative `timestamp` offset stored on each TypingEvent. The payload
 * field is kept only for backward compatibility with existing callers/tests.
 */
export type SessionAction =
  | { type: 'START'; payload: SessionConfig }
  | { type: 'INPUT'; payload: { grapheme: string; timestamp?: number }; meta?: { now?: number } }
  | { type: 'BACKSPACE'; payload?: { timestamp?: number }; meta?: { now?: number } }
  | { type: 'COMPOSITION_START'; payload?: { timestamp?: number } }
  | { type: 'COMPOSITION_UPDATE'; payload: { data: string; timestamp?: number } }
  | { type: 'COMPOSITION_END'; payload: { data: string; timestamp?: number } }
  | { type: 'PAUSE'; meta?: { now?: number } }
  | { type: 'RESUME'; meta?: { now?: number } }
  | { type: 'FINISH'; meta?: { now?: number } }
  | { type: 'RESET' };

// ── Single clock ────────────────────────────────────────────────

export type NowProvider = () => number;

function defaultNow(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

let sessionClock: NowProvider = defaultNow;

/** Override the module clock (useful for tests/app-wide determinism). */
export function setSessionClock(provider: NowProvider): void {
  sessionClock = provider;
}

/** Restore the default performance.now() clock. */
export function resetSessionClock(): void {
  sessionClock = defaultNow;
}

/**
 * Create a reducer bound to a custom clock. The returned reducer ignores
 * payload timestamps for duration math and uses `nowProvider()` instead,
 * so tests can drive time deterministically:
 *
 *   let now = 1000;
 *   const reducer = createSessionReducer(() => now);
 *   state = reducer(state, { type: 'INPUT', payload: { grapheme: 'ক' } });
 *   now += 5000;
 */
export function createSessionReducer(
  nowProvider: NowProvider
): (state: SessionState, action: SessionAction) => SessionState {
  return (state, action) => reduceWithClock(state, action, nowProvider());
}

function actionNow(action: { meta?: { now?: number } }, fallback: number): number {
  return typeof action.meta?.now === 'number' ? action.meta.now : fallback;
}

// ── Initial state ───────────────────────────────────────────────

export const INITIAL_SESSION_STATE: SessionState = {
  status: 'IDLE',
  startedAt: null,
  endedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
  expectedText: '',
  expectedGraphemes: [],
  currentGraphemeIndex: 0,
  events: [],
  layout: 'banglaword',
  composing: false,
  compositionBuffer: '',
  timeLimitMs: null,
  graphemeLimit: null,
  correctedCount: 0,
};

// ── Session reducer ─────────────────────────────────────────────

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  return reduceWithClock(state, action, sessionClock());
}

function reduceWithClock(
  state: SessionState,
  action: SessionAction,
  clockNow: number
): SessionState {
  switch (action.type) {
    case 'START': {
      // PERF: the target text is segmented ONCE here, at session start, into
      // expectedGraphemes (memoised via segmentCached). Per-keystroke INPUT
      // only indexes that array — it never re-segments the target.
      const graphemes = segmentGraphemes(action.payload.text);
      return {
        ...INITIAL_SESSION_STATE,
        status: 'IDLE', // Timer starts at first input, not at start
        expectedText: action.payload.text,
        expectedGraphemes: graphemes,
        layout: action.payload.layout,
        timeLimitMs: action.payload.timeLimitMs ?? null,
        graphemeLimit: action.payload.graphemeLimit ?? null,
      };
    }

    case 'INPUT': {
      if (state.status === 'COMPLETED' || state.status === 'PAUSED') return state;

      // Single clock: payload.timestamp is ignored for duration math.
      const now = actionNow(action, clockNow);

      // Start timer on first input
      const startedAt = state.startedAt ?? now;
      const status: SessionStatus = 'ACTIVE';

      const lastEvent = state.events[state.events.length - 1];
      const lastAbsolute = lastEvent ? startedAt + lastEvent.timestamp : startedAt;
      const latencyMs = state.events.length === 0 ? 0 : Math.max(0, now - lastAbsolute);

      const expectedGrapheme = state.expectedGraphemes[state.currentGraphemeIndex] ?? '';
      const actualInput = action.payload.grapheme;

      // Compare. normalizeBengaliString is the single normalizer for the whole
      // app: NFC, ZWJ/ZWNJ removal, and the decomposed-nukta forms folded onto
      // their atomic letters (ড + ় -> ড়). A second, narrower copy of this
      // function used to live here, so the session engine called ড় a mistake
      // whenever the rest of the app called it correct.
      const correct = expectedGrapheme !== '' &&
        normalizeBengaliString(expectedGrapheme) === normalizeBengaliString(actualInput);

      const errorType: ErrorType | null = correct
        ? null
        : classifyGraphemeError(expectedGrapheme, actualInput);

      const newEvent: TypingEvent = {
        sequence: state.events.length,
        // Captured before the index advances, and deliberately not the same as
        // `sequence`: a grapheme the learner mistyped and then fixed has two
        // events and one index.
        graphemeIndex: state.currentGraphemeIndex,
        expectedGrapheme,
        actualInput,
        timestamp: now - startedAt,  // Relative to session start (clock-derived)
        latencyMs,
        correct,
        errorType,
        layout: state.layout,
        // A mistake is "corrected" when the learner comes back to the same
        // grapheme after having already got it wrong.
        corrected: state.events.some(
          (e) => e.graphemeIndex === state.currentGraphemeIndex && !e.correct
        ),
      };

      const newIndex = correct
        ? Math.min(state.currentGraphemeIndex + 1, state.expectedGraphemes.length)
        : state.currentGraphemeIndex;

      const events = [...state.events, newEvent];
      const targetComplete =
        (state.expectedGraphemes.length > 0 && newIndex >= state.expectedGraphemes.length) ||
        (state.graphemeLimit != null && newIndex >= state.graphemeLimit);

      let nextStatus: SessionStatus = targetComplete ? 'COMPLETED' : status;
      let endedAt: number | null = targetComplete ? now : null;

      // Time limit auto-complete: duration is clock-derived, never payload-derived.
      if (nextStatus !== 'COMPLETED' && state.timeLimitMs != null && startedAt != null) {
        const elapsed = Math.max(0, now - startedAt - state.totalPausedMs);
        if (elapsed >= state.timeLimitMs) {
          nextStatus = 'COMPLETED';
          endedAt = now;
        }
      }

      return {
        ...state,
        status: nextStatus,
        startedAt,
        endedAt,
        currentGraphemeIndex: newIndex,
        events,
      };
    }

    case 'BACKSPACE': {
      if (state.status === 'COMPLETED' || state.status === 'IDLE') return state;
      if (state.events.length === 0) return state;

      /**
       * BACKSPACE (pop strategy).
       *
       * Removes the most recent event from the buffer instead of flagging it:
       * - If the popped event was CORRECT, the cursor steps back one grapheme
       *   (the learner is un-typing a good grapheme).
       * - If the popped event was WRONG, the cursor stays where it is (wrong
       *   inputs never advance the index, so there is nothing to step back
       *   from) — the mistake is simply erased and can be retyped.
       * - At index 0 with a wrong event, the event is removed and the index
       *   stays 0 (no negative index).
       * - Popped WRONG events increment `correctedCount`, the only surviving
       *   record of the correction, since the event itself is gone.
       *
       * Rationale: flagging (`corrected: true`) keeps stale wrong events in
       * the buffer, which inflates error counts and forces every metric to
       * special-case corrected rows. Popping keeps the buffer equal to the
       * visible attempt history.
       */
      const events = [...state.events];
      const popped = events.pop();
      if (!popped) return state;

      const wasCorrect = popped.correct;
      const nextIndex = wasCorrect
        ? Math.max(0, state.currentGraphemeIndex - 1)
        : state.currentGraphemeIndex;

      return {
        ...state,
        currentGraphemeIndex: nextIndex,
        events: events.map((e, i) => ({ ...e, sequence: i })),
        correctedCount: state.correctedCount + (wasCorrect ? 0 : 1),
      };
    }

    case 'COMPOSITION_START': {
      return { ...state, composing: true, compositionBuffer: '' };
    }

    case 'COMPOSITION_UPDATE': {
      return { ...state, compositionBuffer: action.payload.data };
    }

    case 'COMPOSITION_END': {
      // Composition ended — treat the final result as a single input event
      // The actual INPUT action will be dispatched by the engine after this
      return { ...state, composing: false, compositionBuffer: '' };
    }

    case 'PAUSE': {
      if (state.status !== 'ACTIVE') return state;
      return { ...state, status: 'PAUSED', pausedAt: actionNow(action, clockNow) };
    }

    case 'RESUME': {
      if (state.status !== 'PAUSED' || state.pausedAt === null) return state;
      const now = actionNow(action, clockNow);
      const pausedDuration = Math.max(0, now - state.pausedAt);
      return {
        ...state,
        status: 'ACTIVE',
        pausedAt: null,
        totalPausedMs: state.totalPausedMs + pausedDuration,
      };
    }

    case 'FINISH': {
      if (state.status === 'COMPLETED') return state;
      return {
        ...state,
        status: 'COMPLETED',
        endedAt: actionNow(action, clockNow),
      };
    }

    case 'RESET': {
      return { ...INITIAL_SESSION_STATE };
    }

    default:
      return state;
  }
}

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Number of wrong events the learner erased with BACKSPACE.
 * Popped events are gone from `state.events`, so this counter (plus any
 * legacy `corrected` flags) is the correction record. Prefer this helper
 * over reading flags directly.
 */
export function getCorrectedCount(state: SessionState): number {
  const legacy = state.events.filter((e) => e.corrected).length;
  return state.correctedCount + legacy;
}

/**
 * Compute effective session duration (excluding pauses).
 * Uses the injected session clock when the session is still running;
 * pass an explicit `now` in tests for full determinism.
 */
export function getEffectiveDurationMs(state: SessionState, now?: number): number {
  if (state.startedAt == null) return 0;

  const endTime = state.endedAt ?? (typeof now === 'number' ? now : sessionClock());
  const rawDuration = endTime - state.startedAt;
  return Math.max(0, rawDuration - state.totalPausedMs);
}

/**
 * Compute final metrics for a completed session.
 * Call this when session status becomes COMPLETED.
 */
export function computeSessionMetrics(state: SessionState): ExtendedTypingStats {
  const durationMs = getEffectiveDurationMs(state);
  return computeMetrics(state.events, state.expectedText, durationMs);
}

/**
 * Get live (in-progress) metrics for display during a session.
 * Less expensive than full computeSessionMetrics.
 *
 * Speed/accuracy math is delegated to the canonical metric-formulas module
 * so the live overlay and the final report can never disagree on units:
 * GPM via computeGpm, Bengali WPM via deriveWpmFromGpm (0 for gpm<=0),
 * SPM via computeSpm, accuracy via computeAccuracy (integer 0–100).
 */
export function getLiveMetrics(state: SessionState, now?: number): {
  currentGpm: number;
  currentWpm: number;
  currentSpm: number;
  currentAccuracy: number;
  elapsedSeconds: number;
  progress: number;  // 0–100
} {
  if (state.startedAt == null || state.events.length === 0) {
    return { currentGpm: 0, currentWpm: 0, currentSpm: 0, currentAccuracy: 100, elapsedSeconds: 0, progress: 0 };
  }

  const durationMs = getEffectiveDurationMs(state, now);

  const correctCount = state.events.filter(e => e.correct && !e.corrected).length;
  const totalAttempted = state.events.filter(e => !e.corrected).length;

  const currentGpm = computeGpm(correctCount, durationMs);
  const currentWpm = deriveWpmFromGpm(currentGpm);
  const currentSpm = computeSpm(state.events.length, durationMs);
  const currentAccuracy = computeAccuracy(correctCount, totalAttempted);
  const elapsedSeconds = Math.round(durationMs / 1000);
  const progress = state.expectedGraphemes.length > 0
    ? Math.round((state.currentGraphemeIndex / state.expectedGraphemes.length) * 100)
    : 0;

  return { currentGpm, currentWpm, currentSpm, currentAccuracy, elapsedSeconds, progress };
}

/**
 * True when the session has no usable data.
 * An empty (or near-empty) session reports 100% accuracy by convention —
 * that value is meaningless and must never be persisted (see
 * shouldSaveSession).
 */
export function isEmptySession(state: SessionState): boolean {
  return state.events.length === 0 || state.startedAt == null;
}

/**
 * Whether a session is worth persisting.
 *
 * Returns false when there are no events or the effective duration is under
 * 3s: short/empty probes (which trivially show 100% accuracy) would otherwise
 * pollute history and leaderboards. Callers should skip DB writes when this
 * returns false.
 */
export function shouldSaveSession(state: SessionState, now?: number): boolean {
  if (isEmptySession(state)) return false;
  return getEffectiveDurationMs(state, now) >= 3000;
}

/**
 * Check whether the session is complete (all graphemes typed, grapheme limit
 * reached, or time limit reached).
 *
 * Backward compatible: an explicit `timeLimitMs` argument overrides the
 * `state.timeLimitMs` captured at START. Prefer storing the limit in state
 * (set automatically from SessionConfig); the argument remains for legacy
 * callers such as useTypingSession(timeLimitMs).
 */
export function isSessionComplete(state: SessionState, timeLimitMs?: number): boolean {
  if (state.status === 'COMPLETED') return true;
  if (state.currentGraphemeIndex >= state.expectedGraphemes.length && state.expectedGraphemes.length > 0) return true;
  if (state.graphemeLimit != null && state.currentGraphemeIndex >= state.graphemeLimit) return true;
  const limit = timeLimitMs ?? state.timeLimitMs ?? undefined;
  if (limit != null && state.startedAt != null) {
    const elapsed = getEffectiveDurationMs(state);
    if (elapsed >= limit) return true;
  }
  return false;
}
