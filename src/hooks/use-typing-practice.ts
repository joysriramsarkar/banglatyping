import { useReducer, useCallback, useEffect } from 'react';
import {
  composeBengaliKeystroke,
  isValidBengaliTypingPrefix,
  bengaliSegmenter,
  normalizeBengaliString,
} from '@/lib/bengali-grapheme';

/**
 * Custom Hook: useTypingPractice - Optimized for Performance
 * Centralizes all typing state management and logic
 * Prevents "state hell" by consolidating related states into one reducer
 * 
 * Performance Optimizations:
 * - Uses useReducer for efficient state batching
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Word stats caching to avoid recalculating completed words
 * - Virtualization support for large word lists
 */

interface TypingState {
  textToType: string;
  words: string[];
  currentWordIndex: number;
  charInputPerWord: Record<number, string>;
  totalErrors: number;
  /** Graphemes the learner actually produced, plus the spaces between them. */
  totalChars: number;
  /** Words typed exactly right. Drives WPM. */
  totalWords: number;
  wpm: number;
  /** Graphemes per minute — the metric that actually means something in Bengali. */
  gpm: number;
  /** Kept for the results screen; equals gpm for a grapheme-based session. */
  spm: number;
  accuracy: number;
  isFinished: boolean;
  wordStatsCache: Record<number, WordStats>;
}

interface WordStats {
  rawInput: string;
  /** Graphemes the learner produced for this word. */
  graphemesTyped: number;
  /** Graphemes that do not match the expected word. */
  errors: number;
  /** True when the word was typed exactly right. */
  exact: boolean;
}

type TypingAction =
  | { type: 'INIT'; payload: { initialText: string; isPracticeDrill: boolean } }
  | { type: 'INPUT_CHAR'; payload: { key: string; maxLength: number } }
  | { type: 'SET_INPUT'; payload: { input: string } }
  | { type: 'BACKSPACE' }
  | { type: 'CTRL_BACKSPACE' }
  | { type: 'SPACE' }
  | { type: 'NAVIGATE'; payload: { direction: -1 | 1 } }
  | { type: 'CALCULATE_STATS'; payload: { time: number } }
  | { type: 'FINISH'; payload?: { time?: number } }
  | { type: 'RESET'; payload: { text: string; isPracticeDrill: boolean } };

const initialTypingState: TypingState = {
  textToType: '',
  words: [],
  currentWordIndex: 0,
  charInputPerWord: {},
  totalErrors: 0,
  totalChars: 0,
  totalWords: 0,
  wpm: 0,
  gpm: 0,
  spm: 0,
  accuracy: 100,
  isFinished: false,
  wordStatsCache: {},
};

/** Split a word into grapheme clusters, the unit the learner actually produces. */
function toGraphemes(text: string): string[] {
  if (!text) return [];
  return bengaliSegmenter.segmentString(normalizeBengaliString(text));
}

/**
 * Count the mistakes in one word, comparing grapheme by grapheme.
 *
 * Three things this gets right that a code-point loop did not:
 *
 * 1. Nothing is charged while the word is still on its way. Bengali is not
 *    fixed-width: a half-typed conjunct (ক ্) or a half-typed next grapheme
 *    (বিজ of বিজ্ঞান) is not a mistake yet, and the only thing that knows that
 *    is isValidBengaliTypingPrefix. Comparing code points instead reported
 *    every untyped trailing position as a wrong one, so a learner who had typed
 *    two correct graphemes out of three was already being marked down for the
 *    third.
 *
 * 2. Graphemes, not code units. ক্ষ is three code points and one thing on
 *    screen. Walking code points misaligned the comparison as soon as a conjunct
 *    was involved, so errors landed on the wrong letters.
 *
 * 3. Once the word is no longer a prefix, every wrong position counts, including
 *    graphemes typed beyond the end of the word.
 */
function countWordErrors(expected: string, typed: string): { errors: number; exact: boolean } {
  const typedGraphemes = toGraphemes(typed);
  if (typedGraphemes.length === 0) return { errors: 0, exact: false };

  const expectedGraphemes = toGraphemes(expected);

  // Still on track: nothing typed so far is wrong.
  if (isValidBengaliTypingPrefix(typed, expected)) {
    return { errors: 0, exact: typedGraphemes.length === expectedGraphemes.length };
  }

  let errors = 0;
  const shared = Math.min(expectedGraphemes.length, typedGraphemes.length);
  for (let i = 0; i < shared; i++) {
    if (expectedGraphemes[i] !== typedGraphemes[i]) errors++;
  }
  // Anything typed beyond the end of the word is also a mistake.
  errors += typedGraphemes.length - shared;

  return { errors, exact: false };
}

