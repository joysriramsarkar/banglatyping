/**
 * SRS persistence — Leitner box sync after a typing session.
 *
 * Exact backing store from db/migrations/004_integrity_fixes.sql:
 *   TABLE skill_mastery (
 *     user_id, skill_id, status, strength, success_count, failure_count,
 *     stability, last_practiced, next_review_at, ...
 *     UNIQUE(user_id, skill_id)
 *   )
 *
 * There is deliberately NO box/ease column in that table, so the mapping is:
 *   - Leitner box/ease (SRSCard) live in localStorage key `srs-states` —
 *     the source of truth for the Leitner schedule (calculateNextReview).
 *   - skill_mastery rows carry the mapped counters so SQL consumers
 *     (user_skills_due_review view, recommender) see fresh data:
 *       success_count / failure_count <- card counters
 *       last_practiced / next_review_at <- card timestamps
 *       strength  <- box mapped to 0–100 (box * 20)
 *       stability <- ease factor mapped to 0–100
 *     `status` is intentionally NOT overwritten here — the mastery state
 *     machine in mastery.ts owns status transitions.
 *
 * TODO: if a `box_level` / `ease_factor` column is ever added to
 * skill_mastery, write the raw card there instead of the localStorage mirror.
 *
 * Never throws: DB failures (e.g. table missing on an older database) fall
 * back to the localStorage mirror and log via console.warn only.
 */

import { supabase, createRequestClient } from '../db';
import {
  calculateNextReview,
  createCard,
  isDue,
  MAX_EASE,
  MIN_EASE,
  type SRSCard,
} from './srs-engine';
import { graphemeToSkillId } from './mastery';
import type { ErredCharacter, TypingEvent } from '../types';
import type { SkillMasteryRow } from '@/types/supabase';

/** localStorage mirror of Leitner card state (per-character box schedule). */
export const SRS_LOCAL_KEY = 'srs-states';

/** Session error evidence accepted by updateMasteryAfterSession. */
export type SessionErrorInput =
  | TypingEvent[]
  | ErredCharacter[]
  | { erred?: ErredCharacter[]; attempted?: ErredCharacter[] };

interface CharOutcome {
  char: string;
  correct: boolean;
}

function isTypingEventArray(input: SessionErrorInput): input is TypingEvent[] {
  return (
    Array.isArray(input) &&
    input.length > 0 &&
    typeof (input[0] as TypingEvent)?.expectedGrapheme === 'string'
  );
}

/**
 * Reduce the session evidence to one outcome per character.
 * - TypingEvent[]: a char is incorrect if ANY event on it was incorrect.
 * - { erred, attempted }: erred chars incorrect, attempted-minus-erred correct.
 * - ErredCharacter[] alone: only the listed chars are known (incorrect);
 *   characters with no data are skipped, never assumed correct.
 */
export function summarizeOutcomes(input: SessionErrorInput): CharOutcome[] {
  if (isTypingEventArray(input)) {
    const byChar = new Map<string, boolean>();
    for (const ev of input) {
      const g = ev.expectedGrapheme;
      if (!g) continue;
      // Once incorrect, stays incorrect for this session.
      byChar.set(g, (byChar.get(g) ?? true) && ev.correct);
    }
    return [...byChar.entries()].map(([char, correct]) => ({ char, correct }));
  }

  if (!Array.isArray(input)) {
    const erred = input.erred ?? [];
    const attempted = input.attempted ?? [];
    const errSet = new Set(erred.map((e) => e.char));
    const outcomes: CharOutcome[] = erred.map((e) => ({ char: e.char, correct: false }));
    for (const a of attempted) {
      if (!errSet.has(a.char)) outcomes.push({ char: a.char, correct: true });
    }
    return outcomes;
  }

  // Bare erred list — no attempt data, so only failures are actionable.
  return input.map((e) => ({ char: e.char, correct: false }));
}

