/**
 * Grapheme parity property test — deterministic sweep (no fast-check).
 *
 * fast-check is NOT a dependency, so this file uses a deterministic sweep
 * instead of random generation: every Bengali code point (U+0980–U+09FF)
 * sampled in six positions (alone, ক+X, X+ক, ক+্+X, ক+্+ZWJ+X, ক+্+ZWNJ+X),
 * consonant-pair/triple samples, nukta and kar combinations, and the full
 * conjunct list. It asserts fallbackSegment == nativeSegment everywhere
 * GB9c agrees, with divergences governed by a STABLE allowlist below.
 *
 * Allowlist protocol: if Intl.Segmenter ever disagrees on a new fixture,
 * this test fails showing the new divergence. Either fix the fallback or
 * append the fixture key to KNOWN_DIVERGENCES with a comment explaining
 * WHY the divergence is accepted — never silently widen it. The assertion
 * is exact equality of the sorted divergence set, so removals fail too.
 */

import {
  fallbackSegment,
  nativeSegment,
  segmentGraphemes,
  segmentCached,
  clearSegmentCache,
  segmentCacheSize,
  hasNativeSegmenter,
} from '@/lib/bengali-grapheme';

const CONSONANTS = 'কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহৎড়ঢ়য়'.split('');
const ZWJ = String.fromCharCode(0x200d);
const ZWNJ = String.fromCharCode(0x200c);
const HALANT = '্';

const CONJUNCT_LIST = [
  'ক্ষ', 'জ্ঞ', 'ত্র', 'শ্র', 'ন্ত', 'ক্ত', 'স্ত',
  'স্প', 'স্ক', 'স্থ', 'স্ন', 'স্ম', 'স্ব',
  'ঙ্ক', 'ঙ্খ', 'ঙ্গ', 'ঞ্চ', 'ঞ্ছ', 'ঞ্জ',
  'ণ্ট', 'ণ্ঠ', 'ণ্ড', 'ন্ট', 'ন্ঠ', 'ন্ড', 'ন্দ', 'ন্ধ', 'ন্ন',
  'ম্প', 'ম্ব', 'ম্ভ', 'ম্ম', 'প্ট', 'প্ত', 'প্প',
  'ক্ক', 'ক্ট', 'ক্ল', 'ক্র', 'গ্র', 'ঘ্র',
  'চ্চ', 'চ্ছ', 'জ্জ', 'ট্ট', 'ড্ড',
  'দ্দ', 'দ্ধ', 'দ্ব', 'দ্ভ', 'দ্ম', 'দ্র', 'ধ্ব',
  'প্র', 'প্ল', 'ফ্ল', 'ব্র', 'ভ্র', 'ম্ন',
  'ল্ক', 'ল্ট', 'ল্প', 'ষ্ক', 'ষ্ট', 'ষ্ণ', 'ষ্প', 'ষ্ম',
  'হ্ন', 'হ্ম', 'হ্র', 'হ্ল',
  'ক্ষ্ম', 'র্স্প', 'ন্ত্র', 'স্ত্র',
  'র' + HALANT + ZWJ + 'য',
  'র' + ZWJ + HALANT + 'য',
  'ক' + HALANT + ZWJ + 'ষ',
  'ক' + HALANT + ZWNJ + 'ষ',
  'য' + '়', 'ড' + '়', 'ঢ' + '়', 'য়', 'ড়', 'ঢ়',
  'কো', 'কৌ', 'কি', 'কী', 'কে', 'কৈ',
];

function buildSweep(): string[] {
  const fixtures = new Set<string>();
  for (let cp = 0x0980; cp <= 0x09ff; cp++) {
    const ch = String.fromCodePoint(cp);
    fixtures.add(ch);
    fixtures.add('ক' + ch);
    fixtures.add(ch + 'ক');
    fixtures.add('ক' + HALANT + ch);
    fixtures.add('ক' + HALANT + ZWJ + ch);
    fixtures.add('ক' + HALANT + ZWNJ + ch);
  }
  for (let i = 0; i < CONSONANTS.length; i++) {
    const c1 = CONSONANTS[i];
    for (let j = 0; j < CONSONANTS.length; j += 3) {
      const c2 = CONSONANTS[j];
      fixtures.add(c1 + HALANT + c2);
      fixtures.add(c1 + HALANT + c2 + 'া');
      fixtures.add(c1 + HALANT + c2 + 'ি');
      if ((i + j) % 4 === 0) {
        const c3 = CONSONANTS[(i * 7 + j * 3) % CONSONANTS.length];
        fixtures.add(c1 + HALANT + c2 + HALANT + c3);
      }
    }
  }
  for (const c of CONJUNCT_LIST) fixtures.add(c);
  return [...fixtures];
}

/**
 * Known fallback-vs-native divergences, as JSON fixture keys.
 * EMPTY as of the last full sweep (2517 fixtures, 0 divergences, Node 22
 * ICU): the hand-rolled GB9/GB9c walker agrees with Intl.Segmenter
 * everywhere sampled. See the protocol above before adding entries.
 */
const KNOWN_DIVERGENCES: string[] = [];

describe('grapheme parity property (fallback vs native, deterministic sweep)', () => {
  const sweep = buildSweep();

  it('covers the Bengali block and the conjunct list', () => {
    expect(sweep.length).toBeGreaterThan(2000);
  });

  it('divergence set is STABLE — exactly the allowlist, nothing more or less', () => {
    if (!hasNativeSegmenter) {
      // No native segmenter here: nativeSegment IS the fallback, so the
      // divergence set is trivially empty and must equal the allowlist.
      expect(KNOWN_DIVERGENCES).toEqual([]);
      return;
    }
    const diverged: string[] = [];
    for (const fixture of sweep) {
      const a = nativeSegment(fixture);
      const b = fallbackSegment(fixture);
      if (a.join('\u0001') !== b.join('\u0001')) diverged.push(JSON.stringify(fixture));
    }
    diverged.sort();
    expect(diverged).toEqual([...KNOWN_DIVERGENCES].sort());
  });

  it('default segmentGraphemes is the deterministic fallback path', () => {
    expect(segmentGraphemes('ক্ষ্ম')).toEqual(fallbackSegment('ক্ষ্ম'));
    expect(segmentGraphemes('র' + HALANT + ZWJ + 'য')).toEqual(
      fallbackSegment('র' + HALANT + ZWJ + 'য'),
    );
  });
});

describe('segmentation cache (perf)', () => {
  beforeEach(() => {
    clearSegmentCache();
  });

  it('returns the same array reference on a cache hit', () => {
    const first = segmentCached('ক্ষ্ম');
    const second = segmentCached('ক্ষ্ম');
    expect(second).toBe(first);
  });

  it('caps at 200 entries with FIFO eviction of the oldest', () => {
    const firstKey = 'ক_0_প্রথম';
    const firstRef = segmentCached(firstKey);
    for (let i = 0; i < 250; i++) {
      segmentCached(`ক_ক্যাশ_${i}`);
    }
    expect(segmentCacheSize()).toBeLessThanOrEqual(200);
    // The oldest entry was evicted, so re-segmenting allocates a new array.
    expect(segmentCached(firstKey)).not.toBe(firstRef);
    // …while a recent entry is still a cache hit.
    const recentRef = segmentCached('ক_ক্যাশ_249');
    expect(segmentCached('ক_ক্যাশ_249')).toBe(recentRef);
  });
});
