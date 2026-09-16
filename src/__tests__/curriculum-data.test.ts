/**
 * Unit Tests for Curriculum Dataset
 */

import { CURRICULUM_LEVELS, getCurriculumLessonById, getAllCurriculumLessons } from '../lib/curriculum/curriculum-data';

describe('CURRICULUM_LEVELS Complete Coverage', () => {
  test('all 13 levels exist', () => {
    expect(CURRICULUM_LEVELS.length).toBe(13);
  });

  test('every lesson has valid sections and items', () => {
    const all = getAllCurriculumLessons();
    expect(all.length).toBeGreaterThan(20);
    for (const les of all) {
      expect(les.id).toBeDefined();
      expect(les.title).toBeDefined();
      expect(les.sections.length).toBeGreaterThan(0);
      for (const sec of les.sections) {
        expect(sec.id).toBeDefined();
        expect(sec.title).toBeDefined();
      }
    }
  });

  test('getCurriculumLessonById returns correct lessons for key IDs', () => {
    expect(getCurriculumLessonById('lesson-0-1')).toBeDefined();
    expect(getCurriculumLessonById('lesson-1-1')).toBeDefined();
    expect(getCurriculumLessonById('lesson-12-1')).toBeDefined();
    expect(getCurriculumLessonById('non-existent')).toBeUndefined();
  });
});