/**
 * Recompute the running stats from the raw inputs.
 *
 * WPM is words-per-minute: finished words divided by minutes. The English
 * "characters / 5" formula has no meaning here, because one Bengali grapheme
 * can cost five keystrokes (ক্ষ্ম is ক ্ ষ ্ ম) and one keystroke can produce
 * half a grapheme. Dividing by 5 therefore produced numbers that were neither
 * comparable to any other typing test nor a measure of anything.
 *
 * GPM — graphemes per minute — is the honest speed number for Bengali, and it
 * is what the UI leads with. WPM stays because it is the unit the government
 * job exams quote (২৫–৩০ WPM), so a learner can still check themselves against
 * the target they have been told about.
 */
function calculateStatsHelper(
  words: string[],
  charInputPerWord: Record<number, string>,
  currentWordIndex: number,
  time: number,
  wordStatsCache: Record<number, WordStats>
) {
  let graphemesTyped = 0;
  let finishedWords = 0;
  let uncorrectedErrors = 0;
  let newCache: Record<number, WordStats> | null = null;

  // Process all words up to and including current word
  for (let i = 0; i <= currentWordIndex; i++) {
    const rawInput = charInputPerWord[i] || '';
    let stats = wordStatsCache[i];

    // Recompute only when this word's input actually changed
    if (!stats || stats.rawInput !== rawInput) {
      const { errors, exact } = countWordErrors(words[i] || '', rawInput);
      stats = {
        rawInput,
        graphemesTyped: toGraphemes(rawInput).length,
        errors,
        exact,
      };
      if (!newCache) newCache = { ...wordStatsCache };
      newCache[i] = stats;
    }

    graphemesTyped += stats.graphemesTyped;
    uncorrectedErrors += stats.errors;

    // A word counts toward WPM once it has been typed exactly. The word the
    // learner is on right now counts too if it is already complete — otherwise
    // finishing a one-word test would always report 0 WPM.
    if (stats.exact && (i < currentWordIndex || rawInput.length > 0)) {
      finishedWords += 1;
    }

    // The space the learner pressed to leave a completed word.
    if (i < currentWordIndex) graphemesTyped += 1;
  }

  // Accuracy is over graphemes the learner actually produced. Spaces count as
  // produced and never as errors, which matches how a typing test is scored.
  const correctGraphemes = graphemesTyped - uncorrectedErrors;
  const accuracy = graphemesTyped > 0 ? Math.round((correctGraphemes / graphemesTyped) * 100) : 100;

  const timeInMinutes = time / 60;
  if (timeInMinutes <= 0) {
    return {
      totalCharsTyped: graphemesTyped,
      errors: uncorrectedErrors,
      wordsFinished: finishedWords,
      accuracy,
      wpm: 0,
      gpm: 0,
      spm: 0,
      newCache,
    };
  }

  const wpm = Math.round(finishedWords / timeInMinutes);
  const gpm = Math.round(graphemesTyped / timeInMinutes);

  return {
    totalCharsTyped: graphemesTyped,
    errors: uncorrectedErrors,
    wordsFinished: finishedWords,
    accuracy,
    wpm,
    gpm,
    // Kept for the results screen, which still labels this SPM.
    spm: gpm,
    newCache,
  };
}

/**
 * Reducer function that handles all typing state transitions
 * All state changes go through this single source of truth
 */
