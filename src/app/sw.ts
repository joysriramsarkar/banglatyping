/**
 * Service worker stub (vanilla, no Serwist dependency).
 *
 * Serwist is OPTIONAL and not installed. This file documents the intended
 * runtime-caching strategy so a future `sw.js` / Serwist worker can be wired
 * up without adding a dependency now.
 *
 * Intended strategy (when a worker is added):
 * - Precache: `/`, `/offline`, app shell JS/CSS, `/logo.svg`, fonts.
 * - Runtime NetworkFirst (5s timeout → cache fallback): `/dashboard/*`, `/api/*` GET.
 * - Runtime CacheFirst (30d): `/fonts/*`, `/_next/static/*`, images.
 * - Runtime StaleWhileRevalidate: lesson JSON / curriculum data.
 *
 * Registration helper below is safe to call from a client component:
 * `registerServiceWorker()` registers `/sw.js` only in production.
 */

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (process.env.NODE_ENV !== 'production') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is best-effort; ignore registration failures.
    });
  });
}

export const SW_CACHE_VERSION = 'banglatyping-v1';
export const SW_PRECACHE_URLS: string[] = ['/', '/offline', '/logo.svg'];
export const SW_RUNTIME_STRATEGY = {
  appShell: 'NetworkFirst',
  staticAssets: 'CacheFirst',
  lessonData: 'StaleWhileRevalidate',
} as const;

export default registerServiceWorker;
