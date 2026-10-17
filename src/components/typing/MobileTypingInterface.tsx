'use client';

import { useCallback } from 'react';
import type { JSX } from 'react';
import { Progress } from '@/components/ui/progress';
import { MobileBengaliKeyboard } from './MobileBengaliKeyboard';
import { toBengaliNumber } from '@/lib/utils';

export interface MobileTypingInterfaceProps {
  targetText: string;
  typedText: string;
  currentIndex: number;
  gpm: number;
  accuracy: number;
  onType: (char: string) => void;
  onBackspace: () => void;
  className?: string;
}

function vibrateOnError(): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  } catch {
    // ignore — haptics are best-effort
  }
}

export function MobileTypingInterface({
  targetText,
  typedText,
  currentIndex,
  gpm,
  accuracy,
  onType,
  onBackspace,
  className,
}: MobileTypingInterfaceProps): JSX.Element {
  const progress =
    targetText.length === 0 ? 0 : Math.min(100, (currentIndex / targetText.length) * 100);
  const nextChar = targetText[currentIndex] ?? '';
  const isError =
    typedText.length > 0 && typedText[typedText.length - 1] !== targetText[typedText.length - 1];

  const handleKey = useCallback(
    (key: string) => {
      const expected = targetText[currentIndex];
      if (expected !== undefined && key !== expected) {
        vibrateOnError();
      }
      onType(key);
    },
    [currentIndex, onType, targetText],
  );

  const handleSpace = useCallback(() => {
    handleKey(' ');
  }, [handleKey]);

  return (
    <section
      aria-label="মোবাইল টাইপিং ইন্টারফেস"
      className={
        className ??
        'mx-auto flex w-full max-w-md flex-col gap-3 px-3 portrait:max-w-md landscape:max-w-2xl'
      }
    >
      {/* Progress + GPM bar */}
      <div className="space-y-1.5 rounded-xl border bg-card p-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            অগ্রগতি {toBengaliNumber(currentIndex)}/{toBengaliNumber(targetText.length)}
          </span>
          <span aria-live="polite">
            {toBengaliNumber(gpm)} GPM · {toBengaliNumber(accuracy)}%
          </span>
        </div>
        <Progress value={progress} aria-label={`অগ্রগতি ${Math.round(progress)} শতাংশ`} />
        <p className="truncate font-hind text-sm text-foreground" aria-hidden="true">
          <span className="text-green-600 dark:text-green-400">
            {targetText.slice(0, currentIndex)}
          </span>
          <span className="bg-yellow-200 dark:bg-yellow-800">
            {nextChar === ' ' ? '␣' : nextChar}
          </span>
          <span className="text-muted-foreground">{targetText.slice(currentIndex + 1)}</span>
        </p>
        <span className="sr-only" aria-live="polite">
          পরবর্তী অক্ষর {nextChar}
        </span>
        {isError ? (
          <p role="alert" className="text-xs font-bold text-destructive">
            ভুল অক্ষর! আবার চেষ্টা করুন।
          </p>
        ) : null}
      </div>

      <MobileBengaliKeyboard
        onKey={handleKey}
        onBackspace={onBackspace}
        onSpace={handleSpace}
        nextChar={nextChar}
      />
    </section>
  );
}

export default MobileTypingInterface;
