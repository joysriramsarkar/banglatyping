/**
 * Key-sequence hints — the teaching floor.
 *
 * getTypingHint used to be a stub that returned an empty array for everything,
 * so the app could not tell a learner which keys produce the grapheme it is
 * asking for. The contract that matters here is not just "it returns something" —
 * it is that every key it names is a key the layout actually prints, because a
 * hint that disagrees with the on-screen keyboard teaches the wrong thing.
 *
 * The inverse also matters, and is the reason this file enumerates the gaps
 * instead of asserting a coverage percentage: a layout whose table has no key
 * for a character must say so. Silently guessing a key would turn a missing
 * glyph on the keyboard into a confident, wrong instruction.
 */

import {
  KEYBOARD_LAYOUT_OPTIONS,
  NUMBER_ROW,
  formatKeySequence,
  getKeySequenceForGrapheme,
  getKeyboardLayoutConfig,
  normalizeKeyboardLayout,
} from '@/lib/keyboard-layouts';
import { getTypingHint } from '@/lib/typing/engine';
import { bengaliSegmenter } from '@/lib/bengali-grapheme';

const LAYOUTS = KEYBOARD_LAYOUT_OPTIONS.map((o) => o.value);

/** Every key the layout draws, so hints can be checked against the keyboard. */
function printedKeys(layoutName: string): Set<string> {
  const config = getKeyboardLayoutConfig(layoutName);
  const keys = new Set<string>(NUMBER_ROW.map((k) => k.key));
  for (const key of [...config.top, ...config.home, ...config.bottom, ...config.space]) {
    if (key.special === 'shift') continue;
    keys.add(key.key);
  }
  return keys;
}

/** The 33 standard Bengali consonants, spelled by code point to avoid any doubt. */
const CONSONANTS =
  '\u0995\u0996\u0997\u0998\u0999' +
  '\u099A\u099B\u099C\u099D\u099E' +
  '\u099F\u09A0\u09A1\u09A2\u09A3' +
  '\u09A4\u09A5\u09A6\u09A7\u09A8' +
  '\u09AA\u09AB\u09AC\u09AD\u09AE' +
  '\u09AF\u09B0\u09B2\u09B6\u09B7\u09B8\u09B9';

/** The three precomposed nukta letters. */
const NUKTA_LETTERS = '\u09DC\u09DD\u09DF';

const KARS = '\u09BE\u09BF\u09C0\u09C1\u09C2\u09C7\u09C8\u09CB\u09CC\u09D2';

const MISC = '\u0982\u0983\u0981\u09CD\u0964';

const ALL_LETTERS = [...CONSONANTS, ...NUKTA_LETTERS, ...KARS, ...MISC];

const COMMON_GRAPHEMES = [
  ...ALL_LETTERS,
  'কা', 'কি', 'কে', 'কো', 'কু', 'ক্ষ', 'ক্ম', 'ক্ত', 'ক্র', 'জ্ঞ', 'বাংলা', 'স্কুল',
];

/**
 * Characters each layout's own table has no key for.
 *
 * Pinned deliberately. If someone fills a gap in a layout config this list has to
 * shrink in the same commit, which is the point — a gap that silently disappears
 * stops anyone noticing it was ever there.
 *
 * Spelled by code point, because these are exactly the characters where the two
 * encodings of the same glyph (decomposed vs precomposed) differ, and a list
 * built from literals would quietly assert the wrong thing.
 */
const KNOWN_GAPS: Record<string, string[]> = {
  banglaword: [],
  khipro: [],
  // ঞ দ ধ
  probhat: ['ঞ', 'দ', 'ধ'],
  // শ ঁ
  bijoy: ['শ', 'ঁ'],
  // ঞ ঢ় ৃ ঃ ঁ ।
  //
  // ঢ় and ৃ are not gaps so much as limitations of the table: Avro reaches
  // ড় and য় with Shift+r / Shift+y, but the letters below are not on any key it
  // declares. The danda is genuinely absent — a phonetic IME emits য়, not ।.
  avro: ['ঞ', '\u09DD', '\u09D2', 'ঃ', 'ঁ', '\u0964'],
  // ঁ
  unijoy: ['ঁ'],
};

/** These are never typed on their own, so "no key" is the right answer. */
const NEVER_TYPED = ['\u09BC', '\u200C', '\u200D'];

