"use client";

/**
 * ImeTypingInput — Gboard-safe Bengali typing input.
 *
 * Mobile IMEs (notably Gboard) do not deliver reliable `keydown` events:
 * keys arrive as `Unidentified`, and Bengali graphemes are built through
 * composition (multiple keystrokes -> one visual unit). This component
 * therefore never relies on keydown:
 *   - `beforeinput` catches deletions (inputType deleteContentBackward…)
 *   - `input` diffs the committed value for direct (non-composing) entry
 *   - `compositionend` commits a whole batch as graphemes via segmentGraphemes
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { segmentGraphemes } from '@/lib/typing/comparator';

export interface UnidentifiedKeyEvent {
  key: string;
}

/**
 * Gboard fallback: a keydown with key === 'Unidentified' carries no usable
 * data — return true so callers ignore the keydown path and wait for the
 * `input`/`compositionend` events, which do carry the committed text.
 */
export function shouldIgnoreKeydown(event: UnidentifiedKeyEvent): boolean {
  return event.key === 'Unidentified' || event.key === 'Process';
}

/** Split a committed composition batch into single graphemes. */
export function resolveImeCommit(data: string): string[] {
  if (!data) return [];
  return segmentGraphemes(data).filter((g) => g.length > 0);
}

export interface UseImeInputOptions {
  /** Full expected text; used to align committed graphemes to positions. */
  target: string;
  /** Called once per committed grapheme, in order. */
  onGrapheme: (grapheme: string, targetIndex: number) => void;
  /** Called when Backspace/delete is detected via beforeinput. */
  onBackspace?: () => void;
}

export interface UseImeInputReturn {
  value: string;
  committedCount: number;
  handleBeforeInput: (event: InputEvent | { inputType: string }) => void;
  handleInput: (nextValue: string) => void;
  handleCompositionEnd: (data: string) => void;
  handleKeyDownFallback: (event: UnidentifiedKeyEvent) => boolean;
  reset: () => void;
}

/**
 * Grapheme-level IME input state machine. Pure w.r.t. the DOM: it consumes
 * values/data strings, so tests can drive it without a browser.
 */
export function useImeInput({ target, onGrapheme, onBackspace }: UseImeInputOptions): UseImeInputReturn {
  const [value, setValue] = useState('');
  const committedRef = useRef<string[]>([]);
  const onGraphemeRef = useRef(onGrapheme);
  onGraphemeRef.current = onGrapheme;

  const reset = useCallback(() => {
    committedRef.current = [];
    setValue('');
  }, []);

  useEffect(() => {
    reset();
  }, [target, reset]);

  const commitGraphemes = useCallback(
    (graphemes: string[]) => {
      for (const g of graphemes) {
        const index = committedRef.current.length;
        committedRef.current.push(g);
        onGraphemeRef.current(g, index);
      }
      setValue(committedRef.current.join(''));
    },
    []
  );

  const handleBeforeInput = useCallback(
    (event: InputEvent | { inputType: string }) => {
      const type = event.inputType ?? '';
      if (type.startsWith('delete')) {
        const last = committedRef.current.pop();
        if (last !== undefined) {
          setValue(committedRef.current.join(''));
          onBackspace?.();
        }
      }
    },
    [onBackspace]
  );

  const handleInput = useCallback(
    (nextValue: string) => {
      // Direct (non-composing) entry, e.g. Gboard word suggestions or
      // hardware keyboards: diff against committed text, commit the tail.
      const committed = committedRef.current.join('');
      if (nextValue === committed) return;
      if (nextValue.startsWith(committed)) {
        const tail = nextValue.slice(committed.length);
        commitGraphemes(resolveImeCommit(tail));
      } else {
        // Edited in the middle — re-align from scratch is out of scope;
        // keep the DOM value so the user sees what they typed.
        setValue(nextValue);
      }
    },
    [commitGraphemes]
  );

  const handleCompositionEnd = useCallback(
    (data: string) => {
      // One composition batch == one or more graphemes committed atomically.
      // A batch that segments to a single grapheme is the common Gboard case.
      commitGraphemes(resolveImeCommit(data));
    },
    [commitGraphemes]
  );

  const handleKeyDownFallback = useCallback((event: UnidentifiedKeyEvent): boolean => {
    return shouldIgnoreKeydown(event);
  }, []);

  return {
    value,
    committedCount: committedRef.current.length,
    handleBeforeInput,
    handleInput,
    handleCompositionEnd,
    handleKeyDownFallback,
    reset,
  };
}

export interface ImeTypingInputProps extends UseImeInputOptions {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  'aria-label'?: string;
}

/** Controlled input wired to useImeInput. No keydown reliance. */
export default function ImeTypingInput({
  target,
  onGrapheme,
  onBackspace,
  placeholder,
  autoFocus,
  className,
  'aria-label': ariaLabel,
}: ImeTypingInputProps) {
  const {
    value,
    handleBeforeInput,
    handleInput,
    handleCompositionEnd,
    handleKeyDownFallback,
  } = useImeInput({ target, onGrapheme, onBackspace });

  return (
    <input
      type="text"
      value={value}
      autoFocus={autoFocus}
      placeholder={placeholder}
      aria-label={ariaLabel ?? 'বাংলা টাইপিং ইনপুট'}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
      className={className}
      onBeforeInput={(e) => handleBeforeInput(e.nativeEvent as InputEvent)}
      onInput={(e) => handleInput(e.currentTarget.value)}
      onCompositionEnd={(e) => handleCompositionEnd(e.data)}
      onKeyDown={(e) => {
        // Informational only — never used for grapheme capture.
        handleKeyDownFallback({ key: e.key });
      }}
    />
  );
}
