/**
 * Bengali Grapheme Cluster Utilities
 * Handles proper segmentation of Bengali text at the grapheme level,
 * including complex conjuncts (যুক্তাক্ষর) with multiple halants and ZWJ
 */

// Bengali script Unicode ranges and important characters
const BENGALI_CHAR_RANGES = {
  VOWELS: /[\u0985-\u098C\u098F-\u0990\u0993-\u0994]/,
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
 * True when the runtime has a usable Intl.Segmenter.
 *
 * Intl.Segmenter is missing on IE and on older Safari/Firefox builds, and
 * `new Intl.Segmenter(...)` throws there. An unguarded constructor meant a
 * module-level crash that took the whole app down, so we feature-detect once
 * and fall back to a hand-written Bengali grapheme walker.
 *
 * The fallback implements the part of UAX #29 that Bengali actually needs:
 *   GB3   CR x LF stays together, then breaks
 *   GB4/5 break around Control / CR / LF
 *   GB9   x (Extend | ZWJ)  -> vowel signs, hasanta, anusvara, nukta
 *   GB9a  x SpacingMark     -> the post-base marks
 *   GB9c  Consonant [Extend|Linker]* x Consonant
 *         -> the rule that makes ক্ + ষ = ক্ষ one cluster instead of two.
 *         Without it every conjunct in the language fell apart.
 *   GB999 otherwise break
 */
export const hasNativeSegmenter: boolean = (() => {
  try {
    return (
      typeof Intl !== 'undefined' &&
      typeof (Intl as { Segmenter?: unknown }).Segmenter === 'function'
    );
  } catch {
    return false;
  }
})();

/**
 * Marks that attach to the preceding base character (GB9 / GB9a).
 *
 * Written as escapes on purpose: these are invisible codepoints, and inlining
 * the literals makes the source unreadable and easy to corrupt.
 *
 * The Bengali ranges were derived by sweeping U+0980..U+09FF against
 * Intl.Segmenter in every position, so this set is measured rather than guessed:
 *
 *   0981-0983  candrabindu, anusvara, visarga
 *   09BC       nukta (ড় is ড + ়)
 *   09BE-09C4  া ি ী ু ূ ৃ ৄ
 *   09C7 09C8 09CB 09CC   ে ৈ ো ৌ
 *   09CD       hasanta
 *   09D7       vocalic length mark
 *   09E2-09E3  vocalic marks
 *   09FE       sandhi mark
 *   200C-200D  ZWNJ / ZWJ
 *   0300-036F  generic combining diacritics, for mixed Bangla/Latin text
 *
 * Note the gaps: 0980, 09B1, 09C5, 09C6, 09C9 and 09CA do *not* attach, even
 * though they sit inside the ranges a first reading would suggest. Guessing
 * those ranges produces wrong clusters for exactly the codepoints nobody
 * exercises by hand.
 */
const BENGALI_COMBINING_MARK =
  /[\u0300-\u036F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB\u09CC\u09CD\u09D7\u09E2\u09E3\u09FE\u200C\u200D]/;

/**
 * Marks that keep an open conjunct link alive (InCB = Extend / Linker / ZWJ).
 *
 * This is the tail of GB9c:
 *     Consonant [ Extend|Linker ]* Linker [ Extend|Linker ]*  x  Consonant
 *
 * It is deliberately *not* the same set as BENGALI_COMBINING_MARK. The
 * pre-base vowel signs (ি ে ো ৌ) attach to their base but cancel the link, so
 * প্রি is one cluster while প্ + রি is two. Empirical sweep:
 *
 *   PRESERVES: 0981 09BC 09BE 09C1-09C4 09CD 09D7 09E2 09E3 09FE 200D
 *   CANCELS:   09BF 09C7 09C8 09CB 09CC 0982 0983 and ZWNJ (200C)
 */
const BENGALI_LINK_PRESERVING = /[\u0981\u09BC\u09BE\u09C1-\u09C4\u09CD\u09D7\u09E2\u09E3\u09FE\u200D]/;

/** BENGALI SIGN HASANTA — Indic_Conjunct_Break = Linker. */
const BENGALI_HASANTA = /\u09CD/;

/** CR, LF, NEL, LS and PS: each one ends the current cluster (GB4/GB5). */
const BENGALI_FORCE_BREAK = /\r\n|[\r\n\u0085\u2028\u2029]/;

/** Other C0/C1 controls: a cluster boundary and a cluster of its own. */
const BENGALI_CONTROL = /[\u0000-\u001F\u007F-\u009F]/;

/**
 * The letters GB9c will use — as the anchor at the head of a cluster and as the
 * consonant pulled in after a hasanta. For Bengali the two sets coincide.
 *
 * Derived by sweeping U+0980..U+09FF twice: once for "ক্X" vs "ক‌্X" (does
 * X get linked?) and once for "X্ক" (can X anchor a link?).
 *
 *   0995-09A8  ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন
 *   09AA-09B0 09B2   প ফ ব ভ ম য র ল
 *   09B6-09B9  শ ষ স হ
 *   09DC 09DD 09DF  ড় ঢ় য়
 *   09F0 09F1  ৎ ৑
 *
 * The five rare letters in between — ঩ ঱ ঳ ঴ ঵ (09A9, 09B1, 09B3-09B5) — are
 * excluded on purpose. They look like ordinary consonants in the block, but
 * Intl.Segmenter will not form a conjunct with them, so প্‌র style clusters
 * come out differently if you include them.
 *
 * The vowel *signs* (09BE-09CC) are absent too: they reach the cluster through
 * GB9 instead, and they cancel the link rather than continue it.
 */
const BENGALI_CONSONANT =
  /[\u0995-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC\u09DD\u09DF\u09F0\u09F1]/;

/**
 * Split a string into Bengali grapheme clusters without Intl.Segmenter.
 *
 * Exported so it can be regression-tested against the native implementation
 * directly — that comparison is the guarantee this fallback exists to provide.
 */
export function segmentBengaliGraphemesFallback(text: string): string[] {
  if (!text) return [];

  const out: string[] = [];
  const chars = Array.from(text);
  let current = '';
  // True while the current cluster still has an unconsumed conjunct link,
  // i.e. `Consonant [Extend|Linker]* Linker [Extend|Linker]*` with nothing but
  // link-preserving marks since the last hasant.
  let linked = false;
  // ZWNJ means "do not form a conjunct here", so it vetoes the link for the rest
  // of the cluster no matter what follows — even a hasant.
  let vetoed = false;
  // GB9c is anchored on a consonant at the head of the cluster (see
  // BENGALI_CONJUNCT_HEAD); a cluster starting on anything else can never open
  // a link.
  let anchored = false;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    // CRLF is one cluster (GB3), then we break.
    if (BENGALI_FORCE_BREAK.test(ch)) {
      if (current) { out.push(current); current = ''; }
      if (ch === '\r' && chars[i + 1] === '\n') { out.push('\r\n'); i++; }
      else { out.push(ch); }
      linked = false;
      vetoed = false;
      anchored = false;
      continue;
    }

    if (BENGALI_CONTROL.test(ch)) {
      if (current) { out.push(current); current = ''; }
      out.push(ch);
      linked = false;
      vetoed = false;
      anchored = false;
      continue;
    }

    if (!current) {
      current = ch;
      linked = false;
      vetoed = ch === '\u200C';
      anchored = BENGALI_CONSONANT.test(ch);
      continue;
    }

    // GB9 / GB9a: combining marks ride along with their base.
    if (BENGALI_COMBINING_MARK.test(ch)) {
      current += ch;
      // A hasanta opens a link; a link-preserving mark keeps it open; any other
      // mark closes it for good. ZWNJ vetoes it outright.
      if (vetoed) continue;
      if (ch === '\u200C') vetoed = true;
      else if (BENGALI_HASANTA.test(ch)) linked = anchored;
      else if (!BENGALI_LINK_PRESERVING.test(ch)) linked = false;
      continue;
    }

    // GB9c: the hasanta pulls exactly one consonant into this cluster, which is
    // what makes ক্ + ষ + ম = ক্ষ্ম a single visible unit instead of three.
    // The link is consumed by that consonant, so a third one starts fresh.
    if (linked && !vetoed && BENGALI_CONSONANT.test(ch)) {
      current += ch;
      linked = false;
      continue;
    }

    out.push(current);
    current = ch;
    linked = false;
    vetoed = false;
    anchored = BENGALI_CONSONANT.test(ch);
  }

  if (current) out.push(current);
  return out;
}

