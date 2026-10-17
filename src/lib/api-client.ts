// Browser-side helper for calling our own API routes.
//
// Every route that touches a user's data expects the caller's Supabase access
// token (see lib/api-auth.ts). Use `apiFetch` instead of `fetch` for those
// calls and the token is attached for you.
//
// Offline: a failed user-progress POST is enqueued to the IndexedDB
// 'btm-queue' store (see lib/offline/queue) and retried via
// syncQueuedSessions() — e.g. on the window 'online' event.
import { supabase } from './db';
import { SUPABASE_AUTH_HEADER } from './auth-header';
import {
  drainQueue,
  enqueueSession,
  listQueuedSessions,
  type QueuedSession,
} from './offline/queue';

/** Returns the header carrying the current session's access token. */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return { [SUPABASE_AUTH_HEADER]: session?.access_token ?? '' };
}

/**
 * `fetch()` with the caller's Supabase token attached.
 * Any headers passed in `init` are preserved.
 *
 * On network failure, user-progress POSTs are queued offline and the
 * original error is rethrown so callers keep their existing error handling.
 */
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const auth = await authHeaders();

  for (const [name, value] of Object.entries(auth)) {
    headers.set(name, value);
  }

  const requestInit = { ...init, headers };
  try {
    return await fetch(url, requestInit);
  } catch (err) {
    const method = (init.method ?? 'GET').toUpperCase();
    if (url.includes('/api/user-progress') && method === 'POST' && typeof init.body === 'string') {
      try {
        await enqueueSession({ url, method, body: init.body });
      } catch {
        // Queue write failed — the original network error below is what matters.
      }
    }
    throw err;
  }
}

/**
 * Retry queued offline sessions (flushes 'btm-queue' oldest-first).
 * Resolves to the number of sessions synced. Never throws.
 */
export async function syncQueuedSessions(): Promise<number> {
  try {
    return await drainQueue(async (session: QueuedSession) => {
      try {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const auth = await authHeaders();
        for (const [name, value] of Object.entries(auth)) {
          headers.set(name, value);
        }
        const res = await fetch(session.url, {
          method: session.method,
          headers,
          body: session.body,
        });
        return res.ok;
      } catch {
        return false;
      }
    });
  } catch {
    return 0;
  }
}

/** How many sessions are waiting for a connection. Never throws. */
export async function queuedOfflineCount(): Promise<number> {
  try {
    return (await listQueuedSessions()).length;
  } catch {
    return 0;
  }
}

function initOnlineSync(): void {
  if (typeof window === 'undefined') return;
  try {
    window.addEventListener('online', () => {
      syncQueuedSessions().catch(() => {
        // Background retry — UI reads the queue count on demand.
      });
    });
    // Opportunistic flush on load in case the queue survived a restart.
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncQueuedSessions().catch(() => {});
    }
  } catch {
    // Non-browser/test environment — sync stays manual via syncQueuedSessions().
  }
}

initOnlineSync();
