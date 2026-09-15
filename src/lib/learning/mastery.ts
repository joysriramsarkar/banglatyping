/**
 * Skill Mastery Model
 *
 * Tracks per-skill mastery status for each user.
 * A skill progresses through states as performance improves:
 *   LOCKED → LEARNING → PRACTICING → PROFICIENT → MASTERED
 *   and can regress to NEEDS_REVIEW if errors reappear.
 *
 * Mastery criteria (from পরিকল্পনা.md #15):
 *   accuracy >= 97%
 *   AND at least 3 separate successful practice sessions
 *   AND recent error rate low
 *   AND performs well in mixed context
 *
 * Spaced repetition schedule (পরিকল্পনা.md #16):
 *   New skill → practice today → review tomorrow → 3d → 7d → 14d
 */

import type { SkillMastery, MasteryStatus, WeakCharacterView } from '../types';

// ── Mastery thresholds ──────────────────────────────────────────

/** Accuracy required to move from PRACTICING to PROFICIENT */
const PROFICIENT_ACCURACY_THRESHOLD = 90;

/** Accuracy required to move from PROFICIENT to MASTERED */
const MASTERY_ACCURACY_THRESHOLD = 97;

/** Minimum number of successful sessions to achieve MASTERED */
const MASTERY_MIN_SESSIONS = 3;

/** If accuracy drops below this, MASTERED → NEEDS_REVIEW */
const REVIEW_TRIGGER_ACCURACY = 85;

/** Strength contribution per successful session */
const STRENGTH_SUCCESS_INCREMENT = 10;

/** Strength penalty per failed session */
const STRENGTH_FAILURE_DECREMENT = 15;

// ── Spaced repetition intervals (days) ────────────────────────

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

// ── Core mastery functions ──────────────────────────────────────

/**
 * Create a new SkillMastery record for a user-skill pair.
 * Default status is LEARNING (user is starting to learn this skill).
 */
export function createSkillMastery(userId: string, skillId: string): SkillMastery {
  return {
    userId,
    skillId,
    status: 'LEARNING',
    strength: 0,
    successCount: 0,
    failureCount: 0,
    lastPracticed: null,
    nextReviewAt: null,
    stability: 0,
  };
}

/**
 * Update a skill mastery record after a practice session.
 *
 * @param mastery    Current mastery record
 * @param accuracy   Session accuracy (0–100)
 * @param now        Current ISO date string (default: now)
 */
export function updateMastery(
  mastery: SkillMastery,
  accuracy: number,
  now: string = new Date().toISOString()
): SkillMastery {
  const isSuccess = accuracy >= MASTERY_ACCURACY_THRESHOLD;
  const isProficientSuccess = accuracy >= PROFICIENT_ACCURACY_THRESHOLD;

  let { status, strength, successCount, failureCount, stability } = mastery;

  // Update counts
  if (isSuccess) {
    successCount++;
  } else {
    failureCount++;
  }

  // Update strength
  if (isProficientSuccess) {
    strength = Math.min(100, strength + STRENGTH_SUCCESS_INCREMENT);
    stability = Math.min(100, stability + 5);
  } else {
    strength = Math.max(0, strength - STRENGTH_FAILURE_DECREMENT);
    stability = Math.max(0, stability - 10);
  }

  // Update status
  status = computeNewStatus(status, accuracy, successCount, failureCount, stability);

  // Compute next review date based on stability
  const nextReviewAt = computeNextReview(status, stability, now);

  return {
    ...mastery,
    status,
    strength,
    successCount,
    failureCount,
    stability,
    lastPracticed: now,
    nextReviewAt,
  };
}

/**
 * Compute the new mastery status based on performance.
 */
function computeNewStatus(
  current: MasteryStatus,
  accuracy: number,
  successCount: number,
  failureCount: number,
  stability: number
): MasteryStatus {
  // Once MASTERED, check for regression
  if (current === 'MASTERED') {
    if (accuracy < REVIEW_TRIGGER_ACCURACY || (failureCount > 0 && failureCount > successCount * 0.3)) {
      return 'NEEDS_REVIEW';
    }
    return 'MASTERED';
  }

  // NEEDS_REVIEW can recover to MASTERED if performance improves again
  if (current === 'NEEDS_REVIEW') {
    if (accuracy >= MASTERY_ACCURACY_THRESHOLD && successCount >= MASTERY_MIN_SESSIONS && stability >= 50) {
      return 'MASTERED';
    }
    if (accuracy >= PROFICIENT_ACCURACY_THRESHOLD) return 'PROFICIENT';
    return 'NEEDS_REVIEW';
  }

  // Normal progression
  if (accuracy >= MASTERY_ACCURACY_THRESHOLD && successCount >= MASTERY_MIN_SESSIONS && stability >= 40) {
    return 'MASTERED';
  }
  if (accuracy >= PROFICIENT_ACCURACY_THRESHOLD && successCount >= 2) {
    return 'PROFICIENT';
  }
  if (accuracy >= 70 || successCount >= 1) {
    return 'PRACTICING';
  }
  return 'LEARNING';
}

