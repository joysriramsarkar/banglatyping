'use client';

import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'banglatyping-theme';
const DEFAULT_MODE: ThemeMode = 'system';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode;
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // ignore
  }
  return DEFAULT_MODE;
}

export interface UseThemeResult {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  mounted: boolean;
  setMode: (next: ThemeMode) => void;
  toggle: () => void;
}

export function useTheme(): UseThemeResult {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);
  const [resolved, setResolved] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredMode();
    setModeState(stored);
    setResolved(resolveTheme(stored));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const next = resolveTheme(mode);
    setResolved(next);
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.style.colorScheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode, mounted]);

  useEffect(() => {
    if (!mounted || mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent): void => {
      setResolved(e.matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', e.matches);
      document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
    };
    mq.addEventListener('change', onChange);
    return (): void => mq.removeEventListener('change', onChange);
  }, [mode, mounted]);

  const setMode = useCallback((next: ThemeMode): void => {
    setModeState(next);
  }, []);

  const toggle = useCallback((): void => {
    setModeState((prev) => {
      const current = resolveTheme(prev);
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  return { mode, resolved, mounted, setMode, toggle };
}

export default useTheme;
