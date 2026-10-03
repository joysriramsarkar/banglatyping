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
import { TypingEvent } from '../types';
import { getKeySequenceForGrapheme } from '../keyboard-layouts';

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
  const currentIndex = session.currentGraphemeIndex;

  // Last attempt per grapheme index, so a grapheme the learner mistyped and then
  // fixed shows the correction rather than the original mistake. Indexing by
  // `sequence` instead — which is what this used to do — put every event after a
  // correction on the wrong grapheme, because sequence counts events while the
  // display is indexed by position in the text.
  const attemptByIndex = new Map<number, TypingEvent>();
  for (const event of session.events) {
    const index = event.graphemeIndex ?? event.sequence;
    const existing = attemptByIndex.get(index);
    if (!existing || existing.sequence <= event.sequence) {
      attemptByIndex.set(index, event);
    }
  }

  const displayGraphemes = graphemes.map((g, i) => {
    if (i > currentIndex) {
      return { grapheme: g, state: 'upcoming' as const, typed: '' };
    }
    if (i === currentIndex) {
      return { grapheme: g, state: 'current' as const, typed: '' };
    }
    const attempt = attemptByIndex.get(i);
    if (attempt) {
      return {
        grapheme: g,
        state: attempt.correct ? ('correct' as const) : ('incorrect' as const),
        typed: attempt.actualInput,
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
 *
 * Returns one entry per keystroke, formatted for display: ক্রা in BanglaWord
 * comes back as ['k', 'h', 'r', 'a'], and in Avro as ['k', 'h', 'r', 'a'] too
 * (Avro has no compound key for ্র), while ক্ষ is ['q'] in BanglaWord and
 * ['k', 'h', 'Shift + l'] in Avro.
 *
 * Every key comes from the layout's own table, so the hint can never name a key
 * that the on-screen keyboard does not show for that layout.
 *
 * Returns [] when the layout cannot produce the grapheme — Avro has no key for
 * the vocalic ৃ, for instance. Callers must treat empty as "no hint available"
 * rather than rendering a blank that looks like a bug.
 */
export function getTypingHint(grapheme: string, layoutId: string): string[] {
  return getKeySequenceForGrapheme(grapheme, layoutId).map((step) =>
    step.needsShift ? `Shift + ${step.key}` : step.key
  );
}
