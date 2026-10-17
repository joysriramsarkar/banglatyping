/**
 * SRS Engine — Leitner box system (boxes 1–5) with ease factor.
 */

export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export interface SRSCard {
  id: string;
  box: LeitnerBox;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  successCount: number;
  failureCount: number;
}

export const MIN_EASE = 1.3;
export const MAX_EASE = 2.5;
export const DEFAULT_EASE = 2.0;

const BOX_INTERVALS: Record<LeitnerBox, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export function createCard(id: string): SRSCard {
  return {
    id,
    box: 1,
    easeFactor: DEFAULT_EASE,
    intervalDays: BOX_INTERVALS[1],
    nextReviewAt: null,
    lastReviewedAt: null,
    successCount: 0,
    failureCount: 0,
  };
}

export function calculateInterval(box: LeitnerBox, easeFactor: number): number {
  const base = BOX_INTERVALS[box] ?? 1;
  return Math.max(1, Math.round(base * easeFactor));
}

export function calculateNextReview(
  card: SRSCard,
  correct: boolean,
  now: Date = new Date(),
): SRSCard {
  const next: SRSCard = { ...card };
  if (correct) {
    next.successCount += 1;
    next.easeFactor = Math.min(MAX_EASE, next.easeFactor + 0.1);
    next.box = Math.min(5, (next.box + 1) as LeitnerBox) as LeitnerBox;
  } else {
    next.failureCount += 1;
    next.easeFactor = Math.max(MIN_EASE, next.easeFactor - 0.2);
    next.box = 1;
  }
  next.intervalDays = calculateInterval(next.box, next.easeFactor);
  next.lastReviewedAt = now.toISOString();
  next.nextReviewAt = new Date(now.getTime() + next.intervalDays * 86_400_000).toISOString();
  return next;
}

export function isDue(card: SRSCard, now: Date = new Date()): boolean {
  if (!card.nextReviewAt) return true;
  return new Date(card.nextReviewAt).getTime() <= now.getTime();
}

const srsEngine = { createCard, calculateInterval, calculateNextReview, isDue };

export default srsEngine;