/** Load the localStorage Leitner mirror (empty map when unavailable). */
export function loadLocalSrsStates(): Map<string, SRSCard> {
  const states = new Map<string, SRSCard>();
  if (typeof window === 'undefined') return states;
  try {
    const raw = localStorage.getItem(SRS_LOCAL_KEY);
    if (!raw) return states;
    const parsed = JSON.parse(raw) as Record<string, SRSCard>;
    for (const [id, card] of Object.entries(parsed)) {
      if (card && typeof card.box === 'number') states.set(id, card);
    }
  } catch {
    // Corrupt mirror — start fresh rather than crash the session save path.
  }
  return states;
}

function saveLocalSrsStates(states: Map<string, SRSCard>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SRS_LOCAL_KEY, JSON.stringify(Object.fromEntries(states)));
  } catch {
    // Storage full/blocked — DB still has the mapped counters.
  }
}

function easeToStability(ease: number): number {
  const span = MAX_EASE - MIN_EASE || 1;
  return Math.round(((ease - MIN_EASE) / span) * 100);
}

/**
 * Advance per-character Leitner boxes after a session and persist them.
 *
 * @param userId      Supabase auth user id (skill rows are keyed by it)
 * @param input       TypingEvent[] (preferred) or erred/attempted summary
 * @param accessToken Optional caller token; browser session is used otherwise
 * @returns number of characters updated (0 on any failure — never throws)
 */
export async function updateMasteryAfterSession(
  userId: string,
  input: SessionErrorInput,
  accessToken?: string | null
): Promise<number> {
  try {
    if (!userId) return 0;
    const outcomes = summarizeOutcomes(input);
    if (outcomes.length === 0) return 0;

    const now = new Date();
    const states = loadLocalSrsStates();
    const updated: SRSCard[] = [];

    for (const { char, correct } of outcomes) {
      const skillId = graphemeToSkillId(char);
      const card = states.get(skillId) ?? createCard(skillId);
      const next = calculateNextReview(card, correct, now);
      states.set(skillId, next);
      updated.push(next);
    }
    saveLocalSrsStates(states);

    // Mirror mapped counters into skill_mastery (exact 004 column names).
    // status is omitted on purpose — mastery.ts owns the state machine.
    const rows = updated.map((card) => ({
      user_id: userId,
      skill_id: card.id,
      strength: Math.min(100, card.box * 20),
      success_count: card.successCount,
      failure_count: card.failureCount,
      stability: easeToStability(card.easeFactor),
      last_practiced: card.lastReviewedAt,
      next_review_at: card.nextReviewAt,
    }));

    const db = accessToken ? createRequestClient(accessToken) : supabase;
    // NOTE: SupabaseClient<Database> currently resolves `.from()` against the
    // default postgrest schema (pre-existing repo-wide condition — see the
    // identical errors in user-progress.ts), so the table builder is typed
    // structurally here. Row shape is still checked against SkillMasteryRow,
    // which mirrors db/migrations/004_integrity_fixes.sql exactly.
    type MasteryUpsert = Pick<
      SkillMasteryRow,
      | 'user_id'
      | 'skill_id'
      | 'strength'
      | 'success_count'
      | 'failure_count'
      | 'stability'
      | 'last_practiced'
      | 'next_review_at'
    >;
    const table = db.from('skill_mastery') as unknown as {
      upsert(
        values: MasteryUpsert[],
        options: { onConflict: string }
      ): Promise<{ error: { message: string } | null }>;
    };
    const { error } = await table.upsert(rows, { onConflict: 'user_id,skill_id' });

    if (error) {
      // Table missing (pre-004 DB) or RLS denial — localStorage mirror above
      // already preserves the schedule, so downgrade to a warning.
      console.warn('[skill-sync] skill_mastery upsert failed, kept local mirror:', error.message);
    }
    return updated.length;
  } catch (err) {
    console.warn('[skill-sync] updateMasteryAfterSession failed:', err);
    return 0;
  }
}

/** Filter card states down to those due for review now. Wrapper over isDue. */
export function getDueReviews(states: SRSCard[], now: Date = new Date()): SRSCard[] {
  return states.filter((card) => isDue(card, now));
}