describe('getKeySequenceForGrapheme', () => {
  it('returns nothing for an empty grapheme', () => {
    expect(getKeySequenceForGrapheme('')).toEqual([]);
  });

  it('resolves the space bar', () => {
    const steps = getKeySequenceForGrapheme(' ', 'banglaword');
    expect(steps).toHaveLength(1);
    expect(steps[0].keyCode).toBe('Space');
  });

  it('resolves BanglaWord consonants to their single keys', () => {
    // The layout's own table: ক is on `k`, ষ is Shift+l, ক্ষ is on `q`.
    expect(formatKeySequence(getKeySequenceForGrapheme('ক', 'banglaword'))).toBe('k');
    expect(formatKeySequence(getKeySequenceForGrapheme('স', 'banglaword'))).toBe('s');
    expect(formatKeySequence(getKeySequenceForGrapheme('ক্ষ', 'banglaword'))).toBe('q');
  });

  it('prefers the layout compound key over spelling the conjunct out', () => {
    const steps = getKeySequenceForGrapheme('ক্ষ', 'banglaword');
    expect(steps).toHaveLength(1);
    expect(steps[0].produces).toBe('ক্ষ');
  });

  it('spells out a conjunct the layout has no compound key for', () => {
    // BanglaWord has no key for ্র, so ক্রা is ক + ্ + র + া.
    expect(formatKeySequence(getKeySequenceForGrapheme('ক্রা', 'banglaword'))).toBe(
      'k + h + r + a'
    );
  });

  it('resolves a vowel sign from the layout table', () => {
    expect(formatKeySequence(getKeySequenceForGrapheme('কা', 'banglaword'))).toBe('k + a');
    expect(formatKeySequence(getKeySequenceForGrapheme('কি', 'banglaword'))).toBe('k + i');
  });

  it('resolves a kar that the layout table does not print, via its vowel', () => {
    // Bijoy prints no independent vowels at all, so ো can only be found
    // through the vowel it is written from. The table has ও on `x`.
    const steps = getKeySequenceForGrapheme('কো', 'bijoy');
    expect(steps.map((s) => s.produces)).toEqual(['ক', 'ো']);
    expect(steps[1].key).toBe('x');
  });

  it('gives different answers for different layouts', () => {
    const banglaword = formatKeySequence(getKeySequenceForGrapheme('ক', 'banglaword'));
    const bijoy = formatKeySequence(getKeySequenceForGrapheme('ক', 'bijoy'));
    expect(banglaword).toBe('k');
    expect(bijoy).toBe('j');
    expect(banglaword).not.toBe(bijoy);
  });

  it('falls back to the default layout for an unknown layout name', () => {
    expect(getKeySequenceForGrapheme('ক', 'not-a-layout')).toEqual(
      getKeySequenceForGrapheme('ক', 'banglaword')
    );
    expect(normalizeKeyboardLayout('not-a-layout')).toBe('banglaword');
  });

  it('resolves Latin letters to their physical keys', () => {
    expect(formatKeySequence(getKeySequenceForGrapheme('a', 'banglaword'))).toBe('a');
    expect(formatKeySequence(getKeySequenceForGrapheme('Z', 'banglaword'))).toBe('Shift + z');
  });

  it('resolves digits through the shared number row', () => {
    // No layout config declares a number row, but the drills already teach these
    // as physical Digit keys, so the hint must not come up empty for them.
    const seven = getKeySequenceForGrapheme('7', 'banglaword');
    expect(seven).toHaveLength(1);
    expect(seven[0].keyCode).toBe('Digit7');
    expect(formatKeySequence(getKeySequenceForGrapheme('7', 'avro'))).toBe('7');
  });

  it('normalizes a decomposed nukta before resolving', () => {
    // ড + ় must give the same hint as the precomposed ড়, or the same visible
    // character would get two different hints depending on how it was stored.
    const decomposed = '\u09A1\u09BC';
    expect(formatKeySequence(getKeySequenceForGrapheme(decomposed, 'banglaword'))).toBe(
      formatKeySequence(getKeySequenceForGrapheme('\u09DC', 'banglaword'))
    );
  });

  it('gives the same hint for both spellings of the vocalic r sign', () => {
    // U+09D2 and U+09C3 render as the same sign. If the hint differed between
    // them, the same word would teach two different key sequences.
    const short = formatKeySequence(getKeySequenceForGrapheme('\u09C3', 'banglaword'));
    const long = formatKeySequence(getKeySequenceForGrapheme('\u09D2', 'banglaword'));
    expect(short).toBe(long);
    expect(short).not.toBe('');
  });

  it('reports finger and hand for every step, so the keyboard can highlight it', () => {
    for (const step of getKeySequenceForGrapheme('ক্রা', 'banglaword')) {
      expect(step.fingerPosition).toBeGreaterThanOrEqual(1);
      expect(step.fingerPosition).toBeLessThanOrEqual(10);
      expect(['left', 'right']).toContain(step.hand);
      expect(step.bengaliFingerLabel).not.toBe('');
      expect(step.keyCode).toMatch(/^[A-Za-z]/);
    }
  });
});

