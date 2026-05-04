import { useReducer, useCallback, useRef, useEffect } from 'react';

/**
 * Custom Hook: useTypingPractice
 * Centralizes all typing state management and logic
 * Prevents "state hell" by consolidating related states into one reducer
 */

interface TypingState {
  textToType: string;
  words: string[];
  currentWordIndex: number;
  charInputPerWord: Record<number, string>;
  totalErrors: number;
  totalChars: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  wordStatsCache: Record<number, { rawInput: string, typedWord: string, keystrokes: number, errors: number }>;
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
  | { type: 'FINISH' }
  | { type: 'RESET'; payload: { text: string; isPracticeDrill: boolean } };

const initialTypingState: TypingState = {
  textToType: '',
  words: [],
  currentWordIndex: 0,
  charInputPerWord: {},
  totalErrors: 0,
  totalChars: 0,
  wpm: 0,
  accuracy: 100,
  isFinished: false,
  wordStatsCache: {},
};

/**
 * Calculates WPM, accuracy, and error count based on current typing state
 * Uses standard typing test methodology:
 * - Gross WPM = (Total Keystrokes / 5) / Time in minutes
 * - Net WPM = Gross WPM - (Uncorrected Errors / Time in minutes)
 * 
 * Standard formula ensures accurate speed calculation even when words are skipped or mistyped.
 */
function calculateStatsHelper(
  words: string[],
  charInputPerWord: Record<number, string>,
  currentWordIndex: number,
  time: number,
  wordStatsCache: Record<number, { rawInput: string, typedWord: string, keystrokes: number, errors: number }>
) {
  let totalKeystrokesTyped = 0;
  let uncorrectedErrors = 0;
  let newCache: Record<number, { rawInput: string, typedWord: string, keystrokes: number, errors: number }> | null = null;

  // Process all words up to and including current word
  for (let i = 0; i <= currentWordIndex; i++) {
    const rawInput = charInputPerWord[i] || '';
    let stats = wordStatsCache[i];

    // Calculate stats if not cached or if the word has changed
    if (!stats || stats.rawInput !== rawInput) {
      const typedWord = rawInput.normalize('NFC');
      const expectedWord = words[i]?.normalize('NFC') || '';
      let errors = 0;

      const expectedLength = expectedWord.length;
      const typedLength = typedWord.length;

      // Compare character by character up to the longer length
      for (let j = 0; j < Math.max(expectedLength, typedLength); j++) {
        const expectedChar = expectedWord[j] || '';
        const typedChar = typedWord[j] || '';

        if (expectedChar !== typedChar) {
          errors++;
        }
      }

      stats = { rawInput, typedWord, keystrokes: typedLength, errors };
      if (!newCache) newCache = { ...wordStatsCache };
      newCache[i] = stats;
    }
    
    // Add each typed character to keystroke count
    totalKeystrokesTyped += stats.keystrokes;
    
    // Add space between words (except for current incomplete word)
    if (i < currentWordIndex) {
      totalKeystrokesTyped += 1;
    }
    
    // Add uncorrected errors for this word
    uncorrectedErrors += stats.errors;
  }

  // Calculate accuracy: (characters correct) / (total characters typed) * 100
  const totalCharsTyped = totalKeystrokesTyped;
  const correctChars = totalCharsTyped - uncorrectedErrors;
  const accuracy = totalCharsTyped > 0 ? Math.round((correctChars / totalCharsTyped) * 100) : 100;

  // Calculate WPM using standard typing test formula
  const timeInMinutes = time / 60;
  const grossWpm = timeInMinutes > 0 ? (totalKeystrokesTyped / 5) / timeInMinutes : 0;
  const netWpm = timeInMinutes > 0 ? grossWpm - (uncorrectedErrors / timeInMinutes) : 0;
  
  // Use Net WPM (with minimum of 0)
  const wpm = Math.round(Math.max(0, netWpm));

  return { totalCharsTyped, errors: uncorrectedErrors, accuracy, wpm, newCache };
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
      const { key, maxLength } = action.payload;
      const currentInput = (state.charInputPerWord[state.currentWordIndex] || '').normalize('NFC');
      const newInput = (currentInput + key).normalize('NFC');
      
      if (newInput.length <= maxLength) {
        return {
          ...state,
          charInputPerWord: { ...state.charInputPerWord, [state.currentWordIndex]: newInput },
        };
      }
      return state;
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
        // Use Intl.Segmenter to correctly handle Bengali grapheme clusters
        let newInput: string;
        try {
          const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
          const segments = Array.from(segmenter.segment(currentInput));
          newInput = segments.slice(0, -1).map(s => s.segment).join('');
        } catch {
          newInput = currentInput.slice(0, -1);
        }
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
        stats.accuracy !== state.accuracy ||
        stats.wpm !== state.wpm ||
        newCache !== state.wordStatsCache
      ) {
        return {
          ...state,
          totalChars: stats.totalCharsTyped,
          totalErrors: stats.errors,
          accuracy: stats.accuracy,
          wpm: stats.wpm,
          wordStatsCache: newCache,
        };
      }
      return state;
    }
    case 'FINISH':
      if (state.isFinished) return state;
      return { ...state, isFinished: true };
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
  finish: () => void;
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
  const prevStatsRef = useRef({ wpm: 0, accuracy: 100, errors: 0, chars: 0 });

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

  const finish = useCallback(() => {
    dispatch({ type: 'FINISH' });
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
    return normalizedInput.length > 0 && !currentWord.startsWith(normalizedInput);
  }, [getCurrentInput, getCurrentWord]);

  // Virtualization support: Returns only visible words to prevent DOM overload
  // bufferSize: how many words before/after current word to render (default: 2)
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
