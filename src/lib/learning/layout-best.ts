/**
 * Per-layout best scores (localStorage).
 *
 * user_progress has NO layout column, and the save API must not change —
 * so per-layout personal bests live client-side under `layout-best-v1`
 * and are displayed in TodaysReview. Never throws.
 */

export interface LayoutBest {
  layout: string;
  bestWpm: number;
  bestAccuracy: number;
  sessions: number;
  updatedAt: string;
}

const LAYOUT_BEST_KEY = 'layout-best-v1';

export function getLayoutBests(): Record<string, LayoutBest> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LAYOUT_BEST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LayoutBest>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getLayoutBest(layout: string): LayoutBest | null {
  return getLayoutBests()[layout] ?? null;
}

/** Record a session into the per-layout best table. Never throws. */
export function recordLayoutBest(layout: string, wpm: number, accuracy: number): LayoutBest {
  const fallback: LayoutBest = {
    layout,
    bestWpm: wpm,
    bestAccuracy: accuracy,
    sessions: 1,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const all = getLayoutBests();
    const prev = all[layout];
    const next: LayoutBest = {
      layout,
      bestWpm: Math.max(prev?.bestWpm ?? 0, wpm),
      bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
      sessions: (prev?.sessions ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    all[layout] = next;
    localStorage.setItem(LAYOUT_BEST_KEY, JSON.stringify(all));
    return next;
  } catch {
    return fallback;
  }
}
