/**
 * Bengali Grapheme Cluster Utilities
 * Handles proper segmentation of Bengali text at the grapheme level,
 * including complex conjuncts (যুক্তাক্ষর) with multiple halants and ZWJ
 */

// Bengali script Unicode ranges and important characters
const BENGALI_CHAR_RANGES = {
  VOWELS: /[\u0985-\u0988\u098F-\u0990\u0993-\u0994]/,
  CONSONANTS: /[\u0995-\u09B9\u09CE\u09DC-\u09DD\u09DF]/,
  VOWEL_SIGNS: /[\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC]/,
  HALANT: /\u09CD/,
  NUKTA: /\u09BC/,
  ZWJ: /\u200D/,
  ZWNJ: /\u200C/,
  ANUSVARA: /\u0982/,
  VISARGA: /\u0983/,
};

/**
 * Create a Bengali-aware grapheme segmenter
 * Uses Intl.Segmenter for proper grapheme boundary detection
 */
export class BengaliSegmenter {
  private segmenter: Intl.Segmenter;

  constructor() {
    this.segmenter = new Intl.Segmenter('bn-IN', { granularity: 'grapheme' });
  }

  segmentString(text: string): string[] {
    return Array.from(this.segmenter.segment(text), (s: Intl.SegmentData) => s.segment);
  }

  /**
   * Get the first grapheme cluster from a string
   */
  firstGrapheme(text: string): string {
    const segments = this.segmentString(text);
    return segments[0] || '';
  }

  /**
   * Get the last grapheme cluster from a string
   */
  lastGrapheme(text: string): string {
    const segments = this.segmentString(text);
    return segments[segments.length - 1] || '';
  }

  /**
   * Get grapheme count (not character count)
   */
  graphemeLength(text: string): number {
    return this.segmentString(text).length;
  }

  /**
   * Slice string by grapheme clusters
   * e.g., graphemeSlice('ক্ষ্ম', 0, 1) → 'ক্ষ'
   */
  graphemeSlice(text: string, start: number, end?: number): string {
    const segments = this.segmentString(text);
    return segments.slice(start, end).join('');
  }

  /**
   * Get substring up to a position (in graphemes)
   */
  graphemeSubstring(text: string, start: number, length: number): string {
    const segments = this.segmentString(text);
    return segments.slice(start, start + length).join('');
  }
}

// Global instance
export const bengaliSegmenter = new BengaliSegmenter();

/**
 * Detect if a character is a Bengali vowel
 */
export function isBengaliVowel(char: string): boolean {
  return BENGALI_CHAR_RANGES.VOWELS.test(char);
}

/**
 * Detect if a character is a Bengali consonant
 */
export function isBengaliConsonant(char: string): boolean {
  return BENGALI_CHAR_RANGES.CONSONANTS.test(char);
}

/**
 * Detect if a character is a Bengali vowel sign (কার)
 */
export function isBengaliVowelSign(char: string): boolean {
  return BENGALI_CHAR_RANGES.VOWEL_SIGNS.test(char);
}

/**
 * Detect if a character is a halant (্)
 */
export function isHalant(char: string): boolean {
  return BENGALI_CHAR_RANGES.HALANT.test(char);
}

/**
 * Detect if a character is nukta (়)
 */
export function isNukta(char: string): boolean {
  return BENGALI_CHAR_RANGES.NUKTA.test(char);
}

/**
 * Parse a Bengali conjunct (যুক্তাক্ষর) into its constituent parts
 * Returns { consonants: [array], halants: [count], trailingKar: string | null }
 * 
 * Example: 'ক্ষ্ম' → { 
 *   consonants: ['ক', 'ষ', 'ম'], 
 *   halants: [1, 1],  // halants between consonants
 *   trailingKar: null 
 * }
 */
