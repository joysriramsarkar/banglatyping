import { calculateStatsHelper } from '@/utils/typing-stats';

export interface TypingState {
  textToType: string;
  words: string[];
  currentWordIndex: number;
  charInputPerWord: Record<number, string>;
  totalErrors: number;
  totalChars: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
}

export type TypingAction =
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

export const initialTypingState: TypingState = {
  textToType: '',
  words: [],
  currentWordIndex: 0,
  charInputPerWord: {},
  totalErrors: 0,
  totalChars: 0,
  wpm: 0,
  accuracy: 100,
  isFinished: false,
};

/**
 * Reducer function that handles all typing state transitions
 * All state changes go through this single source of truth
 */
export function typingReducer(state: TypingState, action: TypingAction): TypingState {
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
      const stats = calculateStatsHelper(state.words, state.charInputPerWord, state.currentWordIndex, action.payload.time);

      // Only update if stats actually changed to prevent unnecessary re-renders
      if (
        stats.totalCharsTyped !== state.totalChars ||
        stats.errors !== state.totalErrors ||
        stats.accuracy !== state.accuracy ||
        stats.wpm !== state.wpm
      ) {
        return {
          ...state,
          totalChars: stats.totalCharsTyped,
          totalErrors: stats.errors,
          accuracy: stats.accuracy,
          wpm: stats.wpm,
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
