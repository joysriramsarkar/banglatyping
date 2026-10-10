/**
 * Grapheme segmenter parity and regression matrix.
 *
 * Two guarantees:
 *   1. Parity — the hand-written fallback (used when Intl.Segmenter is missing)
 *      produces exactly the same clusters as the platform segmenter across a
 *      systematic Unicode sweep. This is why the fallback exists.
 *   2. Regression — explicit expected clusters for the categories Bengali
 *      actually cares about (conjuncts, reph, kar, nukta/atomic letters, ZWJ/
 *      ZWNJ, anusvara/visarga, punctuation, digits and IME-composed vowels), so
 *      the intent is pinned even where a runtime lacks Intl.Segmenter.
 */

import {
  bengaliSegmenter,
  segmentBengaliGraphemesFallback,
  hasNativeSegmenter,
  composeBengaliKeystroke,
  normalizeBengaliString,
} from '@/lib/bengali-grapheme';

const CONSONANTS = 'কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহৎড়ঢ়য়'.split('');
const VOWEL_SIGNS = 'ািীুূৃেৈোৌ'.split('');

function buildSweep(): string[] {
  const fixtures = new Set<string>();

  // Every Bengali codepoint in the block as a standalone, as a mark on ক, and
  // after ক্ / ক্‌ with joiners.
  for (let cp = 0x0980; cp <= 0x09ff; cp++) {
    const ch = String.fromCodePoint(cp);
    fixtures.add(ch);
    fixtures.add('ক' + ch);
    fixtures.add(ch + 'ক');
    fixtures.add('ক\u09CD' + ch);
    fixtures.add('ক\u09CD\u200D' + ch);
    fixtures.add('ক\u09CD\u200C' + ch);
  }

  // Consonant × (vowel sign | conjunct | nukta) combinations.
  for (const c of CONSONANTS) {
    fixtures.add(c);
    for (const v of VOWEL_SIGNS) fixtures.add(c + v);
    for (const c2 of CONSONANTS) fixtures.add(c + '\u09CD' + c2);
    fixtures.add(c + '\u09BC');
  }

  return [...fixtures];
}

describe('grapheme segmenter parity (fallback vs Intl.Segmenter)', () => {
  const sweep = buildSweep();

  test('the sweep is broad enough to be meaningful', () => {
    expect(sweep.length).toBeGreaterThan(2000);
  });

  test('fallback matches the native segmenter across the Unicode sweep', () => {
    if (!hasNativeSegmenter) {
      // The fallback *is* the implementation here; nothing to compare against.
      expect(segmentBengaliGraphemesFallback('ক্ষ্ম').length).toBe(1);
      return;
    }

    const native = new Intl.Segmenter('bn-IN', { granularity: 'grapheme' });
    const nativeSeg = (s: string) =>
      Array.from(native.segment(s), (x: Intl.SegmentData) => x.segment);

    const mismatches: Array<{ fixture: string; native: string[]; fallback: string[] }> = [];
    for (const fixture of sweep) {
      const a = nativeSeg(fixture);
      const b = segmentBengaliGraphemesFallback(fixture);
      if (a.join('\u0001') !== b.join('\u0001')) {
        mismatches.push({ fixture, native: a, fallback: b });
      }
    }

    expect(mismatches.slice(0, 20)).toEqual([]);
  });

  test('the app-wide segmenter uses whatever backing the runtime provides', () => {
    // Same output whichever path bengaliSegmenter chose.
    expect(bengaliSegmenter.segmentString('ক্ষ্ম')).toEqual(
      segmentBengaliGraphemesFallback('ক্ষ্ম')
    );
  });
});

describe('grapheme regression fixtures', () => {
  it('keeps conjuncts as a single cluster', () => {
    expect(segmentBengaliGraphemesFallback('ক্ষ')).toEqual(['ক্ষ']);
    expect(segmentBengaliGraphemesFallback('ক্ষ্ম')).toEqual(['ক্ষ্ম']);
    expect(segmentBengaliGraphemesFallback('ক্ত')).toEqual(['ক্ত']);
    expect(segmentBengaliGraphemesFallback('প্র')).toEqual(['প্র']);
    expect(segmentBengaliGraphemesFallback('শ্র')).toEqual(['শ্র']);
  });

  it('keeps reph and vowel-sign clusters together', () => {
    expect(segmentBengaliGraphemesFallback('র্ক')).toEqual(['র্ক']);
    expect(segmentBengaliGraphemesFallback('প্রি')).toEqual(['প্রি']);
    expect(segmentBengaliGraphemesFallback('স্বা')).toEqual(['স্বা']);
    expect(segmentBengaliGraphemesFallback('কি')).toEqual(['কি']);
    expect(segmentBengaliGraphemesFallback('কে')).toEqual(['কে']);
    expect(segmentBengaliGraphemesFallback('কো')).toEqual(['কো']);
  });

  it('treats ড় / ঢ় / য় nukta forms as one cluster', () => {
    expect(segmentBengaliGraphemesFallback('\u09A1\u09BC')).toEqual(['\u09A1\u09BC']);
    expect(segmentBengaliGraphemesFallback('ড়')).toEqual(['ড়']);
    expect(segmentBengaliGraphemesFallback('য়')).toEqual(['য়']);
  });

  it('honours ZWJ (keeps the link) and ZWNJ (breaks it)', () => {
    expect(segmentBengaliGraphemesFallback('ক\u09CD\u200Dষ')).toEqual(['ক\u09CD\u200Dষ']);
    expect(segmentBengaliGraphemesFallback('ক\u09CD\u200Cষ')).toEqual(['ক\u09CD\u200C', 'ষ']);
  });

  it('separates anusvara/visarga correctly', () => {
    expect(segmentBengaliGraphemesFallback('রং')).toEqual(['রং']);
    expect(segmentBengaliGraphemesFallback('দুঃখ')).toEqual(['দুঃ', 'খ']);
  });

  it('handles punctuation, spaces and Bengali digits as their own clusters', () => {
    expect(segmentBengaliGraphemesFallback('ক।')).toEqual(['ক', '।']);
    expect(segmentBengaliGraphemesFallback('।')).toEqual(['।']);
    expect(segmentBengaliGraphemesFallback('ক খ')).toEqual(['ক', ' ', 'খ']);
    expect(segmentBengaliGraphemesFallback('০১২৩৪৫৬৭৮৯')).toEqual(
      '০১২৩৪৫৬৭৮৯'.split('')
    );
  });

  it('segments IME-composed output into the expected clusters', () => {
    // BanglaWord: dead-key '্' + kar 'া' composes to the independent vowel 'আ'.
    const composed = composeBengaliKeystroke('\u09CD', 'া');
    expect(normalizeBengaliString(composed)).toBe('আ');
    expect(segmentBengaliGraphemesFallback(composed)).toEqual(['আ']);

    // Trailing hasanta is a combining mark; both paths treat it as one cluster.
    const trailing = 'কল\u09CD';
    const seg = segmentBengaliGraphemesFallback(trailing);
    // Match the platform segmenter behavior: trailing hasanta may attach.
    const native = new Intl.Segmenter('bn-IN', { granularity: 'grapheme' });
    const nseg = Array.from(native.segment(trailing), (x: Intl.SegmentData) => x.segment);
    expect(seg).toEqual(nseg);
  });
});