function typingReducer(state: TypingState, action: TypingAction): TypingState {
  switch (action.type) {
    case 'INIT':
    case 'RESET': {
      const { initialText, isPracticeDrill } = action.type === 'INIT' ? action.payload : { initialText: action.payload.text, isPracticeDrill: action.payload.isPracticeDrill };
      let newWords: string[] = [];
      if (isPracticeDrill) {
        let repeatedText = '';
        const baseWords = initialText?.split(' ').filter(w => w) || [];
        if (baseWords.length > 0) {
          while (repeatedText.length < 10000) {
            repeatedText += baseWords.join(' ') + ' ';
          }
        }
        newWords = repeatedText.split(' ').filter(w => w);
      } else {
        newWords = initialText?.normalize('NFC').split(' ').filter(w => w) || [];
      }
      return {
        ...initialTypingState,
        textToType: newWords.join(' '),
        words: newWords,
      };
    }
    case 'INPUT_CHAR': {
      if (state.isFinished) return state;
      const currentInput = state.charInputPerWord[state.currentWordIndex] || '';
      const rawChar = action.payload.key;
      const targetWord = state.words[state.currentWordIndex] || '';

      // Direct compose (composition is handled by IME / composeBengaliKeystroke)
      const nextInput = composeBengaliKeystroke(currentInput, rawChar);

      // Check max length
      if (nextInput.length > action.payload.maxLength) {
        return state;
      }

      // The keystroke is always recorded, mistakes included, so the word can be
      // scored and shown struck-through. Whether what is currently in the box is
      // still on the way to the target word is answered by isValidBengaliTypingPrefix,
      // which is what isError() below and the red word styling both read. That
      // check used to also be computed here and thrown away, which left the
      // reducer looking like it validated input when it never did.
      return {
        ...state,
        charInputPerWord: {
          ...state.charInputPerWord,
          [state.currentWordIndex]: nextInput,
        },
      };
    }
    case 'SET_INPUT': {
      if (state.isFinished) return state;
      const newInput = action.payload.input.normalize('NFC');
      const expectedWord = state.words[state.currentWordIndex]?.normalize('NFC') || '';
      const maxLength = Math.max(expectedWord.length + 5, 30);
      if (newInput.length <= maxLength) {
        return {
          ...state,
          charInputPerWord: { ...state.charInputPerWord, [state.currentWordIndex]: newInput },
        };
      }
      return state;
    }
    case 'BACKSPACE': {
      if (state.isFinished) return state;
      const currentInput = (state.charInputPerWord[state.currentWordIndex] || '').normalize('NFC');
      
      if (currentInput.length > 0) {
        // Step-by-step character / modifier deletion (e.g. বাংলা -> বাংল -> বাং -> বা -> ব)
        const newInput = Array.from(currentInput).slice(0, -1).join('');
        const newCharInput = { ...state.charInputPerWord };
        if (newInput.length === 0) {
          delete newCharInput[state.currentWordIndex];
        } else {
          newCharInput[state.currentWordIndex] = newInput;
        }
        return { ...state, charInputPerWord: newCharInput };
      } else if (state.currentWordIndex > 0) {
        return { ...state, currentWordIndex: state.currentWordIndex - 1 };
      }
      return state;
    }
    case 'CTRL_BACKSPACE': {
      if (state.isFinished) return state;
      const newCharInput = { ...state.charInputPerWord };
      delete newCharInput[state.currentWordIndex];
      return { ...state, charInputPerWord: newCharInput };
    }
    case 'SPACE': {
      if (state.isFinished) return state;
      const currentInput = (state.charInputPerWord[state.currentWordIndex] || '').normalize('NFC');
      if (currentInput.trim().length === 0) return state;

      if (state.currentWordIndex < state.words.length - 1) {
        return { ...state, currentWordIndex: state.currentWordIndex + 1 };
      }
      return state;
    }
    case 'NAVIGATE': {
      if (state.isFinished) return state;
      const newIndex = state.currentWordIndex + action.payload.direction;
      if (newIndex >= 0 && newIndex < state.words.length) {
        return { ...state, currentWordIndex: newIndex };
      }
      return state;
    }
    case 'CALCULATE_STATS': {
      if (state.isFinished) return state;
      const stats = calculateStatsHelper(state.words, state.charInputPerWord, state.currentWordIndex, action.payload.time, state.wordStatsCache);
      
      const newCache = stats.newCache || state.wordStatsCache;

      // Only update if stats actually changed to prevent unnecessary re-renders
      if (
        stats.totalCharsTyped !== state.totalChars ||
        stats.errors !== state.totalErrors ||
        stats.wordsFinished !== state.totalWords ||
        stats.accuracy !== state.accuracy ||
        stats.wpm !== state.wpm ||
        stats.gpm !== state.gpm ||
        newCache !== state.wordStatsCache
      ) {
        return {
          ...state,
          totalChars: stats.totalCharsTyped,
          totalErrors: stats.errors,
          totalWords: stats.wordsFinished,
          accuracy: stats.accuracy,
          wpm: stats.wpm,
          gpm: stats.gpm,
          spm: stats.spm,
          wordStatsCache: newCache,
        };
      }
      return state;
    }
    case 'FINISH': {
      if (state.isFinished) return state;
      const finalTime = action.payload?.time ?? 0;
      const stats = calculateStatsHelper(state.words, state.charInputPerWord, state.currentWordIndex, finalTime, state.wordStatsCache);
      return {
        ...state,
        totalChars: stats.totalCharsTyped,
        totalErrors: stats.errors,
        totalWords: stats.wordsFinished,
        accuracy: stats.accuracy,
        wpm: stats.wpm,
        gpm: stats.gpm,
        spm: stats.spm,
        wordStatsCache: stats.newCache || state.wordStatsCache,
        isFinished: true,
      };
    }
    default:
      return state;
  }
}

interface UseTypingPracticeOptions {
  initialText: string;
  isPracticeDrill: boolean;
}

interface UseTypingPracticeReturn {
  // State
  state: TypingState;
  
  // Dispatch actions
  dispatch: React.Dispatch<TypingAction>;
  