/**
 * Compute next review date using a simplified spaced repetition schedule.
 * Higher stability → longer interval before next review needed.
 */
function computeNextReview(status: MasteryStatus, stability: number, now: string): string | null {
  if (status === 'LOCKED' || status === 'LEARNING') return null;

  // Pick interval based on stability
  const intervalIndex = Math.min(
    Math.floor(stability / 20),
    REVIEW_INTERVALS_DAYS.length - 1
  );
  const days = REVIEW_INTERVALS_DAYS[intervalIndex];

  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString();
}

/**
 * Check whether a skill is due for review.
 */
export function isDueForReview(mastery: SkillMastery, now: string = new Date().toISOString()): boolean {
  if (!mastery.nextReviewAt) return false;
  return mastery.nextReviewAt <= now;
}

/**
 * Get display label for a mastery status.
 */
export function getMasteryLabel(status: MasteryStatus): string {
  const labels: Record<MasteryStatus, string> = {
    LOCKED:       'লক',
    LEARNING:     'শিখছি',
    PRACTICING:   'অনুশীলন',
    PROFICIENT:   'দক্ষ',
    MASTERED:     'আয়ত্ত',
    NEEDS_REVIEW: 'পর্যালোচনা দরকার',
  };
  return labels[status];
}

/**
 * Get color class for a mastery status (Tailwind).
 */
export function getMasteryColor(status: MasteryStatus): string {
  const colors: Record<MasteryStatus, string> = {
    LOCKED:       'text-muted-foreground',
    LEARNING:     'text-blue-500',
    PRACTICING:   'text-yellow-500',
    PROFICIENT:   'text-orange-500',
    MASTERED:     'text-green-500',
    NEEDS_REVIEW: 'text-red-500',
  };
  return colors[status];
}

// ── Skill ID conventions ────────────────────────────────────────

/**
 * Derive a skill ID from a Bengali character/grapheme.
 * Used to look up mastery records.
 *
 * Examples:
 *   'ক'  → 'char-ক'
 *   'ক্ষ' → 'conjunct-ক্ষ'
 *   'ি'   → 'kar-ি'
 */
export function graphemeToSkillId(grapheme: string): string {
  // Check for vowel signs (কার)
  const VOWEL_SIGNS = /[\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CC]/;
  if (VOWEL_SIGNS.test(grapheme)) return `kar-${grapheme}`;

  // Check for hasanta (conjunct marker)
  if (grapheme.includes('\u09CD')) return `conjunct-${grapheme}`;

  // Check for special signs
  const SPECIAL = /[\u0982\u0983\u0981\u09CE]/;
  if (SPECIAL.test(grapheme)) return `special-${grapheme}`;

  return `char-${grapheme}`;
}

// ── Aggregate mastery stats ─────────────────────────────────────

export interface MasteryStats {
  total: number;
  mastered: number;
  proficient: number;
  practicing: number;
  learning: number;
  needsReview: number;
  locked: number;
  masteryPercent: number;
}

/**
 * Aggregate mastery stats from a list of skill mastery records.
 */
export function aggregateMasteryStats(records: SkillMastery[]): MasteryStats {
  const counts = {
    total: records.length,
    mastered: 0,
    proficient: 0,
    practicing: 0,
    learning: 0,
    needsReview: 0,
    locked: 0,
  };

  for (const r of records) {
    switch (r.status) {
      case 'MASTERED':     counts.mastered++; break;
      case 'PROFICIENT':   counts.proficient++; break;
      case 'PRACTICING':   counts.practicing++; break;
      case 'LEARNING':     counts.learning++; break;
      case 'NEEDS_REVIEW': counts.needsReview++; break;
      case 'LOCKED':       counts.locked++; break;
    }
  }

  const masteryPercent = counts.total > 0
    ? Math.round(((counts.mastered + counts.proficient) / counts.total) * 100)
    : 0;

  return { ...counts, masteryPercent };
}

/**
 * Convert WeakCharacterView records (from DB) to SkillMastery approximations.
 * Used to bridge the existing character_errors table to the new mastery model.
 */
export function weakCharsToMastery(
  userId: string,
  weakChars: WeakCharacterView[]
): SkillMastery[] {
  return weakChars.map(wc => {
    const accuracy = wc.accuracy_rate;
    let status: MasteryStatus;

    if (accuracy >= 97) status = 'MASTERED';
    else if (accuracy >= 90) status = 'PROFICIENT';
    else if (accuracy >= 70) status = 'PRACTICING';
    else if (accuracy > 0) status = 'LEARNING';
    else status = 'NEEDS_REVIEW';

    return {
      userId,
      skillId: graphemeToSkillId(wc.character),
      status,
      strength: Math.round(accuracy),
      successCount: wc.total_attempts - wc.error_count,
      failureCount: wc.error_count,
      lastPracticed: null,
      nextReviewAt: null,
      stability: Math.round(accuracy * 0.7), // approximate
    };
  });
}
