/**
 * Guest Session Storage and Sync Engine
 *
 * Allows unauthenticated guest learners to practice, record test scores, and track
 * progress locally without creating an account first (পরিকল্পনা.md #51).
 *
 * When a guest signs up or logs in, their locally stored progress is seamlessly synced
 * with Supabase.
 */

import { apiFetch } from './api-client';

const GUEST_SESSIONS_KEY = 'banglatyping_guest_sessions';
const GUEST_STATS_KEY = 'banglatyping_guest_stats';

export interface GuestSession {
  id: string;
  lessonId: string;
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  erredCharacters: Array<{ char: string; count: number }>;
  createdAt: string;
}

export interface GuestStats {
  totalSessions: number;
  highestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
}

export function getGuestSessions(): GuestSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestSession(session: Omit<GuestSession, 'id' | 'createdAt'>): GuestSession {
  const newSession: GuestSession = {
    ...session,
    id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return newSession;

  try {
    const existing = getGuestSessions();
    const updated = [newSession, ...existing].slice(0, 100); // Keep last 100
    localStorage.setItem(GUEST_SESSIONS_KEY, JSON.stringify(updated));

    // Update aggregated guest stats
    updateGuestStats(updated);
  } catch (err) {
    console.error('Failed to save guest session:', err);
  }

  return newSession;
}

function updateGuestStats(sessions: GuestSession[]): void {
  if (sessions.length === 0) return;

  let totalWpm = 0;
  let totalAcc = 0;
  let highestWpm = 0;

  for (const s of sessions) {
    totalWpm += s.wpm;
    totalAcc += s.accuracy;
    if (s.wpm > highestWpm) highestWpm = s.wpm;
  }

  const stats: GuestStats = {
    totalSessions: sessions.length,
    highestWpm,
    averageWpm: Math.round(totalWpm / sessions.length),
    averageAccuracy: Math.round(totalAcc / sessions.length),
  };

  try {
    localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore
  }
}

export function getGuestStats(): GuestStats {
  if (typeof window === 'undefined') {
    return { totalSessions: 0, highestWpm: 0, averageWpm: 0, averageAccuracy: 0 };
  }
  try {
    const raw = localStorage.getItem(GUEST_STATS_KEY);
    return raw
      ? JSON.parse(raw)
      : { totalSessions: 0, highestWpm: 0, averageWpm: 0, averageAccuracy: 0 };
  } catch {
    return { totalSessions: 0, highestWpm: 0, averageWpm: 0, averageAccuracy: 0 };
  }
}

/**
 * Sync guest sessions to Supabase after user logs in.
 * Clears guest local queue after successful upload.
 */
export async function syncGuestSessionsToUser(userId: string): Promise<number> {
  const sessions = getGuestSessions();
  if (sessions.length === 0) return 0;

  let syncedCount = 0;

  for (const s of sessions) {
    try {
      const res = await apiFetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId: s.lessonId,
          wpm: s.wpm,
          accuracy: s.accuracy,
          errors: s.errors,
          timeElapsed: s.timeElapsed,
          erredCharacters: s.erredCharacters,
        }),
      });

      if (res.ok) {
        syncedCount++;
      }
    } catch (e) {
      console.error('Failed to sync guest session:', e);
    }
  }

  // Clear guest queue once synced
  if (typeof window !== 'undefined' && syncedCount > 0) {
    try {
      localStorage.removeItem(GUEST_SESSIONS_KEY);
    } catch {
      // Ignore
    }
  }

  return syncedCount;
}
