/**
 * Bengali Typing Error Classifier
 *
 * Classifies each typing error into a specific error category.
 * This enables targeted practice recommendations:
 *   - Know the error type → know what skill to practice
 *
 * Taxonomy:
 *   wrong-key        → typed wrong character entirely
 *   missing-key      → skipped a required character
 *   extra-key        → typed extra character not in expected
 *   wrong-order      → right characters, wrong sequence
 *   wrong-shift      → shift key not used / incorrectly used
 *   wrong-kar        → vowel sign (কার) error
 *   wrong-hasanta    → hasanta (্) missed or inserted incorrectly
 *   wrong-conjunct   → conjunct (যুক্তাক্ষর) formation error
 *   wrong-composition → general Unicode composition issue
 *   space-error      → space at wrong position
 *   punctuation-error → punctuation mismatch
 */

import type { ErrorType } from '../types';
import { GraphemeCompareResult } from './comparator';
import {
  isBengaliVowelSign,
  isHalant,
  isBengaliConsonant,
  normalizeBengaliString,
} from '../bengali-grapheme';

const PUNCTUATION_CHARS = new Set(['।', '?', '!', ',', ';', ':', '"', "'", '(', ')', '-', '–', '—', '…']);

/**
 * Classify an error between an expected and actual grapheme.
 *
 * Returns null if no error (correct match).
 */
export function classifyGraphemeError(
  expected: string,
  actual: string,
  compareResult?: GraphemeCompareResult
): ErrorType | null {
  // No error
  if (expected === actual || normalizeBengaliString(expected) === normalizeBengaliString(actual)) {
    return null;
  }

  // Empty expected → extra key
  if (!expected && actual) return 'extra-key';

  // Empty actual → missing key
  if (expected && !actual) return 'missing-key';

  // Space error
  if (expected === ' ' || actual === ' ') return 'space-error';

  // Punctuation error
  if (PUNCTUATION_CHARS.has(expected) || PUNCTUATION_CHARS.has(actual)) {
    return 'punctuation-error';
  }

  const normExpected = normalizeBengaliString(expected);
  const normActual = normalizeBengaliString(actual);

  const expectedChars = [...normExpected];
  const actualChars = [...normActual];

  // Check if expected has a hasanta (conjunct)
  const expectedHasHasanta = expectedChars.some(ch => isHalant(ch));
  const actualHasHasanta = actualChars.some(ch => isHalant(ch));

  // Expected conjunct but didn't type hasanta (e.g. ক্ত vs কত)
  if (expectedHasHasanta && !actualHasHasanta) {
    return 'wrong-hasanta';
  }

  // Typed hasanta but didn't need it
  if (!expectedHasHasanta && actualHasHasanta) {
    return 'wrong-conjunct';
  }

  // Check vowel sign (কার) errors (e.g. কি vs কা)
  const expectedVowelSign = expectedChars.find(ch => isBengaliVowelSign(ch));
  const actualVowelSign = actualChars.find(ch => isBengaliVowelSign(ch));

  if (expectedVowelSign !== actualVowelSign) {
    // One has a vowel sign the other doesn't, or different vowel signs
    return 'wrong-kar';
  }

  // Extra characters typed beyond expected
  if (actualChars.length > expectedChars.length && compareResult?.hasExtra) {
    return 'extra-key';
  }

  // Missing characters
  if (actualChars.length < expectedChars.length && !compareResult?.isPartial) {
    return 'missing-key';
  }

  // Both have hasanta — could be wrong conjunct composition
  if (expectedHasHasanta && actualHasHasanta) {
    // Check if consonants match but order is wrong
    const expectedConsonants = expectedChars.filter(ch => isBengaliConsonant(ch));
    const actualConsonants = actualChars.filter(ch => isBengaliConsonant(ch));

    const expectedConsonantStr = expectedConsonants.join('');
    const actualConsonantStr = actualConsonants.join('');

    if (expectedConsonantStr !== actualConsonantStr) {
      // Different consonants used — wrong key
      if (
        new Set(expectedConsonants).size === new Set(actualConsonants).size &&
        expectedConsonants.every(c => actualConsonants.includes(c))
      ) {
        return 'wrong-order'; // Same consonants, wrong order
      }
      return 'wrong-conjunct'; // Different consonants
    }

    return 'wrong-composition'; // Same consonants but something else wrong
  }

  // Check consonant errors
  const expectedBaseConsonant = expectedChars.find(ch => isBengaliConsonant(ch));
  const actualBaseConsonant = actualChars.find(ch => isBengaliConsonant(ch));

  if (expectedBaseConsonant !== actualBaseConsonant) {
    return 'wrong-key';
  }

  // Fallback: wrong key
  return 'wrong-key';
}

/**
 * Classify error for a space context.
 * Handles extra/missing space between words.
 */
export function classifySpaceError(
  _expectedContext: string,
  _actualContext: string
): ErrorType {
  return 'space-error';
}

/**
 * Aggregate error type counts from a list of errors.
 * Returns a breakdown map for analytics and recommendations.
 */
export function aggregateErrorBreakdown(
  errors: Array<ErrorType | null>
): Partial<Record<ErrorType, number>> {
  const breakdown: Partial<Record<ErrorType, number>> = {};

  for (const error of errors) {
    if (error) {
      breakdown[error] = (breakdown[error] ?? 0) + 1;
    }
  }

  return breakdown;
}

/**
 * Get a human-readable Bengali explanation for an error type.
 * Used in the "Why was I wrong?" feedback UI.
 */
export function getErrorExplanation(errorType: ErrorType): string {
  const explanations: Record<ErrorType, string> = {
    'wrong-key':        'ভুল key চাপা হয়েছে।',
    'missing-key':      'একটি key চাপা বাদ গেছে।',
    'extra-key':        'একটি অতিরিক্ত key চাপা হয়েছে।',
    'wrong-order':      'সঠিক key চাপা হয়েছে, কিন্তু ক্রম ভুল।',
    'wrong-shift':      'Shift key সঠিকভাবে ব্যবহার হয়নি।',
    'wrong-kar':        'কার (ি, ী, ু, ূ, ে, ৈ, ো, ৌ) ভুল হয়েছে।',
    'wrong-hasanta':    'হসন্ত (্) চাপা হয়নি বা বেশি চাপা হয়েছে।',
    'wrong-conjunct':   'যুক্তাক্ষর গঠনে ভুল হয়েছে।',
    'wrong-composition': 'Unicode composition ভুল হয়েছে।',
    'space-error':      'Space ভুল জায়গায় দেওয়া হয়েছে।',
    'punctuation-error': 'বিরাম চিহ্ন ভুল হয়েছে।',
  };

  return explanations[errorType] ?? 'অজানা ত্রুটি।';
}

/**
 * Determine which skill a given error type maps to.
 * Used by the recommender to target practice.
 */
export function errorTypeToSkillArea(errorType: ErrorType): string {
  const skillMap: Record<ErrorType, string> = {
    'wrong-key':        'basic-keys',
    'missing-key':      'key-timing',
    'extra-key':        'key-control',
    'wrong-order':      'key-sequence',
    'wrong-shift':      'shift-modifier',
    'wrong-kar':        'vowel-signs',
    'wrong-hasanta':    'hasanta',
    'wrong-conjunct':   'conjuncts',
    'wrong-composition': 'composition',
    'space-error':      'spacing',
    'punctuation-error': 'punctuation',
  };

  return skillMap[errorType] ?? 'general';
}
