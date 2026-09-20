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

export interface VowelProcessInfo {
  vowel: string;
  deadKeyChar: string; // '্'
  deadKeyCode: string; // 'KeyH'
  deadKey: string;     // 'h'
  karChar: string;     // 'ি'
  karKey: string;      // 'i'
  karKeyCode: string;  // 'KeyI'
  needsShift: boolean;
  processLabel: string; // 'h,্ + i,ি = ই'
}

export const INDEPENDENT_VOWEL_PROCESS_MAP: Record<string, VowelProcessInfo> = {
  'অ': { vowel: 'অ', deadKeyChar: 'অ', deadKeyCode: 'KeyA', deadKey: 'a', karChar: 'অ', karKey: 'a', karKeyCode: 'KeyA', needsShift: true, processLabel: 'Shift+a = অ' },
  'আ': { vowel: 'আ', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'া', karKey: 'a', karKeyCode: 'KeyA', needsShift: false, processLabel: 'h,্ + a,া = আ' },
  'ই': { vowel: 'ই', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ি', karKey: 'i', karKeyCode: 'KeyI', needsShift: false, processLabel: 'h,্ + i,ি = ই' },
  'ঈ': { vowel: 'ঈ', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ী', karKey: 'i', karKeyCode: 'KeyI', needsShift: true, processLabel: 'h,্ + Shift+i,ী = ঈ' },
  'উ': { vowel: 'উ', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ু', karKey: 'u', karKeyCode: 'KeyU', needsShift: false, processLabel: 'h,্ + u,ু = উ' },
  'ঊ': { vowel: 'ঊ', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ূ', karKey: 'u', karKeyCode: 'KeyU', needsShift: true, processLabel: 'h,্ + Shift+u,ূ = ঊ' },
  'ঋ': { vowel: 'ঋ', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ৃ', karKey: 'r', karKeyCode: 'KeyR', needsShift: false, processLabel: 'h,্ + r,ৃ = ঋ' },
  'এ': { vowel: 'এ', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ে', karKey: 'e', karKeyCode: 'KeyE', needsShift: false, processLabel: 'h,্ + e,ে = এ' },
  'ঐ': { vowel: 'ঐ', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ৈ', karKey: 'e', karKeyCode: 'KeyE', needsShift: true, processLabel: 'h,্ + Shift+e,ৈ = ঐ' },
  'ও': { vowel: 'ও', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ো', karKey: 'o', karKeyCode: 'KeyO', needsShift: false, processLabel: 'h,্ + o,ো = ও' },
  'ঔ': { vowel: 'ঔ', deadKeyChar: '্', deadKeyCode: 'KeyH', deadKey: 'h', karChar: 'ৌ', karKey: 'o', karKeyCode: 'KeyO', needsShift: true, processLabel: 'h,্ + Shift+o,ৌ = ঔ' },
  'অ্যা': { vowel: 'অ্যা', deadKeyChar: 'অ', deadKeyCode: 'KeyA', deadKey: 'a', karChar: 'া', karKey: 'a', karKeyCode: 'KeyA', needsShift: false, processLabel: 'Shift+a,অ + a,া = অ্যা' },
};

/**
 * Compose incoming keystroke with the current typing buffer according to direct character input.
 * Supports BanglaWord Hasanta (্) + Kar -> Independent Vowel composition, and short-to-long vowel extensions.
 */
export function composeBengaliKeystroke(currentBuffer: string, newChar: string): string {
  if (!newChar) return normalizeBengaliString(currentBuffer);

  // Case 1: Buffer ends with '্' and user typed a Kar (া, ি, ী, ু, ূ, ৃ, ে, ৈ, ো, ৌ)
  // In BanglaWord, '্' + Kar transforms into an independent vowel (works standalone, after space, or mid-word)
  if (
    currentBuffer.endsWith('্') &&
    KAR_TO_VOWEL_MAP[newChar]
  ) {
    const prefix = currentBuffer.slice(0, -1);
    return normalizeBengaliString(prefix + KAR_TO_VOWEL_MAP[newChar]);
  }

  // Case 2: Buffer ends with '্' and newChar is an independent vowel (from OS dead-key completion)
  if (
    currentBuffer.endsWith('্') &&
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

  // Check if items are phrases/sentences or texts (containing spaces internally)
  const hasInternalSpaces = items.some(it => it.trim().includes(' '));
  if (hasInternalSpaces) {
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
 * Supports pending Hasanta (্) when next target character is an independent vowel in BanglaWord
 * (works at word start, after space, or inside a word like 'পুঁ' + '্').
 */
export function isValidBengaliTypingPrefix(buffer: string, target: string): boolean {
  if (!buffer) return true;
  if (!target) return false;

  const normBuffer = normalizeBengaliString(buffer);
  const normTarget = normalizeBengaliString(target);

  if (normTarget.startsWith(normBuffer)) {
    return true;
  }

  // If buffer ends with '্', check if target has an independent vowel that starts with '্'
  if (normBuffer.endsWith('্')) {
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
 * Determine the upcoming independent vowel if one is next in sequence.
 * Works both before dead-key is pressed and while dead-key ('্') is pending in buffer.
 */
export function getUpcomingIndependentVowel(buffer: string, target: string): VowelProcessInfo | null {
  if (!target) return null;
  const normBuffer = normalizeBengaliString(buffer);
  const normTarget = normalizeBengaliString(target);

  if (normBuffer.endsWith('্')) {
    const prefix = normBuffer.slice(0, -1);
    if (normTarget.startsWith(prefix)) {
      const nextChar = normTarget.slice(prefix.length, prefix.length + 1);
      return INDEPENDENT_VOWEL_PROCESS_MAP[nextChar] || null;
    }
  } else if (normTarget.startsWith(normBuffer)) {
    const nextChar = normTarget.slice(normBuffer.length, normBuffer.length + 1);
    return INDEPENDENT_VOWEL_PROCESS_MAP[nextChar] || null;
  }
  return null;
}

/**
 * Determine the next expected single Bengali character in the target string.
 * If expandIndependentVowels is true, returns dead-key '্' as first step for BanglaWord vowels.
 */
export function getNextExpectedKeyChar(
  buffer: string,
  target: string,
  expandIndependentVowels: boolean = false
): string {
  if (!target) return '';
  if (buffer === target) return '';

  const normBuffer = normalizeBengaliString(buffer);
  const normTarget = normalizeBengaliString(target);

  if (normTarget.startsWith(normBuffer)) {
    const nextChar = normTarget.slice(normBuffer.length, normBuffer.length + 1) || '';
    if (
      expandIndependentVowels &&
      INDEPENDENT_VOWEL_PROCESS_MAP[nextChar] &&
      INDEPENDENT_VOWEL_PROCESS_MAP[nextChar].deadKeyChar === '্'
    ) {
      return '্';
    }
    return nextChar;
  }

  // If buffer ends with '্' and next target character is an independent vowel (e.g. 'পুঁ্' for 'পুঁই')
  if (normBuffer.endsWith('্')) {
    const prefix = normBuffer.slice(0, -1);
    if (normTarget.startsWith(prefix)) {
      const nextCharInTarget = normTarget.slice(prefix.length, prefix.length + 1);
      if (VOWEL_TO_KAR_MAP[nextCharInTarget]) {
        return VOWEL_TO_KAR_MAP[nextCharInTarget];
      }
    }
  }

  return normTarget[0] || '';
}

/**
 * Consonant-specific clip ratios for 2-step single grapheme clusters (consonant + mark).
 * Calibrated using exact browser font metrics (Hind Siliguri / Noto Sans Bengali)
 * to ensure green highlight stops exactly at the boundary without bleeding into marks.
 */
function getConsonantTopThreshold(baseChar: string): number {
  switch (baseChar) {
    case 'ট': case 'ঠ': case 'ড': case 'ঢ': case 'ড়': case 'ঢ়':
      return 10;
    default:
      return 12;
  }
}

function getConsonantAaRatio(baseChar: string): number {
  switch (baseChar) {
    // Narrow consonants: চ, দ, ব, র, হ, ধ, ঠ
    case 'চ': case 'দ': case 'ব': case 'র': case 'হ': case 'ধ': case 'ঠ':
      return 68;
    // Medium-narrow consonants: ট, ঢ, ণ, থ, ন, ষ, ঢ়
    case 'ট': case 'ঢ': case 'ণ': case 'থ': case 'ন': case 'ষ': case 'ঢ়':
      return 70;
    // Medium consonants: ঘ, খ, গ, ম, য, ল, স, য়
    case 'স': case 'ঘ': case 'খ': case 'গ': case 'ম': case 'য': case 'ল': case 'য়':
      return 71;
    // Medium-wide consonants: ঙ, ছ, ড, ত, প, ভ, শ, ড়
    case 'ঙ': case 'ছ': case 'ড': case 'ত': case 'প': case 'ভ': case 'শ': case 'ড়':
      return 73;
    // Wide consonants: ক, ঝ, ফ
    case 'ক': case 'ঝ': case 'ফ':
      return 75;
    // Extra-wide consonants: জ, ঞ
    case 'জ': case 'ঞ':
      return 77;
    default:
      return 70;
  }
}

function getConsonantAnusvaraRatio(baseChar: string): number {
  switch (baseChar) {
    // Narrow consonants: চ, দ, ঠ, ধ
    case 'চ': case 'দ': case 'ঠ': case 'ধ':
      return 58;
    // Medium-narrow consonants: ট, ব, র, হ, ন, ঢ, ণ, ঢ়
    case 'ট': case 'ব': case 'র': case 'হ': case 'ন': case 'ঢ': case 'ণ': case 'ঢ়':
      return 60;
    // Medium consonants: খ, গ, ঘ, ম, য, ষ, থ, য়
    case 'খ': case 'গ': case 'ঘ': case 'ম': case 'য': case 'ষ': case 'থ': case 'য়':
      return 61;
    // Medium-wide consonants: স, ল
    case 'স': case 'ল':
      return 62;
    // Wide consonants: ড, ত, প, ভ, ছ, ঙ, শ, ড়
    case 'ড': case 'ত': case 'প': case 'ভ': case 'ছ': case 'ঙ': case 'শ': case 'ড়':
      return 64;
    // Extra-wide consonants: ক, ঝ, ফ
    case 'ক': case 'ঝ': case 'ফ':
      return 66;
    // Ultra-wide consonants: জ, ঞ
    case 'জ': case 'ঞ':
      return 69;
    default:
      return 60;
  }
}

function getConsonantELeftOffset(baseChar: string): number {
  switch (baseChar) {
    // Extra-narrow consonants: চ, দ, ঠ (e-kar extends to ~42%)
    case 'চ': case 'দ': case 'ঠ':
      return 42;
    // Narrow consonants: ট, ব, র, হ, ধ (e-kar extends to ~41%)
    case 'ট': case 'ব': case 'র': case 'হ': case 'ধ':
      return 41;
    // Medium-narrow consonants: ন, ঢ, ণ, থ, ষ, ঢ়
    case 'ন': case 'ঢ': case 'ণ': case 'থ': case 'ষ': case 'ঢ়':
      return 40;
    // Medium consonants: খ, গ, ঘ, ম, য, ল, য়
    case 'খ': case 'গ': case 'ঘ': case 'ম': case 'য': case 'ল': case 'য়':
      return 38;
    // Medium-wide consonants: স
    case 'স':
      return 37;
    // Wide consonants: ড, ত, প, ভ, ঙ, ছ, শ, ঝ, ড়
    case 'ড': case 'ত': case 'প': case 'ভ': case 'ঙ': case 'ছ': case 'শ': case 'ঝ': case 'ড়':
      return 35;
    // Extra-wide consonants: ক
    case 'ক':
      return 33;
    // Ultra-wide consonants: জ, ঞ, ফ
    case 'জ': case 'ঞ': case 'ফ':
      return 30;
    default:
      return 40;
  }
}

function getConsonantHroshwoIOffset(baseChar: string): number {
  switch (baseChar) {
    case 'চ': case 'দ': case 'ঠ':
      return 32;
    case 'ট': case 'ব': case 'র': case 'হ':
      return 31;
    case 'ন': case 'ঢ': case 'ণ': case 'থ': case 'ষ': case 'ঢ়':
      return 30;
    case 'খ': case 'গ': case 'ম': case 'য': case 'য়':
      return 29;
    case 'স': case 'ল':
      return 28;
    case 'ড': case 'ত': case 'প': case 'ভ': case 'ঙ': case 'ছ': case 'শ': case 'ঝ': case 'ড়':
      return 26;
    case 'ক': case 'ফ':
      return 24;
    default:
      return 30;
  }
}

function getConsonantDirghoIRatio(baseChar: string): number {
  switch (baseChar) {
    case 'চ': case 'দ':
      return 68;
    case 'ট': case 'ব': case 'র': case 'হ':
      return 69;
    case 'ন': case 'ঢ': case 'ণ': case 'থ': case 'ষ': case 'ঢ়':
      return 70;
    case 'খ': case 'গ': case 'ম': case 'য': case 'ল': case 'ড়': case 'য়':
      return 71;
    case 'স':
      return 72;
    case 'ক': case 'ফ':
      return 76;
    default:
      return 70;
  }
}

function getConsonantCircumfixSpan(baseChar: string): [number, number] {
  switch (baseChar) {
    case 'ট': case 'চ': case 'দ': case 'ব': case 'র': case 'হ': case 'ধ':
      return [33, 73];
    case 'স': case 'ল': case 'ম': case 'ন':
      return [30, 75];
    case 'ক': case 'ফ': case 'জ':
      return [27, 77];
    default:
      return [31, 74];
  }
}

/**
 * Compute clip-path polygon to reveal only the typed portion of a composite Bengali character or word
 * without ever splitting the Unicode grapheme cluster into disconnected DOM nodes.
 */
export function getBengaliGraphemeClip(text: string, currentStep: number, totalSteps: number): string {
  if (currentStep <= 0) return 'inset(100%)';
  if (currentStep >= totalSteps) return 'inset(0)';

  const baseChar = text[0] || '';
  const topY = getConsonantTopThreshold(baseChar);

  // Below-base combining marks: ু (U+09C1), ূ (U+09C2), ৃ (U+09C3), ৄ (U+09C4), ৢ, ৣ
  const hasBelowBaseVowel = /[\u09C1\u09C2\u09C3\u09C4\u09E2\u09E3]/.test(text);
  const hasHalant = /\u09CD/.test(text);
  // Post-base Aa-kar mark: া (U+09BE)
  const hasAaKar = /\u09BE/.test(text);
  // Anusvara (ং U+0982) and Visarga (ঃ U+0983)
  const hasAnusvaraOrVisarga = /[\u0982\u0983]/.test(text);
  // Post-base Dirgho-I kar mark: ী (U+09C0)
  const hasDirghoIKar = /\u09C0/.test(text);
  // Pre-base left-side marks: ে (U+09C7), ৈ (U+09C8)
  const hasPreBaseEorOi = /[\u09C7\u09C8]/.test(text);
  const hasOiKar = /\u09C8/.test(text);
  // Pre-base Hroshwo-I kar mark: ি (U+09BF)
  const hasHroshwoIKar = /\u09BF/.test(text);
  // Circumfix (both sides) marks: ো (U+09CB), ৌ (U+09CC)
  const hasBothSides = /[\u09CB\u09CC]/.test(text);
  const hasOuKar = /\u09CC/.test(text);
  // Top mark: ঁ (U+0981, chandrabindu)
  const hasTopMark = /\u0981/.test(text);

  const isSingleCluster = bengaliSegmenter.segmentString(text).length <= 1;

  if (isSingleCluster) {
    // 1. Circumfix marks with Top Mark (Chandrabindu ঁ) (e.g. 'ধোঁ' in 'ধোঁয়া', 'রোঁ', 'চোঁ', 'টোঁ')
    if (hasBothSides && hasTopMark) {
      const [start, end] = getConsonantCircumfixSpan(baseChar);
      if (currentStep === 1) {
        // Step 1: Consonant only -> highlight middle consonant, exclude left e-kar, right aa-kar, and top chandrabindu
        return `polygon(${start}% ${topY}%, ${end}% ${topY}%, ${end}% 100%, ${start}% 100%)`;
      }
      if (currentStep === 2) {
        // Step 2: Consonant + O-kar (e.g. 'ধো') -> highlight left e-kar, middle consonant, and right aa-kar; exclude top chandrabindu
        return `polygon(0 0, ${start}% 0, ${start}% ${topY}%, ${end}% ${topY}%, ${end}% 0, 100% 0, 100% 100%, 0 100%)`;
      }
    }

    // 2. Post-base Aa-kar with Top Mark (Chandrabindu ঁ) (e.g. 'দাঁ', 'চাঁ', 'বাঁ', 'হাঁ', 'পাঁ')
    if (hasAaKar && hasTopMark && !hasPreBaseEorOi && !hasHroshwoIKar && !hasBothSides) {
      const pct = getConsonantAaRatio(baseChar);
      if (currentStep === 1) {
        // Step 1: Consonant only -> highlight consonant, exclude top chandrabindu and right aa-kar
        return `polygon(0 ${topY}%, ${pct}% ${topY}%, ${pct}% 100%, 0 100%)`;
      }
      if (currentStep === 2) {
        // Step 2: Consonant + Aa-kar -> highlight consonant and aa-kar, exclude top chandrabindu
        return `polygon(0 ${topY}%, ${pct}% ${topY}%, ${pct}% 0, 100% 0, 100% 100%, 0 100%)`;
      }
    }

    // 3. Below-base marks with Top Mark (Chandrabindu ঁ) (e.g. 'কুঁ', 'পুঁ', 'ধুঁ')
    if (hasBelowBaseVowel && hasTopMark && !hasPreBaseEorOi && !hasHroshwoIKar && !hasBothSides && !hasAaKar) {
      if (currentStep === 1) {
        // Step 1: Consonant only -> exclude bottom vowel and top chandrabindu
        return `polygon(0 ${topY}%, 100% ${topY}%, 100% 68%, 0 68%)`;
      }
      if (currentStep === 2) {
        // Step 2: Consonant + below-base vowel -> exclude top chandrabindu
        return `polygon(0 ${topY}%, 100% ${topY}%, 100% 100%, 0 100%)`;
      }
    }

    // 4. Pre-base marks with Top Mark (Chandrabindu ঁ) (e.g. 'পিঁ', 'শেঁ', 'টিঁ')
    if ((hasPreBaseEorOi || hasHroshwoIKar) && hasTopMark && !hasBothSides && !hasAaKar) {
      const start = hasHroshwoIKar ? getConsonantHroshwoIOffset(baseChar) : getConsonantELeftOffset(baseChar);
      if (currentStep === 1) {
        // Step 1: Consonant only -> exclude left mark and top chandrabindu
        if (hasHroshwoIKar && (baseChar === 'ট' || baseChar === 'ঠ' || baseChar === 'ড' || baseChar === 'ঢ')) {
          return `polygon(${start}% ${topY}%, 46% ${topY}%, 46% 0, 78% 0, 78% ${topY}%, 100% ${topY}%, 100% 100%, ${start}% 100%)`;
        }
        return `polygon(${start}% ${topY}%, 100% ${topY}%, 100% 100%, ${start}% 100%)`;
      }
      if (currentStep === 2) {
        // Step 2: Mark + consonant -> exclude top chandrabindu
        return `polygon(0 0, ${start}% 0, ${start}% ${topY}%, 100% ${topY}%, 100% 100%, 0 100%)`;
      }
    }

    // 5. Below-base mark with Anusvara/Visarga (e.g. 'দুঃ' in 'দুঃখ')
    if (hasBelowBaseVowel && hasAnusvaraOrVisarga && !hasPreBaseEorOi && !hasHroshwoIKar && !hasBothSides) {
      const pct = getConsonantAnusvaraRatio(baseChar);
      if (currentStep === 1) {
        // Step 1: Consonant only -> exclude bottom vowel and right visarga/anusvara
        return `polygon(0 0, ${pct}% 0, ${pct}% 68%, 0 68%)`;
      }
      if (currentStep === 2) {
        // Step 2: Consonant + below-base mark -> exclude right visarga/anusvara
        return `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
      }
    }

    // 6. Post-base Aa-kar 'া' alone (e.g. 'ডা', 'ফা', 'সা', 'কা', 'মা', 'বা', 'লা', 'চা', 'দা'):
    if (hasAaKar && !hasPreBaseEorOi && !hasHroshwoIKar && !hasBothSides && !hasTopMark) {
      const pct = getConsonantAaRatio(baseChar);
      return `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
    }

    // 7. Below-base marks alone (e.g. 'টূ', 'কু', 'কৃ', 'ক্', 'মৃ', 'পূ'):
    if ((hasBelowBaseVowel || (hasHalant && !hasAaKar && !hasDirghoIKar && !hasHroshwoIKar && !hasPreBaseEorOi)) && !hasPreBaseEorOi && !hasHroshwoIKar && !hasAaKar && !hasAnusvaraOrVisarga && !hasDirghoIKar && !hasBothSides && !hasTopMark && totalSteps === 2) {
      return 'polygon(0 0, 100% 0, 100% 68%, 0 68%)';
    }

    // 8. Post-base Anusvara 'ং' and Visarga 'ঃ' alone (e.g. 'টং', 'রং', 'চং', 'দং', 'সং', 'বং', 'দঃ'):
    if (hasAnusvaraOrVisarga && !hasPreBaseEorOi && !hasHroshwoIKar && !hasBothSides && !hasTopMark && !hasBelowBaseVowel) {
      const pct = getConsonantAnusvaraRatio(baseChar);
      return `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)`;
    }

    // 9. Post-base Dirgho-I kar 'ী' (e.g. 'কী', 'টী', 'সী', 'দী', 'ক্ষী'):
    // Accurately clips below topY so the top arch/loop of 'ী' never turns green prematurely,
    // while keeping the consonant's top matra 100% full and uncut.
    if (hasDirghoIKar && !hasPreBaseEorOi && !hasHroshwoIKar && !hasBothSides) {
      const pct = getConsonantDirghoIRatio(baseChar);
      return `polygon(0 ${topY}%, ${pct}% ${topY}%, ${pct}% 100%, 0 100%)`;
    }

    // 10. Pre-base E-kar 'ে' and Oi-kar 'ৈ' (e.g. 'টে', 'চে', 'দে', 'সে', 'বে', 'রে', 'কে', 'তৈ', 'বৈ'):
    // For Oi-kar 'ৈ', clips below topY so its upper plume remains cleanly uncolored until typed.
    if (hasPreBaseEorOi && !hasAaKar && !hasAnusvaraOrVisarga && !hasBothSides) {
      const start = getConsonantELeftOffset(baseChar);
      if (hasOiKar) {
        return `polygon(${start}% ${topY}%, 100% ${topY}%, 100% 100%, ${start}% 100%)`;
      }
      return `polygon(${start}% 0, 100% 0, 100% 100%, ${start}% 100%)`;
    }

    // 11. Pre-base Hroshwo-I kar 'ি' (e.g. 'টি', 'কি', 'চি', 'দি', 'সি', 'বি', 'রি', 'ড়ি', 'পি'):
    // Clips below topY so the top umbrella arch of 'ি' remains cleanly uncolored until 'ি' is typed!
    // For 'ট', 'ঠ', 'ড', 'ঢ', their distinctive upper horn/টিঁকি extends above the matra to 0%
    // between 46% and 78% width, while the umbrella curve of 'ি' stays on the left (0 to 46%).
    // We use a notched polygon that covers 100% of the consonant (including its top horn)
    // without ever touching the umbrella or left stem of 'ি'!
    if (hasHroshwoIKar && !hasAaKar && !hasAnusvaraOrVisarga && !hasBothSides) {
      const start = getConsonantHroshwoIOffset(baseChar);
      if (baseChar === 'ট' || baseChar === 'ঠ' || baseChar === 'ড' || baseChar === 'ঢ') {
        return `polygon(${start}% ${topY}%, 46% ${topY}%, 46% 0, 78% 0, 78% ${topY}%, 100% ${topY}%, 100% 100%, ${start}% 100%)`;
      }
      return `polygon(${start}% ${topY}%, 100% ${topY}%, 100% 100%, ${start}% 100%)`;
    }

    // 12. Circumfix marks (e.g. 'টো', 'টৌ', 'চো', 'দো', 'সো', 'বো', 'কো', 'মৌ'):
    if (hasBothSides) {
      const [start, end] = getConsonantCircumfixSpan(baseChar);
      if (hasOuKar) {
        return `polygon(${start}% ${topY}%, ${end}% ${topY}%, ${end}% 100%, ${start}% 100%)`;
      }
      return `polygon(${start}% 0, ${end}% 0, ${end}% 100%, ${start}% 100%)`;
    }

    // 13. Top mark alone (chandrabindu ঁ, e.g. 'টঁ', 'হঁ'):
    if (hasTopMark) {
      return `polygon(0 ${topY}%, 100% ${topY}%, 100% 100%, 0 100%)`;
    }
  }

  // General multi-character / horizontal text or words (e.g. 'ডাল', 'সাদা', 'কলম', 'ফাদা'):
  const xPercent = Math.round((currentStep / totalSteps) * 100);
  return `polygon(0 0, ${xPercent}% 0, ${xPercent}% 100%, 0 100%)`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bengali Grapheme Render Model
// পরিকল্পনা.md §৫–৯ অনুযায়ী semantic-parts ভিত্তিক rendering
// ─────────────────────────────────────────────────────────────────────────────

export type GraphemePartState = "typed" | "current" | "pending";

export interface GraphemePart {
  text: string;
  state: GraphemePartState;
}

export interface ConjunctStep {
  label: string;    // e.g. "ক", "ক্", "ক্ত"
  completed: boolean;
}

export type GraphemeKind = "simple" | "kar" | "conjunct";

export interface GraphemeRenderModel {
  full: string;
  kind: GraphemeKind;
  parts: GraphemePart[];
  conjunctSteps?: ConjunctStep[]; // শুধু conjunct-এর জন্য
}

/**
 * Extract the typing-level code-units from a Bengali grapheme cluster.
 * Returns an ordered array of the raw Unicode scalar values (characters) as typed.
 * e.g. "টি" → ["ট", "ি"]
 *       "ক্ত" → ["ক", "্", "ত"]
 *       "ক্ষ্ম" → ["ক", "্", "ষ", "্", "ম"]
 *       "কা" → ["ক", "া"]
 */
function extractTypingUnits(cluster: string): string[] {
  // Use Array.from to split by UTF-16 code units but handle surrogates correctly
  // For Bengali, all characters are in BMP so Array.from is fine here
  return Array.from(cluster);
}

/**
 * Build intermediate conjunct steps for a multi-consonant cluster.
 * e.g. "ক্ত" → ["ক", "ক্", "ক্ত"]
 *      "ক্ষ্ম" → ["ক", "ক্", "ক্ষ", "ক্ষ্", "ক্ষ্ম"]
 *
 * Each step represents a meaningful intermediate typing state.
 */
function buildConjunctSteps(cluster: string): string[] {
  const units = extractTypingUnits(cluster);
  const steps: string[] = [];
  let accumulated = '';

  for (let i = 0; i < units.length; i++) {
    accumulated += units[i];
    // After each consonant or at the end of a halant group, record a step
    // A "meaningful" step is after: consonant alone, consonant+halant, full cluster
    const ch = units[i];
    const nextCh = units[i + 1];

    // Record after consonant (but not if immediately followed by halant — wait for halant)
    // Actually record after every unit for full granularity matching typing sequence
    // We record: consonant (if next is halant, skip — let halant complete the step)
    // But actually for display: show each intermediate state the user types through
    if (isHalant(ch)) {
      // After halant: record "ক্" state
      steps.push(accumulated);
    } else if (isBengaliConsonant(ch)) {
      if (!isHalant(nextCh || '')) {
        // Consonant not followed by halant → record (e.g. last consonant of cluster, or vowel sign)
        steps.push(accumulated);
      }
      // If next is halant, don't record yet — wait for halant step
    } else if (isBengaliVowelSign(ch)) {
      steps.push(accumulated);
    }
  }

  // Ensure full cluster is always the last step
  if (steps.length === 0 || steps[steps.length - 1] !== cluster) {
    steps.push(cluster);
  }

  return steps;
}

/**
 * Build a GraphemeRenderModel for a target cluster and how much the user has typed so far.
 *
 * @param cluster  - The normalized target grapheme cluster (e.g. "টি", "ক্ত")
 * @param typedSoFar - The normalized string the user has typed into this cluster so far
 */
export function buildGraphemeRenderModel(
  cluster: string,
  typedSoFar: string
): GraphemeRenderModel {
  const units = extractTypingUnits(cluster);
  const typedUnits = extractTypingUnits(typedSoFar);

  // ── Determine kind ──────────────────────────────────────────────────────────
  const hasHalantChar = units.some(u => isHalant(u));

  let kind: GraphemeKind;
  if (hasHalantChar && units.filter(u => isBengaliConsonant(u)).length >= 2) {
    kind = 'conjunct';
  } else if (
    units.length >= 2 &&
    isBengaliConsonant(units[0]) &&
    (isBengaliVowelSign(units[units.length - 1]) ||
      /[\u0981\u0982\u0983]/.test(units[units.length - 1]))
  ) {
    kind = 'kar';
  } else {
    kind = 'simple';
  }

  // ── Build parts (typed / current / pending) ─────────────────────────────────
  const parts: GraphemePart[] = [];

  if (kind === 'conjunct') {
    // For conjunct: the whole cluster is displayed as one glyph (full), plus decomposition steps.
    // Parts here represent the full cluster in a single part with overall state.
    const fullyTyped = typedSoFar === cluster;
    const partiallyTyped = typedSoFar.length > 0 && cluster.startsWith(typedSoFar) && !fullyTyped;
    parts.push({
      text: cluster,
      state: fullyTyped ? 'typed' : partiallyTyped ? 'current' : 'pending',
    });

    // Build decomposition steps
    const stepLabels = buildConjunctSteps(cluster);
    const conjunctSteps: ConjunctStep[] = stepLabels.map(label => ({
      label,
      completed: typedSoFar.length > 0 && (
        typedSoFar === label ||
        label.length < typedSoFar.length ||
        (typedSoFar.startsWith(label) && label !== cluster)
      ),
    }));

    return {
      full: cluster,
      kind,
      parts,
      conjunctSteps,
    };
  }

  // ── simple / kar: render parts individually ─────────────────────────────────
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    let state: GraphemePartState;

    if (i < typedUnits.length) {
      state = 'typed';
    } else if (i === typedUnits.length) {
      state = 'current';
    } else {
      state = 'pending';
    }

    parts.push({ text: unit, state });
  }

  return {
    full: cluster,
    kind,
    parts,
  };
}
