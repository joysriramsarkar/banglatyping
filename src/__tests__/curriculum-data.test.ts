/**
 * Unit Tests for Curriculum Dataset
 */

import { CURRICULUM_LEVELS, getCurriculumLessonById, getAllCurriculumLessons, getNextCurriculumLesson } from '../lib/curriculum/curriculum-data';

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

  test('getNextCurriculumLesson returns the next lesson in sequence', () => {
    const nextAfter01 = getNextCurriculumLesson('lesson-0-1');
    expect(nextAfter01).toBeDefined();
    expect(nextAfter01?.id).toBe('lesson-1-1');

    const nextAfter11 = getNextCurriculumLesson('lesson-1-1');
    expect(nextAfter11).toBeDefined();
    expect(nextAfter11?.id).toBe('lesson-1-2');

    const all = getAllCurriculumLessons();
    const lastLesson = all[all.length - 1];
    expect(getNextCurriculumLesson(lastLesson.id)).toBeUndefined();
  });

  test('curriculum drill sections have expanded practice items', () => {
    const l11 = getCurriculumLessonById('lesson-1-1');
    expect(l11).toBeDefined();
    const practiceSec = l11?.sections.find((s) => s.items && s.items.length > 0);
    expect(practiceSec).toBeDefined();
    expect(practiceSec?.items?.length).toBeGreaterThanOrEqual(25);

    // Also check lesson-1-1 mastery section
    const masterySec = l11?.sections.find((s) => s.type === 'mastery');
    expect(masterySec).toBeDefined();
    expect(masterySec?.items?.length).toBeGreaterThanOrEqual(25);
  });
});
