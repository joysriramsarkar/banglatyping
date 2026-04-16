"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VirtualizedWordDisplayProps {
  visibleWords: Array<{ word: string; index: number }>;
  currentWordIndex: number;
  totalWords: number;
  getWordClass: (index: number) => string;
  textDisplayFontSize?: string;
}

/**
 * VirtualizedWordDisplay Component
 * 
 * Efficiently renders only visible words instead of the entire word list.
 * This solves the DOM overload problem where thousands of DOM nodes were created.
 * 
 * Benefits:
 * - Only renders current word +/- buffer (default 2 words before/after)
 * - Dramatically reduces DOM node count (from 10,000+ to ~5-7 nodes)
 * - Prevents memory leaks and input delay
 * - Smooth scrolling experience with proper word transitions
 */
export const VirtualizedWordDisplay = ({
  visibleWords,
  currentWordIndex,
  totalWords,
  getWordClass,
  textDisplayFontSize = 'text-3xl',
}: VirtualizedWordDisplayProps) => {
  return (
    <div className={cn("p-6 tracking-wider font-hind leading-relaxed relative select-none", textDisplayFontSize)}>
      <p>
        {visibleWords.map((item) => (
          <React.Fragment key={item.index}>
            <span
              className={cn(
                'transition-colors font-hind',
                getWordClass(item.index),
                item.index === currentWordIndex && 'bg-yellow-100 dark:bg-yellow-800/50 rounded'
              )}
            >
              {item.word.normalize('NFC')}
            </span>
            <span> </span>
          </React.Fragment>
        ))}
      </p>
      
      {/* Indicators for more words ahead/behind */}
      {visibleWords.length > 0 && visibleWords[0].index > 0 && (
        <div className="absolute left-4 top-2 text-xs text-muted-foreground">↑ আরও শব্দ আছে</div>
      )}
      {visibleWords.length > 0 && visibleWords[visibleWords.length - 1].index < totalWords - 1 && (
        <div className="absolute right-4 bottom-2 text-xs text-muted-foreground">↓ আরও শব্দ আছে</div>
      )}
    </div>
  );
};

export default VirtualizedWordDisplay;
