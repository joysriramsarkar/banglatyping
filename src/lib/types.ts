export type KeyboardLayout = "Avro Phonetic" | "Bijoy Classic" | "BanglaWord";

export type RowCategoryType = 
  | 'home-row' 
  | 'top-row' 
  | 'bottom-row' 
  | 'mixed-row' 
  | 'kar-row' 
  | 'hasanta-row' 
  | 'phola-row' 
  | 'conjunct-row' 
  | 'special-row' 
  | 'number-row' 
  | 'words-row';

export interface Lesson {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  text?: string;
  drills?: Drill[];
  row?: RowCategoryType;
  isWordDrill?: boolean;
}

export interface ErredCharacter {
    char: string;
    count: number;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  spm?: number;
  erredCharacters?: ErredCharacter[];
}

export interface SingleDrill {
    display: string;
    key: string;
    keyCode: string; // Physical keyboard code like 'KeyQ', 'KeyW'
    shift: boolean;
    fingerPosition?: number; // 1-5 left hand, 6-10 right hand
    fingerName?: string; // 'Pinky', 'Ring', 'Middle', 'Index', 'Thumb'
}

export interface Drill {
  prompt: string; // The character(s) the user needs to type
  steps: SingleDrill[];
}

export type RowDrillCategory = {
    id: RowCategoryType;
    name: string;
    description: string;
}

export interface TestSummary {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  lessonId: string;
  timestamp?: string;
  erredCharacters: ErredCharacter[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string | null;
  wpm: number;
  accuracy: number;
  errors: number;
  time_elapsed: number;
  erred_characters: ErredCharacter[];
  session_timestamp: string;
  created_at: string;
}

export interface CharacterError {
  id: string;
  user_id: string;
  character: string;
  error_count: number;
  total_attempts: number;
  accuracy_rate: number;
  last_error_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WeakCharacterView {
  user_id: string;
  character: string;
  accuracy_rate: number;
  error_count: number;
  total_attempts: number;
  strength_level: 'Strong' | 'Good' | 'Weak' | 'Very Weak';
}

export interface UserStatistics {
  user_id: string;
  lessons_practiced: number;
  average_accuracy: number;
  average_wpm: number;
  best_wpm: number;
  best_accuracy: number;
  total_sessions: number;
}

export interface CustomDrill {
  id: string;
  user_id: string;
  name?: string;
  characters: string;
  drill_data: Drill[];
  focus_characters: Record<string, number>;
  generated_at: string;
  last_used_at?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserTypingStats {
  averageWpm: number;
  averageAccuracy: number;
  lessonsCompleted: number;
  testsTaken: number;
  highestWpm: number;
}

// ─────────────────────────────────────────────────────────────
// Phase 1 — New Types
// ─────────────────────────────────────────────────────────────

/**
 * Taxonomy of typing error categories.
 * Enables granular weakness detection beyond simple "wrong character".
 */
export type ErrorType =
  | 'wrong-key'          // Wrong character pressed
  | 'missing-key'        // Character skipped
  | 'extra-key'          // Extra character inserted
  | 'wrong-order'        // Correct keys, wrong sequence
  | 'wrong-shift'        // Shift modifier not used / incorrectly used
  | 'wrong-kar'          // Vowel sign (কার) error
  | 'wrong-hasanta'      // Hasanta (্) missed or extra
  | 'wrong-conjunct'     // Conjunct (যুক্তাক্ষর) formation error
  | 'wrong-composition'  // General Unicode composition error
  | 'space-error'        // Space at wrong position
  | 'punctuation-error'; // Punctuation error

/**
 * Skill mastery status — a skill progresses through these states
 * as the user practices and performs well consistently.
 */
export type MasteryStatus =
  | 'LOCKED'       // Not yet reached
  | 'LEARNING'     // Currently in lesson
  | 'PRACTICING'   // Completed lesson, building accuracy
  | 'PROFICIENT'   // Consistently > 90% accuracy
  | 'MASTERED'     // >= 97% accuracy across 3+ sessions
  | 'NEEDS_REVIEW'; // Was mastered but accuracy declined

/**
 * Per-skill mastery record for a user.
 * Tracks strength, review schedule, and session history.
 */
export interface SkillMastery {
  userId: string;
  skillId: string;         // e.g. "kar-i", "conjunct-ksha", "vowel-o"
  status: MasteryStatus;
  strength: number;        // 0–100 score
  successCount: number;
  failureCount: number;
  lastPracticed: string | null;  // ISO date
  nextReviewAt: string | null;   // ISO date for spaced repetition
  stability: number;             // How stable the mastery is (higher = more stable)
}

/**
 * A single typing event captured during a session.
 * Stored in local buffer; aggregated metrics sent to DB on session end.
 */
export interface TypingEvent {
  sequence: number;
  expectedGrapheme: string;
  actualInput: string;
  timestamp: number;       // ms since session start
  latencyMs: number;       // time since last event
  correct: boolean;
  errorType: ErrorType | null;
  layout: string;          // keyboard layout used
  corrected: boolean;      // was a previous error corrected with backspace?
}

/**
 * Extended typing session metrics — computed from event buffer at session end.
 * Augments the existing TypingStats with Bengali-specific and advanced metrics.
 */
export interface ExtendedTypingStats extends TypingStats {
  grossWpm: number;          // Total keystrokes / 5 / minutes
  netWpm: number;            // grossWpm - (uncorrectedErrors / minutes)
  gpm: number;               // Graphemes Per Minute (Bengali-specific)
  cpm: number;               // Characters Per Minute
  spm: number;               // Strokes Per Minute (Keystrokes / Minute)
  correctedErrors: number;   // Errors the user caught and fixed
  uncorrectedErrors: number; // Errors left uncorrected
  consistency: number;       // 0–100, how consistent the speed was
  pauseCount: number;        // Number of pauses > 2s
  longestStreak: number;     // Longest consecutive correct grapheme streak
  burstSpeed: number;        // Max GPM in any 5-second window
  errorBreakdown: Partial<Record<ErrorType, number>>;  // Count per error type
}

/**
 * A practice recommendation generated by the adaptive recommender.
 */
export interface SkillRecommendation {
  skillId: string;
  character: string;
  accuracyRate: number;
  recommendedDrillType: 'weakness' | 'precision' | 'speed' | 'mixed';
  priority: number;  // 1 = highest priority
}
