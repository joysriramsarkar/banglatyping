/**
 * Comprehensive Bengali Unicode Fixtures Test Suite
 *
 * Exercises Unicode grapheme clustering, segmentation, conjunct decomposition,
 * and normalization across all core linguistic categories in Bengali (পরিকল্পনা.md #10, #11, #12, #44.2).
 */

import {
  BengaliSegmenter,
  normalizeBengaliString,
  isBengaliVowel,
  isBengaliConsonant,
  isBengaliVowelSign,
  isHalant,
  isNukta,
  isConjunct,
  isComplexConjunct,
  isKarCluster,
  buildConjunctSimulationSteps,
  buildGraphemeRenderModel,
} from '@/lib/bengali-grapheme';

describe('Bengali Unicode Fixtures: Core Alphabet', () => {
  const segmenter = new BengaliSegmenter();

  test('correctly segments independent vowels (স্বরবর্ণ)', () => {
    const vowels = ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ'];
    for (const v of vowels) {
      const clusters = segmenter.segmentString(v);
      expect(clusters).toEqual([v]);
      expect(isBengaliVowel(v)).toBe(true);
    }
  });

  test('correctly segments single consonants (ব্যঞ্জনবর্ণ)', () => {
    const consonants = [
      'ক', 'খ', 'গ', 'ঘ', 'ঙ',
      'চ', 'ছ', 'জ', 'ঝ', 'ঞ',
      'ট', 'ঠ', 'ড', 'ঢ', 'ণ',
      'ত', 'থ', 'দ', 'ধ', 'ন',
      'প', 'ফ', 'ব', 'ভ', 'ম',
      'য', 'র', 'ল', 'শ', 'ষ',
      'স', 'হ', 'ড়', 'ঢ়', 'য়',
    ];
    for (const c of consonants) {
      const clusters = segmenter.segmentString(c);
      expect(clusters).toEqual([c]);
      expect(isBengaliConsonant(c)).toBe(true);
    }
  });

  test('correctly segments Bengali numerals (সংখ্যা)', () => {
    const digits = '০১২৩৪৫৬৭৮৯';
    const clusters = segmenter.segmentString(digits);
    expect(clusters).toHaveLength(10);
    expect(clusters).toEqual(['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']);
  });
});

describe('Bengali Unicode Fixtures: Kar Marks (কারচিহ্ন)', () => {
  const segmenter = new BengaliSegmenter();

  test('identifies vowel signs correctly', () => {
    const karChars = ['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ'];
    for (const kar of karChars) {
      expect(isBengaliVowelSign(kar)).toBe(true);
    }
  });

  test('keeps base consonant and attached vowel sign as a single grapheme cluster', () => {
    const kars = [
      { text: 'কা', expected: ['কা'] },
      { text: 'কি', expected: ['কি'] },
      { text: 'কী', expected: ['কী'] },
      { text: 'কু', expected: ['কু'] },
      { text: 'কূ', expected: ['কূ'] },
      { text: 'কৃ', expected: ['কৃ'] },
      { text: 'কে', expected: ['কে'] },
      { text: 'কৈ', expected: ['কৈ'] },
      { text: 'কো', expected: ['কো'] },
      { text: 'কৌ', expected: ['কৌ'] },
    ];

    for (const { text, expected } of kars) {
      expect(segmenter.segmentString(text)).toEqual(expected);
      expect(isKarCluster(text)).toBe(true);
    }
  });

  test('correctly segments words with multiple kars', () => {
    const words = [
      { text: 'পানি', expected: ['পা', 'নি'] },
      { text: 'মানুষ', expected: ['মা', 'নু', 'ষ'] },
      { text: 'দোকান', expected: ['দো', 'কা', 'ন'] },
      { text: 'কৌতূহল', expected: ['কৌ', 'তূ', 'হ', 'ল'] },
      { text: 'বৈকালিক', expected: ['বৈ', 'কা', 'লি', 'ক'] },
    ];

    for (const { text, expected } of words) {
      expect(segmenter.segmentString(text)).toEqual(expected);
    }
  });
});

