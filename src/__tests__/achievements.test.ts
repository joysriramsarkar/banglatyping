/**
 * Achievements — sticky lesson badges and best-score preservation.
 *
 * Complements curriculum-engine.test.ts (which covers the mastered /
 * everMastered sticky badge and legacy sanitization): this file pins the
 * surrounding achievement invariants — best WPM/GPM preservation, completion
 * counting, lesson advancement, and unknown-lesson safety.
 */

import {
  INITIAL_CURRICULUM_STATE,
  calculateCurriculumProgress,
  isLessonUnlocked,
  recordLessonCompletion,
} from '../lib/curriculum/engine';
import {
  ACHIEVEMENTS,
  calculateXP,
  unlockedAchievements,
  type AchievementId,
} from '../lib/game/achievements';

describe('lesson achievement records', () => {
  test('first completion records bests and advances to the next lesson', () => {
    const state = recordLessonCompletion(
      INITIAL_CURRICULUM_STATE,
      'lesson-0-1',
      92,
      25,
      120,
    );
    const progress = state.completedLessons['lesson-0-1'];
    expect(progress.completed).toBe(true);
    expect(progress.mastered).toBe(false);
    expect(progress.everMastered).toBe(false);
    expect(progress.bestWpm).toBe(25);
    expect(progress.bestGpm).toBe(120);
    expect(progress.timesCompleted).toBe(1);
    expect(state.currentLessonId).not.toBe('lesson-0-1');
  });

  test('a weaker repeat preserves bests and does not double-count completion', () => {
    let state = recordLessonCompletion(
      INITIAL_CURRICULUM_STATE,
      'lesson-0-1',
      98,
      30,
      150,
    );
    state = recordLessonCompletion(state, 'lesson-0-1', 70, 12, 60);
    const progress = state.completedLessons['lesson-0-1'];
    expect(progress.completed).toBe(true); // sticky milestone
    expect(progress.mastered).toBe(false); // current form regressed
    expect(progress.everMastered).toBe(true); // all-time badge kept
    expect(progress.bestWpm).toBe(30);
    expect(progress.bestGpm).toBe(150);
    expect(progress.lastAccuracy).toBe(70);
    expect(progress.timesCompleted).toBe(1); // 70% is not a completion
  });

  test('repeated completions keep raising the bests', () => {
    let state = recordLessonCompletion(
      INITIAL_CURRICULUM_STATE,
      'lesson-0-1',
      95,
      25,
      125,
    );
    state = recordLessonCompletion(state, 'lesson-0-1', 99, 40, 200);
    const progress = state.completedLessons['lesson-0-1'];
    expect(progress.timesCompleted).toBe(2);
    expect(progress.bestAccuracy).toBe(99);
    expect(progress.bestWpm).toBe(40);
    expect(progress.bestGpm).toBe(200);
    expect(progress.everMastered).toBe(true);
  });

  test('unknown lesson ids leave the state untouched', () => {
    const state = recordLessonCompletion(
      INITIAL_CURRICULUM_STATE,
      'lesson-does-not-exist',
      100,
      50,
      250,
    );
    expect(state).toBe(INITIAL_CURRICULUM_STATE);
  });

  test('headline progress counts completions and unlocks the next lesson', () => {
    let state = INITIAL_CURRICULUM_STATE;
    expect(isLessonUnlocked('lesson-1-1', state)).toBe(false);
    state = recordLessonCompletion(state, 'lesson-0-1', 95, 25, 125);
    const headline = calculateCurriculumProgress(state);
    expect(headline.completedCount).toBe(1);
    expect(headline.percentage).toBeGreaterThan(0);
    expect(isLessonUnlocked('lesson-1-1', state)).toBe(true);
  });
});

describe('game achievement + XP engine', () => {
  test('catalog has five fully-labeled achievements', () => {
    const ids = Object.keys(ACHIEVEMENTS) as AchievementId[];
    expect(ids).toHaveLength(5);
    for (const id of ids) {
      const a = ACHIEVEMENTS[id];
      expect(a.id).toBe(id);
      expect(a.titleBn.length).toBeGreaterThan(0);
      expect(a.titleEn.length).toBeGreaterThan(0);
      expect(a.xp).toBeGreaterThan(0);
      expect(a.threshold).toBeGreaterThan(0);
    }
  });

  test('XP rewards volume, accuracy tiers and practice time', () => {
    expect(calculateXP({ wpm: 0, accuracy: 0, wordsTyped: 0, minutesPracticed: 0 })).toBe(0);
    const elite = calculateXP({ wpm: 40, accuracy: 97, wordsTyped: 100, minutesPracticed: 10 });
    const good = calculateXP({ wpm: 40, accuracy: 92, wordsTyped: 100, minutesPracticed: 10 });
    const sloppy = calculateXP({ wpm: 40, accuracy: 80, wordsTyped: 100, minutesPracticed: 10 });
    // base 130 + time 20, plus 50 / 20 / 0 accuracy bonus.
    expect(elite).toBe(200);
    expect(good).toBe(170);
    expect(sloppy).toBe(150);
  });

  test('unlocks fire at thresholds and never twice', () => {
    const fresh = { sessions: 0, words: 0, bestWpm: 0, minutes: 0, layouts: 0 };
    expect(unlockedAchievements(fresh)).toEqual([]);

    const stats = { sessions: 1, words: 100, bestWpm: 40, minutes: 60, layouts: 3 };
    expect(unlockedAchievements(stats).sort()).toEqual(
      ['century', 'firststeps', 'marathon', 'polyglot', 'speeddemon'].sort(),
    );

    // Already-owned achievements are not reported again.
    expect(
      unlockedAchievements(stats, ['firststeps', 'century', 'speeddemon', 'marathon', 'polyglot']),
    ).toEqual([]);
    expect(unlockedAchievements(stats, ['firststeps'])).not.toContain('firststeps');
  });
});