export function parseConjunct(conjunct: string): {
  consonants: string[];
  halants: number[];
  trailingKar: string | null;
} {
  const consonants: string[] = [];
  const halants: number[] = [];
  let trailingKar: string | null = null;

  const segments = bengaliSegmenter.segmentString(conjunct);
  
  let i = 0;
  while (i < segments.length) {
    const segment = segments[i];

    if (isNukta(segment) || segment === '') {
      i++;
      continue;
    }

    // Check for trailing vowel sign
    if (isBengaliVowelSign(segment)) {
      trailingKar = segment;
      i++;
      break;
    }

    if (isBengaliConsonant(segment)) {
      consonants.push(segment);
      i++;

      // Count consecutive halants after consonant
      let halantCount = 0;
      while (i < segments.length && isHalant(segments[i])) {
        halantCount++;
        i++;
      }

      // Skip ZWJ/ZWNJ after halant
      while (i < segments.length && (segments[i] === '\u200D' || segments[i] === '\u200C')) {
        i++;
      }

      // If this isn't the last consonant, record the halant count
      if (i < segments.length && (isBengaliConsonant(segments[i]) || isBengaliVowelSign(segments[i]))) {
        if (halantCount > 0) {
          halants.push(halantCount);
        }
      }
    } else {
      i++;
    }
  }

  return { consonants, halants, trailingKar };
}

/**
 * Normalize a Bengali string for comparison
 * Removes ZWJ/ZWNJ and handles variant forms
 */
export function normalizeBengaliString(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u200D/g, '') // Remove ZWJ
    .replace(/\u200C/g, '') // Remove ZWNJ
    .normalize('NFC') // Apply standard NFC first
    .replace(/\u09AF\u09BC/g, '\u09DF') // য + ় -> য় (Atomic Bengali letter YYA)
    .replace(/\u09A1\u09BC/g, '\u09DC') // ড + ় -> ড় (Atomic Bengali letter RRA)
    .replace(/\u09A2\u09BC/g, '\u09DD'); // ঢ + ় -> ঢ় (Atomic Bengali letter RHA)
}

/**
 * Check if a string is a Bengali conjunct (has halants)
 */
export function isConjunct(text: string): boolean {
  return bengaliSegmenter.segmentString(text).some(seg => isHalant(seg));
}

/**
 * Split a Bengali conjunct by halants, respecting grapheme boundaries
 * e.g., 'ক্ষ' → ['ক', 'ষ']
 * e.g., 'ক্ষ্ম' → ['ক', 'ষ্ম'] (keeps trailing conjunct parts)
 */
export function splitConjunctByHalant(conjunct: string): string[] {
  const segments = bengaliSegmenter.segmentString(conjunct);
  const parts: string[] = [];
  let currentPart = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPart += segment;

    if (isHalant(segment)) {
      // Look ahead - if next is consonant, we need to keep halant with next
      if (i + 1 < segments.length && isBengaliConsonant(segments[i + 1])) {
        // Keep the halant, continue building
        continue;
      }
    }

    // If it's a consonant and next is halant, just continue
    if (isBengaliConsonant(segment) && i + 1 < segments.length && isHalant(segments[i + 1])) {
      continue;
    }

    // If we hit a vowel sign, add it and finish
    if (isBengaliVowelSign(segment)) {
      parts.push(currentPart);
      currentPart = '';
    }
  }

  if (currentPart) {
    parts.push(currentPart);
  }

  return parts.filter(p => p.length > 0);
}

/**
 * Mapping of complex Bengali conjuncts with ZWJ/special handling
 * This is a reference table for edge cases
 */
export const COMPLEX_CONJUNCT_MAP: Record<string, { components: string[]; description: string }> = {
  'ক্ষ': { components: ['ক', '্', 'ষ'], description: 'Direct key mapping in most keyboards' },
  'ঞ্চ': { components: ['ঞ', '্', 'চ'], description: 'Jenya-Cha conjunct' },
  'ট্র': { components: ['ট', '্', 'র'], description: 'Ta-Ra conjunct' },
  'ষ্ট': { components: ['ষ', '্', 'ট'], description: 'Sha-Ta conjunct' },
  'স্ট': { components: ['স', '্', 'ট'], description: 'Sa-Ta conjunct' },
  'স্থ': { components: ['স', '্', 'থ'], description: 'Sa-Tha conjunct' },
};

