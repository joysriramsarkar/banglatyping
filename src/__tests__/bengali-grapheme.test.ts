import {
  BengaliSegmenter,
  isBengaliVowel,
  isBengaliConsonant,
  isBengaliVowelSign,
  isHalant,
  isNukta,
  isConjunct,
  normalizeBengaliString,
  parseConjunct,
} from '@/lib/bengali-grapheme';

// Bengali Unicode constants
const KA = '\u0995';       // ক
const SHA = '\u09B7';      // ষ
const KSA = '\u0995\u09CD\u09B7'; // ক্ষ (conjunct)
const HASANTA = '\u09CD';  // ্ (Bengali)
const DEVANAGARI_VIRAMA = '\u094D'; // ् (Devanagari - should NOT match)
const AA_KAR = '\u09BE';   // া
const I_KAR = '\u09BF';    // ি
const AA_VOWEL = '\u0986'; // আ
const KA_AA = '\u0995\u09BE'; // কা

describe('BengaliSegmenter', () => {
  const segmenter = new BengaliSegmenter();

  describe('segmentString', () => {
    it('segments simple Bengali word', () => {
      const word = '\u0986\u09AE\u09BE\u09B0'; // আমার
      const segments = segmenter.segmentString(word);
      expect(segments.length).toBeGreaterThan(0);
      expect(segments.join('')).toBe(word);
    });

    it('treats conjunct as single grapheme', () => {
      const segments = segmenter.segmentString(KSA);
      expect(segments.length).toBe(1);
      expect(segments[0]).toBe(KSA);
    });

    it('handles empty string', () => {
      expect(segmenter.segmentString('')).toEqual([]);
    });

    it('handles space', () => {
      expect(segmenter.segmentString(' ')).toEqual([' ']);
    });
  });

  describe('graphemeLength', () => {
    it('counts graphemes not code points', () => {
      expect(segmenter.graphemeLength(KSA)).toBe(1);
      expect(segmenter.graphemeLength(KA + '\u0996')).toBe(2); // কখ
    });
  });

  describe('firstGrapheme', () => {
    it('returns first grapheme', () => {
      const word = '\u0986\u09AE\u09BE\u09B0'; // আমার
      expect(segmenter.firstGrapheme(word)).toBe('\u0986'); // আ
    });

    it('returns empty string for empty input', () => {
      expect(segmenter.firstGrapheme('')).toBe('');
    });
  });

  describe('lastGrapheme', () => {
    it('returns last grapheme', () => {
      const word = '\u0986\u09AE\u09BE\u09B0'; // আমার
      expect(segmenter.lastGrapheme(word)).toBe('\u09B0'); // র
    });
  });

  describe('graphemeSlice', () => {
    it('slices by grapheme index', () => {
      // আমার has graphemes: আ, মা, র (3 graphemes)
      const word = '\u0986\u09AE\u09BE\u09B0';
      const result = segmenter.graphemeSlice(word, 0, 2);
      expect(result).toBe('\u0986\u09AE\u09BE'); // আমা (first 2 graphemes)
    });
  });
});

describe('Bengali character detection', () => {
  describe('isBengaliVowel', () => {
    it('detects Bengali vowels', () => {
      expect(isBengaliVowel('\u0985')).toBe(true); // অ
      expect(isBengaliVowel('\u0986')).toBe(true); // আ
      expect(isBengaliVowel('\u0987')).toBe(true); // ই
    });

    it('rejects non-vowels', () => {
      expect(isBengaliVowel(KA)).toBe(false);
      expect(isBengaliVowel('a')).toBe(false);
    });
  });

  describe('isBengaliConsonant', () => {
    it('detects Bengali consonants', () => {
      expect(isBengaliConsonant(KA)).toBe(true);   // ক
      expect(isBengaliConsonant('\u0996')).toBe(true); // খ
      expect(isBengaliConsonant('\u09B9')).toBe(true); // হ
    });

    it('rejects non-consonants', () => {
      expect(isBengaliConsonant('\u0986')).toBe(false); // আ
      expect(isBengaliConsonant(AA_KAR)).toBe(false);   // া
    });
  });

  describe('isBengaliVowelSign', () => {
    it('detects vowel signs (কার)', () => {
      expect(isBengaliVowelSign(AA_KAR)).toBe(true); // া
      expect(isBengaliVowelSign(I_KAR)).toBe(true);  // ি
      expect(isBengaliVowelSign('\u09C1')).toBe(true); // ু
    });

    it('rejects non-vowel-signs', () => {
      expect(isBengaliVowelSign(KA)).toBe(false);
      expect(isBengaliVowelSign('\u0986')).toBe(false);
    });
  });

  describe('isHalant', () => {
    it('detects Bengali hasanta U+09CD', () => {
      expect(isHalant(HASANTA)).toBe(true);
    });

    it('rejects Devanagari virama U+094D', () => {
      expect(isHalant(DEVANAGARI_VIRAMA)).toBe(false);
    });

    it('rejects regular characters', () => {
      expect(isHalant(KA)).toBe(false);
    });
  });

  describe('isNukta', () => {
    it('detects nukta U+09BC', () => {
      expect(isNukta('\u09BC')).toBe(true);
    });

    it('rejects non-nukta', () => {
      expect(isNukta(KA)).toBe(false);
    });
  });
});

describe('isConjunct', () => {
  it('detects conjuncts with Bengali hasanta', () => {
    expect(isConjunct(KSA)).toBe(true); // ক্ষ
    expect(isConjunct('\u09A8\u09CD\u09A4')).toBe(true); // ন্ত
  });

  it('returns false for simple consonants', () => {
    expect(isConjunct(KA)).toBe(false);
    expect(isConjunct('\u0986')).toBe(false);
  });
});

describe('normalizeBengaliString', () => {
  it('removes ZWJ', () => {
    const withZWJ = KA + '\u200D' + '\u0996';
    expect(normalizeBengaliString(withZWJ)).toBe(KA + '\u0996');
  });

  it('removes ZWNJ', () => {
    const withZWNJ = KA + '\u200C' + '\u0996';
    expect(normalizeBengaliString(withZWNJ)).toBe(KA + '\u0996');
  });

  it('applies NFC normalization', () => {
    const text = '\u0986\u09AE\u09BE\u09B0';
    expect(normalizeBengaliString(text)).toBe(text.normalize('NFC'));
  });
});

describe('parseConjunct', () => {
  it('parses two-consonant conjunct ন্ত', () => {
    // ন্ত = ন + ্ + ত (not a single grapheme, so parseConjunct can split it)
    const NTA = '\u09A8\u09CD\u09A4';
    const result = parseConjunct(NTA);
    expect(result.consonants.length).toBeGreaterThanOrEqual(1);
    expect(result.trailingKar).toBeNull();
  });

  it('handles single consonant', () => {
    const result = parseConjunct(KA);
    expect(result.consonants).toContain(KA);
    expect(result.halants).toHaveLength(0);
  });

  it('returns empty consonants for empty string', () => {
    const result = parseConjunct('');
    expect(result.consonants).toHaveLength(0);
    expect(result.trailingKar).toBeNull();
  });
});
