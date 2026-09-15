"use client";

/**
 * useTypingSession — React hook for the new typing session engine
 *
 * Wraps the sessionReducer with React lifecycle management.
 * Provides:
 *   - Session state and dispatch
 *   - Live metrics (GPM, accuracy, elapsed time, progress)
 *   - Final metrics computed at session end
 *   - IME composition handling
 *
 * Usage:
 *   const { session, dispatch, liveMetrics, finalMetrics, handleKeyDown } = useTypingSession(config);
 */

import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
  sessionReducer,
  INITIAL_SESSION_STATE,
  computeSessionMetrics,
  getLiveMetrics,
  isSessionComplete,
} from '@/lib/typing/session';
import type {
  SessionState,
  SessionAction,
  SessionConfig,
} from '@/lib/typing/session';
import type { ExtendedTypingStats } from '@/lib/types';
import { segmentGraphemes } from '@/lib/typing/comparator';

interface UseTypingSessionReturn {
  /** Current session state */
  session: SessionState;

  /** Dispatch a session action directly */
  dispatch: React.Dispatch<SessionAction>;

  /** Live metrics (updated every 500ms during active session) */
  liveMetrics: {
    currentGpm: number;
    currentAccuracy: number;
    elapsedSeconds: number;
    progress: number;
  };

  /** Final metrics — computed when session completes, null otherwise */
  finalMetrics: ExtendedTypingStats | null;

  /** Start a new session */
  startSession: (config: SessionConfig) => void;

  /** Handle a keyboard event, dispatching appropriate session actions */
  handleKeyDown: (event: KeyboardEvent | { key: string; isCompositionEnd?: boolean }) => void;

  /** Handle IME composition events */
  handleCompositionEnd: (data: string) => void;

  /** Pause/resume the session */
  togglePause: () => void;

  /** Manually finish the session (e.g. when time runs out) */
  finishSession: () => void;

  /** Reset and clear session */
  resetSession: () => void;

  /** Whether the session is currently complete */
  isComplete: boolean;
}

export function useTypingSession(timeLimitMs?: number): UseTypingSessionReturn {
  const [session, dispatch] = useReducer(sessionReducer, INITIAL_SESSION_STATE);
  const liveMetricsRef = useRef({
    currentGpm: 0,
    currentAccuracy: 100,
    elapsedSeconds: 0,
    progress: 0,
  });
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const finalMetricsRef = useRef<ExtendedTypingStats | null>(null);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const composingRef = useRef(false);
  const compositionBufferRef = useRef('');

  // ── Live metrics update loop ────────────────────────────────
  useEffect(() => {
    if (session.status === 'ACTIVE') {
      liveIntervalRef.current = setInterval(() => {
        liveMetricsRef.current = getLiveMetrics(session);
        forceUpdate();

        // Check time limit
        if (timeLimitMs && liveMetricsRef.current.elapsedSeconds * 1000 >= timeLimitMs) {
          dispatch({ type: 'FINISH' });
        }
      }, 500);
    } else {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    }

    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    };
  }, [session.status, timeLimitMs, session]);

  // ── Compute final metrics when session completes ────────────
  useEffect(() => {
    if (session.status === 'COMPLETED' && !finalMetricsRef.current) {
      finalMetricsRef.current = computeSessionMetrics(session);
      forceUpdate();
    }
    if (session.status === 'IDLE') {
      finalMetricsRef.current = null;
    }
  }, [session.status, session]);

  // ── Session control functions ───────────────────────────────

  const startSession = useCallback((config: SessionConfig) => {
    finalMetricsRef.current = null;
    composingRef.current = false;
    compositionBufferRef.current = '';
    dispatch({ type: 'START', payload: config });
  }, []);

  const handleKeyDown = useCallback((
    event: KeyboardEvent | { key: string; isCompositionEnd?: boolean }
  ) => {
    if (session.status === 'COMPLETED') return;
    if (composingRef.current) return; // Let composition events handle it

    const key = event.key;
    const now = performance.now();

    if (key === 'Backspace') {
      dispatch({ type: 'BACKSPACE', payload: { timestamp: now } });
      return;
    }

    // Skip modifier keys
    if (
      key === 'Shift' || key === 'Control' || key === 'Alt' ||
      key === 'Meta' || key === 'Tab' || key === 'Escape' ||
      key === 'Enter' || key === 'ArrowLeft' || key === 'ArrowRight' ||
      key === 'ArrowUp' || key === 'ArrowDown'
    ) {
      return;
    }

    // Space
    if (key === ' ') {
      dispatch({ type: 'INPUT', payload: { grapheme: ' ', timestamp: now } });
      return;
    }

    // Regular character input — segment to get the actual grapheme
    // In practice, for Bengali input through IME, this comes through composition events
    // For direct key input (e.g. virtual keyboard), use the key directly
    const grapheme = key.length === 1 ? key : '';
    if (grapheme) {
      dispatch({ type: 'INPUT', payload: { grapheme, timestamp: now } });
    }
  }, [session.status]);

  const handleCompositionEnd = useCallback((data: string) => {
    composingRef.current = false;
    compositionBufferRef.current = '';

    if (!data) return;

    const now = performance.now();
    // A composition may produce multiple graphemes (e.g., after IME conversion)
    const graphemes = segmentGraphemes(data);
    for (const grapheme of graphemes) {
      dispatch({ type: 'INPUT', payload: { grapheme, timestamp: now } });
    }
  }, []);

  const togglePause = useCallback(() => {
    if (session.status === 'ACTIVE') {
      dispatch({ type: 'PAUSE' });
    } else if (session.status === 'PAUSED') {
      dispatch({ type: 'RESUME' });
    }
  }, [session.status]);

  const finishSession = useCallback(() => {
    dispatch({ type: 'FINISH' });
  }, []);

  const resetSession = useCallback(() => {
    finalMetricsRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  const isComplete = isSessionComplete(session, timeLimitMs);

  return {
    session,
    dispatch,
    liveMetrics: liveMetricsRef.current,
    finalMetrics: finalMetricsRef.current,
    startSession,
    handleKeyDown,
    handleCompositionEnd,
    togglePause,
    finishSession,
    resetSession,
    isComplete,
  };
}