/**
 * Vowel to Kar mapping for independent vowels formed with hasant (্) in BanglaWord / Bijoy
 */
export const VOWEL_TO_KAR_MAP: Record<string, string> = {
  'আ': 'া',
  'ই': 'ি',
  'ঈ': 'ী',
  'উ': 'ু',
  'ঊ': 'ূ',
  'ঋ': 'ৃ',
  'এ': 'ে',
  'ঐ': 'ৈ',
  'ও': 'ো',
  'ঔ': 'ৌ',
};

/**
 * Kar to Independent Vowel mapping when preceded by hasant (্)
 */
export const KAR_TO_VOWEL_MAP: Record<string, string> = {
  'া': 'আ',
  'ি': 'ই',
  'ী': 'ঈ',
  'ু': 'উ',
  'ূ': 'ঊ',
  'ৃ': 'ঋ',
  'ে': 'এ',
  'ৈ': 'ঐ',
  'ো': 'ও',
  'ৌ': 'ঔ',
};

/**
 * Short to Long vowel mapping for repeated Kar / vowel extension in BanglaWord
 * e.g. 'ই' + 'ি' / 'ী' -> 'ঈ', 'উ' + 'ু' / 'ূ' -> 'ঊ', 'এ' + 'ে' / 'ৈ' -> 'ঐ', 'ও' + 'ো' / 'ৌ' -> 'ঔ'
 */
export const SHORT_TO_LONG_VOWEL_MAP: Record<string, { kars: string[]; longVowel: string }> = {
  'ই': { kars: ['ি', 'ী'], longVowel: 'ঈ' },
  'উ': { kars: ['ু', 'ূ'], longVowel: 'ঊ' },
  'এ': { kars: ['ে', 'ৈ'], longVowel: 'ঐ' },
  'ও': { kars: ['ো', 'ৌ'], longVowel: 'ঔ' },
};

/**
 * Compose incoming keystroke with the current typing buffer according to direct character input.
 * Supports BanglaWord Hasanta (্) + Kar -> Independent Vowel composition, and short-to-long vowel extensions.
 */
export function composeBengaliKeystroke(currentBuffer: string, newChar: string): string {
  if (!newChar) return normalizeBengaliString(currentBuffer);

  // Case 1: Buffer is '্' (or ends with space + '্') and user typed a Kar (া, ি, ী, ু, ূ, ৃ, ে, ৈ, ো, ৌ)
  // In BanglaWord, '্' + Kar transforms into an independent vowel
  if (
    (currentBuffer === '্' || currentBuffer.endsWith(' ্')) &&
    KAR_TO_VOWEL_MAP[newChar]
  ) {
    const prefix = currentBuffer.slice(0, -1);
    return normalizeBengaliString(prefix + KAR_TO_VOWEL_MAP[newChar]);
  }

  // Case 2: Buffer ends with '্' and newChar is an independent vowel (from OS dead-key completion)
  if (
    (currentBuffer === '্' || currentBuffer.endsWith(' ্')) &&
    isBengaliVowel(newChar)
  ) {
    const prefix = currentBuffer.slice(0, -1);
    return normalizeBengaliString(prefix + newChar);
  }

  // Case 3: Short to long vowel extension (e.g. 'ই' + 'ি'/'ী' -> 'ঈ', 'উ' + 'ু'/'ূ' -> 'ঊ')
  if (currentBuffer.length > 0) {
    const lastChar = currentBuffer[currentBuffer.length - 1];
    const mapping = SHORT_TO_LONG_VOWEL_MAP[lastChar];
    if (mapping && mapping.kars.includes(newChar)) {
      return normalizeBengaliString(currentBuffer.slice(0, -1) + mapping.longVowel);
    }
  }

  return normalizeBengaliString(currentBuffer + newChar);
}

