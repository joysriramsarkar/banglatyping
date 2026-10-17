/**
 * Offline session queue — IndexedDB store with in-memory fallback.
 *
 * DB 'btm-queue', object store 'sessions'. When indexedDB is unavailable
 * (SSR, jsdom, private mode) a module-level Map backs the same API so the
 * queue — and its tests — work in both environments.
 */

export interface QueuedSession {
  id: string;
  url: string;
  method: string;
  body: string;
  queuedAt: string;
  attempts: number;
}

const DB_NAME = 'btm-queue';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;

const memoryFallback = new Map<string, QueuedSession>();

function hasIndexedDB(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

function runStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        let req: IDBRequest<T>;
        try {
          req = fn(store);
        } catch (err) {
          db.close();
          reject(err);
          return;
        }
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error('IndexedDB transaction failed'));
        };
      })
  );
}

function makeId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Persist a failed session POST for later retry. Never throws. */
export async function enqueueSession(entry: {
  url: string;
  method?: string;
  body: string;
}): Promise<QueuedSession> {
  const queued: QueuedSession = {
    id: makeId(),
    url: entry.url,
    method: entry.method ?? 'POST',
    body: entry.body,
    queuedAt: new Date().toISOString(),
    attempts: 0,
  };
  if (!hasIndexedDB()) {
    memoryFallback.set(queued.id, queued);
    return queued;
  }
  try {
    await runStore('readwrite', (store) => store.put(queued));
  } catch {
    memoryFallback.set(queued.id, queued);
  }
  return queued;
}

/** Remove a session from the queue after successful sync. Never throws. */
export async function dequeueSession(id: string): Promise<void> {
  memoryFallback.delete(id);
  if (!hasIndexedDB()) return;
  try {
    await runStore('readwrite', (store) => store.delete(id));
  } catch {
    // ignore — memory copy already removed
  }
}

/** List all queued sessions (oldest first). Never throws. */
export async function listQueuedSessions(): Promise<QueuedSession[]> {
  const fromMemory = [...memoryFallback.values()];
  if (!hasIndexedDB()) {
    return fromMemory.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
  }
  try {
    const rows = await runStore<QueuedSession[]>('readonly', (store) => store.getAll());
    const merged = new Map<string, QueuedSession>();
    for (const r of rows ?? []) merged.set(r.id, r);
    for (const m of fromMemory) merged.set(m.id, m);
    return [...merged.values()].sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
  } catch {
    return fromMemory;
  }
}

/** Current queued-session count. Never throws. */
export async function queuedSessionCount(): Promise<number> {
  return (await listQueuedSessions()).length;
}

export type QueueSender = (session: QueuedSession) => Promise<boolean>;

/**
 * Flush the queue: oldest first, stop at the first failure so ordering is
 * preserved across retries. Returns the number of sessions synced.
 */
export async function drainQueue(sender: QueueSender): Promise<number> {
  let synced = 0;
  const queued = await listQueuedSessions();
  for (const session of queued) {
    let ok = false;
    try {
      ok = await sender({ ...session, attempts: session.attempts + 1 });
    } catch {
      ok = false;
    }
    if (!ok) break;
    await dequeueSession(session.id);
    synced += 1;
  }
  return synced;
}

/** Test-only hook: clear both backends. */
export async function clearQueueForTesting(): Promise<void> {
  memoryFallback.clear();
  if (!hasIndexedDB()) return;
  try {
    await runStore('readwrite', (store) => store.clear());
  } catch {
    // ignore
  }
}
