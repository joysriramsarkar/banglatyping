/**
 * Canonical Bengali typing metric formulas.
 *
 * This module is the single source of truth for how the app turns raw counts
 * into GPM / WPM / SPM / accuracy. The curriculum player, the practice hook and
 * the session engine must all derive their numbers from here so that the same
 * performance is reported identically on every screen.
 *
 * Full contract: docs/METRICS.md
 *
 * ── Definitions ───────────────────────────────────────────────────────────
 *   GPM (Graphemes Per Minute)   = correct graphemes / minutes
 *       The primary metric for Bengali: one visible grapheme (e.g. ক্ষ্ম) can be
 *       several keystrokes and several Unicode code points, so a keystroke-based
 *       word metric under-reports real output.
 *   Accuracy (%)                 = correct attempts / total attempts * 100
 *   SPM (Strokes Per Minute)     = recorded strokes / minutes
 *   WPM (Bengali estimate)       = round(GPM / GRAPHEMES_PER_BENGALI_WORD)
 *   standardWpm (English-style)  = (keystrokes / 5) / minutes
 *       A *different* metric kept only for interoperability. Never label it
 *       simply "WPM" next to the Bengali estimate.
 */

/** Average number of Bengali graphemes per word, used to derive a practical WPM. */
export const GRAPHEMES_PER_BENGALI_WORD = 4;

/** Standard typing convention: one "word" is five keystrokes. */
export const KEYSTROKES_PER_STANDARD_WORD = 5;

/** Milliseconds in one minute. */
const MS_PER_MINUTE = 60000;

function minutesFromMs(elapsedMs: number): number {
  return elapsedMs > 0 ? elapsedMs / MS_PER_MINUTE : 0;
}

/**
 * Graphemes Per Minute — the authoritative Bengali speed metric.
 * Returns 0 for non-positive durations.
 */
export function computeGpm(correctGraphemes: number, elapsedMs: number): number {
  const minutes = minutesFromMs(elapsedMs);
  if (minutes <= 0 || correctGraphemes <= 0) return 0;
  return Math.round(correctGraphemes / minutes);
}

/**
 * Characters (Unicode code points) Per Minute.
 * Lower than GPM for conjuncts, since one grapheme may use several code points.
 */
export function computeCpm(correctCharacters: number, elapsedMs: number): number {
  const minutes = minutesFromMs(elapsedMs);
  if (minutes <= 0 || correctCharacters <= 0) return 0;
  return Math.round(correctCharacters / minutes);
}

/**
 * Strokes Per Minute: converts a stroke count into a per-minute rate.
 * The caller decides whether the count is every recorded stroke (session
 * engine) or only the useful ones; the per-minute math is identical.
 */
export function computeSpm(strokes: number, elapsedMs: number): number {
  const minutes = minutesFromMs(elapsedMs);
  if (minutes <= 0 || strokes <= 0) return 0;
  return Math.round(strokes / minutes);
}

/**
 * Accuracy (%) as a whole number. With no attempts the learner has not made a
 * mistake yet, so the conventional value is 100.
 */
export function computeAccuracy(correctAttempts: number, totalAttempts: number): number {
  if (totalAttempts <= 0) return 100;
  const correct = Math.max(0, Math.min(correctAttempts, totalAttempts));
  return Math.round((correct / totalAttempts) * 100);
}

/**
 * Derive the practical Bengali WPM from a GPM value.
 * Documented approximation — NOT a standardized/English WPM.
 */
export function deriveWpmFromGpm(gpm: number): number {
  if (gpm <= 0) return 0;
  return Math.max(1, Math.round(gpm / GRAPHEMES_PER_BENGALI_WORD));
}

/**
 * Standardized (English-style) WPM: keystrokes / 5 / minutes.
 * Kept separate from the Bengali estimate so the two never share a label.
 */
export function computeStandardWpm(totalKeystrokes: number, elapsedMs: number): number {
  const minutes = minutesFromMs(elapsedMs);
  if (minutes <= 0 || totalKeystrokes <= 0) return 0;
  return Math.round(totalKeystrokes / KEYSTROKES_PER_STANDARD_WORD / minutes);
}
