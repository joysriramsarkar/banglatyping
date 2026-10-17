'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

export const WORD_WINDOW_RADIUS = 30;

export interface WindowedWord {
  word: string;
  index: number;
}

/** Simple windowing: render ±radius words around currentIndex. No external deps. */
export function getWordWindow(
  words: string[],
  currentIndex: number,
  radius: number = WORD_WINDOW_RADIUS,
): WindowedWord[] {
  const start = Math.max(0, currentIndex - radius);
  const end = Math.min(words.length, currentIndex + radius + 1);
  const out: WindowedWord[] = [];
  for (let i = start; i < end; i++) {
    out.push({ word: words[i], index: i });
  }
  return out;
}

interface VirtualizedWordDisplayProps {
  words: string[];
  currentWordIndex: number;
  getWordClass: (index: number) => string;
  radius?: number;
  textDisplayFontSize?: string;
}

export const VirtualizedWordDisplay = memo(function VirtualizedWordDisplay({
  words,
  currentWordIndex,
  getWordClass,
  radius = WORD_WINDOW_RADIUS,
  textDisplayFontSize = 'text-3xl',
}: VirtualizedWordDisplayProps) {
  const visibleWords = useMemo(
    () => getWordWindow(words, currentWordIndex, radius),
    [words, currentWordIndex, radius],
  );

  const hasBefore = visibleWords.length > 0 && visibleWords[0].index > 0;
  const hasAfter =
    visibleWords.length > 0 && visibleWords[visibleWords.length - 1].index < words.length - 1;

  return (
    <div
      className={cn(
        'p-6 tracking-wider font-hind leading-relaxed relative select-none',
        textDisplayFontSize,
      )}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        শব্দ {currentWordIndex + 1} / {words.length}
      </span>
      <p aria-hidden="true">
        {visibleWords.map((item) => (
          <span key={item.index}>
            <span
              className={cn(
                'transition-colors font-hind',
                getWordClass(item.index),
                item.index === currentWordIndex && 'bg-yellow-100 dark:bg-yellow-800/50 rounded',
              )}
            >
              {item.word.normalize('NFC')}
            </span>
            <span> </span>
          </span>
        ))}
      </p>
      {hasBefore ? (
        <div className="absolute left-4 top-2 text-xs text-muted-foreground" aria-hidden="true">
          ↑ আরও শব্দ আছে
        </div>
      ) : null}
      {hasAfter ? (
        <div className="absolute right-4 bottom-2 text-xs text-muted-foreground" aria-hidden="true">
          ↓ আরও শব্দ আছে
        </div>
      ) : null}
    </div>
  );
});

export default VirtualizedWordDisplay;
