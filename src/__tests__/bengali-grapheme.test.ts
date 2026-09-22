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
  getUpcomingIndependentVowel,
  INDEPENDENT_VOWEL_PROCESS_MAP,
  ensureSpacedDrillItems,
  VOWEL_TO_KAR_MAP as _VOWEL_TO_KAR_MAP,
  KAR_TO_VOWEL_MAP as _KAR_TO_VOWEL_MAP,
  isComplexConjunct,
  isTransparentConjunct,
  isKarCluster,
  buildConjunctSimulationSteps,
  buildGraphemeRenderModel,
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

    it('segments sentence containing spaces into words and separate space clusters', () => {
      const sentence = 'রুটি খাও।';
      const segments = segmenter.segmentString(sentence);
      expect(segments).toContain(' ');
      expect(segments).toEqual(['রু', 'টি', ' ', 'খা', 'ও', '।']);
    });

    it('preserves Anusvara (ং) and Visarga (ঃ) bound to base cluster to prevent font-shaping breakage (বাংলাদেশ, বাংলা, দুঃখ)', () => {
      expect(segmenter.segmentString('বাংলাদেশ')).toEqual(['বাং', 'লা', 'দে', 'শ']);
      expect(segmenter.segmentString('বাংলা')).toEqual(['বাং', 'লা']);
      expect(segmenter.segmentString('রং')).toEqual(['রং']);
      expect(segmenter.segmentString('অংশ')).toEqual(['অং', 'শ']);
      expect(segmenter.segmentString('দুঃখ')).toEqual(['দুঃ', 'খ']);
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
    // Mid-word BanglaWord vowel composition
    expect(composeBengaliKeystroke('পুঁ্', 'ি')).toBe('পুঁই');
    expect(composeBengaliKeystroke('ব্', 'ই')).toBe('বই');
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
    expect(isValidBengaliTypingPrefix('পুঁ্', 'পুঁই')).toBe(true);
    expect(isValidBengaliTypingPrefix('ব্', 'বই')).toBe(true);
  });

  it('rejects mismatching prefixes', () => {
    expect(isValidBengaliTypingPrefix('খ', 'ক')).toBe(false);
    expect(isValidBengaliTypingPrefix('ব', 'কলম')).toBe(false);
    expect(isValidBengaliTypingPrefix('ই', 'ঈ')).toBe(false);
    expect(isValidBengaliTypingPrefix('্', 'কলম')).toBe(false);
  });
});

describe('getNextExpectedKeyChar and getUpcomingIndependentVowel', () => {
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
    expect(getNextExpectedKeyChar('পুঁ্', 'পুঁই')).toBe('ি');
  });

  it('guides step-by-step dead key when expandIndependentVowels is true', () => {
    expect(getNextExpectedKeyChar('', 'ই', true)).toBe('্');
    expect(getNextExpectedKeyChar('্', 'ই', true)).toBe('ি');
    expect(getNextExpectedKeyChar('পুঁ', 'পুঁই', true)).toBe('্');
    expect(getNextExpectedKeyChar('পুঁ্', 'পুঁই', true)).toBe('ি');
  });

  it('detects upcoming independent vowel process info', () => {
    expect(getUpcomingIndependentVowel('পুঁ', 'পুঁই')?.processLabel).toBe('h,্ + i,ি = ই');
    expect(getUpcomingIndependentVowel('পুঁ্', 'পুঁই')?.processLabel).toBe('h,্ + i,ি = ই');
    expect(getUpcomingIndependentVowel('', 'আম')?.processLabel).toBe('h,্ + a,া = আ');
    expect(getUpcomingIndependentVowel('ক', 'কা')).toBeNull();
  });

  it('returns empty string when input is fully matched', () => {
    expect(getNextExpectedKeyChar('ঈ', 'ঈ')).toBe('');
    expect(getNextExpectedKeyChar('কা', 'কা')).toBe('');
    expect(getNextExpectedKeyChar('কীর্তি', 'কীর্তি')).toBe('');
  });
});

describe('ensureSpacedDrillItems', () => {
  it('preserves sentences with internal spaces without adding duplicate space items', () => {
    const sentences = ['রুটি খাও।', 'পাখি গান গায়।', 'গোরু ঘাস খায়।'];
    const result = ensureSpacedDrillItems(sentences);
    expect(result).toEqual(sentences);
  });

  it('inserts space items every 2-4 items for isolated words', () => {
    const words = ['রুটি', 'ক্ষীর', 'পুঁই', 'পৈতে'];
    const result = ensureSpacedDrillItems(words, 3);
    expect(result).toContain(' ');
  });
});

