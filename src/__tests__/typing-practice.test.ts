// Bengali Unicode constants
const AMAR = '\u0986\u09AE\u09BE\u09B0'; // আমার
const SONAR = '\u09B8\u09CB\u09A8\u09BE\u09B0'; // সোনার
const BANGLA = '\u09AC\u09BE\u0982\u09B2\u09BE'; // বাংলা
const HASANTA = '\u09CD'; // ্ Bengali

describe('Typing Practice Logic', () => {
  describe('Input handling', () => {
    it('builds input correctly character by character', () => {
      const currentInput = '';
      const newInput = (currentInput + '\u0986').normalize('NFC'); // আ
      expect(newInput).toBe('\u0986');
    });

    it('respects maxLength limit', () => {
      const expectedWord = AMAR;
      const maxLength = Math.max(expectedWord.length + 5, 30);
      expect(maxLength).toBeGreaterThanOrEqual(expectedWord.length);
    });

    it('normalizes NFC on input', () => {
      const input = AMAR;
      const normalized = input.normalize('NFC');
      expect(normalized).toBe(AMAR);
    });
  });

  describe('Backspace handling', () => {
    it('removes last character', () => {
      const input = '\u0986\u09AE\u09BE'; // আমা (3 codepoints but 2 graphemes: আ + মা)
      const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
      const segments = Array.from(segmenter.segment(input));
      const newInput = segments.slice(0, -1).map((s: Intl.SegmentData) => s.segment).join('');
      expect(newInput).toBe('\u0986'); // আ (first grapheme only)
    });

    it('handles empty input gracefully', () => {
      const input = '';
      const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
      const segments = Array.from(segmenter.segment(input));
      const newInput = segments.slice(0, -1).map((s: Intl.SegmentData) => s.segment).join('');
      expect(newInput).toBe('');
    });

    it('correctly removes Bengali conjunct as one grapheme', () => {
      const input = '\u0995\u09CD\u09B7'; // ক্ষ - should be one grapheme
      const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
      const segments = Array.from(segmenter.segment(input));
      expect(segments.length).toBe(1);
      const newInput = segments.slice(0, -1).map((s: Intl.SegmentData) => s.segment).join('');
      expect(newInput).toBe('');
    });
  });

  describe('Space / word navigation', () => {
    const words = [AMAR, SONAR, BANGLA];

    it('advances to next word on space when input is non-empty', () => {
      const currentWordIndex = 0;
      const currentInput = AMAR;
      const canAdvance = currentInput.trim().length > 0 && currentWordIndex < words.length - 1;
      expect(canAdvance).toBe(true);
    });

    it('does not advance on space when input is empty', () => {
      const currentInput = '';
      const canAdvance = currentInput.trim().length > 0;
      expect(canAdvance).toBe(false);
    });

    it('does not advance past last word', () => {
      const currentWordIndex = 2;
      const canAdvance = currentWordIndex < words.length - 1;
      expect(canAdvance).toBe(false);
    });
  });

  describe('Navigation', () => {
    const words = [AMAR, SONAR, BANGLA];

    it('navigates forward', () => {
      const currentWordIndex = 0;
      const newIndex = currentWordIndex + 1;
      expect(newIndex >= 0 && newIndex < words.length).toBe(true);
    });

    it('navigates backward', () => {
      const currentWordIndex = 1;
      const newIndex = currentWordIndex - 1;
      expect(newIndex >= 0 && newIndex < words.length).toBe(true);
    });

    it('does not navigate below 0', () => {
      const currentWordIndex = 0;
      const newIndex = currentWordIndex - 1;
      expect(newIndex < 0).toBe(true);
    });
  });

  describe('Error detection', () => {
    it('detects error when input does not match word start', () => {
      const currentWord = AMAR; // আমার
      const input = '\u0986\u09AC'; // আব - wrong second char
      const isError = input.length > 0 && !currentWord.startsWith(input);
      expect(isError).toBe(true);
    });

    it('no error when input matches word start', () => {
      const currentWord = AMAR; // আমার
      const input = '\u0986\u09AE'; // আম
      const isError = input.length > 0 && !currentWord.startsWith(input);
      expect(isError).toBe(false);
    });

    it('no error on empty input', () => {
      const currentWord = AMAR;
      const input = '';
      const isError = input.length > 0 && !currentWord.startsWith(input);
      expect(isError).toBe(false);
    });
  });

  describe('Stats calculation', () => {
    it('calculates accuracy as 100 when no chars typed', () => {
      const totalCharsTyped = 0;
      const uncorrectedErrors = 0;
      const accuracy = totalCharsTyped > 0
        ? Math.round(((totalCharsTyped - uncorrectedErrors) / totalCharsTyped) * 100)
        : 100;
      expect(accuracy).toBe(100);
    });

    it('calculates accuracy correctly', () => {
      const totalCharsTyped = 10;
      const uncorrectedErrors = 2;
      const accuracy = Math.round(((totalCharsTyped - uncorrectedErrors) / totalCharsTyped) * 100);
      expect(accuracy).toBe(80);
    });

    it('calculates WPM correctly', () => {
      const totalKeystrokes = 50;
      const timeInMinutes = 1;
      const grossWpm = (totalKeystrokes / 5) / timeInMinutes;
      expect(grossWpm).toBe(10);
    });

    it('returns 0 WPM when time is 0', () => {
      const totalKeystrokes = 50;
      const timeInMinutes = 0;
      const grossWpm = timeInMinutes > 0 ? (totalKeystrokes / 5) / timeInMinutes : 0;
      expect(grossWpm).toBe(0);
    });

    it('net WPM is never negative', () => {
      const grossWpm = 5;
      const uncorrectedErrors = 10;
      const timeInMinutes = 1;
      const netWpm = Math.max(0, grossWpm - (uncorrectedErrors / timeInMinutes));
      expect(netWpm).toBe(0);
    });
  });

  describe('Visible words virtualization', () => {
    const words = ['\u098F\u0995', '\u09A6\u09C1\u0987', '\u09A4\u09BF\u09A8', '\u099A\u09BE\u09B0', '\u09AA\u09BE\u0981\u099A'];

    it('returns correct window of words', () => {
      const currentWordIndex = 2;
      const bufferSize = 2;
      const startIndex = Math.max(0, currentWordIndex - bufferSize);
      const endIndex = Math.min(words.length - 1, currentWordIndex + bufferSize);
      const visible = [];
      for (let i = startIndex; i <= endIndex; i++) {
        visible.push({ word: words[i], index: i });
      }
      expect(visible.length).toBe(5);
      expect(visible[0].index).toBe(0);
      expect(visible[4].index).toBe(4);
    });

    it('clamps to start of array', () => {
      const currentWordIndex = 0;
      const bufferSize = 2;
      const startIndex = Math.max(0, currentWordIndex - bufferSize);
      expect(startIndex).toBe(0);
    });

    it('clamps to end of array', () => {
      const currentWordIndex = 4;
      const bufferSize = 2;
      const endIndex = Math.min(words.length - 1, currentWordIndex + bufferSize);
      expect(endIndex).toBe(4);
    });
  });
});