describe('key hints agree with the on-screen keyboard', () => {
  it.each(LAYOUTS)('%s: every hinted key is printed on that layout', (layout) => {
    const printed = printedKeys(layout);

    for (const grapheme of COMMON_GRAPHEMES) {
      for (const step of getKeySequenceForGrapheme(grapheme, layout)) {
        expect({
          layout,
          grapheme,
          key: step.key,
          printed: printed.has(step.key),
        }).toEqual({ layout, grapheme, key: step.key, printed: true });
      }
    }
  });

  it.each(LAYOUTS)('%s: resolves exactly the letters its table can produce', (layout) => {
    const expected = KNOWN_GAPS[layout] ?? [];
    const unresolved = ALL_LETTERS.filter(
      (g) =>
        !expected.includes(g) &&
        !NEVER_TYPED.includes(g) &&
        getKeySequenceForGrapheme(g, layout).length === 0
    );
    expect({ layout, unresolved }).toEqual({ layout, unresolved: [] });
  });

  it.each(LAYOUTS)('%s: has no key for exactly the documented gaps', (layout) => {
    const unresolved = ALL_LETTERS.filter(
      (g) => getKeySequenceForGrapheme(g, layout).length === 0 && !NEVER_TYPED.includes(g)
    );
    expect({ layout, unresolved }).toEqual({ layout, unresolved: KNOWN_GAPS[layout] ?? [] });
  });

  it('leaves nothing in a real sentence unexplained by a documented gap', () => {
    // বাংলাদেশ স্বাধীন হয়েছে।
    //
    // Probhat's table has no key for দ or ধ, both of which appear here, so this
    // does not assert full coverage. It asserts the weaker and more useful thing:
    // every grapheme that fails to resolve fails for a reason already written
    // down. A new unexplained gap fails the test.
    const sentence = 'বাংলাদেশ স্বাধীন হয়েছে।';
    const graphemes = bengaliSegmenter.segmentString(sentence).filter((g) => g.trim());

    for (const layout of LAYOUTS) {
      const gaps = KNOWN_GAPS[layout] ?? [];
      const unexplained = graphemes.filter(
        (g) =>
          getKeySequenceForGrapheme(g, layout).length === 0 &&
          ![...g].some((c) => gaps.includes(c))
      );
      expect({ layout, unexplained }).toEqual({ layout, unexplained: [] });
    }
  });
});

describe('getTypingHint', () => {
  it('formats one label per keystroke', () => {
    expect(getTypingHint('কা', 'banglaword')).toEqual(['k', 'a']);
    // খ is Shift+k on BanglaWord; ড় is Shift+r.
    expect(getTypingHint('খ', 'banglaword')).toEqual(['Shift + k']);
  });

  it('marks shifted keys explicitly rather than with a bare capital', () => {
    expect(getTypingHint('ড়', 'banglaword')).toEqual(['Shift + r']);
  });

  it('returns an empty list rather than a placeholder for an unresolvable grapheme', () => {
    expect(getTypingHint('', 'banglaword')).toEqual([]);
    expect(getTypingHint('ৃ', 'avro')).toEqual([]);
  });

  it('matches the structured resolver for every layout and grapheme', () => {
    for (const layout of LAYOUTS) {
      for (const grapheme of COMMON_GRAPHEMES) {
        expect({ layout, grapheme, hint: getTypingHint(grapheme, layout) }).toEqual({
          layout,
          grapheme,
          hint: getKeySequenceForGrapheme(grapheme, layout).map((s) =>
            s.needsShift ? `Shift + ${s.key}` : s.key
          ),
        });
      }
    }
  });
});