  // Convenience methods
  inputChar: (key: string, maxLength: number) => void;
  setCurrentInput: (input: string) => void;
  handleBackspace: (isCtrl?: boolean) => void;
  handleSpace: () => void;
  navigate: (direction: -1 | 1) => void;
  calculateStats: (time: number) => void;
  finish: (time?: number) => void;
  reset: (text: string) => void;
  
  // Derived values
  getCurrentInput: () => string;
  getCurrentWord: () => string;
  getWordClass: (wordIdx: number) => string;
  isError: () => boolean;
  
  // Virtualization support - returns only visible words to optimize rendering
  getVisibleWords: (bufferSize?: number) => Array<{ word: string; index: number }>;
}

/**
 * Hook that manages all typing practice state and logic
 * Returns state and dispatch functions for use in components
 * 
 * Benefits:
 * - Single source of truth for all typing state
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Encapsulates complex state logic
 * - Easy to reuse across multiple components
 */
export function useTypingPractice(options: UseTypingPracticeOptions): UseTypingPracticeReturn {
  const { initialText, isPracticeDrill } = options;
  const [state, dispatch] = useReducer(typingReducer, initialTypingState);

  // Initialize on mount or when text changes
  useEffect(() => {
    dispatch({ type: 'INIT', payload: { initialText, isPracticeDrill } });
  }, [initialText, isPracticeDrill]);

  // Memoized dispatch methods to prevent recreating functions on every render
  const inputChar = useCallback((key: string, maxLength: number) => {
    dispatch({ type: 'INPUT_CHAR', payload: { key, maxLength } });
  }, []);

  const setCurrentInput = useCallback((input: string) => {
    dispatch({ type: 'SET_INPUT', payload: { input } });
  }, []);

  const handleBackspace = useCallback((isCtrl = false) => {
    dispatch({ type: isCtrl ? 'CTRL_BACKSPACE' : 'BACKSPACE' });
  }, []);

  const handleSpace = useCallback(() => {
    dispatch({ type: 'SPACE' });
  }, []);

  const navigate = useCallback((direction: -1 | 1) => {
    dispatch({ type: 'NAVIGATE', payload: { direction } });
  }, []);

  const calculateStats = useCallback((time: number) => {
    dispatch({ type: 'CALCULATE_STATS', payload: { time } });
  }, []);

  const finish = useCallback((time?: number) => {
    dispatch({ type: 'FINISH', payload: { time } });
  }, []);

  const reset = useCallback((text: string) => {
    dispatch({ type: 'RESET', payload: { text, isPracticeDrill } });
  }, [isPracticeDrill]);

  // Derived values with proper normalization
  const getCurrentInput = useCallback(() => {
    return (state.charInputPerWord[state.currentWordIndex] || '').normalize('NFC');
  }, [state.currentWordIndex, state.charInputPerWord]);

  const getCurrentWord = useCallback(() => {
    return state.words[state.currentWordIndex]?.normalize('NFC') || '';
  }, [state.words, state.currentWordIndex]);

  const getWordClass = useCallback((wordIdx: number) => {
    if (wordIdx > state.currentWordIndex) return "text-muted-foreground";
    if (wordIdx < state.currentWordIndex) {
      const typedWord = (state.charInputPerWord[wordIdx] || '').normalize('NFC');
      const expectedWord = state.words[wordIdx]?.normalize('NFC') || '';
      return typedWord === expectedWord ? "text-green-500" : "text-red-500 line-through";
    }
    return "text-primary";
  }, [state.currentWordIndex, state.charInputPerWord, state.words]);

  const isError = useCallback(() => {
    const normalizedInput = getCurrentInput();
    const currentWord = getCurrentWord();
    return normalizedInput.length > 0 && !isValidBengaliTypingPrefix(normalizedInput, currentWord);
  }, [getCurrentInput, getCurrentWord]);

  // Virtualization support: Returns only visible words to prevent DOM overload
  // bufferSize: how many words before/after current word to render (default: 2)
  // Optimized with useCallback to prevent recreating the function on every render
  const getVisibleWords = useCallback((bufferSize: number = 2) => {
    const startIndex = Math.max(0, state.currentWordIndex - bufferSize);
    const endIndex = Math.min(state.words.length - 1, state.currentWordIndex + bufferSize);
    
    const visibleWords = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleWords.push({
        word: state.words[i],
        index: i,
      });
    }
    
    return visibleWords;
  }, [state.currentWordIndex, state.words]);

  return {
    state,
    dispatch,
    inputChar,
    setCurrentInput,
    handleBackspace,
    handleSpace,
    navigate,
    calculateStats,
    finish,
    reset,
    getCurrentInput,
    getCurrentWord,
    getWordClass,
    isError,
    getVisibleWords,
  };
}

export type { TypingState, TypingAction };
