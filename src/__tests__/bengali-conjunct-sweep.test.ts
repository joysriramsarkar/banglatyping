/**
 * Bengali Conjunct Sweep — grapheme integrity for যুক্তাক্ষর.
 *
 * Every conjunct below must segment as exactly ONE grapheme cluster. If any
 * of these split, per-grapheme scoring, the cursor map and the hint engine
 * all disagree about where one "letter" ends, so this sweep pins the
 * invariant across ~75 common conjuncts plus the tricky ZWJ / nukta cases.
 */

import {
  bengaliSegmenter,
  buildGraphemeRenderModel,
  normalizeBengaliString,
} from '../lib/bengali-grapheme';

describe('conjunct sweep: common যুক্তাক্ষর stay single clusters', () => {
  it('segments ক্ষ্ম (triple conjunct) as one cluster', () => {
    // ক + ্ + ষ + ্ + ম
    expect(bengaliSegmenter.graphemeLength('ক্ষ্ম')).toBe(1);
    expect(bengaliSegmenter.segmentString('ক্ষ্ম')).toEqual(['ক্ষ্ম']);
  });

  it('segments র্স্প (reph-led triple conjunct) as one cluster', () => {
    // র + ্ + স + ্ + প
    expect(bengaliSegmenter.graphemeLength('র্স্প')).toBe(1);
  });

  it('keeps the ZWJ form below as one cluster at the segmentation layer', () => {
    // ra + hasant + ZWJ + ya — the ZWJ is shaping-significant, so
    // segmentation (unlike comparison) must preserve it and still not split.
    const zwjForm = 'র' + '্' + String.fromCharCode(0x200D) + 'য';
    expect(Array.from(zwjForm)).toEqual(['র', '্', String.fromCharCode(0x200D), 'য']);
    expect(bengaliSegmenter.graphemeLength(zwjForm)).toBe(1);
  });

  it('folds nukta variants onto their atomic letters for comparison', () => {
    // NFC alone does NOT compose these (U+09DF has no canonical
    // decomposition), which is why the explicit folds exist.
    expect('য\u09BC'.normalize('NFC')).not.toBe('য়');
    expect(normalizeBengaliString('য\u09BC')).toBe('য়');
    expect(normalizeBengaliString('ড\u09BC')).toBe('ড়');
    expect(normalizeBengaliString('ঢ\u09BC')).toBe('ঢ়');
    // Atomic forms are already stable.
    expect(normalizeBengaliString('য়')).toBe('য়');
    expect(normalizeBengaliString('ড়')).toBe('ড়');
    expect(normalizeBengaliString('ঢ়')).toBe('ঢ়');
  });

  it('strips ZWJ/ZWNJ for comparison so shaping controls never score', () => {
    expect(normalizeBengaliString('ক\u200D')).toBe('ক');
    expect(normalizeBengaliString('ক\u200C')).toBe('ক');
    expect(normalizeBengaliString('র\u09CD\u200D\u09AF')).toBe(
      normalizeBengaliString('র\u09CD\u09AF'),
    );
  });

  it.each([
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
  ])('segments %s as a single cluster', (conjunct) => {
    expect(bengaliSegmenter.segmentString(conjunct)).toHaveLength(1);
  });

  it('folds split circumfix spellings onto their precomposed kars (ো≡ে+া; ৌ is atomic)', () => {
    // ো (U+09CB) has a canonical decomposition ে+া, so NFC composes the split
    // sequence — pinned so a keyboard emitting ে then া still matches a
    // precomposed ো target. ৌ (U+09CC) has NO canonical decomposition, so
    // ে+ৈ stays split under NFC; it is pinned atomic-and-stable instead.
    expect(('ে' + 'া').normalize('NFC')).toBe('ো');
    expect(normalizeBengaliString('ে' + 'া')).toBe('ো');
    expect(normalizeBengaliString('ো')).toBe('ো');
    expect(('ে' + 'ৈ').normalize('NFC')).not.toBe('ৌ');
    expect(normalizeBengaliString('ৌ')).toBe('ৌ');
    expect('ৌ'.normalize('NFC')).toBe('ৌ');
  });

  it('segments explicit ya-phala র‍্য (র+্+ZWJ+য) as one cluster', () => {
    // Canonical order: hasanta, THEN ZWJ, then য. The ZWJ is what forces the
    // explicit য-ফলা instead of the default ligature.
    const explicitYaPhala = 'র' + '্' + String.fromCharCode(0x200D) + 'য';
    expect(bengaliSegmenter.segmentString(explicitYaPhala)).toEqual([explicitYaPhala]);
    expect(bengaliSegmenter.graphemeLength(explicitYaPhala)).toBe(1);
  });

  it('typing hint for র‍্য names the ZWJ position in the key order', () => {
    const model = buildGraphemeRenderModel('র' + '্' + String.fromCharCode(0x200D) + 'য', '');
    expect(model.kind).toBe('conjunct');
    expect(model.specialHint).toContain('ZWJ');
    expect(model.specialHint).toContain('হসন্তের পরে');
  });
});
