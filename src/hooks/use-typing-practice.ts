import { useReducer, useCallback, useRef, useEffect } from 'react';
import {
  TypingState,
  TypingAction,
  initialTypingState,
  typingReducer,
} from '@/reducers/typing-reducer';

/**
 * Custom Hook: useTypingPractice
 * Centralizes all typing state management and logic
 * Prevents "state hell" by consolidating related states into one reducer
 */

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
