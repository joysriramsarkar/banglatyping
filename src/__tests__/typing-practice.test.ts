import { renderHook, act } from '@testing-library/react';
import { useTypingPractice } from '@/hooks/use-typing-practice';

// Bengali Unicode fixtures
const AMAR = '\u0986\u09AE\u09BE\u09B0'; // আমার
const SONAR = '\u09B8\u09CB\u09A8\u09BE\u09B0'; // সোনার
const BANGLA = '\u09AC\u09BE\u0982\u09B2\u09BE'; // বাংলা
const KSSA = '\u0995\u09CD\u09B7'; // ক্ষ - single grapheme cluster, 3 code points
const HASANTA = '\u09CD'; // ্
const KA = '\u0995'; // ক
const SSA = '\u09B7'; // ষ

const THREE_WORDS = `${AMAR} ${SONAR} ${BANGLA}`;

function setup(initialText: string, isPracticeDrill = false) {
  return renderHook(
    ({ text, drill }) => useTypingPractice({ initialText: text, isPracticeDrill: drill }),
    { initialProps: { text: initialText, drill: isPracticeDrill } }
  );
}

type HookResult = ReturnType<typeof setup>['result'];

/** Types a string one character at a time through the real hook. */
function typeWord(result: HookResult, word: string, maxLength = 100) {
  for (const ch of Array.from(word)) {
    act(() => {
      result.current.inputChar(ch, maxLength);
    });
  }
}

