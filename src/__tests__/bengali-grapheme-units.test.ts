/**
 * Bengali grapheme units — keystroke composer, drill spacing, prefix/hint
 * helpers, conjunct parsing, render model and the clip-path engine.
 *
 * These pin the pure-function contracts underneath the typing UI: the
 * BanglaWord dead-key composition, the per-consonant clip ratios, and the
 * render-model step tracking. The clip matrix loops every consonant against
 * every mark so the calibrated ratio switches stay covered.
 */

import {
  bengaliSegmenter,
  buildConjunctSimulationSteps,
  buildGraphemeRenderModel,
  composeBengaliKeystroke,
  ensureSpacedDrillItems,
  extractTypingUnits,
  getBengaliGraphemeClip,
  getNextExpectedKeyChar,
  getUpcomingIndependentVowel,
  isValidBengaliTypingPrefix,
  parseConjunct,
  splitConjunctByHalant,
} from '../lib/bengali-grapheme';

const ZWJ = String.fromCharCode(0x200d);
const ZWNJ = String.fromCharCode(0x200c);

describe('composeBengaliKeystroke (BanglaWord dead-key composition)', () => {
  test('empty keystroke normalizes the buffer', () => {
    expect(composeBengaliKeystroke('ক', '')).toBe('ক');
  });

  test('hasanta + kar composes an independent vowel', () => {
    expect(composeBengaliKeystroke('্', 'া')).toBe('আ');
    expect(composeBengaliKeystroke('্', 'ি')).toBe('ই');
    expect(composeBengaliKeystroke('ক্', 'ি')).toBe('কই');
  });

  test('hasanta + independent vowel passes the vowel through', () => {
    expect(composeBengaliKeystroke('্', 'অ')).toBe('অ');
  });

  test('short vowel + matching kar extends to the long vowel', () => {
    expect(composeBengaliKeystroke('ই', 'ি')).toBe('ঈ');
    expect(composeBengaliKeystroke('উ', 'ূ')).toBe('ঊ');
    expect(composeBengaliKeystroke('এ', 'ৈ')).toBe('ঐ');
  });

  test('short vowel + unrelated char falls through to plain append', () => {
    expect(composeBengaliKeystroke('ই', 'ক')).toBe('ইক');
    expect(composeBengaliKeystroke('ক', 'ল')).toBe('কল');
    expect(composeBengaliKeystroke('', 'ক')).toBe('ক');
  });
});

