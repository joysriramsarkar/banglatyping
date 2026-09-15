/**
 * Curriculum Engine
 *
 * Handles prerequisites checking, section progression, mastery threshold verification,
 * and user level progression.
 */

import {
  CURRICULUM_LEVELS,
  getCurriculumLessonById,
  getAllCurriculumLessons,
} from './curriculum-data';
import type {
  UserLessonProgress,
  UserCurriculumState,
} from './types';

const STORAGE_KEY = 'banglatyping_curriculum_state';

/** Default initial curriculum state (Level 0 unlocked) */
export const INITIAL_CURRICULUM_STATE: UserCurriculumState = {
  completedLessons: {},
  currentLessonId: 'lesson-0-1',
  unlockedLevel: 0,
};

/** Get local curriculum state from localStorage (or fallback) */
export function getStoredCurriculumState(): UserCurriculumState {
  if (typeof window === 'undefined') return INITIAL_CURRICULUM_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CURRICULUM_STATE;
    return JSON.parse(raw);
  } catch {
    return INITIAL_CURRICULUM_STATE;
  }
}

/** Save local curriculum state to localStorage */
export function saveStoredCurriculumState(state: UserCurriculumState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save curriculum state:', err);
  }
}

/**
 * Check if a lesson is unlocked for a user
 * Level 0 is always unlocked. Other lessons require all their prerequisites to be completed.
 */
export function isLessonUnlocked(
  lessonId: string,
  state: UserCurriculumState
): boolean {
  const lesson = getCurriculumLessonById(lessonId);
  if (!lesson) return false;

  // Level 0 is always unlocked
  if (lesson.level === 0) return true;

  // Check if all prerequisites are completed
  return lesson.prerequisites.every(
    preId => state.completedLessons[preId]?.completed
  );
}

/**
 * Record a lesson attempt / completion in state
 */
export function recordLessonCompletion(
  state: UserCurriculumState,
  lessonId: string,
  accuracy: number,
  wpm: number,
  gpm: number
): UserCurriculumState {
  const lesson = getCurriculumLessonById(lessonId);
  if (!lesson) return state;

  const current = state.completedLessons[lessonId] || {
    lessonId,
    completed: false,
    mastered: false,
    bestAccuracy: 0,
    bestWpm: 0,
    bestGpm: 0,
    timesCompleted: 0,
    lastAttemptAt: new Date().toISOString(),
  };

  const isCompleted = accuracy >= 90;
  const isMastered = accuracy >= 97;

  const updatedProgress: UserLessonProgress = {
    lessonId,
    completed: current.completed || isCompleted,
    mastered: current.mastered || isMastered,
    bestAccuracy: Math.max(current.bestAccuracy, accuracy),
    bestWpm: Math.max(current.bestWpm, wpm),
    bestGpm: Math.max(current.bestGpm, gpm),
    timesCompleted: current.timesCompleted + (isCompleted ? 1 : 0),
    lastAttemptAt: new Date().toISOString(),
  };

  const newCompletedLessons = {
    ...state.completedLessons,
    [lessonId]: updatedProgress,
  };

  // Find next lesson to set as current
  const allLessons = getAllCurriculumLessons();
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  let nextLessonId = state.currentLessonId;
  if (isCompleted && currentIndex !== -1 && currentIndex < allLessons.length - 1) {
    nextLessonId = allLessons[currentIndex + 1].id;
  }

  // Calculate highest unlocked level
  let highestLevel = 0;
  for (const lvl of CURRICULUM_LEVELS) {
    const allLvlLessons = lvl.modules.flatMap(m => m.lessons);
    const hasUncompleted = allLvlLessons.some(
      l => !newCompletedLessons[l.id]?.completed
    );
    if (!hasUncompleted) {
      highestLevel = Math.max(highestLevel, lvl.level + 1);
    }
  }

  const newState: UserCurriculumState = {
    completedLessons: newCompletedLessons,
    currentLessonId: nextLessonId,
    unlockedLevel: Math.max(state.unlockedLevel, highestLevel),
  };

  saveStoredCurriculumState(newState);
  return newState;
}

/**
 * Calculate overall curriculum progress percentage (0-100)
 */
export function calculateCurriculumProgress(state: UserCurriculumState): {
  completedCount: number;
  totalCount: number;
  percentage: number;
  masteredCount: number;
} {
  const all = getAllCurriculumLessons();
  const totalCount = all.length;
  let completedCount = 0;
  let masteredCount = 0;

  for (const les of all) {
    const prog = state.completedLessons[les.id];
    if (prog?.completed) completedCount++;
    if (prog?.mastered) masteredCount++;
  }

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { completedCount, totalCount, percentage, masteredCount };
}
