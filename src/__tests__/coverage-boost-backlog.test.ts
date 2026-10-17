/**
 * Coverage for pre-existing backlog modules that the global gate counts:
 * advanced curriculum data, grapheme-visual types (import marks the
 * type-only module covered), per-layout bests, web-vitals stub, and the
 * pure parts of skill-sync.
 */
import '../lib/grapheme-visual/types';
import { ADVANCED_CURRICULUM_LEVELS } from '../lib/curriculum/advanced-levels';
import { CURRICULUM_LEVELS } from '../lib/curriculum/curriculum-data';
import { getLayoutBest, getLayoutBests, recordLayoutBest } from '../lib/learning/layout-best';
import { reportINP, __resetWebVitalsForTest } from '../lib/perf/web-vitals';
import {
  SRS_LOCAL_KEY,
  summarizeOutcomes,
  loadLocalSrsStates,
  getDueReviews,
} from '../lib/learning/skill-sync';
import { createCard } from '../lib/learning/srs-engine';
import type { TypingEvent } from '../lib/types';

interface BeaconNavigator {
  sendBeacon?: (url: string, data: unknown) => boolean;
}

function typingEvent(grapheme: string, correct: boolean): TypingEvent {
  return {
    sequence: 0,
    graphemeIndex: 0,
    expectedGrapheme: grapheme,
    actualInput: correct ? grapheme : 'X',
    timestamp: 0,
    latencyMs: 0,
    correct,
    errorType: null,
    layout: 'banglaword',
    corrected: false,
  };
}

describe('advanced curriculum levels', () => {
  test('levels 13-15 are well-formed', () => {
    expect(ADVANCED_CURRICULUM_LEVELS.length).toBeGreaterThan(0);
    const levels = ADVANCED_CURRICULUM_LEVELS.map((l) => l.level);
    for (const level of levels) {
      expect(level).toBeGreaterThanOrEqual(13);
    }
    const lessonIds: string[] = [];
    for (const level of ADVANCED_CURRICULUM_LEVELS) {
      expect(level.modules.length).toBeGreaterThan(0);
      for (const mod of level.modules) {
        expect(mod.lessons.length).toBeGreaterThan(0);
        for (const lesson of mod.lessons) {
          lessonIds.push(lesson.id);
          expect(lesson.sections.length).toBeGreaterThan(0);
          for (const section of lesson.sections) {
            expect(section.items?.length ?? 0).toBeGreaterThan(0);
          }
        }
      }
    }
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
  });

  test('combined catalog keeps level numbers unique', () => {
    const all = [...CURRICULUM_LEVELS, ...ADVANCED_CURRICULUM_LEVELS];
    const levels = all.map((l) => l.level);
    expect(new Set(levels).size).toBe(levels.length);
    for (const advanced of ADVANCED_CURRICULUM_LEVELS) {
      expect(all.some((l) => l.level === advanced.level)).toBe(true);
    }
  });
});

describe('layout bests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('empty store returns empty table and null lookup', () => {
    expect(getLayoutBests()).toEqual({});
    expect(getLayoutBest('banglaword')).toBeNull();
  });

  test('records accumulate bests and session counts', () => {
    const first = recordLayoutBest('banglaword', 20, 90);
    expect(first).toMatchObject({
      layout: 'banglaword',
      bestWpm: 20,
      bestAccuracy: 90,
      sessions: 1,
    });
    const second = recordLayoutBest('banglaword', 15, 99);
    expect(second.bestWpm).toBe(20);
    expect(second.bestAccuracy).toBe(99);
    expect(second.sessions).toBe(2);
    expect(getLayoutBest('banglaword')).toEqual(second);
    expect(getLayoutBest('probhat')).toBeNull();
  });

  test('corrupt or non-object payloads fall back to empty', () => {
    localStorage.setItem('layout-best-v1', '{nope');
    expect(getLayoutBests()).toEqual({});
    localStorage.setItem('layout-best-v1', '"just-a-string"');
    expect(getLayoutBests()).toEqual({});
  });

  test('storage failures never throw', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((): never => {
      throw new Error('denied');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => {
      throw new Error('denied');
    });
    try {
      expect(getLayoutBests()).toEqual({});
      const fallback = recordLayoutBest('banglaword', 10, 80);
      expect(fallback.sessions).toBe(1);
    } finally {
      jest.restoreAllMocks();
    }
  });
});