/**
 * Ensures drill items have space characters interspersed so learners practice
 * the spacebar regularly (every 2 to 4 characters / words).
 *
 * Rules:
 * - If items already contain explicit spaces, preserves them without duplicating.
 * - If an item is a sentence or contains internal spaces, keeps it as-is.
 * - Otherwise, automatically adds a " " (space) every 2-4 items (default 3).
 * - Never adds leading, trailing, or adjacent duplicate spaces.
 */
export function ensureSpacedDrillItems(items: string[], maxInterval: number = 3): string[] {
  if (!items || items.length === 0) return [];

  // Check if items are full sentences / long texts (containing spaces internally)
  const isFullText = items.some(it => it.length > 20 && it.includes(' '));
  if (isFullText) {
    return items;
  }

  // Check if items already have explicit space items interspersed
  const explicitSpaceCount = items.filter(it => it === ' ' || it.trim() === '').length;
  if (explicitSpaceCount >= Math.floor(items.length / 4)) {
    return items;
  }

  const result: string[] = [];
  let itemsSinceLastSpace = 0;
  const targetInterval = Math.max(2, Math.min(4, maxInterval));

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item === ' ' || item.trim() === '') {
      if (result.length > 0 && result[result.length - 1] !== ' ') {
        result.push(' ');
      }
      itemsSinceLastSpace = 0;
      continue;
    }

    result.push(item);
    itemsSinceLastSpace++;

    if (itemsSinceLastSpace >= targetInterval && i < items.length - 1) {
      result.push(' ');
      itemsSinceLastSpace = 0;
    }
  }

  if (result.length > 0 && result[result.length - 1] === ' ') {
    result.pop();
  }

  return result;
}

/**
 * Check if the current typed buffer is a valid prefix of the target string.
 * Supports pending Hasanta (্) when next target character is an independent vowel in BanglaWord.
 */