describe('useTypingPractice', () => {
  describe('initialization', () => {
    it('splits the initial text into words on mount', () => {
      const { result } = setup(THREE_WORDS);

      expect(result.current.state.words).toEqual([AMAR, SONAR, BANGLA]);
      expect(result.current.state.textToType).toBe(THREE_WORDS);
      expect(result.current.state.currentWordIndex).toBe(0);
      expect(result.current.state.charInputPerWord).toEqual({});
      expect(result.current.state.isFinished).toBe(false);
    });

    it('starts with neutral stats', () => {
      const { result } = setup(THREE_WORDS);

      expect(result.current.state.accuracy).toBe(100);
      expect(result.current.state.wpm).toBe(0);
      expect(result.current.state.totalErrors).toBe(0);
      expect(result.current.state.totalChars).toBe(0);
    });

    it('drops empty segments produced by repeated spaces', () => {
      const { result } = setup('hello   world');

      expect(result.current.state.words).toEqual(['hello', 'world']);
    });

    it('produces no words for empty text', () => {
      const { result } = setup('');

      expect(result.current.state.words).toEqual([]);
    });

    it('re-initializes when the initial text changes', () => {
      const { result, rerender } = setup(THREE_WORDS);

      rerender({ text: 'hello world', drill: false });

      expect(result.current.state.words).toEqual(['hello', 'world']);
      expect(result.current.state.currentWordIndex).toBe(0);
    });
  });

  describe('practice drill mode', () => {
    it('repeats the base words until the drill is long enough', () => {
      const { result } = setup(`${KA} \u0996 \u0997`, true);

      expect(result.current.state.words.length).toBeGreaterThan(1000);
      expect(result.current.state.words.every((w) => [KA, '\u0996', '\u0997'].includes(w))).toBe(true);
    });
  });

  describe('character input', () => {
    it('builds input character by character', () => {
      const { result } = setup('hello world');

      expect(result.current.getCurrentInput()).toBe('');

      typeWord(result, 'hel');

      expect(result.current.getCurrentInput()).toBe('hel');
      expect(result.current.state.charInputPerWord[0]).toBe('hel');
    });

    it('respects the maxLength limit', () => {
      const { result } = setup('hello world');

      act(() => {
        result.current.inputChar('a', 2);
      });
      act(() => {
        result.current.inputChar('b', 2);
      });
      act(() => {
        result.current.inputChar('c', 2);
      });

      expect(result.current.getCurrentInput()).toBe('ab');
    });

    it('normalizes composed input to NFC', () => {
      const { result } = setup('hello world');

      act(() => {
        result.current.inputChar('e', 100);
      });
      act(() => {
        result.current.inputChar('\u0301', 100);
      });

      // 'e' + combining acute must collapse to a single precomposed character
      expect(result.current.getCurrentInput()).toBe('\u00E9');
      expect(result.current.getCurrentInput().length).toBe(1);
    });
  });

  describe('setCurrentInput', () => {
    it('accepts input within the derived limit', () => {
      const { result } = setup('hello world');

      act(() => {
        result.current.setCurrentInput('hel');
      });

      expect(result.current.getCurrentInput()).toBe('hel');
    });

    it('rejects input longer than max(word length + 5, 30)', () => {
      const { result } = setup('hello world');

      act(() => {
        result.current.setCurrentInput('x'.repeat(31));
      });

      expect(result.current.getCurrentInput()).toBe('');

      act(() => {
        result.current.setCurrentInput('x'.repeat(30));
      });

      expect(result.current.getCurrentInput()).toBe('x'.repeat(30));
    });
  });

  describe('backspace', () => {
    it('removes the last typed character/modifier step by step (e.g. বাংলা -> বাংল and বাং -> বা -> ব)', () => {
      const { result } = setup(`বাংলা সোনার`);

      // Type বাংলা
      act(() => {
        result.current.setCurrentInput('বাংলা');
      });
      expect(result.current.getCurrentInput()).toBe('বাংলা');

      // Backspace 1: removes 'া', leaving 'বাংল'
      act(() => {
        result.current.handleBackspace();
      });
      expect(result.current.getCurrentInput()).toBe('বাংল');

      // Backspace 2: removes 'ল', leaving 'বাং'
      act(() => {
        result.current.handleBackspace();
      });
      expect(result.current.getCurrentInput()).toBe('বাং');

      // Backspace 3: removes 'ং', leaving 'বা'
      act(() => {
        result.current.handleBackspace();
      });
      expect(result.current.getCurrentInput()).toBe('বা');

      // Backspace 4: removes 'া', leaving 'ব'
      act(() => {
        result.current.handleBackspace();
      });
      expect(result.current.getCurrentInput()).toBe('ব');

      // Backspace 5: removes 'ব', leaving ''
      act(() => {
        result.current.handleBackspace();
      });
      expect(result.current.getCurrentInput()).toBe('');
    });

    it('removes conjunct characters step-by-step (e.g. ক্ষ -> ক্ -> ক)', () => {
      const { result } = setup(`${KSSA} ${SONAR}`);

      typeWord(result, KA);
      act(() => {
        result.current.inputChar(HASANTA, 100);
      });
      act(() => {
        result.current.inputChar(SSA, 100);
      });
      expect(result.current.getCurrentInput()).toBe(KSSA);

      // 1st backspace deletes SSA (ষ), leaving KA + HASANTA (ক্)
      act(() => {
        result.current.handleBackspace();
      });
      expect(result.current.getCurrentInput()).toBe(KA + HASANTA);

      // 2nd backspace deletes HASANTA (্), leaving KA (ক)
      act(() => {
        result.current.handleBackspace();
      });
      expect(result.current.getCurrentInput()).toBe(KA);

      // 3rd backspace deletes KA (ক), leaving empty
      act(() => {
        result.current.handleBackspace();
      });
      expect(result.current.getCurrentInput()).toBe('');
    });

    it('moves to the previous word when the current input is empty', () => {
      const { result } = setup(THREE_WORDS);

      typeWord(result, AMAR);
      act(() => {
        result.current.handleSpace();
      });
      expect(result.current.state.currentWordIndex).toBe(1);

      act(() => {
        result.current.handleBackspace();
      });

      expect(result.current.state.currentWordIndex).toBe(0);
    });

    it('stays on the first word when there is nothing to delete', () => {
      const { result } = setup(THREE_WORDS);

      act(() => {
        result.current.handleBackspace();
      });

      expect(result.current.state.currentWordIndex).toBe(0);
      expect(result.current.getCurrentInput()).toBe('');
    });

    it('clears the whole word on ctrl+backspace', () => {
      const { result } = setup(THREE_WORDS);

      typeWord(result, AMAR);
      expect(result.current.getCurrentInput()).toBe(AMAR);

      act(() => {
        result.current.handleBackspace(true);
      });

      expect(result.current.getCurrentInput()).toBe('');
    });
  });

  describe('space / word navigation', () => {
    it('advances to the next word when the input is non-empty', () => {
      const { result } = setup(THREE_WORDS);

      typeWord(result, AMAR);
      act(() => {
        result.current.handleSpace();
      });

      expect(result.current.state.currentWordIndex).toBe(1);
    });

    it('does not advance when the input is empty', () => {
      const { result } = setup(THREE_WORDS);

      act(() => {
        result.current.handleSpace();
      });

      expect(result.current.state.currentWordIndex).toBe(0);
    });

    it('does not advance past the last word', () => {
      const { result } = setup(`${AMAR} ${SONAR}`);

      typeWord(result, AMAR);
      act(() => {
        result.current.handleSpace();
      });
      typeWord(result, SONAR);
      act(() => {
        result.current.handleSpace();
      });

      expect(result.current.state.currentWordIndex).toBe(1);
    });

    it('navigates forward and backward within bounds', () => {
      const { result } = setup(THREE_WORDS);

      act(() => {
        result.current.navigate(1);
      });
      expect(result.current.state.currentWordIndex).toBe(1);

      act(() => {
        result.current.navigate(-1);
      });
      expect(result.current.state.currentWordIndex).toBe(0);
    });

    it('clamps navigation at both ends', () => {
      const { result } = setup(THREE_WORDS);

      act(() => {
        result.current.navigate(-1);
      });
      expect(result.current.state.currentWordIndex).toBe(0);

      act(() => {
        result.current.navigate(1);
      });
      act(() => {
        result.current.navigate(1);
      });
      act(() => {
        result.current.navigate(1);
      });
      expect(result.current.state.currentWordIndex).toBe(2);
    });
  });

  describe('error detection and word classes', () => {
    it('flags input that does not match the start of the current word', () => {
      const { result } = setup(THREE_WORDS);

      act(() => {
        result.current.inputChar(AMAR[0], 100);
      });
      expect(result.current.isError()).toBe(false);

      act(() => {
        result.current.inputChar('\u09AC', 100); // ব - wrong second character
      });
      expect(result.current.isError()).toBe(true);
    });

    it('reports no error for an empty input', () => {
      const { result } = setup(THREE_WORDS);

      expect(result.current.isError()).toBe(false);
    });

    it('styles completed, current and upcoming words differently', () => {
      const { result } = setup(THREE_WORDS);

      typeWord(result, AMAR);
      act(() => {
        result.current.handleSpace();
      });

      expect(result.current.getWordClass(0)).toBe('text-green-500');
      expect(result.current.getWordClass(1)).toBe('text-primary');
      expect(result.current.getWordClass(2)).toBe('text-muted-foreground');
    });

    it('marks a mistyped completed word as an error', () => {
      const { result } = setup(THREE_WORDS);

      act(() => {
        result.current.inputChar('\u09AC', 100);
      });
      act(() => {
        result.current.handleSpace();
      });

      expect(result.current.getWordClass(0)).toBe('text-red-500 line-through');
    });
  });

  describe('stats calculation', () => {
    it('keeps accuracy at 100 when nothing has been typed', () => {
      const { result } = setup(THREE_WORDS);

      act(() => {
        result.current.calculateStats(60);
      });

      expect(result.current.state.accuracy).toBe(100);
      expect(result.current.state.wpm).toBe(0);
    });

    it('reports perfect accuracy for a correct word', () => {
      const { result } = setup('hello world');

      typeWord(result, 'hello');
      act(() => {
        result.current.calculateStats(60);
      });

      expect(result.current.state.totalErrors).toBe(0);
      expect(result.current.state.accuracy).toBe(100);
      expect(result.current.state.totalChars).toBe('hello'.length);
    });

    it('counts uncorrected errors and lowers accuracy', () => {
      const { result } = setup('hello world');

      typeWord(result, 'hxllo');
      act(() => {
        result.current.calculateStats(60);
      });

      expect(result.current.state.totalErrors).toBe(1);
      expect(result.current.state.accuracy).toBe(80);
    });

    it('counts the space between completed words as a keystroke', () => {
      const { result } = setup('ab cd');

      typeWord(result, 'ab');
      act(() => {
        result.current.handleSpace();
      });
      act(() => {
        result.current.calculateStats(60);
      });

      // 2 typed characters + 1 space
      expect(result.current.state.totalChars).toBe(3);
      // The current word has not been started, so both of its expected
      // characters ('c' and 'd') are counted as uncorrected errors.
      expect(result.current.state.totalErrors).toBe(2);
    });

    it('calculates net WPM from keystrokes over time', () => {
      const { result } = setup('abcdefghij other');

      typeWord(result, 'abcdefghij'); // 10 keystrokes
      act(() => {
        result.current.calculateStats(60);
      });

      // (10 / 5) per minute, no errors => 2 WPM
      expect(result.current.state.wpm).toBe(2);
    });

    it('never reports a negative WPM', () => {
      const { result } = setup('hello world');

      typeWord(result, 'xxxxx'); // 5 keystrokes, 5 errors
      act(() => {
        result.current.calculateStats(60);
      });

      // gross 1 WPM minus 5 errors per minute would be negative
      expect(result.current.state.wpm).toBe(0);
    });

    it('caches word stats and skips redundant state updates', () => {
      const { result } = setup('hello world');

      typeWord(result, 'hello');
      act(() => {
        result.current.calculateStats(60);
      });
      const stateAfterFirstCalc = result.current.state;

      act(() => {
        result.current.calculateStats(60);
      });

      expect(result.current.state).toBe(stateAfterFirstCalc);
    });
  });

  describe('finish and reset', () => {
    it('freezes the state once finished', () => {
      const { result } = setup('hello world');

      typeWord(result, 'hello');
      act(() => {
        result.current.finish();
      });
      expect(result.current.state.isFinished).toBe(true);

      act(() => {
        result.current.inputChar('z', 100);
      });
      act(() => {
        result.current.handleSpace();
      });
      act(() => {
        result.current.navigate(1);
      });

      expect(result.current.getCurrentInput()).toBe('hello');
      expect(result.current.state.currentWordIndex).toBe(0);
    });

    it('clears progress on reset', () => {
      const { result } = setup(THREE_WORDS);

      typeWord(result, AMAR);
      act(() => {
        result.current.handleSpace();
      });
      act(() => {
        result.current.reset('hello world again');
      });

      expect(result.current.state.words).toEqual(['hello', 'world', 'again']);
      expect(result.current.state.currentWordIndex).toBe(0);
      expect(result.current.state.charInputPerWord).toEqual({});
      expect(result.current.state.isFinished).toBe(false);
    });
  });

  describe('visible word window', () => {
    const NUMBERS = ['one', 'two', 'three', 'four', 'five'];

    it('returns a window around the current word', () => {
      const { result } = setup(NUMBERS.join(' '));

      act(() => {
        result.current.navigate(1);
      });
      act(() => {
        result.current.navigate(1);
      });

      const visible = result.current.getVisibleWords(2);

      expect(visible).toEqual([
        { word: 'one', index: 0 },
        { word: 'two', index: 1 },
        { word: 'three', index: 2 },
        { word: 'four', index: 3 },
        { word: 'five', index: 4 },
      ]);
    });

    it('clamps the window at the start of the list', () => {
      const { result } = setup(NUMBERS.join(' '));

      const visible = result.current.getVisibleWords(2);

      expect(visible.map((w) => w.index)).toEqual([0, 1, 2]);
    });

    it('honours a custom buffer size', () => {
      const { result } = setup(NUMBERS.join(' '));

      act(() => {
        result.current.navigate(1);
      });

      const visible = result.current.getVisibleWords(1);

      expect(visible.map((w) => w.index)).toEqual([0, 1, 2]);
    });
  });

  describe('unknown actions', () => {
    it('leaves the state untouched', () => {
      const { result } = setup(THREE_WORDS);
      const before = result.current.state;

      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.current.dispatch({ type: 'NOT_A_REAL_ACTION' } as any);
      });

      expect(result.current.state).toBe(before);
    });
  });
});
