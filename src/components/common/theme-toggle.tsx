'use client';

import { Moon, Sun } from 'lucide-react';
import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps): JSX.Element {
  const { resolved, toggle, mounted } = useTheme();
  const isDark = resolved === 'dark';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
      aria-pressed={isDark}
      title={isDark ? 'লাইট মোড (Light mode)' : 'ডার্ক মোড (Dark mode)'}
      className={cn(
        // Contrast-safe: explicit border + foreground tokens in both themes
        'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-[3px] focus-visible:outline-offset-2',
        className,
      )}
    >
      {!mounted ? (
        <Sun className={iconSize} aria-hidden="true" />
      ) : isDark ? (
        <Sun className={iconSize} aria-hidden="true" />
      ) : (
        <Moon className={iconSize} aria-hidden="true" />
      )}
      <span className="sr-only">{isDark ? 'লাইট মোডে যান' : 'ডার্ক মোডে যান'}</span>
    </Button>
  );
}

export default ThemeToggle;
