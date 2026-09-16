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
 * Calculate the difficulty score of a Bengali word or phrase
 * Based on length, unique keys, vowel signs (কার), hasanta (্), conjuncts (যুক্তাক্ষর),
 * and special characters.
 *
 * Examples:
 *   "জল" -> ~1.2 (Easy)
 *   "বাংলা" -> ~2.4 (Intermediate)
 *   "স্বাধীনতা" -> ~4.7 (Hard)
 *   "প্রযুক্তি" -> ~5.1 (Complex)
 */
export function calculateWordDifficulty(word: string): number {
  if (!word || word.trim().length === 0) return 0;

  const text = word.trim();
  const graphemes = Array.from(new Intl.Segmenter('bn-IN', { granularity: 'grapheme' }).segment(text));
  const graphemeCount = graphemes.length;

  // Counts of specific features
  const karMatches = text.match(/[\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC]/g) || [];
  const karCount = karMatches.length;

  const hasantaMatches = text.match(/\u09CD/g) || [];
  const hasantaCount = hasantaMatches.length;

  const specialMatches = text.match(/[\u0981\u0982\u0983\u09BC\u09CE\u09DC\u09DD\u09DF]/g) || [];
  const specialCharCount = specialMatches.length;

  // Detect conjuncts in graphemes
  let conjunctCount = 0;
  for (const g of graphemes) {
    if (g.segment.includes('\u09CD') || g.segment.length > 1) {
      conjunctCount++;
    }
  }

  // Unique characters
  const uniqueChars = new Set(Array.from(text)).size;

  // Formula matching পরিকল্পনা.md
  const rawScore = 
    graphemeCount * 0.4 +
    uniqueChars * 0.2 +
    karCount * 0.5 +
    hasantaCount * 0.9 +
    conjunctCount * 1.2 +
    specialCharCount * 0.8;

  // Return rounded to 1 decimal place, minimum 1.0 for valid words
  return Math.max(1.0, Math.round(rawScore * 10) / 10);
}

/**
 * Categorize difficulty score into tiers:
 * Tier 1: 1.0 - 2.0 (Easy)
 * Tier 2: 2.1 - 3.5 (Medium)
 * Tier 3: 3.6 - 5.0 (Hard)
 * Tier 4: 5.1+ (Expert)
 */
export function getWordDifficultyTier(score: number): 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' {
  if (score <= 2.0) return 'Tier 1';
  if (score <= 3.5) return 'Tier 2';
  if (score <= 5.0) return 'Tier 3';
  return 'Tier 4';
}

/**
 * Weighted and balanced drill item generator without naive random replacement
 */
export function generateWeightedDrillList(
  items: string[],
  count: number = 20,
  weights?: Record<string, number>
): string[] {
  if (!items || items.length === 0) return [];
  if (items.length === 1) return Array(count).fill(items[0]);

  const result: string[] = [];
  const itemPool = [...items];

  // If weights provided, build weighted cumulative array
  if (weights) {
    const totalWeight = itemPool.reduce((sum, item) => sum + (weights[item] || 1), 0);
    for (let i = 0; i < count; i++) {
      let randomVal = Math.random() * totalWeight;
      let selected = itemPool[0];
      for (const item of itemPool) {
        const w = weights[item] || 1;
        if (randomVal <= w) {
          selected = item;
          break;
        }
        randomVal -= w;
      }
      result.push(selected);
    }
    return result;
  }

  // Balanced distribution without immediately consecutive duplicates
  let lastItem = '';
  for (let i = 0; i < count; i++) {
    const candidates = itemPool.filter(item => item !== lastItem);
    const chosen = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : itemPool[Math.floor(Math.random() * itemPool.length)];
    result.push(chosen);
    lastItem = chosen;
  }

  return result;
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


