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
  HALANT: /\u094D/,
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
  private segmenter: any;

  constructor() {
    // Intl.Segmenter for 'grapheme' granularity handles combining marks properly
    this.segmenter = new Intl.Segmenter('bn-IN', { granularity: 'grapheme' });
  }

  /**
   * Split a Bengali string into proper grapheme clusters
   * e.g., 'ক্ষ্ম' → ['ক্ষ', '্', 'ম'] (handles complex conjuncts)
   */
  segmentString(text: string): string[] {
    const segments = Array.from(this.segmenter.segment(text), (s: any) => s.segment);
    return segments;
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
  return text
    .replace(/\u200D/g, '') // Remove ZWJ
    .replace(/\u200C/g, '') // Remove ZWNJ
    .normalize('NFC');
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
