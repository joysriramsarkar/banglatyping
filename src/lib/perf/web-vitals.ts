/**
 * Web Vitals stub — Interaction to Next Paint (INP) reporter.
 *
 * Wires a PerformanceObserver over `event` entries, keeps the worst
 * interaction latency, and beacons it to `/api/metrics` when available.
 * No `/api/metrics` route exists yet, so the beacon is best-effort:
 * sendBeacon failures fall back to console.debug. Safe to call in
 * non-browser (SSR) contexts — it no-ops there.
 */

export interface InpReport {
  value: number;
  entries: number;
  url: string;
  at: number;
}

let _started = false;
let _worst = 0;
let _count = 0;

function beacon(report: InpReport): void {
  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify({ type: 'inp', ...report })], {
        type: 'application/json',
      });
      const ok = navigator.sendBeacon('/api/metrics', blob);
      if (ok) return;
    }
  } catch {
    // Fall through to the debug fallback below.
  }
  console.debug('[web-vitals] INP', report);
}

/**
 * Start one-shot INP observation. Idempotent — later calls are ignored.
 * Reports the worst interaction on pagehide, plus once per 10 interactions.
 */
export function reportINP(): void {
  if (_started) return;
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return;
  }
  _started = true;

  const flush = () => {
    if (_count === 0) return;
    beacon({
      value: Math.round(_worst),
      entries: _count,
      url: window.location.pathname,
      at: Date.now(),
    });
  };

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // LayoutShift-unrelated: only EventTiming entries carry interactionId.
        const latency = (entry as PerformanceEventTiming).duration ?? 0;
        if (latency > _worst) _worst = latency;
        _count += 1;
        if (_count % 10 === 0) flush();
      }
    });
    observer.observe({ type: 'event', buffered: true });
    window.addEventListener('pagehide', flush, { once: true });
  } catch {
    console.debug('[web-vitals] PerformanceObserver unavailable');
  }
}

/** Test hook: reset module state between specs. */
export function __resetWebVitalsForTest(): void {
  _started = false;
  _worst = 0;
  _count = 0;
}
