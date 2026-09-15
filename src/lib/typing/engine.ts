/**
 * Bengali Typing Engine — Public API
 *
 * This is the top-level module that UI components interact with.
 * UI should only call engine methods; engine handles all Bengali-specific logic.
 *
 * Design (from পরিকল্পনা.md #4):
 *   "UI যেন typing logic না জানে। UI শুধু বলবে engine.handleInput(event)"
 *
 * Exports:
 *   - createTypingEngine()  — factory for a stateful engine instance
 *   - BengaliTypingEngine   — the engine class
 *   - All public types from sub-modules
 */

export type { ErrorType, TypingEvent, ExtendedTypingStats, SkillRecommendation } from '../types';
export type { SessionState, SessionStatus, SessionAction, SessionConfig } from './session';
export type { GraphemeCompareResult, TextCompareResult } from './comparator';

export {
  sessionReducer,
  INITIAL_SESSION_STATE,
  computeSessionMetrics,
  getLiveMetrics,
  isSessionComplete,
  getEffectiveDurationMs,
} from './session';

export {
  compareGrapheme,
  compareText,
  segmentGraphemes,
  normalizeBengali,
  isBengaliEqual,
  graphemeHasVowelSign,
  graphemeHasHasanta,
} from './comparator';

export {
  computeMetrics,
  formatDuration,
  classifyPerformance,
} from './metrics';

export {
  classifyGraphemeError,
  aggregateErrorBreakdown,
  getErrorExplanation,
  errorTypeToSkillArea,
} from './error-classifier';

// ── Convenience: current grapheme display state ─────────────────

import { SessionState } from './session';

export interface GraphemeDisplayState {
  /** The grapheme the user needs to type next */
  currentGrapheme: string;
  /** Index of current grapheme in the expected sequence */
  index: number;
  /** Total graphemes in the expected text */
  total: number;
  /** All graphemes, with their typed state */
  graphemes: Array<{
    grapheme: string;
    state: 'correct' | 'incorrect' | 'current' | 'upcoming';
    typed: string;
  }>;
}

/**
 * Build display state from the current session state.
 * Used to render the typing area highlighting.
 */
export function buildDisplayState(session: SessionState): GraphemeDisplayState {
  const graphemes = session.expectedGraphemes;
  const events = session.events;
  const currentIndex = session.currentGraphemeIndex;

  const displayGraphemes = graphemes.map((g, i) => {
    if (i > currentIndex) {
      return { grapheme: g, state: 'upcoming' as const, typed: '' };
    }
    if (i === currentIndex) {
      return { grapheme: g, state: 'current' as const, typed: '' };
    }
    // Find the last event for this grapheme
    const event = events.find(e => e.sequence === i);
    if (event) {
      return {
        grapheme: g,
        state: event.correct ? ('correct' as const) : ('incorrect' as const),
        typed: event.actualInput,
      };
    }
    return { grapheme: g, state: 'upcoming' as const, typed: '' };
  });

  return {
    currentGrapheme: graphemes[currentIndex] ?? '',
    index: currentIndex,
    total: graphemes.length,
    graphemes: displayGraphemes,
  };
}

/**
 * Get the expected typing sequence for a grapheme given a keyboard layout.
 * Returns human-readable key sequence (e.g., "h + Shift+L" for ক্ষ in Avro).
 *
 * Note: This is a simplified lookup. Full implementation requires layout-aware
 * getSequence() method on the keyboard layout.
 */
export function getTypingHint(grapheme: string, layoutId: string): string[] {
  // This is a placeholder — real implementation should use the keyboard layout
  // to resolve the key sequence for each grapheme.
  // Returning empty for now; will be enhanced when layout abstraction is added.
  void grapheme;
  void layoutId;
  return [];
}
