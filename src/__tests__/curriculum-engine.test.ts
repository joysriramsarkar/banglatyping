/**
 * Curriculum Engine & Error Diagnostics Unit Tests
 */

import {
  CURRICULUM_LEVELS,
  getCurriculumLessonById,
  getAllCurriculumLessons,
} from '../lib/curriculum/curriculum-data';
import {
  isLessonUnlocked,
  recordLessonCompletion,
  calculateCurriculumProgress,
  INITIAL_CURRICULUM_STATE,
  calculateWordDifficulty,
  getWordDifficultyTier,
  generateWeightedDrillList,
} from '../lib/curriculum/engine';
import {
  classifyGraphemeError,
  getErrorExplanation,
  errorTypeToSkillArea,
} from '../lib/typing/error-classifier';

describe('Curriculum Engine & Data Tests', () => {
  test('all 13 curriculum levels (0 to 12) exist and are populated', () => {
    expect(CURRICULUM_LEVELS.length).toBe(13);
    for (let i = 0; i <= 12; i++) {
      const level = CURRICULUM_LEVELS.find(l => l.level === i);
      expect(level).toBeDefined();
      expect(level!.modules.length).toBeGreaterThan(0);
      for (const mod of level!.modules) {
        expect(mod.lessons.length).toBeGreaterThan(0);
        for (const les of mod.lessons) {
          expect(les.id).toBeTruthy();
          expect(les.sections.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('getCurriculumLessonById finds valid lessons', () => {
    const lesson0 = getCurriculumLessonById('lesson-0-1');
    expect(lesson0).toBeDefined();
    expect(lesson0?.level).toBe(0);

    const lesson12 = getCurriculumLessonById('lesson-12-1');
    expect(lesson12).toBeDefined();
    expect(lesson12?.level).toBe(12);

    const invalid = getCurriculumLessonById('non-existent-lesson-id');
    expect(invalid).toBeUndefined();
  });

  test('getAllCurriculumLessons returns full linear array of lessons', () => {
    const all = getAllCurriculumLessons();
    expect(all.length).toBeGreaterThan(25);
    expect(all[0].id).toBe('lesson-0-1');
  });

  test('Level 0 lessons are unlocked by default', () => {
    const state = INITIAL_CURRICULUM_STATE;
    expect(isLessonUnlocked('lesson-0-1', state)).toBe(true);
  });

  test('Level 1 lesson requires prerequisite completion', () => {
    let state = INITIAL_CURRICULUM_STATE;
    const lesson1 = getCurriculumLessonById('lesson-1-1');
    expect(lesson1).toBeDefined();

    // Before completing prerequisite
    expect(isLessonUnlocked('lesson-1-1', state)).toBe(false);

    // After completing prerequisite lesson-0-1 with 95% accuracy
    state = recordLessonCompletion(state, 'lesson-0-1', 95, 25, 125);
    expect(state.completedLessons['lesson-0-1'].completed).toBe(true);
    expect(isLessonUnlocked('lesson-1-1', state)).toBe(true);
  });

  test('Mastery is granted at >= 97% accuracy', () => {
    let state = INITIAL_CURRICULUM_STATE;
    state = recordLessonCompletion(state, 'lesson-0-1', 98, 30, 150);
    expect(state.completedLessons['lesson-0-1'].mastered).toBe(true);

    const progress = calculateCurriculumProgress(state);
    expect(progress.completedCount).toBe(1);
    expect(progress.masteredCount).toBe(1);
    expect(progress.percentage).toBeGreaterThan(0);
  });
});

describe('Word Difficulty Engine & Weighted Generator Tests', () => {
  test('calculates difficulty for basic, medium, and complex Bengali words', () => {
    const jolDifficulty = calculateWordDifficulty('জল');
    const banglaDifficulty = calculateWordDifficulty('বাংলা');
    const shadhinotaDifficulty = calculateWordDifficulty('স্বাধীনতা');
    const projuktiDifficulty = calculateWordDifficulty('প্রযুক্তি');

    expect(jolDifficulty).toBeGreaterThanOrEqual(1.0);
    expect(banglaDifficulty).toBeGreaterThan(jolDifficulty);
    expect(shadhinotaDifficulty).toBeGreaterThan(banglaDifficulty);
    expect(projuktiDifficulty).toBeGreaterThan(banglaDifficulty);
  });

  test('correctly categorizes difficulty tiers', () => {
    expect(getWordDifficultyTier(1.2)).toBe('Tier 1');
    expect(getWordDifficultyTier(2.5)).toBe('Tier 2');
    expect(getWordDifficultyTier(4.5)).toBe('Tier 3');
    expect(getWordDifficultyTier(5.5)).toBe('Tier 4');
  });

  test('generateWeightedDrillList produces balanced items', () => {
    const items = ['সা', 'দা', 'গা'];
    const generated = generateWeightedDrillList(items, 15);
    expect(generated.length).toBe(15);
    for (const item of generated) {
      expect(items).toContain(item);
    }
  });
});

describe('Error Classification & WhyWasIWrong Diagnostics', () => {
  test('classifies vowel sign errors (wrong-kar)', () => {
    const err = classifyGraphemeError('কি', 'কা');
    expect(err).toBe('wrong-kar');
    expect(getErrorExplanation('wrong-kar')).toContain('কার');
  });

  test('classifies conjunct missing hasanta errors (wrong-hasanta)', () => {
    const err = classifyGraphemeError('ক্ত', 'কত');
    expect(err).toBe('wrong-hasanta');
    expect(getErrorExplanation('wrong-hasanta')).toContain('হসন্ত');
  });

  test('classifies punctuation and space errors', () => {
    expect(classifyGraphemeError('।', ',')).toBe('punctuation-error');
    expect(classifyGraphemeError(' ', 'ক')).toBe('space-error');
  });

  test('maps error types to skill areas for targeted recommender', () => {
    expect(errorTypeToSkillArea('wrong-hasanta')).toBe('hasanta');
    expect(errorTypeToSkillArea('wrong-kar')).toBe('vowel-signs');
    expect(errorTypeToSkillArea('wrong-conjunct')).toBe('conjuncts');
  });
});