describe('Bengali Unicode Fixtures: Conjuncts & Ligatures (যুক্তাক্ষর)', () => {
  const segmenter = new BengaliSegmenter();

  test('correctly segments standard 2-character conjuncts', () => {
    const conjuncts = [
      { word: 'রক্ত', clusters: ['র', 'ক্ত'] },
      { word: 'শিক্ষা', clusters: ['শি', 'ক্ষা'] },
      { word: 'বিজ্ঞান', clusters: ['বি', 'জ্ঞা', 'ন'] },
      { word: 'শান্ত', clusters: ['শা', 'ন্ত'] },
      { word: 'অঙ্ক', clusters: ['অ', 'ঙ্ক'] },
      { word: 'গঙ্গা', clusters: ['গ', 'ঙ্গা'] },
      { word: 'কাঞ্চন', clusters: ['কা', 'ঞ্চ', 'ন'] },
      { word: 'লণ্ঠন', clusters: ['ল', 'ণ্ঠ', 'ন'] },
      { word: 'উত্তাপ', clusters: ['উ', 'ত্তা', 'প'] },
      { word: 'শব্দ', clusters: ['শ', 'ব্দ'] },
      { word: 'সম্পদ', clusters: ['স', 'ম্প', 'দ'] },
    ];

    for (const { word, clusters } of conjuncts) {
      expect(segmenter.segmentString(word)).toEqual(clusters);
    }
  });

  test('correctly segments Phala and Ref combinations (র-ফলা, য-ফলা, ব-ফলা, রেফ)', () => {
    expect(segmenter.segmentString('গ্রাম')).toEqual(['গ্রা', 'ম']);
    expect(segmenter.segmentString('বাক্য')).toEqual(['বা', 'ক্য']);
    expect(segmenter.segmentString('কর্ম')).toEqual(['ক', 'র্ম']);
    expect(segmenter.segmentString('সূর্য')).toEqual(['সূ', 'র্য']);
    expect(segmenter.segmentString('স্মরণ')).toEqual(['স্ম', 'র', 'ণ']);
  });

  test('correctly segments complex 3-consonant clusters (যেমন ষ্ট্র, স্বাতন্ত্র্য, উজ্জ্বল)', () => {
    const complexWords = [
      { word: 'রাষ্ট্র', clusters: ['রা', 'ষ্ট্র'] },
      { word: 'স্বাস্থ্য', clusters: ['স্বা', 'স্থ্য'] },
      { word: 'উজ্জ্বল', clusters: ['উ', 'জ্জ্ব', 'ল'] },
      { word: 'স্বাতন্ত্র্য', clusters: ['স্বা', 'ত', 'ন্ত্র্য'] },
      { word: 'আন্তর্জাতিক', clusters: ['আ', 'ন্ত', 'র্জা', 'তি', 'ক'] },
    ];

    for (const { word, clusters } of complexWords) {
      expect(segmenter.segmentString(word)).toEqual(clusters);
    }
  });

  test('accurately identifies conjuncts with isConjunct and isComplexConjunct', () => {
    expect(isConjunct('ক্ত')).toBe(true);
    expect(isConjunct('ক্ষ')).toBe(true);
    expect(isConjunct('ক')).toBe(false);
    expect(isComplexConjunct('ক্ষ')).toBe(true);
    expect(isComplexConjunct('জ্ঞ')).toBe(true);
    expect(isComplexConjunct('হ্ম')).toBe(true);
  });
});

describe('Bengali Unicode Fixtures: Candrabindu, Hasanta, Khanda-Ta, Nukta & Punctuation', () => {
  const segmenter = new BengaliSegmenter();

  test('attaches Candrabindu (ঁ) to base or kar mark as single cluster', () => {
    expect(segmenter.segmentString('চাঁদ')).toEqual(['চাঁ', 'দ']);
    expect(segmenter.segmentString('হাঁস')).toEqual(['হাঁ', 'স']);
    expect(segmenter.segmentString('বাঁশি')).toEqual(['বাঁ', 'শি']);
    expect(segmenter.segmentString('আঁকা')).toEqual(['আঁ', 'কা']);
  });

  test('handles Hasanta (্) and Nukta (ড়, ঢ়, য়)', () => {
    expect(isHalant('্')).toBe(true);
    expect(isHalant('ক')).toBe(false);
    expect(isNukta('়')).toBe(true);

    expect(segmenter.segmentString('বাড়ি')).toEqual(['বা', 'ড়ি']);
    expect(segmenter.segmentString('আষাঢ়')).toEqual(['আ', 'ষা', 'ঢ়']);
    expect(segmenter.segmentString('সময়')).toEqual(['স', 'ম', 'য়']);
  });

  test('handles Khanda-Ta (ৎ), Anusvara (ং), Visarga (ঃ)', () => {
    expect(segmenter.segmentString('উৎসব')).toEqual(['উ', 'ৎ', 'স', 'ব']);
    expect(segmenter.segmentString('হঠাৎ')).toEqual(['হ', 'ঠা', 'ৎ']);
    expect(segmenter.segmentString('রং')).toEqual(['রং']);
    expect(segmenter.segmentString('দুঃখ')).toEqual(['দুঃ', 'খ']);
  });

  test('handles Bengali Dari (।) and punctuation marks in sentences', () => {
    const sentence = 'আমি বাংলায় গান গাই। তুমি কি শুনবে?';
    const clusters = segmenter.segmentString(sentence);
    expect(clusters).toContain('।');
    expect(clusters).toContain('?');
    expect(clusters).toContain(' ');
  });
});

describe('Bengali Unicode Normalization & Decomposition', () => {
  test('normalizes decomposed Unicode sequences to canonical Bengali form', () => {
    const raw = 'বাংলা টাইপিং';
    const normalized = normalizeBengaliString(raw);
    expect(normalized).toBe('বাংলা টাইপিং');
  });

  test('buildConjunctSimulationSteps handles conjuncts (ক্র, ক্ত, ট্ট, ষ্ঠা)', () => {
    const kroSteps = buildConjunctSimulationSteps('ক্র', '');
    expect(kroSteps.length).toBe(3);
    expect(kroSteps.map(s => s.label)).toEqual(['ক', 'ক্', 'র']);

    const ktoSteps = buildConjunctSimulationSteps('ক্ত', '');
    expect(ktoSteps.length).toBe(3);
    expect(ktoSteps.map(s => s.label)).toEqual(['ক', 'ক্', 'ত']);

    const ttoSteps = buildConjunctSimulationSteps('ট্ট', '');
    expect(ttoSteps.length).toBe(3);
    expect(ttoSteps.map(s => s.label)).toEqual(['ট', 'ট্', 'ট']);

    const shthaSteps = buildConjunctSimulationSteps('ষ্ঠা', '');
    expect(shthaSteps.length).toBe(4);
    expect(shthaSteps.map(s => s.label)).toEqual(['ষ', '্', 'ঠ', 'া']);
  });

  test('buildGraphemeRenderModel constructs detailed layout model', () => {
    const model = buildGraphemeRenderModel('ষ্টা', 'ষ');
    expect(model.full).toBe('ষ্টা');
    expect(model.kind).toBe('conjunct');
    expect(model.isComplex).toBe(true);
  });
});