describe('getBengaliGraphemeClip', () => {
  it('handles boundaries (0 steps and fully completed steps)', () => {
    expect(getBengaliGraphemeClip('ডা', 0, 2)).toBe('inset(100%)');
    expect(getBengaliGraphemeClip('ডা', 2, 2)).toBe('inset(0)');
    expect(getBengaliGraphemeClip('ডা', 3, 2)).toBe('inset(0)');
  });

  it('notches polygon for টি, ঠি to preserve top horn (টিঁকি) without coloring i-kar umbrella', () => {
    expect(getBengaliGraphemeClip('টি', 1, 2)).toBe(
      'polygon(31% 10%, 46% 10%, 46% 0, 78% 0, 78% 10%, 100% 10%, 100% 100%, 31% 100%)'
    );
    expect(getBengaliGraphemeClip('ঠি', 1, 2)).toBe(
      'polygon(32% 10%, 46% 10%, 46% 0, 78% 0, 78% 10%, 100% 10%, 100% 100%, 32% 100%)'
    );
  });

  it('correctly clips post-base Aa-kar (া) without spilling into aa-kar stem', () => {
    // Narrow consonants (চ, দ, ব, র) stop at 68%
    expect(getBengaliGraphemeClip('চা', 1, 2)).toBe('polygon(0 0, 68% 0, 68% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('দা', 1, 2)).toBe('polygon(0 0, 68% 0, 68% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('বা', 1, 2)).toBe('polygon(0 0, 68% 0, 68% 100%, 0 100%)');
    // 'স' stops at 71%
    expect(getBengaliGraphemeClip('সা', 1, 2)).toBe('polygon(0 0, 71% 0, 71% 100%, 0 100%)');
    // 'ট' stops at 70%
    expect(getBengaliGraphemeClip('টা', 1, 2)).toBe('polygon(0 0, 70% 0, 70% 100%, 0 100%)');
    // 'ড' stops at 73%, 'ক' stops at 75%
    expect(getBengaliGraphemeClip('ডা', 1, 2)).toBe('polygon(0 0, 73% 0, 73% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('কা', 1, 2)).toBe('polygon(0 0, 75% 0, 75% 100%, 0 100%)');
  });

  it('correctly clips post-base Anusvara (ং) and Visarga (ঃ) without spilling into mark', () => {
    expect(getBengaliGraphemeClip('টং', 1, 2)).toBe('polygon(0 0, 60% 0, 60% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('রং', 1, 2)).toBe('polygon(0 0, 60% 0, 60% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('চং', 1, 2)).toBe('polygon(0 0, 58% 0, 58% 100%, 0 100%)');
  });

  it('correctly clips Aa-kar + Anusvara (e.g. বাং in বাংলাদেশ) across all 3 typing steps', () => {
    // Step 1: Only 'ব' is revealed (42% width), 'া' and 'ং' remain gray
    expect(getBengaliGraphemeClip('বাং', 1, 3)).toBe('polygon(0 0, 42% 0, 42% 100%, 0 100%)');
    // Step 2: 'বা' is revealed (74% width), 'ং' remains gray
    expect(getBengaliGraphemeClip('বাং', 2, 3)).toBe('polygon(0 0, 74% 0, 74% 100%, 0 100%)');
    // Step 3: Entire 'বাং' is revealed
    expect(getBengaliGraphemeClip('বাং', 3, 3)).toBe('inset(0)');
  });

  it('correctly clips below-base marks at top 68%', () => {
    expect(getBengaliGraphemeClip('টূ', 1, 2)).toBe('polygon(0 0, 100% 0, 100% 68%, 0 68%)');
    expect(getBengaliGraphemeClip('কু', 1, 2)).toBe('polygon(0 0, 100% 0, 100% 68%, 0 68%)');
  });

  it('correctly clips pre-base marks preserving uncolored e-kar, oi-kar, and hroshwo-i kar without slicing matra', () => {
    // 'টি' uses 10% top margin for 'ট' with notched horn
    expect(getBengaliGraphemeClip('টি', 1, 2)).toBe('polygon(31% 10%, 46% 10%, 46% 0, 78% 0, 78% 10%, 100% 10%, 100% 100%, 31% 100%)');
    // 'রি' uses 12% top margin for 'র', keeping full matra while keeping hroshwo-i umbrella uncolored
    expect(getBengaliGraphemeClip('রি', 1, 2)).toBe('polygon(31% 12%, 100% 12%, 100% 100%, 31% 100%)');
    // 'তৈ' keeps upper plume uncolored and matra full
    expect(getBengaliGraphemeClip('তৈ', 1, 2)).toBe('polygon(35% 12%, 100% 12%, 100% 100%, 35% 100%)');
    // 'টে' and 'চে' have horizontal e-kar
    expect(getBengaliGraphemeClip('টে', 1, 2)).toBe('polygon(41% 0, 100% 0, 100% 100%, 41% 100%)');
    expect(getBengaliGraphemeClip('চে', 1, 2)).toBe('polygon(42% 0, 100% 0, 100% 100%, 42% 100%)');
  });

  it('correctly clips post-base Dirgho-I kar (ী) keeping full consonant matra and top arch/loop uncolored', () => {
    expect(getBengaliGraphemeClip('দী', 1, 2)).toBe('polygon(0 12%, 68% 12%, 68% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('কী', 1, 2)).toBe('polygon(0 12%, 76% 12%, 76% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('টী', 1, 2)).toBe('polygon(0 10%, 69% 10%, 69% 100%, 0 100%)');
  });

  it('correctly clips multi-step clusters with Chandrabindu (ঁ) without slicing consonant matra', () => {
    // দাঁ: step 1 (দ only, full matra, no chandrabindu, no aa-kar)
    expect(getBengaliGraphemeClip('দাঁ', 1, 3)).toBe('polygon(0 12%, 68% 12%, 68% 100%, 0 100%)');
    // দাঁ: step 2 (দ + া, both full height, chandrabindu uncolored)
    expect(getBengaliGraphemeClip('দাঁ', 2, 3)).toBe('polygon(0 12%, 68% 12%, 68% 0, 100% 0, 100% 100%, 0 100%)');
    // দাঁ: step 3 (দ + া + ঁ)
    expect(getBengaliGraphemeClip('দাঁ', 3, 3)).toBe('inset(0)');

    // চাঁদ: step 1 and step 2
    expect(getBengaliGraphemeClip('চাঁ', 1, 3)).toBe('polygon(0 12%, 68% 12%, 68% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('চাঁ', 2, 3)).toBe('polygon(0 12%, 68% 12%, 68% 0, 100% 0, 100% 100%, 0 100%)');
  });

  it('correctly clips circumfix marks with Chandrabindu (ধোঁ in ধোঁয়া)', () => {
    // ধোঁ: step 1 (ধ only) -> middle consonant highlighted, e-kar and aa-kar and chandrabindu uncolored
    expect(getBengaliGraphemeClip('ধোঁ', 1, 3)).toBe('polygon(33% 12%, 73% 12%, 73% 100%, 33% 100%)');
    // ধোঁ: step 2 (ধ + ো = ধো typed) -> e-kar, ধ, and aa-kar ALL highlighted, ONLY chandrabindu uncolored!
    expect(getBengaliGraphemeClip('ধোঁ', 2, 3)).toBe('polygon(0 0, 33% 0, 33% 12%, 73% 12%, 73% 0, 100% 0, 100% 100%, 0 100%)');
    // ধোঁ: step 3 (ধোঁ completed)
    expect(getBengaliGraphemeClip('ধোঁ', 3, 3)).toBe('inset(0)');
  });

  it('correctly clips multi-step clusters with Below-base and Visarga (দুঃ)', () => {
    // দুঃ: step 1 (দ only)
    expect(getBengaliGraphemeClip('দুঃ', 1, 3)).toBe('polygon(0 0, 58% 0, 58% 68%, 0 68%)');
    // দুঃ: step 2 (দ + ু)
    expect(getBengaliGraphemeClip('দুঃ', 2, 3)).toBe('polygon(0 0, 58% 0, 58% 100%, 0 100%)');
  });

  it('correctly clips circumfix marks in center', () => {
    expect(getBengaliGraphemeClip('টো', 1, 2)).toBe('polygon(33% 0, 73% 0, 73% 100%, 33% 100%)');
    expect(getBengaliGraphemeClip('মৌ', 1, 2)).toBe('polygon(30% 12%, 75% 12%, 75% 100%, 30% 100%)');
  });

  it('correctly clips multi-character words proportionally rather than sticking at single-character kar ratio', () => {
    expect(getBengaliGraphemeClip('ফাদা', 1, 4)).toBe('polygon(0 0, 25% 0, 25% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('ফাদা', 2, 4)).toBe('polygon(0 0, 50% 0, 50% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('ফাদা', 3, 4)).toBe('polygon(0 0, 75% 0, 75% 100%, 0 100%)');
    expect(getBengaliGraphemeClip('ফাদা', 4, 4)).toBe('inset(0)');
  });

  it('correctly clips transparent conjuncts (প্ত, প্র, চ্ছ, জ্ব)', () => {
    // প্ত: step 1 ('প') and step 2 ('প্') clip top 58%
    expect(getBengaliGraphemeClip('প্ত', 1, 3)).toBe('polygon(0 0, 100% 0, 100% 58%, 0 58%)');
    expect(getBengaliGraphemeClip('প্ত', 2, 3)).toBe('polygon(0 0, 100% 0, 100% 58%, 0 58%)');
    expect(getBengaliGraphemeClip('প্ত', 3, 3)).toBe('inset(0)');

    // প্র: step 1 and 2 clip top 72%
    expect(getBengaliGraphemeClip('প্র', 1, 3)).toBe('polygon(0 0, 100% 0, 100% 72%, 0 72%)');
    expect(getBengaliGraphemeClip('প্র', 3, 3)).toBe('inset(0)');

    // চ্ছ: step 1 clips top 58%
    expect(getBengaliGraphemeClip('চ্ছ', 1, 3)).toBe('polygon(0 0, 100% 0, 100% 58%, 0 58%)');
    expect(getBengaliGraphemeClip('চ্ছ', 3, 3)).toBe('inset(0)');

    // জ্ব: step 1 clips top 72%
    expect(getBengaliGraphemeClip('জ্ব', 1, 3)).toBe('polygon(0 0, 100% 0, 100% 72%, 0 72%)');
    expect(getBengaliGraphemeClip('জ্ব', 3, 3)).toBe('inset(0)');

    // স্বা: 4-step progressive stages (স -> স্ -> স্ব -> স্বা)
    // Step 1: 'স' typed -> reveals ONLY 'স' (top 54% height, left 70% width)
    expect(getBengaliGraphemeClip('স্বা', 1, 4)).toBe('polygon(0 0, 70% 0, 70% 54%, 0 54%)');
    // Step 2: 'স্' typed -> same clip, halant dot indicator shown below
    expect(getBengaliGraphemeClip('স্বা', 2, 4)).toBe('polygon(0 0, 70% 0, 70% 54%, 0 54%)');
    // Step 3: 'স্ব' typed -> reveals entire 'স্ব' (both 'স' and '্ব'), but NOT 'া'
    expect(getBengaliGraphemeClip('স্বা', 3, 4)).toBe('polygon(0 0, 70% 0, 70% 100%, 0 100%)');
    // Step 4: 'স্বা' typed -> 100% complete
    expect(getBengaliGraphemeClip('স্বা', 4, 4)).toBe('inset(0)');
  });
});

describe('Conjunct and Kar Classification', () => {
  it('correctly identifies complex conjuncts requiring breakdown simulation screen', () => {
    // User requested examples: ক্ত, ত্র, ট্ট, ক্র
    expect(isComplexConjunct('ক্ত')).toBe(true);
    expect(isComplexConjunct('ত্র')).toBe(true);
    expect(isComplexConjunct('ট্ট')).toBe(true);
    expect(isComplexConjunct('ক্র')).toBe(true);

    // Other key fused ligatures
    expect(isComplexConjunct('ক্ষ')).toBe(true);
    expect(isComplexConjunct('ক্ষ্ম')).toBe(true);
    expect(isComplexConjunct('জ্ঞ')).toBe(true);
    expect(isComplexConjunct('হ্ম')).toBe(true);
    expect(isComplexConjunct('ত্ত')).toBe(true);
    expect(isComplexConjunct('দ্ধ')).toBe(true);

    // Conjunct with trailing kar (e.g. 'ক্রি', 'ত্রু', 'ক্ষা')
    expect(isComplexConjunct('ক্রি')).toBe(true);
    expect(isComplexConjunct('ত্রু')).toBe(true);
    expect(isComplexConjunct('ক্ষা')).toBe(true);

    // Transparent conjuncts and kar are NOT complex
    expect(isComplexConjunct('প্ত')).toBe(false);
    expect(isComplexConjunct('চ্ছ')).toBe(false);
    expect(isComplexConjunct('জ্ব')).toBe(false);
    expect(isComplexConjunct('প্র')).toBe(false);
    expect(isComplexConjunct('দ্র')).toBe(false);
    expect(isComplexConjunct('রু')).toBe(false);
    expect(isComplexConjunct('রূ')).toBe(false);
    expect(isComplexConjunct('কা')).toBe(false);
    expect(isComplexConjunct('টি')).toBe(false);
  });

  it('correctly identifies transparent conjuncts', () => {
    // User requested examples: 'প্ত','চ্ছ', 'জ্ব', প্র, দ্র, রু, রূ
    expect(isTransparentConjunct('প্ত')).toBe(true);
    expect(isTransparentConjunct('চ্ছ')).toBe(true);
    expect(isTransparentConjunct('জ্ব')).toBe(true);
    expect(isTransparentConjunct('প্র')).toBe(true);
    expect(isTransparentConjunct('দ্র')).toBe(true);
    expect(isTransparentConjunct('রু')).toBe(true);
    expect(isTransparentConjunct('রূ')).toBe(true);
    expect(isTransparentConjunct('ব্দ')).toBe(true);
    expect(isTransparentConjunct('স্প')).toBe(true);

    // Complex conjuncts and kar are NOT transparent conjuncts
    expect(isTransparentConjunct('ক্ত')).toBe(false);
    expect(isTransparentConjunct('ত্র')).toBe(false);
    expect(isTransparentConjunct('ট্ট')).toBe(false);
    expect(isTransparentConjunct('ক্র')).toBe(false);
    expect(isTransparentConjunct('ক্ষ')).toBe(false);
    expect(isTransparentConjunct('কা')).toBe(false);
    expect(isTransparentConjunct('টি')).toBe(false);
  });

  it('correctly identifies kar clusters', () => {
    expect(isKarCluster('কা')).toBe(true);
    expect(isKarCluster('টি')).toBe(true);
    expect(isKarCluster('কু')).toBe(true);
    expect(isKarCluster('কী')).toBe(true);
    expect(isKarCluster('কে')).toBe(true);
    expect(isKarCluster('কৌ')).toBe(true);
    expect(isKarCluster('দাঁ')).toBe(true);

    // Conjuncts and consonants are NOT kar clusters
    expect(isKarCluster('ক')).toBe(false);
    expect(isKarCluster('প্ত')).toBe(false);
    expect(isKarCluster('ক্ত')).toBe(false);
  });
});

describe('buildConjunctSimulationSteps', () => {
  it('builds component decomposition formula for ক্র (ক+ক্+র)', () => {
    // Initial: none typed -> 'ক' is active
    const steps0 = buildConjunctSimulationSteps('ক্র', '');
    expect(steps0.map(s => s.label)).toEqual(['ক', 'ক্', 'র']);
    expect(steps0[0].active).toBe(true);
    expect(steps0[0].completed).toBe(false);

    // Step 1: 'ক' typed -> 'ক' completed, 'ক্' active
    const steps1 = buildConjunctSimulationSteps('ক্র', 'ক');
    expect(steps1[0].completed).toBe(true);
    expect(steps1[1].active).toBe(true);

    // Step 2: 'ক্' typed -> 'ক' and 'ক্' completed, 'র' active
    const steps2 = buildConjunctSimulationSteps('ক্র', 'ক্');
    expect(steps2[0].completed).toBe(true);
    expect(steps2[1].completed).toBe(true);
    expect(steps2[2].active).toBe(true);

    // Step 3: 'ক্র' typed -> all completed
    const steps3 = buildConjunctSimulationSteps('ক্র', 'ক্র');
    expect(steps3.every(s => s.completed)).toBe(true);
  });

  it('builds component decomposition formula for ট্ট (ট+ট্+ট)', () => {
    const steps = buildConjunctSimulationSteps('ট্ট', 'ট');
    expect(steps.map(s => s.label)).toEqual(['ট', 'ট্', 'ট']);
    expect(steps[0].completed).toBe(true);
    expect(steps[1].active).toBe(true);
  });

  it('builds component decomposition formula for ক্ত (ক+ক্+ত)', () => {
    const steps = buildConjunctSimulationSteps('ক্ত', 'ক্');
    expect(steps.map(s => s.label)).toEqual(['ক', 'ক্', 'ত']);
    expect(steps[0].completed).toBe(true);
    expect(steps[1].completed).toBe(true);
    expect(steps[2].active).toBe(true);
  });

  it('builds component decomposition formula for cluster with kar ষ্ঠা (ষ+্+ঠ+া)', () => {
    const steps0 = buildConjunctSimulationSteps('ষ্ঠা', '');
    expect(steps0.map(s => s.label)).toEqual(['ষ', '্', 'ঠ', 'া']);
    expect(steps0[0].active).toBe(true);

    const steps1 = buildConjunctSimulationSteps('ষ্ঠা', 'ষ');
    expect(steps1[0].completed).toBe(true);
    expect(steps1[1].active).toBe(true);

    const steps2 = buildConjunctSimulationSteps('ষ্ঠা', 'ষ্');
    expect(steps2[0].completed).toBe(true);
    expect(steps2[1].completed).toBe(true);
    expect(steps2[2].active).toBe(true);

    const steps3 = buildConjunctSimulationSteps('ষ্ঠা', 'ষ্ঠ');
    expect(steps3[0].completed).toBe(true);
    expect(steps3[1].completed).toBe(true);
    expect(steps3[2].completed).toBe(true);
    expect(steps3[3].active).toBe(true);

    const steps4 = buildConjunctSimulationSteps('ষ্ঠা', 'ষ্ঠা');
    expect(steps4.every(s => s.completed)).toBe(true);
  });

  it('supports ক্ষ typed directly via BanglaWord "q" or via ক+ক্+ষ', () => {
    // If typed directly 'ক্ষ' (e.g. from key 'q' in BanglaWord)
    const directSteps = buildConjunctSimulationSteps('ক্ষ', 'ক্ষ');
    expect(directSteps.every(s => s.completed)).toBe(true);

    // If typed sequentially 'ক' -> 'ক্' -> 'ক্ষ'
    const seqStep1 = buildConjunctSimulationSteps('ক্ষ', 'ক');
    expect(seqStep1[0].completed).toBe(true);
    expect(seqStep1[1].active).toBe(true);

    const seqStep2 = buildConjunctSimulationSteps('ক্ষ', 'ক্');
    expect(seqStep2[0].completed).toBe(true);
    expect(seqStep2[1].completed).toBe(true);
    expect(seqStep2[2].active).toBe(true);
  });
});

describe('buildGraphemeRenderModel', () => {
  it('creates render model for kar cluster (টি, কা) with full unbroken string', () => {
    const model = buildGraphemeRenderModel('টি', 'ট');
    expect(model.full).toBe('টি');
    expect(model.kind).toBe('kar');
    expect(model.currentStep).toBe(1);
    expect(model.totalSteps).toBe(2);
    expect(model.hasPendingHalant).toBe(false);
  });

  it('creates render model for transparent conjunct with halant indicator (প্ত: প-প্-প্ত)', () => {
    // Step 1: 'প' typed
    const model1 = buildGraphemeRenderModel('প্ত', 'প');
    expect(model1.full).toBe('প্ত');
    expect(model1.kind).toBe('conjunct');
    expect(model1.isComplex).toBe(false);
    expect(model1.hasPendingHalant).toBe(false);

    // Step 2: 'প্' typed (halant entered) -> hasPendingHalant is true!
    const model2 = buildGraphemeRenderModel('প্ত', 'প্');
    expect(model2.full).toBe('প্ত');
    expect(model2.hasPendingHalant).toBe(true);

    // Step 3: 'প্ত' completed
    const model3 = buildGraphemeRenderModel('প্ত', 'প্ত');
    expect(model3.hasPendingHalant).toBe(false);
  });

  it('creates render model for complex conjunct (ক্র, ক্ষ) with simulation steps and hint', () => {
    const modelCro = buildGraphemeRenderModel('ক্র', 'ক');
    expect(modelCro.isComplex).toBe(true);
    expect(modelCro.conjunctSteps).toBeDefined();
    expect(modelCro.conjunctSteps?.length).toBe(3);

    const modelKsa = buildGraphemeRenderModel('ক্ষ', '');
    expect(modelKsa.isComplex).toBe(true);
    expect(modelKsa.specialHint).toContain("বাংলাওয়ার্ড: সরাসরি 'q' অথবা ক + ্ + ষ");
  });
});

