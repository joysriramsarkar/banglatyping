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
 */

import type { TypingEvent, ExtendedTypingStats, ErrorType } from '../types';
import { segmentGraphemes } from './comparator';
import { classifyGraphemeError } from './error-classifier';
import { computeMetrics } from './metrics';

// ── Session state ───────────────────────────────────────────────

export type SessionStatus = 'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface SessionState {
  status: SessionStatus;
  startedAt: number | null;      // performance.now() at first input
  endedAt: number | null;        // performance.now() at session end
  pausedAt: number | null;       // when current pause started
  totalPausedMs: number;         // cumulative pause time (excluded from duration)
  expectedText: string;
  expectedGraphemes: string[];
  currentGraphemeIndex: number;
  events: TypingEvent[];
  layout: string;                // keyboard layout id
  composing: boolean;            // true while IME composition is in progress
  compositionBuffer: string;     // current IME composition string
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

export type SessionAction =
  | { type: 'START'; payload: SessionConfig }
  | { type: 'INPUT'; payload: { grapheme: string; timestamp: number } }
  | { type: 'BACKSPACE'; payload: { timestamp: number } }
  | { type: 'COMPOSITION_START'; payload: { timestamp: number } }
  | { type: 'COMPOSITION_UPDATE'; payload: { data: string; timestamp: number } }
  | { type: 'COMPOSITION_END'; payload: { data: string; timestamp: number } }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

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
};

// ── Session reducer ─────────────────────────────────────────────

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START': {
      const graphemes = segmentGraphemes(action.payload.text);
      return {
        ...INITIAL_SESSION_STATE,
        status: 'IDLE', // Timer starts at first input, not at start
        expectedText: action.payload.text,
        expectedGraphemes: graphemes,
        layout: action.payload.layout,
      };
    }

    case 'INPUT': {
      if (state.status === 'COMPLETED' || state.status === 'PAUSED') return state;

      const now = action.payload.timestamp;

      // Start timer on first input
      const startedAt = state.startedAt ?? now;
      const status: SessionStatus = 'ACTIVE';

      const lastEvent = state.events[state.events.length - 1];
      const lastTimestamp = lastEvent?.timestamp ?? startedAt;
      const latencyMs = now - lastTimestamp;

      const expectedGrapheme = state.expectedGraphemes[state.currentGraphemeIndex] ?? '';
      const actualInput = action.payload.grapheme;

      // Compare
      const correct = expectedGrapheme !== '' &&
        normalizeForCompare(expectedGrapheme) === normalizeForCompare(actualInput);

      const errorType: ErrorType | null = correct
        ? null
        : classifyGraphemeError(expectedGrapheme, actualInput);

      const newEvent: TypingEvent = {
        sequence: state.events.length,
        expectedGrapheme,
        actualInput,
        timestamp: now - startedAt,  // Relative to session start
        latencyMs,
        correct,
        errorType,
        layout: state.layout,
        corrected: false,
      };

      const newIndex = correct
        ? Math.min(state.currentGraphemeIndex + 1, state.expectedGraphemes.length)
        : state.currentGraphemeIndex;

      const isComplete = newIndex >= state.expectedGraphemes.length;

      return {
        ...state,
        status: isComplete ? 'COMPLETED' : status,
        startedAt,
        endedAt: isComplete ? now : null,
        currentGraphemeIndex: newIndex,
        events: [...state.events, newEvent],
      };
    }

    case 'BACKSPACE': {
      if (state.status === 'COMPLETED' || state.status === 'IDLE') return state;
      if (state.currentGraphemeIndex === 0) return state;

      // Mark the last event as corrected
      const events = [...state.events];
      if (events.length > 0) {
        const last = events[events.length - 1];
        events[events.length - 1] = { ...last, corrected: true };
      }

      return {
        ...state,
        currentGraphemeIndex: Math.max(0, state.currentGraphemeIndex - 1),
        events,
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
      return { ...state, status: 'PAUSED', pausedAt: performance.now() };
    }

    case 'RESUME': {
      if (state.status !== 'PAUSED' || state.pausedAt === null) return state;
      const pausedDuration = performance.now() - state.pausedAt;
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
        endedAt: performance.now(),
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

function normalizeForCompare(text: string): string {
  return text.replace(/\u200D/g, '').replace(/\u200C/g, '').normalize('NFC');
}

/**
 * Compute effective session duration (excluding pauses).
 */
export function getEffectiveDurationMs(state: SessionState): number {
  if (!state.startedAt) return 0;

  const endTime = state.endedAt ?? performance.now();
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
 */
export function getLiveMetrics(state: SessionState): {
  currentGpm: number;
  currentAccuracy: number;
  elapsedSeconds: number;
  progress: number;  // 0–100
} {
  if (!state.startedAt || state.events.length === 0) {
    return { currentGpm: 0, currentAccuracy: 100, elapsedSeconds: 0, progress: 0 };
  }

  const durationMs = getEffectiveDurationMs(state);
  const minutes = durationMs / 60000;

  const correctCount = state.events.filter(e => e.correct && !e.corrected).length;
  const totalAttempted = state.events.filter(e => !e.corrected).length;

  const currentGpm = minutes > 0 ? Math.round(correctCount / minutes) : 0;
  const currentAccuracy = totalAttempted > 0
    ? Math.round((correctCount / totalAttempted) * 100)
    : 100;
  const elapsedSeconds = Math.round(durationMs / 1000);
  const progress = state.expectedGraphemes.length > 0
    ? Math.round((state.currentGraphemeIndex / state.expectedGraphemes.length) * 100)
    : 0;

  return { currentGpm, currentAccuracy, elapsedSeconds, progress };
}

/**
 * Check whether the session is complete (all graphemes typed or time limit reached).
 */
export function isSessionComplete(state: SessionState, timeLimitMs?: number): boolean {
  if (state.status === 'COMPLETED') return true;
  if (state.currentGraphemeIndex >= state.expectedGraphemes.length && state.expectedGraphemes.length > 0) return true;
  if (timeLimitMs && state.startedAt) {
    const elapsed = getEffectiveDurationMs(state);
    if (elapsed >= timeLimitMs) return true;
  }
  return false;
}