export function isValidBengaliTypingPrefix(buffer: string, target: string): boolean {
  if (!buffer) return true;
  if (!target) return false;

  const normBuffer = normalizeBengaliString(buffer);
  const normTarget = normalizeBengaliString(target);

  if (normTarget.startsWith(normBuffer)) {
    return true;
  }

  // If buffer ends with '্' at word/buffer start, check if target has an independent vowel that starts with '্'
  if (normBuffer === '্' || normBuffer.endsWith(' ্')) {
    const prefix = normBuffer.slice(0, -1);
    if (normTarget.startsWith(prefix)) {
      const nextCharInTarget = normTarget.slice(prefix.length, prefix.length + 1);
      if (VOWEL_TO_KAR_MAP[nextCharInTarget]) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Determine the next expected single Bengali character in the target string.
 */
export function getNextExpectedKeyChar(buffer: string, target: string): string {
  if (!target) return '';
  if (buffer === target) return '';

  const normBuffer = normalizeBengaliString(buffer);
  const normTarget = normalizeBengaliString(target);

  if (normTarget.startsWith(normBuffer)) {
    return normTarget.slice(normBuffer.length, normBuffer.length + 1) || '';
  }

  // If buffer is '্' and target starts with an independent vowel
  if (normBuffer === '্' || normBuffer.endsWith(' ্')) {
    const prefix = normBuffer.slice(0, -1);
    if (normTarget.startsWith(prefix)) {
      const nextCharInTarget = normTarget.slice(prefix.length, prefix.length + 1);
      return VOWEL_TO_KAR_MAP[nextCharInTarget] || nextCharInTarget;
    }
  }

  return normTarget[0] || '';
}

/**
 * Compute clip-path polygon to reveal only the typed portion of a composite Bengali character or word
 * without ever splitting the Unicode grapheme cluster into disconnected DOM nodes.
 */
export function getBengaliGraphemeClip(text: string, currentStep: number, totalSteps: number): string {
  if (currentStep <= 0) return 'inset(100%)';
  if (currentStep >= totalSteps) return 'inset(0)';

  // Below-base combining marks: ু (U+09C1), ূ (U+09C2), ৃ (U+09C3), ৄ (U+09C4), ্ (U+09CD), ৢ, ৣ
  const hasBelowBase = /[\u09C1\u09C2\u09C3\u09C4\u09CD\u09E2\u09E3]/.test(text);
  // Post-base Aa-kar mark: া (U+09BE)
  const hasAaKar = /\u09BE/.test(text);
  // Other post-base (right-side) marks: ী (U+09C0), ং (U+0982), ঃ (U+0983)
  const hasOtherPostBase = /[\u09C0\u0982\u0983]/.test(text);
  // Pre-base (left-side) marks: ি (U+09BF), ে (U+09C7), ৈ (U+09C8)
  const hasPreBase = /[\u09BF\u09C7\u09C8]/.test(text);
  // Circumfix (both sides) marks: ো (U+09CB), ৌ (U+09CC)
  const hasBothSides = /[\u09CB\u09CC]/.test(text);
  // Top mark: ঁ (U+0981, chandrabindu)
  const hasTopMark = /[\u0981]/.test(text);

  // Special intra-grapheme mark clipping for 2-step single clusters (e.g. 'ডা', 'কু', 'কী', 'কে'):
  if (totalSteps === 2) {
    // 1. Post-base Aa-kar 'া' (e.g. 'ডা', 'ফা', 'সা', 'কা', 'মা', 'বা', 'লা'):
    // In Bengali typography, the consonant occupies ~76% of width, while 'া'
    // is merely a thin vertical stroke occupying ~24% on the far right.
    // When typing the consonant (step 1): cover 100% of the consonant in green (up to 76%),
    // leaving ONLY the 'া' stem uncolored without cutting off the consonant or leaving a huge gap.
    if (hasAaKar && !hasPreBase && !hasBothSides) {
      return 'polygon(0 0, 76% 0, 76% 100%, 0 100%)';
    }

    // 2. Below-base marks (e.g. 'টূ', 'কু', 'কৃ', 'ক্'):
    // Base consonant is at top (~68%), kar is at bottom (~32%).
    // When consonant is typed (step 1): top is green, bottom is muted.
    if (hasBelowBase && !hasPreBase && !hasAaKar && !hasOtherPostBase && !hasBothSides) {
      return 'polygon(0 0, 100% 0, 100% 68%, 0 68%)';
    }

    // 3. Other post-base marks (e.g. 'কী', 'টং', 'টঃ'):
    if (hasOtherPostBase && !hasPreBase && !hasBothSides) {
      return 'polygon(0 0, 70% 0, 70% 100%, 0 100%)';
    }

    // 4. Pre-base marks (e.g. 'টি', 'টে', 'টৈ'):
    // Kar is on left (~34%), consonant is on right (~66%).
    // When consonant is typed (step 1): right consonant is green, left kar remains muted.
    if (hasPreBase && !hasAaKar && !hasOtherPostBase && !hasBothSides) {
      return 'polygon(34% 0, 100% 0, 100% 100%, 34% 100%)';
    }

    // 5. Circumfix marks (e.g. 'টো', 'টৌ'):
    // Consonant is in center (~46%), kar is on left and right (~27% each).
    // When consonant is typed (step 1): center is green.
    if (hasBothSides) {
      return 'polygon(27% 0, 73% 0, 73% 100%, 27% 100%)';
    }

    // 6. Top mark (chandrabindu ঁ):
    if (hasTopMark) {
      return 'polygon(0 22%, 100% 22%, 100% 100%, 0 100%)';
    }
  }

  // General multi-character / horizontal text or words (e.g. 'ডাল', 'সাদা', 'কলম'):
  const xPercent = Math.round((currentStep / totalSteps) * 100);
  return `polygon(0 0, ${xPercent}% 0, ${xPercent}% 100%, 0 100%)`;
}

