'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

export interface MobileBengaliKeyboardProps {
  onKey: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  nextChar?: string;
  disabled?: boolean;
  className?: string;
}

// Compact Avro-phonetic-friendly Bengali rows for touch typing.
const ROWS: string[][] = [
  ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ'],
  ['জ', 'ঝ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ'],
  ['ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ'],
  ['ব', 'ভ', 'ম', 'য', 'র', 'ল', 'স'],
  ['হ', 'ড়', 'ঢ়', 'য়', 'া', 'ি', 'ী'],
  ['ু', 'ূ', 'ে', 'ৈ', 'ো', 'ৌ', 'ং'],
];

interface KeyButtonProps {
  label: string;
  isNext: boolean;
  disabled: boolean;
  onPress: (key: string) => void;
}

const KeyButton = memo(function KeyButton({ label, isNext, disabled, onPress }: KeyButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPress(label)}
      aria-label={`বাংলা অক্ষর ${label}${isNext ? ' (পরবর্তী)' : ''}`}
      className={cn(
        'flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center rounded-lg border font-hind text-lg font-bold',
        'bg-background text-foreground border-border',
        'active:scale-95 active:bg-accent',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'focus-visible:outline-[3px] focus-visible:outline-offset-2',
        isNext && 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/40',
      )}
    >
      {label}
    </button>
  );
});

export const MobileBengaliKeyboard = memo(function MobileBengaliKeyboard({
  onKey,
  onBackspace,
  onSpace,
  nextChar,
  disabled = false,
  className,
}: MobileBengaliKeyboardProps) {
  return (
    <div
      className={cn('w-full space-y-1.5 rounded-2xl border bg-card p-2', className)}
      role="group"
      aria-label="মোবাইল বাংলা কীবোর্ড"
    >
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5">
          {row.map((ch) => (
            <KeyButton
              key={ch}
              label={ch}
              isNext={nextChar === ch}
              disabled={disabled}
              onPress={onKey}
            />
          ))}
        </div>
      ))}
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          aria-label="ব্যাকস্পেস (মুছুন)"
          className="min-h-[44px] min-w-[44px] flex-1 rounded-lg border border-border bg-secondary font-bold text-foreground active:scale-95 active:bg-accent disabled:opacity-40"
        >
          ⌫
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSpace}
          aria-label="স্পেসবার"
          className="min-h-[44px] flex-[3] rounded-lg border border-border bg-secondary font-bold text-foreground active:scale-95 active:bg-accent disabled:opacity-40"
        >
          স্পেস
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onKey('্')}
          aria-label="হসন্ত"
          className={cn(
            'min-h-[44px] min-w-[44px] flex-1 rounded-lg border font-bold',
            nextChar === '্'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-foreground border-border',
            'active:scale-95 disabled:opacity-40',
          )}
        >
          ্
        </button>
      </div>
    </div>
  );
});

export default MobileBengaliKeyboard;
