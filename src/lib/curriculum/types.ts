/**
 * Curriculum System Types
 *
 * Defines the complete structure for the 12-level curriculum:
 * Course → Level → Module → Lesson → Section (Pedagogical Unit) → Drill / Content
 */

import type { Drill } from '../types';

export type SectionType =
  | 'explanation'
  | 'demonstration'
  | 'guided'
  | 'isolated'
  | 'pattern'
  | 'word'
  | 'mixed'
  | 'challenge'
  | 'mastery'
  | 'review';

export interface LessonSection {
  id: string;
  type: SectionType;
  title: string;
  instruction?: string;
  explanationText?: string;
  /** For demonstration / visual steps */
  demonstration?: {
    target: string;
    description: string;
    steps: Array<{
      key: string;
      label: string;
      finger?: string;
      hint?: string;
    }>;
  };
  /** For typing practice sections */
  items?: string[];
  /** Or pre-configured drills */
  drills?: Drill[];
  /** Minimum accuracy required to pass this section (0-100) */
  requiredAccuracy?: number;
  /** Minimum WPM required (optional) */
  requiredWpm?: number;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  subtitle?: string;
  level: number; // 0 to 12
  moduleId: string;
  moduleTitle: string;
  description: string;
  skills: string[]; // e.g. ['kar-i', 'kar-ee']
  prerequisites: string[]; // lesson ids that must be completed first
  estimatedMinutes: number;
  difficulty: number; // 1 to 10
  sections: LessonSection[];
}

export interface CurriculumModule {
  id: string;
  level: number;
  title: string;
  description: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumLevel {
  level: number;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  modules: CurriculumModule[];
}

export interface UserLessonProgress {
  lessonId: string;
  /** Sticky milestone: the lesson was ever completed (>= completion threshold). */
  completed: boolean;
  /**
   * CURRENT mastery. Reflects the most recent attempt, so it can regress when a
   * later attempt falls below the mastery threshold. Use `everMastered` for the
   * all-time achievement badge.
   */
  mastered: boolean;
  /** Sticky all-time achievement: mastery was reached at least once. */
  everMastered: boolean;
  /** Best (highest) accuracy ever recorded. */
  bestAccuracy: number;
  /** Accuracy of the most recent attempt; drives current mastery. */
  lastAccuracy: number;
  bestWpm: number;
  bestGpm: number;
  timesCompleted: number;
  lastAttemptAt: string;
  unlockedAt?: string;
}

export interface UserCurriculumState {
  /** Schema version, bumped when the persisted shape changes. */
  version?: number;
  completedLessons: Record<string, UserLessonProgress>;
  currentLessonId: string;
  unlockedLevel: number;
}
