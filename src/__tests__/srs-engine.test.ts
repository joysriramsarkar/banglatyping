/**
 * SRS Engine — spaced-repetition schedule and mastery transitions.
 *
 * Complements learning-mastery-recommender.test.ts (which covers record
 * creation, basic updates, stats aggregation and the recommender): this file
 * pins the review-interval schedule [1, 3, 7, 14, 30] days, the regression /
 * recovery transitions, and the strength bounds.
 */

import {
  createSkillMastery,
  getMasteryColor,
  getMasteryLabel,
  isDueForReview,
  updateMastery,
} from '../lib/learning/mastery';
import {
  DEFAULT_EASE,
  MAX_EASE,
  MIN_EASE,
  calculateInterval,
  calculateNextReview,
  createCard,
  isDue,
  type LeitnerBox,
} from '../lib/learning/srs-engine';
import type { SkillMastery } from '../lib/types';

const FIXED_NOW = '2026-01-01T00:00:00.000Z';

function daysAfterNow(days: number): string {
  const d = new Date(FIXED_NOW);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Drive a fresh skill through `n` successful sessions at 99% accuracy. */
function drillSuccesses(n: number, accuracy = 99): SkillMastery {
  let mastery = createSkillMastery('user-1', 'char-ক');
  for (let i = 0; i < n; i++) {
    mastery = updateMastery(mastery, accuracy, FIXED_NOW);
  }
  return mastery;
}

describe('SRS review schedule', () => {
  test('a new skill has no review date and is never due', () => {
    const mastery = createSkillMastery('user-1', 'char-ক');
    expect(mastery.nextReviewAt).toBeNull();
    expect(isDueForReview(mastery, FIXED_NOW)).toBe(false);
  });

  test('first success schedules a 1-day review and enters PRACTICING', () => {
    const mastery = updateMastery(createSkillMastery('user-1', 'char-ক'), 98, FIXED_NOW);
    expect(mastery.status).toBe('PRACTICING');
    expect(mastery.nextReviewAt).toBe(daysAfterNow(1));
    expect(isDueForReview(mastery, FIXED_NOW)).toBe(false);
    expect(isDueForReview(mastery, daysAfterNow(2))).toBe(true);
  });

  test('intervals lengthen with stability: 3d → 7d → 14d → 30d', () => {
    // stability grows +5 per success; interval index = floor(stability / 20).
    expect(drillSuccesses(4).nextReviewAt).toBe(daysAfterNow(3)); // stability 20
    expect(drillSuccesses(8).nextReviewAt).toBe(daysAfterNow(7)); // stability 40
    expect(drillSuccesses(12).nextReviewAt).toBe(daysAfterNow(14)); // stability 60
    expect(drillSuccesses(16).nextReviewAt).toBe(daysAfterNow(30)); // stability 80
    expect(drillSuccesses(30).nextReviewAt).toBe(daysAfterNow(30)); // capped
  });

  test('sustained mastery reaches MASTERED once stability is sufficient', () => {
    const mastery = drillSuccesses(8);
    expect(mastery.status).toBe('MASTERED');
    expect(mastery.successCount).toBe(8);
  });
});

describe('SRS regression and recovery', () => {
  test('a MASTERED skill drops to NEEDS_REVIEW after a poor session', () => {
    const mastered = drillSuccesses(10);
    expect(mastered.status).toBe('MASTERED');
    const regressed = updateMastery(mastered, 70, FIXED_NOW);
    expect(regressed.status).toBe('NEEDS_REVIEW');
    expect(regressed.failureCount).toBe(1);
  });

  test('a NEEDS_REVIEW skill recovers to MASTERED after strong sessions', () => {
    const needsReview = {
      ...createSkillMastery('user-1', 'char-ক'),
      status: 'NEEDS_REVIEW' as const,
      successCount: 3,
      failureCount: 1,
      stability: 55,
      strength: 60,
    };
    const recovered = updateMastery(needsReview, 98, FIXED_NOW);
    expect(recovered.status).toBe('MASTERED');
  });

  test('strength stays within 0–100 under long failure/success streaks', () => {
    let weak = createSkillMastery('user-1', 'char-ক');
    for (let i = 0; i < 20; i++) weak = updateMastery(weak, 10, FIXED_NOW);
    expect(weak.strength).toBe(0);
    expect(weak.stability).toBe(0);

    const strong = drillSuccesses(50);
    expect(strong.strength).toBe(100);
    expect(strong.stability).toBe(100);
  });
});

describe('SRS display helpers cover every status', () => {
  test('labels and colors are defined for all six statuses', () => {
    const statuses = [
      'LOCKED',
      'LEARNING',
      'PRACTICING',
      'PROFICIENT',
      'MASTERED',
      'NEEDS_REVIEW',
    ] as const;
    for (const status of statuses) {
      expect(getMasteryLabel(status).length).toBeGreaterThan(0);
      expect(getMasteryColor(status)).toMatch(/^text-/);
    }
    expect(getMasteryLabel('NEEDS_REVIEW')).toBe('পর্যালোচনা দরকার');
    expect(getMasteryColor('MASTERED')).toBe('text-green-500');
  });
});

describe('Leitner box engine (learning/srs-engine)', () => {
  const NOW = new Date('2026-01-01T00:00:00.000Z');

  test('new cards start in box 1 with default ease', () => {
    const card = createCard('card-1');
    expect(card).toMatchObject({
      id: 'card-1',
      box: 1,
      easeFactor: DEFAULT_EASE,
      intervalDays: 1,
      nextReviewAt: null,
      successCount: 0,
      failureCount: 0,
    });
  });

  test('intervals scale with box and ease, minimum 1 day', () => {
    expect(calculateInterval(1, 2.0)).toBe(2);
    expect(calculateInterval(3, 2.0)).toBe(14);
    expect(calculateInterval(5, 2.5)).toBe(75);
    expect(calculateInterval(9 as LeitnerBox, 0.1)).toBe(1);
  });

  test('correct reviews promote the box and raise ease up to the cap', () => {
    let card = createCard('c');
    card = calculateNextReview(card, true, NOW);
    expect(card.box).toBe(2);
    expect(card.successCount).toBe(1);
    expect(card.easeFactor).toBeCloseTo(DEFAULT_EASE + 0.1);
    expect(card.lastReviewedAt).toBe(NOW.toISOString());
    expect(card.nextReviewAt).not.toBeNull();

    // Box never exceeds 5 and ease never exceeds MAX_EASE.
    for (let i = 0; i < 10; i++) card = calculateNextReview(card, true, NOW);
    expect(card.box).toBe(5);
    expect(card.easeFactor).toBeLessThanOrEqual(MAX_EASE);
  });

  test('failed reviews reset to box 1 and lower ease down to the floor', () => {
    let card = createCard('c');
    card = calculateNextReview(card, true, NOW);
    card = calculateNextReview(card, false, NOW);
    expect(card.box).toBe(1);
    expect(card.failureCount).toBe(1);

    for (let i = 0; i < 20; i++) card = calculateNextReview(card, false, NOW);
    expect(card.easeFactor).toBeGreaterThanOrEqual(MIN_EASE);
  });

  test('due check treats unscheduled cards as due', () => {
    expect(isDue(createCard('c'), NOW)).toBe(true);
    const reviewed = calculateNextReview(createCard('c'), true, NOW);
    expect(isDue(reviewed, NOW)).toBe(false);
    expect(
      isDue(reviewed, new Date(NOW.getTime() + 365 * 86_400_000)),
    ).toBe(true);
  });
});
