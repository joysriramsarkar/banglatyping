/**
 * Bengali Typing Metrics
 *
 * Computes all speed, accuracy, and consistency metrics
 * from a completed typing session's event buffer.
 *
 * Key metrics:
 *   Gross WPM      — total keystrokes / 5 / minutes
 *   Net WPM        — gross - (uncorrected errors / minutes)
 *   GPM            — Graphemes Per Minute (Bengali-specific, most meaningful)
 *   CPM            — Characters Per Minute (Unicode code points)
 *   Accuracy       — correct graphemes / total graphemes × 100
 *   Consistency    — 0–100, variance in typing speed over time
 *   Burst Speed    — peak GPM in any 5-second window
 *   Longest Streak — most consecutive correct graphemes
 *
 * Design note:
 *   WPM alone is NOT sufficient for Bengali because one Bengali grapheme
 *   (e.g., ক্ষ্ম) requires 5+ keystrokes but is one visual unit.
 *   GPM is the authoritative metric for Bengali typing speed.
 */

import type { TypingEvent, ExtendedTypingStats } from '../types';
import { segmentGraphemes } from './comparator';
import { aggregateErrorBreakdown } from './error-classifier';

/** Pause threshold in ms — gaps longer than this are counted as pauses */
const PAUSE_THRESHOLD_MS = 2000;

/** Window size in ms for burst speed calculation */
const BURST_WINDOW_MS = 5000;

/**
 * Compute all extended typing metrics from raw session events.
 *
 * @param events       Array of typing events recorded during the session
 * @param expectedText The full text that was supposed to be typed
 * @param durationMs   Total session duration in milliseconds
 */
export function computeMetrics(
  events: TypingEvent[],
  expectedText: string,
  durationMs: number
): ExtendedTypingStats {
  if (events.length === 0 || durationMs <= 0) {
    return buildEmptyStats(durationMs);
  }

  const minutes = durationMs / 60000;
  const seconds = durationMs / 1000;

  // ── Correctness counts ──────────────────────────────────────
  const correctEvents = events.filter(e => e.correct && !e.corrected);
  const incorrectEvents = events.filter(e => !e.correct);
  const correctedErrors = events.filter(e => e.corrected).length;
  const uncorrectedErrors = incorrectEvents.filter(e => !e.corrected).length;

  // ── Grapheme counts ─────────────────────────────────────────
  const expectedGraphemes = segmentGraphemes(expectedText);
  const _totalExpectedGraphemes = expectedGraphemes.length;
  const correctGraphemes = correctEvents.length;

  // ── Speed metrics ───────────────────────────────────────────
  // Total keystrokes typed (all events, including backspaces would inflate, so we count input events only)
  const inputEvents = events.filter(e => e.actualInput !== ''); // exclude non-input events
  const totalKeystrokes = inputEvents.length;

  // Gross WPM: standard formula (1 word = 5 keystrokes)
  const grossWpm = minutes > 0 ? Math.round((totalKeystrokes / 5) / minutes) : 0;

  // Net WPM: deduct uncorrected errors
  const netWpm = minutes > 0
    ? Math.max(0, Math.round(grossWpm - (uncorrectedErrors / minutes)))
    : 0;

  // GPM: correct graphemes per minute (Bengali-primary metric)
  const gpm = minutes > 0 ? Math.round(correctGraphemes / minutes) : 0;

  // CPM: unicode characters per minute (from correct events)
  const correctUnicodeChars = correctEvents.reduce(
    (sum, e) => sum + [...e.actualInput].length,
    0
  );
  const cpm = minutes > 0 ? Math.round(correctUnicodeChars / minutes) : 0;

  // SPM: strokes (keystrokes) per minute
  const spm = minutes > 0 ? Math.round(totalKeystrokes / minutes) : 0;

  // ── Accuracy ────────────────────────────────────────────────
  // Based on graphemes: correct / (correct + uncorrected)
  const totalAttempted = correctGraphemes + uncorrectedErrors;
  const accuracy = totalAttempted > 0
    ? Math.round((correctGraphemes / totalAttempted) * 1000) / 10
    : 100;

  // ── Consistency ─────────────────────────────────────────────
  const consistency = computeConsistency(events, seconds);

  // ── Pauses ──────────────────────────────────────────────────
  const pauseCount = countPauses(events);

  // ── Streak ──────────────────────────────────────────────────
  const longestStreak = computeLongestStreak(events);

  // ── Burst speed ─────────────────────────────────────────────
  const burstSpeed = computeBurstGpm(events);

  // ── Error breakdown ─────────────────────────────────────────
  const errorBreakdown = aggregateErrorBreakdown(
    events.filter(e => !e.correct).map(e => e.errorType)
  );

  // ── Error chars for backward compat ─────────────────────────
  const erredCharacters = buildErredCharacters(events);

  return {
    wpm: netWpm,
    grossWpm,
    netWpm,
    gpm,
    cpm,
    spm,
    accuracy: Math.min(100, accuracy),
    errors: uncorrectedErrors,
    correctedErrors,
    uncorrectedErrors,
    timeElapsed: Math.round(seconds),
    consistency,
    pauseCount,
    longestStreak,
    burstSpeed,
    errorBreakdown,
    erredCharacters,
  };
}