export class BengaliSegmenter {
  private segmenter: Intl.Segmenter | null;

  constructor() {
    this.segmenter = hasNativeSegmenter
      ? new Intl.Segmenter('bn-IN', { granularity: 'grapheme' })
      : null;
  }

  /** True when this instance is backed by the platform's Intl.Segmenter. */
  get isNative(): boolean {
    return this.segmenter !== null;
  }

  segmentString(text: string): string[] {
    if (!text) return [];
    if (!this.segmenter) return segmentBengaliGraphemesFallback(text);
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

  const segments = Array.from(conjunct);
  
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
 * Purpose-split normalization (PixelPerfect spec 5R). The legacy
 * normalizeBengaliString() stays as the comparison default; the three
 * functions below make each use-site declare its intent.
 */

/** Typing comparison: is the buffer equivalent to the target? (legacy behavior) */
export function normalizeForComparison(text: string): string {
  return normalizeBengaliString(text);
}

/** Cursor/grapheme boundaries: keep shaping controls, canonicalize order. */
export function normalizeForSegmentation(text: string): string {
  if (!text) return '';
  return text.normalize('NFC');
}

/**
 * Glyph shaping input: preserve ZWJ/ZWNJ (they can change Indic joining) and
 * never rewrite decomposed nukta forms - the shaper handles both spellings.
 */
export function normalizeForRendering(text: string): string {
  if (!text) return '';
  return text.normalize('NFC');
}

/**
 * Check if a string is a Bengali conjunct (has halants)
 */
export function isConjunct(text: string): boolean {
  return /[\u09CD]/.test(text);
}

/**
 * Split a Bengali conjunct by halants, respecting grapheme boundaries
 * e.g., 'ক্ষ' → ['ক', 'ষ']
 * e.g., 'ক্ষ্ম' → ['ক', 'ষ্ম'] (keeps trailing conjunct parts)
 */
export function splitConjunctByHalant(conjunct: string): string[] {
  const segments = Array.from(conjunct);
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
 * Set of fused/complex conjuncts (ligatures) where individual component characters
 * merge into a distinct new visual glyph. These require the dedicated simulation screen (ক-ক্-ক্র, ট-ট্-ট্ট).
 */
export const COMPLEX_CONJUNCTS = new Set<string>([
  // ক-বর্গ
  'ক্ত', 'ক্র', 'ক্ষ', 'ক্ষ্ম', 'ঙ্ক', 'ঙ্গ', 'ঙ্ঘ', 'ঙ্ক্ষ',
  // চ/ছ/জ/ঝ-বর্গ
  'জ্ঞ', 'ঞ্চ', 'ঞ্ছ', 'ঞ্জ', 'ঞ্ঝ',
  // ট/ঠ/ড/ঢ/ণ-বর্গ
  'ট্ট', 'ণ্ড', 'ণ্ট', 'ণ্ঠ', 'ণ্ণ',
  // ত/থ/দ/ধ-বর্গ
  'ত্ত', 'ত্থ', 'ত্র', 'দ্ধ', 'ব্ধ', 'গ্ধ',
  // শ/ষ/স-বর্গ
  'ষ্ণ', 'ষ্ক', 'ষ্ট', 'ষ্ঠ',
  // হ-বর্গ
  'হ্ম', 'হ্ণ', 'হ্ন', 'হ্ল', 'হ্য', 'হৃ',
  // অন্যান্য বিশেষ জটিল রূপ
  'শ্র', 'ভ্র', 'গ্র', 'ব্র',
]);

/**
 * Strips trailing vowel signs (কার) and auxiliary modifiers (ঁ, ং, ঃ) to get the bare conjunct root.
 */
export function getConjunctCore(cluster: string): string {
  return cluster.replace(/[\u09BE-\u09CC\u0981-\u0983\u09D7]/g, '');
}

/**
 * Checks if a grapheme cluster is a complex conjunct requiring the breakdown simulation screen.
 */
export function isComplexConjunct(cluster: string): boolean {
  const core = getConjunctCore(cluster);
  return COMPLEX_CONJUNCTS.has(core);
}

/**
 * Checks if a grapheme cluster is a transparent/identifiable conjunct (e.g. 'প্ত', 'চ্ছ', 'জ্ব', 'প্র', 'দ্র', 'রু', 'রূ').
 */
export function isTransparentConjunct(cluster: string): boolean {
  if (cluster.startsWith('রু') || cluster.startsWith('রূ')) return true;
  return isConjunct(cluster) && !isComplexConjunct(cluster);
}

/**
 * Below-base conjuncts whose second component attaches underneath the first AND
 * stays legible there (ল-ফলা family: 'ক্ল', 'গ্ল', 'প্ল', 'স্ল', … plus the
 * explicitly listed stacked doubles such as 'ট্ট'). These get an upper/lower
 * split highlight: the upper consonant turns green first, the pending hasanta
 * shows the usual dot, and the lower component turns green when typed.
 *
 * Fused conjuncts where the lower component is NOT recognizable (e.g. 'ক্ত')
 * are intentionally excluded — those keep the simulation-steps display.
 */
const BELOW_BASE_EXPLICIT = new Set<string>([
  'ট্ট',
]);

export function isBelowBaseLegible(cluster: string): boolean {
  const core = getConjunctCore(normalizeBengaliString(cluster));
  if (BELOW_BASE_EXPLICIT.has(core)) return true;
  // ল-ফলা: exactly C + hasanta + ল (কার stripped by getConjunctCore, so this
  // also covers 'ক্লা', 'ক্লি', … via their core).
  const units = Array.from(core);
  return units.length === 3 && units[1] === '্' && units[2] === 'ল';
}

/**
 * Checks if a conjunct stacks its components vertically (one below the other),
 * e.g. 'প্ত', 'স্ব', 'প্র', 'ক্ল', 'ট্ট' (contains ্ব/্র, has a legible
 * below-base component, or the base consonant belongs to the
 * vertically-stacking family). For these, a horizontal split highlight follows
 * the natural glyph geometry: upper part first, lower part when typed.
 */
export function isVerticallyStackedConjunct(text: string): boolean {
  if (isBelowBaseLegible(text)) return true;
  const baseChar = text[0] || '';
  return text.includes('্ব') ||
    text.includes('্র') ||
    /^[পদচজশসবলমতম্নছটঠডঢ]/.test(baseChar);
}

/**
 * Split height (%) for the below-base family ('ক্ল', 'ট্ট', …): everything
 * above this line turns green once the upper consonant is typed.
 * Tuned visually against Hind Siliguri / Noto Sans Bengali.
 */
export const BELOW_BASE_SPLIT_HEIGHT = 62;

/**
 * Checks if a cluster needs the conjunct simulation (step-by-step decomposition)
 * display instead of a partial clip highlight. True for complex conjuncts whose
 * components fuse beyond recognition (e.g. 'ক্ত', 'ক্র', 'ক্ষ'), where any
 * clip-path would cut the ligature mid-stroke.
 */
export function needsConjunctSimulation(cluster: string): boolean {
  const normCluster = normalizeBengaliString(cluster);
  if (isBelowBaseLegible(normCluster)) return false;
  return isComplexConjunct(normCluster);
}

/**
 * Checks if a grapheme cluster is a consonant with vowel sign (kar).
 */
export function isKarCluster(cluster: string): boolean {
  const units = Array.from(cluster);
  return (
    units.length >= 2 &&
    isBengaliConsonant(units[0]) &&
    !units.some(u => isHalant(u)) &&
    (units.some(u => isBengaliVowelSign(u)) || units.some(u => /[\u0981\u0982\u0983]/.test(u)))
  );
}


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

/**
 * Horn (টিকি) notch span [left, right] for ট/ঠ/ড/ঢ + ি above the matra.
 * Screenshot-verified per base: one band sliced the left slope of ঢ/ঠ horns.
 */
function getHornNotchSpan(baseChar: string): [number, number] {
  switch (baseChar) {
    case 'ঢ': return [20, 62];
    case 'ঠ': return [26, 62];
    case 'ট': case 'ড':
    default:
      return [30, 62];
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
    if (!hasHalant) {
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
            const [notchLeft, notchRight] = getHornNotchSpan(baseChar);
          // ট: the horn tip (y<4%) sits left of the 30% band while the ি
          // umbrella stays below it — a wider top tier greens the whole horn
          // without touching the umbrella (variant-verified, 2026-10-10).
          if (baseChar === 'ট') {
            return `polygon(${start}% 100%, 100% 100%, 100% ${topY}%, ${notchRight}% ${topY}%, ${notchRight}% 0, 24% 0, 24% 4%, ${notchLeft}% 4%, ${notchLeft}% ${topY}%, ${start}% ${topY}%)`;
          }
          return `polygon(${start}% ${topY}%, ${notchLeft}% ${topY}%, ${notchLeft}% 0, ${notchRight}% 0, ${notchRight}% ${topY}%, 100% ${topY}%, 100% 100%, ${start}% 100%)`;
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
        if (hasAnusvaraOrVisarga) {
          if (currentStep === 1) {
            return `polygon(0 0, 42% 0, 42% 100%, 0 100%)`;
          }
          if (currentStep === 2) {
            return `polygon(0 0, 74% 0, 74% 100%, 0 100%)`;
          }
          return `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;
        }
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
      // around 30% and 62% width (screenshot-verified), while the umbrella curve of 'ি' stays on the left (0 to 46%).
      // We use a notched polygon that covers 100% of the consonant (including its top horn)
      // without ever touching the umbrella or left stem of 'ি'!
      if (hasHroshwoIKar && !hasAaKar && !hasAnusvaraOrVisarga && !hasBothSides) {
        const start = getConsonantHroshwoIOffset(baseChar);
        if (baseChar === 'ট' || baseChar === 'ঠ' || baseChar === 'ড' || baseChar === 'ঢ') {
          const [notchLeft, notchRight] = getHornNotchSpan(baseChar);
          // ট: the horn tip (y<4%) sits left of the 30% band while the ি
          // umbrella stays below it — a wider top tier greens the whole horn
          // without touching the umbrella (variant-verified, 2026-10-10).
          if (baseChar === 'ট') {
            return `polygon(${start}% 100%, 100% 100%, 100% ${topY}%, ${notchRight}% ${topY}%, ${notchRight}% 0, 24% 0, 24% 4%, ${notchLeft}% 4%, ${notchLeft}% ${topY}%, ${start}% ${topY}%)`;
          }
          return `polygon(${start}% ${topY}%, ${notchLeft}% ${topY}%, ${notchLeft}% 0, ${notchRight}% 0, ${notchRight}% ${topY}%, 100% ${topY}%, 100% 100%, ${start}% 100%)`;
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

    // 14. Conjunct clusters (with halants, e.g. 'প্ত', 'চ্ছ', 'জ্ব', 'প্র', 'দ্র', 'ব্দ', 'স্প', 'স্থ', 'শ্রে', 'স্বা', 'ব্রা'):
    if (hasHalant && isConjunct(text)) {
      if (currentStep >= totalSteps) {
        return `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;
      }

      const hasPostBaseKar = /[\u09BE\u09C0]/.test(text); // া (Aa-kar) or ী (Dirgho-I kar)
      const hasPreBaseKar = /[\u09BF\u09C7\u09C8]/.test(text); // ি, ে, ৈ
      const isVerticalStacked = isVerticallyStackedConjunct(text);

      // Conjuncts with trailing post-base marks like 'স্বা', 'ব্রা', 'প্রা', 'দ্বা', 'শ্বা', 'স্পা', 'স্থা':
      // The conjunct base is on the left (0% to ~70%), while the post-base mark (া, ী) is on the right (~70% to 100%).
      if (hasPostBaseKar) {
        const baseWidth = 70;
        if (currentStep <= 2) {
          // Step 1 or 2 (e.g. 'স' or 'স্' in 'স্বা'): Reveal only the top consonant C1, without bleeding into '্ব' or 'া'
          if (isVerticalStacked) {
            const splitHeight = (baseChar === 'স' || text.includes('্ব')) ? 54 : 56;
            return `polygon(0 0, ${baseWidth}% 0, ${baseWidth}% ${splitHeight}%, 0 ${splitHeight}%)`;
          }
          return `polygon(0 0, 38% 0, 38% 100%, 0 100%)`;
        }
        if (currentStep === 3) {
          // Step 3 (e.g. 'স্ব' in 'স্বা'): Reveal the entire completed conjunct base 'স্ব', while 'া' remains gray!
          return `polygon(0 0, ${baseWidth}% 0, ${baseWidth}% 100%, 0 100%)`;
        }
        return `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;
      }

      // Conjuncts with pre-base marks like 'শ্রে' (ে on left, শ্র on right):
      if (hasPreBaseKar) {
        const leftOffset = 38;
        if (currentStep <= 2) {
          const splitHeight = (baseChar === 'স' || text.includes('্ব')) ? 54 : 56;
          return `polygon(${leftOffset}% 0, 100% 0, 100% ${splitHeight}%, ${leftOffset}% ${splitHeight}%)`;
        }
        if (currentStep === 3) {
          return `polygon(${leftOffset}% 0, 100% 0, 100% 100%, ${leftOffset}% 100%)`;
        }
        return `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;
      }

      // Bare conjuncts without trailing kar (e.g. 'স্ব', 'প্র', 'প্ত', 'চ্ছ', 'জ্ব', 'স্প', 'স্থ',
      // and the below-base family 'ক্ল', 'গ্ল', 'ট্ট'):
      if (currentStep <= 2) {
        if (isVerticalStacked) {
          // Screenshot-verified (lab matrix): ্র- and ্ব-subscripts both
          // start below ~58% while their bases end above it. স+্ব keeps
          // its tighter 54 (স sits higher). Legacy 72 painted র/ব tops
          // green from the first keystroke, so it is gone.
          const splitHeight = isBelowBaseLegible(text)
            ? BELOW_BASE_SPLIT_HEIGHT
            : baseChar === 'স' && text.includes('্ব')
            ? 54
            : 58;
          return `polygon(0 0, 100% 0, 100% ${splitHeight}%, 0 ${splitHeight}%)`;
        }
        return `polygon(0 0, 52% 0, 52% 100%, 0 100%)`;
      }
      const xPct = Math.round((currentStep / totalSteps) * 100);
      return `polygon(0 0, ${xPct}% 0, ${xPct}% 100%, 0 100%)`;
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
  label: string;    // e.g. "ক", "ক্", "র" / "ষ", "্", "ঠ", "া"
  completed: boolean;
  active?: boolean;
}

export type GraphemeKind = "simple" | "kar" | "conjunct";

export interface GraphemeRenderModel {
  full: string;
  kind: GraphemeKind;
  parts: GraphemePart[];
  conjunctSteps?: ConjunctStep[]; // সব conjunct-এর টাইপিং ধাপ; দেখানো হবে কি না plan ঠিক করে
  currentStep?: number;
  totalSteps?: number;
  hasPendingHalant?: boolean;
  isComplex?: boolean;
  specialHint?: string;
}

/**
 * Extract the typing-level code-units from a Bengali grapheme cluster.
 * Returns an ordered array of the raw Unicode scalar values (characters) as typed.
 * e.g. "টি" → ["ট", "ি"]
 *       "ক্ত" → ["ক", "্", "ত"]
 *       "ক্ষ্ম" → ["ক", "্", "ষ", "্", "ম"]
 *       "কা" → ["ক", "া"]
 */
export function extractTypingUnits(cluster: string): string[] {
  return Array.from(cluster);
}

/**
 * Build component decomposition simulation steps for a complex conjunct.
 * Formula specification:
 * - 2-consonant conjuncts: "ক + ক্ + র = ক্র", "ক + ক্ + ত = ক্ত", "ক + ক্ + ষ = ক্ষ"
 * - Clusters with kars or >2 consonants: "ষ + ্ + ঠ + া = ষ্ঠা", "শ + ্ + র + ে = শ্রে", "ব + ্ + র + া = ব্রা"
 */
export function buildConjunctSimulationSteps(
  cluster: string,
  typedSoFar: string
): ConjunctStep[] {
  const normCluster = normalizeBengaliString(cluster);
  const normTyped = normalizeBengaliString(typedSoFar);
  const units = extractTypingUnits(normCluster);
  const typedUnits = extractTypingUnits(normTyped);

  // Determine token breakdown formula
  const tokens: string[] = [];
  if (units.length === 3 && units[1] === '\u09CD') {
    // 2-consonant conjunct formula: [C1, C1্, C2] e.g. ["ক", "ক্", "র"] or ["ক", "ক্", "ত"]
    tokens.push(units[0]);
    tokens.push(units[0] + '\u09CD');
    tokens.push(units[2]);
  } else {
    // Clusters with trailing kar or >2 consonants: [C1, ্, C2, ...] e.g. ["ষ", "্", "ঠ", "া"]
    for (const u of units) {
      tokens.push(u);
    }
  }

  const isFullyTyped = normTyped === normCluster || (normCluster.length > 0 && normTyped.startsWith(normCluster));

  let activeAssigned = false;
  return tokens.map((label, idx) => {
    let completed = false;
    let active = false;

    if (isFullyTyped) {
      completed = true;
    } else if (units.length === 3 && units[1] === '\u09CD') {
      // 2-consonant conjunct tracking:
      // idx 0 ('ক'): completed if typedUnits >= 1
      // idx 1 ('ক্'): completed if typedUnits >= 2
      // idx 2 ('র'): completed if typedUnits >= 3
      if (typedUnits.length > idx) {
        completed = true;
      } else if (!activeAssigned) {
        active = true;
        activeAssigned = true;
      }
    } else {
      // Direct unit-by-unit tracking
      if (typedUnits.length > idx) {
        completed = true;
      } else if (!activeAssigned) {
        active = true;
        activeAssigned = true;
      }
    }

    return {
      label,
      completed,
      active,
    };
  });
}

/**
 * Build a GraphemeRenderModel for a target cluster and how much the user has typed so far.
 *
 * @param cluster  - The normalized target grapheme cluster (e.g. "টি", "প্ত", "ক্ত", "ক্র")
 * @param typedSoFar - The normalized string the user has typed into this cluster so far
 */
export function buildGraphemeRenderModel(
  cluster: string,
  typedSoFar: string
): GraphemeRenderModel {
  const normCluster = normalizeBengaliString(cluster);
  const normTyped = normalizeBengaliString(typedSoFar);
  const units = extractTypingUnits(normCluster);
  const typedUnits = extractTypingUnits(normTyped);

  const isComplex = isComplexConjunct(normCluster);
  const isConj = isConjunct(normCluster) || normCluster === 'রু' || normCluster === 'রূ';
  const isKar = isKarCluster(normCluster);

  let kind: GraphemeKind;
  if (isComplex || isConj) {
    kind = 'conjunct';
  } else if (isKar) {
    kind = 'kar';
  } else {
    kind = 'simple';
  }

  const fullyTyped = normTyped === normCluster;
  const currentStep = typedUnits.length;
  const totalSteps = units.length;
  // Pending-hasanta dot: shown for transparent conjuncts and for below-base
  // legible ones (e.g. 'ট্ট') that render through the clip path.
  const hasPendingHalant =
    (!isComplex || isBelowBaseLegible(normCluster)) &&
    isConj &&
    normTyped.endsWith('্') &&
    !fullyTyped;

  let conjunctSteps: ConjunctStep[] | undefined = undefined;
  let specialHint: string | undefined = undefined;

  if (isConj) {
    // Steps for every conjunct: the RENDER PLAN (not this model) decides
    // whether they are shown (simulation box) or the clip path is used.
    conjunctSteps = buildConjunctSimulationSteps(normCluster, normTyped);
    if (normCluster.includes('ক্ষ')) {
      specialHint = "বাংলাওয়ার্ড: সরাসরি 'q' অথবা ক + ্ + ষ";
    }
  }

  const parts: GraphemePart[] = [];
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
    full: normCluster,
    kind,
    parts,
    conjunctSteps,
    currentStep,
    totalSteps,
    hasPendingHalant,
    isComplex,
    specialHint,
  };
}

