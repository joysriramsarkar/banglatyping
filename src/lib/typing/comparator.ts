/**
 * Bengali Typing Comparator
 *
 * Handles comparison of typed Bengali text against expected text,
 * accounting for the three distinct layers:
 *   1. Unicode code points (raw storage)
 *   2. Grapheme clusters (what the user sees — one visual unit)
 *   3. Typing sequence (what key presses produce the grapheme)
 *
 * Visual equality ≠ Unicode equality ≠ Typing-sequence equality
 */

import { bengaliSegmenter, normalizeBengaliString, isBengaliVowelSign, isHalant } from '../bengali-grapheme';

/**
 * Normalize Bengali text for reliable comparison.
 * Applies NFC normalization + removes ZWJ/ZWNJ artifacts.
 */
export function normalizeBengali(text: string): string {
  return normalizeBengaliString(text);
}

/**
 * Segment a normalized Bengali string into grapheme clusters.
 * Each entry in the result is one visual Bengali unit (e.g., ক্ষ, কি, ক).
 */
export function segmentGraphemes(text: string): string[] {
  const normalized = normalizeBengali(text);
  return bengaliSegmenter.segmentString(normalized);
}

/**
 * Compare two Bengali strings at the grapheme level.
 *
 * Returns whether they are grapheme-equivalent after normalization.
 * Use this instead of `===` for Bengali text comparison.
 */
export function isBengaliEqual(a: string, b: string): boolean {
  const na = normalizeBengali(a);
  const nb = normalizeBengali(b);
  return na === nb;
}

/**
 * Result of comparing a typed grapheme against an expected one.
 */
export interface GraphemeCompareResult {
  expected: string;
  actual: string;
  correct: boolean;
  /** True if the actual input is a prefix of expected (partial match — still composing) */
  isPartial: boolean;
  /** True if actual has extra characters beyond expected */
  hasExtra: boolean;
  /** The differing position (character index within grapheme), or -1 if correct */
  firstDiffPos: number;
}

/**
 * Compare a typed (actual) grapheme against the expected grapheme.
 *
 * This is the core comparison used by the typing engine per-grapheme.
 */
export function compareGrapheme(expected: string, actual: string): GraphemeCompareResult {
  const normExpected = normalizeBengali(expected);
  const normActual = normalizeBengali(actual);

  if (normExpected === normActual) {
    return {
      expected: normExpected,
      actual: normActual,
      correct: true,
      isPartial: false,
      hasExtra: false,
      firstDiffPos: -1,
    };
  }

  // Check if actual is a valid prefix of expected (user is still composing)
  const isPartial = normExpected.startsWith(normActual) && normActual.length > 0 && normActual.length < normExpected.length;

  // Check if actual has more chars than expected
  const hasExtra = normActual.length > normExpected.length;

  // Find first differing position
  let firstDiffPos = -1;
  const minLen = Math.min(normExpected.length, normActual.length);
  for (let i = 0; i < minLen; i++) {
    if (normExpected[i] !== normActual[i]) {
      firstDiffPos = i;
      break;
    }
  }
  if (firstDiffPos === -1 && normExpected.length !== normActual.length) {
    firstDiffPos = minLen;
  }

  return {
    expected: normExpected,
    actual: normActual,
    correct: false,
    isPartial,
    hasExtra,
    firstDiffPos,
  };
}

/**
 * Full-text comparison result for a completed typing session or word.
 */
export interface TextCompareResult {
  expectedGraphemes: string[];
  actualGraphemes: string[];
  /** Per-grapheme comparison results */
  results: GraphemeCompareResult[];
  correctCount: number;
  incorrectCount: number;
  /** Count of graphemes in expected that were not typed */
  missingCount: number;
  /** Count of extra graphemes typed beyond expected */
  extraCount: number;
  accuracy: number; // 0–100
}

/**
 * Compare entire typed text against expected text at grapheme level.
 *
 * This produces a per-grapheme breakdown suitable for error classification.
 */
export function compareText(expectedText: string, actualText: string): TextCompareResult {
  const expectedGraphemes = segmentGraphemes(expectedText);
  const actualGraphemes = segmentGraphemes(actualText);

  const results: GraphemeCompareResult[] = [];
  let correctCount = 0;
  let incorrectCount = 0;

  const maxLen = Math.max(expectedGraphemes.length, actualGraphemes.length);

  for (let i = 0; i < maxLen; i++) {
    const expected = expectedGraphemes[i] ?? '';
    const actual = actualGraphemes[i] ?? '';

    if (!expected) {
      // Extra typed grapheme
      results.push({
        expected: '',
        actual,
        correct: false,
        isPartial: false,
        hasExtra: true,
        firstDiffPos: 0,
      });
      incorrectCount++;
    } else if (!actual) {
      // Missing grapheme (not typed)
      results.push({
        expected,
        actual: '',
        correct: false,
        isPartial: false,
        hasExtra: false,
        firstDiffPos: 0,
      });
      incorrectCount++;
    } else {
      const result = compareGrapheme(expected, actual);
      results.push(result);
      if (result.correct) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
  }

  const missingCount = Math.max(0, expectedGraphemes.length - actualGraphemes.length);
  const extraCount = Math.max(0, actualGraphemes.length - expectedGraphemes.length);
  const total = expectedGraphemes.length + extraCount;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100;

  return {
    expectedGraphemes,
    actualGraphemes,
    results,
    correctCount,
    incorrectCount,
    missingCount,
    extraCount,
    accuracy,
  };
}

/**
 * Check if a grapheme contains a Bengali vowel sign (কার).
 * Useful for classifying vowel-sign related errors.
 */
export function graphemeHasVowelSign(grapheme: string): boolean {
  return Array.from(normalizeBengali(grapheme)).some(ch => isBengaliVowelSign(ch));
}

/**
 * Check if a grapheme contains a hasanta (্).
 * Used for classifying conjunct/hasanta errors.
 */
export function graphemeHasHasanta(grapheme: string): boolean {
  return Array.from(normalizeBengali(grapheme)).some(ch => isHalant(ch));
}

/**
 * Count the number of Unicode code points in a string.
 * For metrics that need raw character count vs grapheme count.
 */
export function unicodeLength(text: string): number {
  return [...text].length;
}