describe('ensureSpacedDrillItems', () => {
  test('empty input stays empty', () => {
    expect(ensureSpacedDrillItems([])).toEqual([]);
  });

  test('phrases with internal spaces pass through untouched', () => {
    const items = ['আমার সোনার বাংলা'];
    expect(ensureSpacedDrillItems(items)).toBe(items);
  });

  test('already-spaced items pass through untouched', () => {
    expect(ensureSpacedDrillItems(['ক', ' ', 'খ', 'গ', 'ঘ'])).toEqual([
      'ক',
      ' ',
      'খ',
      'গ',
      'ঘ',
    ]);
  });

  test('inserts a space every 3 items without leading/trailing gaps', () => {
    expect(ensureSpacedDrillItems(['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'])).toEqual([
      'ক',
      'খ',
      'গ',
      ' ',
      'ঘ',
      'ঙ',
      'চ',
    ]);
  });

  test('collapses spaces and drops a trailing space', () => {
    expect(
      ensureSpacedDrillItems(['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'ঝ', ' ']),
    ).toEqual(['ক', 'খ', 'গ', ' ', 'ঘ', 'ঙ', 'চ', ' ', 'ছ', 'ঝ']);
    expect(
      ensureSpacedDrillItems([
        'ক',
        ' ',
        ' ',
        'খ',
        'গ',
        'ঘ',
        'ঙ',
        'চ',
        'ছ',
        'ঝ',
        'ঞ',
        'ট',
      ]).filter((it) => it === ' ').length,
    ).toBeLessThanOrEqual(4);
  });

  test('maxInterval clamps into the 2–4 range', () => {
    expect(ensureSpacedDrillItems(['ক', 'খ', 'গ', 'ঘ'], 0)).toEqual([
      'ক',
      'খ',
      ' ',
      'গ',
      'ঘ',
    ]);
  });
});

describe('prefix and hint helpers', () => {
  test('isValidBengaliTypingPrefix handles empty and plain prefixes', () => {
    expect(isValidBengaliTypingPrefix('', 'কল')).toBe(true);
    expect(isValidBengaliTypingPrefix('ক', '')).toBe(false);
    expect(isValidBengaliTypingPrefix('ক', 'কল')).toBe(true);
    expect(isValidBengaliTypingPrefix('খ', 'কল')).toBe(false);
  });

  test('pending hasanta accepts the upcoming independent vowel', () => {
    expect(isValidBengaliTypingPrefix('পুঁ্', 'পুঁই')).toBe(true);
    expect(isValidBengaliTypingPrefix('ক্', 'কল')).toBe(false);
  });

  test('getUpcomingIndependentVowel resolves pending and direct vowels', () => {
    expect(getUpcomingIndependentVowel('x', '')).toBeNull();
    expect(getUpcomingIndependentVowel('্', 'আ')?.vowel).toBe('আ');
    expect(getUpcomingIndependentVowel('', 'আ')?.vowel).toBe('আ');
    expect(getUpcomingIndependentVowel('ক', 'খ')).toBeNull();
  });

  test('getNextExpectedKeyChar steps through the target', () => {
    expect(getNextExpectedKeyChar('x', '')).toBe('');
    expect(getNextExpectedKeyChar('ক', 'ক')).toBe('');
    expect(getNextExpectedKeyChar('ক', 'কল')).toBe('ল');
    expect(getNextExpectedKeyChar('', 'আ', true)).toBe('্');
    expect(getNextExpectedKeyChar('', 'আ', false)).toBe('আ');
    expect(getNextExpectedKeyChar('পুঁ্', 'পুঁই')).toBe('ি');
    expect(getNextExpectedKeyChar('খ', 'ক')).toBe('ক');
  });
});

describe('conjunct parsing', () => {
  test('parseConjunct decomposes a triple conjunct', () => {
    expect(parseConjunct('ক্ষ্ম')).toEqual({
      consonants: ['ক', 'ষ', 'ম'],
      halants: [1, 1],
      trailingKar: null,
      hasZWJ: false,
      hasZWNJ: false,
    });
  });

  test('parseConjunct records a trailing kar', () => {
    expect(parseConjunct('ক্কা')).toEqual({
      consonants: ['ক', 'ক'],
      halants: [1],
      trailingKar: 'া',
      hasZWJ: false,
      hasZWNJ: false,
    });
  });

  test('parseConjunct keeps (never strips) nukta and shaping controls', () => {
    expect(parseConjunct('ড়')).toEqual({
      consonants: ['ড'],
      halants: [],
      trailingKar: null,
      hasZWJ: false,
      hasZWNJ: false,
    });
    expect(parseConjunct('ক' + '্' + ZWJ + 'ষ')).toEqual({
      consonants: ['ক', 'ষ'],
      halants: [1],
      trailingKar: null,
      hasZWJ: true,
      hasZWNJ: false,
    });
    expect(parseConjunct('ক' + '্' + ZWNJ + 'ষ')).toEqual({
      consonants: ['ক', 'ষ'],
      halants: [1],
      trailingKar: null,
      hasZWJ: false,
      hasZWNJ: true,
    });
  });

  test('splitConjunctByHalant keeps grapheme boundaries', () => {
    expect(splitConjunctByHalant('ক্ষ')).toEqual(['ক্ষ']);
    expect(splitConjunctByHalant('ক্ষা')).toEqual(['ক্ষা']);
  });

  test('extractTypingUnits splits a cluster into typed code units', () => {
    expect(extractTypingUnits('টি')).toEqual(['ট', 'ি']);
    expect(extractTypingUnits('ক্ষ্ম')).toEqual(['ক', '্', 'ষ', '্', 'ম']);
  });

  test('graphemeSubstring slices by cluster, not code unit', () => {
    expect(bengaliSegmenter.graphemeSubstring('ক্ষ্মক', 1, 1)).toBe('ক');
  });
});

describe('conjunct simulation steps and render model', () => {
  test('2-consonant formula tracks typed/active/pending steps', () => {
    const fresh = buildConjunctSimulationSteps('ক্ত', '');
    expect(fresh.map((s) => s.label)).toEqual(['ক', 'ক্', 'ত']);
    expect(fresh[0].active).toBe(true);
    expect(fresh.every((s) => !s.completed)).toBe(true);

    const partial = buildConjunctSimulationSteps('ক্ত', 'ক');
    expect(partial[0].completed).toBe(true);
    expect(partial[1].active).toBe(true);

    const done = buildConjunctSimulationSteps('ক্ত', 'ক্ত');
    expect(done.every((s) => s.completed)).toBe(true);
  });

  test('kar-tailed clusters use unit-by-unit tracking', () => {
    const steps = buildConjunctSimulationSteps('ব্রা', 'ব্');
    expect(steps.map((s) => s.label)).toEqual(['ব', '্', 'র', 'া']);
    expect(steps[0].completed).toBe(true);
    expect(steps[1].completed).toBe(true);
    expect(steps[2].active).toBe(true);
  });

  test('render model classifies kind and tracks part states', () => {
    const simple = buildGraphemeRenderModel('ক', '');
    expect(simple.kind).toBe('simple');
    expect(simple.totalSteps).toBe(1);
    expect(simple.conjunctSteps).toBeUndefined();

    const kar = buildGraphemeRenderModel('কা', '');
    expect(kar.kind).toBe('kar');
    expect(kar.parts).toHaveLength(2);

    const conj = buildGraphemeRenderModel('ক্ত', 'ক');
    expect(conj.kind).toBe('conjunct');
    expect(conj.parts.map((p) => p.state)).toEqual([
      'typed',
      'current',
      'pending',
    ]);
    expect(conj.currentStep).toBe(1);
    expect(conj.totalSteps).toBe(3);

    const kssa = buildGraphemeRenderModel('ক্ষ', '');
    expect(kssa.kind).toBe('conjunct');
    expect(kssa.specialHint).toContain('q');
  });

  test('pending-hasanta flag only shows mid-conjunct', () => {
    expect(buildGraphemeRenderModel('স্ব', 'স্').hasPendingHalant).toBe(true);
    expect(buildGraphemeRenderModel('স্ব', 'স্ব').hasPendingHalant).toBe(false);
    expect(buildGraphemeRenderModel('ক', 'ক').hasPendingHalant).toBe(false);
  });
});

describe('getBengaliGraphemeClip', () => {
  test('step boundaries collapse to full hide/reveal', () => {
    expect(getBengaliGraphemeClip('ক', 0, 3)).toBe('inset(100%)');
    expect(getBengaliGraphemeClip('ক', 3, 3)).toBe('inset(0)');
    expect(getBengaliGraphemeClip('ক', 9, 3)).toBe('inset(0)');
  });

  test('multi-cluster words reveal left-to-right by proportion', () => {
    expect(getBengaliGraphemeClip('কক', 1, 2)).toBe(
      'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
    );
  });

  test('aa-kar with chandrabindu clips consonant, kar and top mark', () => {
    expect(getBengaliGraphemeClip('কাঁ', 1, 3)).toBe(
      'polygon(0 12%, 75% 12%, 75% 100%, 0 100%)',
    );
  });

  test('below-base vowel with chandrabindu excludes top and bottom', () => {
    expect(getBengaliGraphemeClip('কুঁ', 1, 3)).toBe(
      'polygon(0 12%, 100% 12%, 100% 68%, 0 68%)',
    );
  });

  test('pre-base e-kar with chandrabindu starts right of the mark', () => {
    expect(getBengaliGraphemeClip('কেঁ', 1, 3)).toBe(
      'polygon(33% 12%, 100% 12%, 100% 100%, 33% 100%)',
    );
  });

  test('below-base vowel with visarga clips consonant and mark', () => {
    expect(getBengaliGraphemeClip('দুঃ', 1, 3)).toBe(
      'polygon(0 0, 58% 0, 58% 68%, 0 68%)',
    );
  });

  test('aa-kar with anusvara uses the fixed narrow/wide stops', () => {
    expect(getBengaliGraphemeClip('কাং', 1, 3)).toBe(
      'polygon(0 0, 42% 0, 42% 100%, 0 100%)',
    );
    expect(getBengaliGraphemeClip('কাং', 2, 3)).toBe(
      'polygon(0 0, 74% 0, 74% 100%, 0 100%)',
    );
  });

  test('below-base mark alone and anusvara alone clip by ratio', () => {
    expect(getBengaliGraphemeClip('কু', 1, 2)).toBe(
      'polygon(0 0, 100% 0, 100% 68%, 0 68%)',
    );
    expect(getBengaliGraphemeClip('কং', 1, 2)).toBe(
      'polygon(0 0, 66% 0, 66% 100%, 0 100%)',
    );
    expect(getBengaliGraphemeClip('কে', 1, 2)).toBe(
      'polygon(33% 0, 100% 0, 100% 100%, 33% 100%)',
    );
    expect(getBengaliGraphemeClip('কি', 1, 2)).toBe(
      'polygon(24% 12%, 100% 12%, 100% 100%, 24% 100%)',
    );
    expect(getBengaliGraphemeClip('কঁ', 1, 2)).toBe(
      'polygon(0 12%, 100% 12%, 100% 100%, 0 100%)',
    );
  });

  test('every consonant × mark clip is a well-formed polygon', () => {
    const consonants = Array.from(
      'কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়',
    );
    const marks = ['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ', 'ং', 'ঃ', 'ঁ'];
    for (const base of consonants) {
      for (const mark of marks) {
        for (const step of [1, 2]) {
          const clip = getBengaliGraphemeClip(base + mark, step, 3);
          expect(clip).toMatch(/^(polygon\(|inset\()/);
          expect(clip).not.toMatch(/NaN|undefined/);
        }
      }
    }
  });

  test('conjunct clips stay well-formed across steps', () => {
    for (const cluster of ['স্ব', 'স্বা', 'শ্রে', 'ক্ষ', 'প্র', 'স্ত্র']) {
      for (const step of [1, 2, 3]) {
        const clip = getBengaliGraphemeClip(cluster, step, 4);
        expect(clip).toMatch(/^(polygon\(|inset\()/);
        expect(clip).not.toMatch(/NaN|undefined/);
      }
    }
  });
});
