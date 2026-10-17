"use client";

/**
 * LayoutPicker — onboarding layout question.
 *
 * "কোন লেআউটে পরীক্ষা দেবেন?" — six layouts as radios, dismissible.
 * Persists `layout-choice` plus the shared active-layout key so the
 * on-screen keyboard and hints agree; learner level goes to the existing
 * user-mode key via saveStoredUserMode. Renders nothing once a choice is
 * stored (unless `force` is set). Never throws.
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  KEYBOARD_LAYOUT_OPTIONS,
  getActiveKeyboardLayout,
  setActiveKeyboardLayout,
  type KeyboardLayoutKey,
} from '@/lib/keyboard-layouts';
import { getStoredUserMode, saveStoredUserMode, type UserMode } from '@/lib/user-mode';
import { cn } from '@/lib/utils';

export const LAYOUT_CHOICE_KEY = 'layout-choice';
const LAYOUT_DISMISSED_KEY = 'layout-choice-dismissed';

const MODE_OPTIONS: Array<{ value: UserMode; label: string }> = [
  { value: 'beginner', label: 'শিক্ষানবিশ' },
  { value: 'intermediate', label: 'মধ্যম' },
  { value: 'advanced', label: 'উন্নত' },
];

export function getStoredLayoutChoice(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      localStorage.getItem(LAYOUT_CHOICE_KEY) ??
      (localStorage.getItem(LAYOUT_DISMISSED_KEY) ? 'dismissed' : null)
    );
  } catch {
    return null;
  }
}

export default function LayoutPicker({ force = false }: { force?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState<KeyboardLayoutKey>('banglaword');
  const [mode, setMode] = useState<UserMode>('beginner');

  useEffect(() => {
    if (force) {
      setVisible(true);
      return;
    }
    try {
      const chosen = localStorage.getItem(LAYOUT_CHOICE_KEY);
      const dismissed = localStorage.getItem(LAYOUT_DISMISSED_KEY);
      if (!chosen && !dismissed) {
        setLayout(getActiveKeyboardLayout());
        setMode(getStoredUserMode());
        setVisible(true);
      }
    } catch {
      // storage blocked — stay hidden rather than nag every visit
    }
  }, [force]);

  if (!visible) return null;

  const save = (value: KeyboardLayoutKey | null, nextMode: UserMode) => {
    try {
      if (value) {
        localStorage.setItem(LAYOUT_CHOICE_KEY, value);
        setActiveKeyboardLayout(value);
      } else {
        localStorage.setItem(LAYOUT_DISMISSED_KEY, '1');
      }
      saveStoredUserMode(nextMode);
    } catch {
      // ignore — onboarding must never block learning
    }
    setVisible(false);
  };

  return (
    <Card className="border-primary/30 bg-primary/5 shadow-sm" role="dialog" aria-label="লেআউট নির্বাচন">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">কোন লেআউটে পরীক্ষা দেবেন?</CardTitle>
        <p className="text-xs text-muted-foreground">
          পরে যেকোনো সময় বদলাতে পারবেন — আপনার পছন্দ মনে রাখা হবে।
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div role="radiogroup" aria-label="কীবোর্ড লেআউট" className="grid gap-2 sm:grid-cols-2">
          {KEYBOARD_LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={layout === opt.value}
              onClick={() => setLayout(opt.value)}
              className={cn(
                'text-left rounded-lg border p-3 transition-colors',
                layout === opt.value
                  ? 'border-primary bg-background shadow-xs'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              <p className="text-sm font-bold">{opt.label}</p>
              <p className="text-[11px] text-muted-foreground">{opt.subtitle}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground">আপনার স্তর:</span>
          {MODE_OPTIONS.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={mode === m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors',
                mode === m.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted/50'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => save(layout, mode)} className="font-bold">
            এই লেআউটে শুরু করুন
          </Button>
          <Button variant="ghost" onClick={() => save(null, mode)}>
            পরে সিদ্ধান্ত নেব
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