/**
 * Compute consistency score (0–100).
 *
 * Method: divide session into 5-second windows, compute GPM for each,
 * then score = 100 - coefficient-of-variation (normalized to 0–100).
 * Higher score = more consistent typing rhythm.
 */
function computeConsistency(events: TypingEvent[], totalSeconds: number): number {
  if (events.length < 5 || totalSeconds < 10) return 100;

  const windowMs = 5000;
  const windows: number[] = [];

  let windowStart = events[0].timestamp;
  let windowEnd = windowStart + windowMs;
  let windowCorrect = 0;

  for (const event of events) {
    if (event.timestamp > windowEnd) {
      // Save window GPM
      const windowMinutes = windowMs / 60000;
      windows.push(windowCorrect / windowMinutes);
      // Advance window
      windowStart = windowEnd;
      windowEnd = windowStart + windowMs;
      windowCorrect = 0;
    }
    if (event.correct && !event.corrected) {
      windowCorrect++;
    }
  }
  // Last window
  if (windowCorrect > 0) {
    const remainMs = (events[events.length - 1].timestamp - windowStart) || windowMs;
    const windowMinutes = remainMs / 60000;
    windows.push(windowMinutes > 0 ? windowCorrect / windowMinutes : 0);
  }

  if (windows.length < 2) return 100;

  // Coefficient of variation
  const mean = windows.reduce((a, b) => a + b, 0) / windows.length;
  if (mean === 0) return 0;

  const variance = windows.reduce((sum, v) => sum + (v - mean) ** 2, 0) / windows.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // 0 = perfect, higher = more variable

  // Map CV to 0–100 score (CV of 0 → 100, CV ≥ 1.0 → 0)
  const consistency = Math.round(Math.max(0, Math.min(100, (1 - cv) * 100)));
  return consistency;
}

/**
 * Count pauses > PAUSE_THRESHOLD_MS between events.
 */
function countPauses(events: TypingEvent[]): number {
  let count = 0;
  for (let i = 1; i < events.length; i++) {
    if (events[i].latencyMs > PAUSE_THRESHOLD_MS) {
      count++;
    }
  }
  return count;
}

/**
 * Compute the longest consecutive correct grapheme streak.
 */
function computeLongestStreak(events: TypingEvent[]): number {
  let longest = 0;
  let current = 0;

  for (const event of events) {
    if (event.correct && !event.corrected) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }

  return longest;
}

/**
 * Compute maximum GPM achieved in any BURST_WINDOW_MS window.
 */
function computeBurstGpm(events: TypingEvent[]): number {
  if (events.length === 0) return 0;

  let maxGpm = 0;
  const windowMinutes = BURST_WINDOW_MS / 60000;

  for (let i = 0; i < events.length; i++) {
    const windowStart = events[i].timestamp;
    const windowEnd = windowStart + BURST_WINDOW_MS;

    let correctInWindow = 0;
    for (let j = i; j < events.length && events[j].timestamp <= windowEnd; j++) {
      if (events[j].correct && !events[j].corrected) {
        correctInWindow++;
      }
    }

    const windowGpm = correctInWindow / windowMinutes;
    if (windowGpm > maxGpm) maxGpm = windowGpm;
  }

  return Math.round(maxGpm);
}

/**
 * Build erred characters summary for backward compatibility with
 * the existing test results UI.
 */
function buildErredCharacters(events: TypingEvent[]): Array<{ char: string; count: number }> {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (!event.correct && event.expectedGrapheme) {
      const char = event.expectedGrapheme;
      counts.set(char, (counts.get(char) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 error characters
}

/**
 * Build an empty/zero stats object for sessions with no data.
 */
function buildEmptyStats(durationMs: number): ExtendedTypingStats {
  return {
    wpm: 0,
    grossWpm: 0,
    netWpm: 0,
    gpm: 0,
    cpm: 0,
    spm: 0,
    accuracy: 100,
    errors: 0,
    correctedErrors: 0,
    uncorrectedErrors: 0,
    timeElapsed: Math.round(durationMs / 1000),
    consistency: 100,
    pauseCount: 0,
    longestStreak: 0,
    burstSpeed: 0,
    errorBreakdown: {},
    erredCharacters: [],
  };
}

/**
 * Format a duration in seconds as mm:ss string.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Classify overall performance based on accuracy.
 * Used to determine if user should do precision vs speed training.
 */
export function classifyPerformance(accuracy: number): 'precision' | 'balanced' | 'speed' {
  if (accuracy < 90) return 'precision';
  if (accuracy < 95) return 'balanced';
  return 'speed';
}
