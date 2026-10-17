import { z } from 'zod';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// An invalid lessonId is not a client error — it just means "no lesson".
// Coerce anything that is not a valid UUID to null instead of falling back
// to a magic nil-UUID row that may not exist in the lessons table.
export function normalizeLessonId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

const charCountSchema = z.object({
  char: z.string().max(10, 'প্রতিটি অক্ষর সর্বোচ্চ ১০ অক্ষরের হতে হবে'),
  count: z.number().int().min(0),
});

export const saveProgressSchema = z.object({
  userId: z.string().optional(),
  lessonId: z.unknown().optional().nullable(),
  wpm: z
    .number({ invalid_type_error: 'গতি (wpm) সংখ্যায় হতে হবে' })
    .finite('গতি (wpm) সসীম সংখ্যা হতে হবে')
    .min(0, 'গতি (wpm) ০–৩০০ এর মধ্যে হতে হবে')
    .max(300, 'গতি (wpm) ০–৩০০ এর মধ্যে হতে হবে'),
  accuracy: z
    .number({ invalid_type_error: 'নির্ভুলতা সংখ্যায় হতে হবে' })
    .finite('নির্ভুলতা সসীম সংখ্যা হতে হবে')
    .min(0, 'নির্ভুলতা ০–১০০ এর মধ্যে হতে হবে')
    .max(100, 'নির্ভুলতা ০–১০০ এর মধ্যে হতে হবে'),
  errors: z
    .number({ invalid_type_error: 'ভুলের সংখ্যা সংখ্যায় হতে হবে' })
    .int('ভুলের সংখ্যা পূর্ণসংখ্যা হতে হবে')
    .min(0, 'ভুলের সংখ্যা ০ বা তার বেশি হতে হবে'),
  timeElapsed: z
    .number({ invalid_type_error: 'সময় সংখ্যায় (মিলিসেকেন্ড) হতে হবে' })
    .int('সময় পূর্ণসংখ্যা (মিলিসেকেন্ড) হতে হবে')
    .positive('সময় ০-এর বেশি হতে হবে')
    .max(28800000, 'সময় সর্বোচ্চ ৮ ঘণ্টা হতে পারে'),
  erredCharacters: z
    .array(charCountSchema)
    .max(500, 'ভুল অক্ষরের তালিকা সর্বোচ্চ ৫০০টি হতে পারে')
    .optional()
    .default([]),
  attemptedCharacters: z
    .array(charCountSchema)
    .max(500, 'চেষ্টা করা অক্ষরের তালিকা সর্বোচ্চ ৫০০টি হতে পারে')
    .optional(),
  // Present for backwards compatibility with older clients; capped server-side.
  drillCount: z.number().int().min(0).max(1000).optional(),
  threshold: z.number().min(0).max(100).optional(),
  // Guest-synced sessions arrive without a server-verified event log.
  // Optional so existing callers never break; unknown extra keys would be
  // stripped by zod anyway, this just documents the flag.
  unverified: z.boolean().optional(),
});

export type SaveProgressInput = z.infer<typeof saveProgressSchema>;

// Idempotency: collapse accidental double-submits that share a key.
// Bounded in-memory window (10s); safe to lose on restart — at worst a
// duplicate is stored, never a lost write.
const IDEMPOTENCY_WINDOW_MS = 10_000;
const recentIdempotencyKeys = new Map<string, number>();

function pruneIdempotencyKeys(now: number): void {
  for (const [key, seenAt] of recentIdempotencyKeys) {
    if (now - seenAt > IDEMPOTENCY_WINDOW_MS) recentIdempotencyKeys.delete(key);
  }
}

export function consumeIdempotencyKey(key: string | null): boolean {
  if (!key) return false;
  const now = Date.now();
  pruneIdempotencyKeys(now);
  if (recentIdempotencyKeys.has(key)) return true;
  recentIdempotencyKeys.set(key, now);
  return false;
}

/** Test-only hook to reset the in-memory idempotency window. */
export function resetIdempotencyKeysForTesting(): void {
  recentIdempotencyKeys.clear();
}
