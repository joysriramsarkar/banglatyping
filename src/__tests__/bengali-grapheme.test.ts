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
  composeBengaliKeystroke,
  isValidBengaliTypingPrefix,
  getNextExpectedKeyChar,
  getBengaliGraphemeClip,
  VOWEL_TO_KAR_MAP as _VOWEL_TO_KAR_MAP,
  KAR_TO_VOWEL_MAP as _KAR_TO_VOWEL_MAP,
} from '@/lib/bengali-grapheme';

// Bengali Unicode constants
const KA = '\u0995';       // ক
const _SHA = '\u09B7';      // ষ
const KSA = '\u0995\u09CD\u09B7'; // ক্ষ (conjunct)
const HASANTA = '\u09CD';  // ্ (Bengali)
const DEVANAGARI_VIRAMA = '\u094D'; // ् (Devanagari - should NOT match)
const AA_KAR = '\u09BE';   // া
const I_KAR = '\u09BF';    // ি
const _AA_VOWEL = '\u0986'; // আ
const _KA_AA = '\u0995\u09BE'; // কা

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

  it('normalizes decomposed nukta consonants to atomic whole letters', () => {
    // \u09AF (য) + \u09BC (়) -> \u09DF (য়)
    expect(normalizeBengaliString('\u09AF\u09BC')).toBe('\u09DF');
    expect(normalizeBengaliString('উচ্চতা\u09AF\u09BC')).toBe('উচ্চতায়');

    // \u09A1 (ড) + \u09BC (়) -> \u09DC (ড়)
    expect(normalizeBengaliString('\u09A1\u09BC')).toBe('\u09DC');
    expect(normalizeBengaliString('গা\u09A1\u09BCি')).toBe('গাড়ি');

    // \u09A2 (ঢ) + \u09BC (়) -> \u09DD (ঢ়)
    expect(normalizeBengaliString('\u09A2\u09BC')).toBe('\u09DD');
    expect(normalizeBengaliString('আষা\u09A2\u09BC')).toBe('আষাঢ়');
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

describe('composeBengaliKeystroke', () => {
  it('concatenates and normalizes Bengali characters directly', () => {
    expect(composeBengaliKeystroke('', 'আ')).toBe('আ');
    expect(composeBengaliKeystroke('আ', 'ম')).toBe('আম');
    expect(composeBengaliKeystroke('ক', '্')).toBe('ক্');
    expect(composeBengaliKeystroke('ক্', 'ত')).toBe('ক্ত');
    expect(composeBengaliKeystroke('কীর্ত', 'ি')).toBe('কীর্তি');
  });

  it('composes Hasanta + Kar into independent vowels in BanglaWord', () => {
    expect(composeBengaliKeystroke('্', 'া')).toBe('আ');
    expect(composeBengaliKeystroke('্', 'ি')).toBe('ই');
    expect(composeBengaliKeystroke('্', 'ী')).toBe('ঈ');
    expect(composeBengaliKeystroke('্', 'ু')).toBe('উ');
    expect(composeBengaliKeystroke('্', 'ূ')).toBe('ঊ');
    expect(composeBengaliKeystroke('্', 'ে')).toBe('এ');
    expect(composeBengaliKeystroke('্', 'ৈ')).toBe('ঐ');
    expect(composeBengaliKeystroke('্', 'ো')).toBe('ও');
    expect(composeBengaliKeystroke('্', 'ৌ')).toBe('ঔ');
  });

  it('handles OS dead-key resolution where Hasanta is followed by independent vowel', () => {
    expect(composeBengaliKeystroke('্', 'আ')).toBe('আ');
    expect(composeBengaliKeystroke('্', 'ই')).toBe('ই');
    expect(composeBengaliKeystroke('্', 'ঈ')).toBe('ঈ');
  });

  it('handles short-to-long vowel extensions', () => {
    expect(composeBengaliKeystroke('ই', 'ি')).toBe('ঈ');
    expect(composeBengaliKeystroke('ই', 'ী')).toBe('ঈ');
    expect(composeBengaliKeystroke('উ', 'ু')).toBe('ঊ');
  });
});

describe('isValidBengaliTypingPrefix', () => {
  it('accepts valid direct prefixes of targets', () => {
    expect(isValidBengaliTypingPrefix('আ', 'আ')).toBe(true);
    expect(isValidBengaliTypingPrefix('ঈ', 'ঈ')).toBe(true);
    expect(isValidBengaliTypingPrefix('আ', 'আম')).toBe(true);
    expect(isValidBengaliTypingPrefix('আম', 'আম')).toBe(true);
    expect(isValidBengaliTypingPrefix('ক', 'কা')).toBe(true);
    expect(isValidBengaliTypingPrefix('ক', 'ক্ত')).toBe(true);
    expect(isValidBengaliTypingPrefix('ক্', 'ক্ত')).toBe(true);
    expect(isValidBengaliTypingPrefix('কীর্', 'কীর্তি')).toBe(true);
  });

  it('accepts pending Hasanta for independent vowels in BanglaWord', () => {
    expect(isValidBengaliTypingPrefix('্', 'আ')).toBe(true);
    expect(isValidBengaliTypingPrefix('্', 'আম')).toBe(true);
    expect(isValidBengaliTypingPrefix('্', 'ইট')).toBe(true);
    expect(isValidBengaliTypingPrefix('্', 'ঈদ')).toBe(true);
    expect(isValidBengaliTypingPrefix('আজকের ্', 'আজকের আলো')).toBe(true);
  });

  it('rejects mismatching prefixes', () => {
    expect(isValidBengaliTypingPrefix('খ', 'ক')).toBe(false);
    expect(isValidBengaliTypingPrefix('ব', 'কলম')).toBe(false);
    expect(isValidBengaliTypingPrefix('ই', 'ঈ')).toBe(false);
    expect(isValidBengaliTypingPrefix('্', 'কলম')).toBe(false);
  });
});

describe('getNextExpectedKeyChar', () => {
  it('returns next expected character directly from target string', () => {
    expect(getNextExpectedKeyChar('', 'ঈ')).toBe('ঈ');
    expect(getNextExpectedKeyChar('', 'আ')).toBe('আ');
    expect(getNextExpectedKeyChar('', 'অ')).toBe('অ');
    expect(getNextExpectedKeyChar('', 'ক')).toBe('ক');
    expect(getNextExpectedKeyChar('ক', 'কা')).toBe('া');
    expect(getNextExpectedKeyChar('আ', 'আম')).toBe('ম');
    expect(getNextExpectedKeyChar('ক', 'ক্ত')).toBe('্');
    expect(getNextExpectedKeyChar('ক্', 'ক্ত')).toBe('ত');
    expect(getNextExpectedKeyChar('কীর্', 'কীর্তি')).toBe('ত');
  });

  it('returns corresponding Kar when buffer has pending Hasanta for independent vowel', () => {
    expect(getNextExpectedKeyChar('্', 'আ')).toBe('া');
    expect(getNextExpectedKeyChar('্', 'আম')).toBe('া');
    expect(getNextExpectedKeyChar('্', 'ইট')).toBe('ি');
    expect(getNextExpectedKeyChar('্', 'ঈদ')).toBe('ী');
  });

  it('returns empty string when input is fully matched', () => {
    expect(getNextExpectedKeyChar('ঈ', 'ঈ')).toBe('');
    expect(getNextExpectedKeyChar('কা', 'কা')).toBe('');
    expect(getNextExpectedKeyChar('কীর্তি', 'কীর্তি')).toBe('');
  });
});

describe('getBengaliGraphemeClip', () => {
  it('handles boundaries (0 steps and fully completed steps)', () => {
    expect(getBengaliGraphemeClip('ডা', 0, 2)).toBe('inset(100%)');
    expect(getBengaliGraphemeClip('ডা', 2, 2)).toBe('inset(0)');
    expect(getBengaliGraphemeClip('ডা', 3, 2)).toBe('inset(0)');
  });

  it('correctly clips post-base Aa-kar (া) at 76% so consonant is 100% covered and aa-kar stem remains clean', () => {
    // For 'ডা', 'ড' occupies 0 to 76%, 'া' occupies 76% to 100%
    expect(getBengaliGraphemeClip('ডা', 1, 2)).toBe('polygon(0 0, 76% 0, 76% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('ফা', 1, 2)).toBe('polygon(0 0, 76% 0, 76% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('সা', 1, 2)).toBe('polygon(0 0, 76% 0, 76% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('কা', 1, 2)).toBe('polygon(0 0, 76% 0, 76% 100%, 0 100%)');
  });

  it('correctly clips below-base marks at top 68%', () => {
    expect(getBengaliGraphemeClip('টূ', 1, 2)).toBe('polygon(0 0, 100% 0, 100% 68%, 0 68%)');
    expect(getBengaliGraphemeClip('কু', 1, 2)).toBe('polygon(0 0, 100% 0, 100% 68%, 0 68%)');
  });

  it('correctly clips pre-base marks on right 66%', () => {
    expect(getBengaliGraphemeClip('টি', 1, 2)).toBe('polygon(34% 0, 100% 0, 100% 100%, 34% 100%)');
    expect(getBengaliGraphemeClip('টে', 1, 2)).toBe('polygon(34% 0, 100% 0, 100% 100%, 34% 100%)');
  });

  it('correctly clips circumfix marks in center', () => {
    expect(getBengaliGraphemeClip('টো', 1, 2)).toBe('polygon(27% 0, 73% 0, 73% 100%, 27% 100%)');
  });

  it('correctly clips multi-character words proportionally rather than sticking at single-character kar ratio', () => {
    expect(getBengaliGraphemeClip('ফাদা', 1, 4)).toBe('polygon(0 0, 25% 0, 25% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('ফাদা', 2, 4)).toBe('polygon(0 0, 50% 0, 50% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('ফাদা', 3, 4)).toBe('polygon(0 0, 75% 0, 75% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('ফাদা', 4, 4)).toBe('inset(0)');
  });
});