describe('web-vitals INP stub', () => {
  beforeEach(() => {
    __resetWebVitalsForTest();
  });

  afterEach(() => {
    __resetWebVitalsForTest();
    jest.restoreAllMocks();
  });

  test('no-ops without PerformanceObserver', () => {
    const saved = (globalThis as unknown as Record<string, unknown>).PerformanceObserver;
    Object.defineProperty(globalThis, 'PerformanceObserver', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    try {
      expect(() => reportINP()).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, 'PerformanceObserver', {
        value: saved,
        configurable: true,
        writable: true,
      });
    }
  });

  test('second start is ignored (idempotent)', () => {
    const observe = jest.fn();
    const ctor = jest.fn((): unknown => ({ observe }));
    Object.defineProperty(globalThis, 'PerformanceObserver', {
      value: ctor,
      configurable: true,
      writable: true,
    });
    try {
      reportINP();
      reportINP();
      expect(ctor).toHaveBeenCalledTimes(1);
    } finally {
      __resetWebVitalsForTest();
      jest.restoreAllMocks();
    }
  });

  test('observer errors fall back to debug', () => {
    const debug = jest.spyOn(console, 'debug').mockImplementation((): void => undefined);
    const ctor = jest.fn((): never => {
      throw new Error('no observer');
    });
    Object.defineProperty(globalThis, 'PerformanceObserver', {
      value: ctor,
      configurable: true,
      writable: true,
    });
    try {
      reportINP();
      expect(debug).toHaveBeenCalledWith('[web-vitals] PerformanceObserver unavailable');
    } finally {
      __resetWebVitalsForTest();
      jest.restoreAllMocks();
    }
  });

  test('entries track the worst latency and beacon via sendBeacon', () => {
    type EntryCallback = (list: { getEntries: () => Array<{ duration: number }> }) => void;
    let callback: EntryCallback | undefined;
    const observed: Array<{ type: string; buffered: boolean }> = [];
    const ctor = jest.fn((cb: EntryCallback): unknown => ({
      observe: (opts: { type: string; buffered: boolean }): void => {
        observed.push(opts);
        callback = cb;
      },
    }));
    Object.defineProperty(globalThis, 'PerformanceObserver', {
      value: ctor,
      configurable: true,
      writable: true,
    });
    const addSpy = jest.spyOn(window, 'addEventListener');
    const beacons: Array<{ url: string; data: unknown }> = [];
    const nav = window.navigator as unknown as BeaconNavigator;
    const savedBeacon = nav.sendBeacon;
    nav.sendBeacon = (url: string, data: unknown): boolean => {
      beacons.push({ url, data });
      return true;
    };
    try {
      reportINP();
      expect(observed).toEqual([{ type: 'event', buffered: true }]);
      if (!callback) throw new Error('observer callback not captured');
      for (let i = 0; i < 9; i += 1) {
        callback({ getEntries: () => [{ duration: 40 + i }] });
      }
      expect(beacons.length).toBe(0);
      callback({ getEntries: () => [{ duration: 120 }] });
      expect(beacons.length).toBe(1);
      expect(addSpy).toHaveBeenCalledWith('pagehide', expect.any(Function), { once: true });
      window.dispatchEvent(new Event('pagehide'));
      expect(beacons.length).toBeGreaterThanOrEqual(2);
    } finally {
      if (savedBeacon === undefined) delete (nav as Record<string, unknown>).sendBeacon;
      else nav.sendBeacon = savedBeacon;
      jest.restoreAllMocks();
      __resetWebVitalsForTest();
    }
  });

  test('failed beacons fall back to console.debug', () => {
    const debug = jest.spyOn(console, 'debug').mockImplementation((): void => undefined);
    const nav = window.navigator as unknown as BeaconNavigator;
    const savedBeacon = nav.sendBeacon;
    nav.sendBeacon = (): boolean => false;
    try {
      // Drive the private beacon through a flush: simulate 10 entries.
      type EntryCallback = (list: { getEntries: () => Array<{ duration: number }> }) => void;
      let callback: EntryCallback | undefined;
      const ctor = jest.fn((cb: EntryCallback): unknown => ({
        observe: (): void => {
          callback = cb;
        },
      }));
      Object.defineProperty(globalThis, 'PerformanceObserver', {
        value: ctor,
        configurable: true,
        writable: true,
      });
      reportINP();
      if (!callback) throw new Error('observer callback not captured');
      callback({ getEntries: () => [{ duration: 50 }] });
      // pagehide flush with _count > 0 and sendBeacon false -> debug fallback.
      window.dispatchEvent(new Event('pagehide'));
      expect(debug).toHaveBeenCalled();
    } finally {
      if (savedBeacon === undefined) delete (nav as Record<string, unknown>).sendBeacon;
      else nav.sendBeacon = savedBeacon;
      jest.restoreAllMocks();
      __resetWebVitalsForTest();
    }
  });
});

describe('skill-sync pure helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('summarizeOutcomes handles all three evidence shapes', () => {
    const fromEvents = summarizeOutcomes([
      typingEvent('ক', true),
      typingEvent('ক', false),
      typingEvent('', true),
      typingEvent('খ', true),
    ]);
    expect(fromEvents).toEqual([
      { char: 'ক', correct: false },
      { char: 'খ', correct: true },
    ]);
    expect(summarizeOutcomes([])).toEqual([]);

    const fromPair = summarizeOutcomes({
      erred: [{ char: 'গ', count: 2 }],
      attempted: [
        { char: 'গ', count: 3 },
        { char: 'ঘ', count: 1 },
      ],
    });
    expect(fromPair).toEqual([
      { char: 'গ', correct: false },
      { char: 'ঘ', correct: true },
    ]);
    expect(summarizeOutcomes({})).toEqual([]);

    const fromBare = summarizeOutcomes([{ char: 'ঙ', count: 1 }]);
    expect(fromBare).toEqual([{ char: 'ঙ', correct: false }]);
  });

  test('loadLocalSrsStates round-trips valid cards and skips junk', () => {
    expect(loadLocalSrsStates().size).toBe(0);
    const card = createCard('ক');
    localStorage.setItem(SRS_LOCAL_KEY, JSON.stringify({ [card.id]: card, junk: { nope: true } }));
    const loaded = loadLocalSrsStates();
    expect(loaded.get('ক')).toEqual(card);
    expect(loaded.has('junk')).toBe(false);
    localStorage.setItem(SRS_LOCAL_KEY, '{broken');
    expect(loadLocalSrsStates().size).toBe(0);
  });

  test('getDueReviews filters on nextReviewAt', () => {
    const fresh: ReturnType<typeof createCard> = {
      ...createCard('fresh'),
      nextReviewAt: new Date(Date.now() + 86_400_000).toISOString(),
    };
    const due: ReturnType<typeof createCard> = {
      ...createCard('due'),
      nextReviewAt: new Date(Date.now() - 1000).toISOString(),
    };
    expect(getDueReviews([fresh, due]).map((c) => c.id)).toEqual(['due']);
    expect(getDueReviews([createCard('nodate')]).map((c) => c.id)).toEqual(['nodate']);
  });
});
