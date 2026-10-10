/**
 * Metric Contract — cross-screen consistency tests.
 *
 * Proves that the single formula module (src/lib/typing/metric-formulas.ts) is
 * the one used by the practice hook and the session engine, so the same
 * performance yields the same GPM / accuracy everywhere. See docs/METRICS.md.
 */

import { renderHook, act } from '@testing-library/react';
import { useTypingPractice } from '@/hooks/use-typing-practice';
import { computeMetrics } from '@/lib/typing/metrics';
import {
  computeGpm,
  computeCpm,
  computeSpm,
  computeAccuracy,
  deriveWpmFromGpm,
  computeStandardWpm,
  GRAPHEMES_PER_BENGALI_WORD,
  KEYSTROKES_PER_STANDARD_WORD,
} from '@/lib/typing/metric-formulas';
import type { TypingEvent } from '@/lib/types';

function makeEvent(overrides: Partial<TypingEvent> = {}): TypingEvent {
  return {
    expectedGrapheme: 'ক',
    actualInput: 'ক',
    correct: true,
    sequence: 0,
    graphemeIndex: 0,
    timestamp: 0,
    latencyMs: 100,
    errorType: null,
    layout: 'probhat',
    corrected: false,
    ...overrides,
  };
}

describe('metric formulas', () => {
  it('computes GPM as correct graphemes per minute', () => {
    // 60 graphemes in 60s = 60 GPM
    expect(computeGpm(60, 60_000)).toBe(60);
    // 10 graphemes in 30s = 20 GPM
    expect(computeGpm(10, 30_000)).toBe(20);
  });

  it('returns 0 speed for non-positive duration or counts', () => {
    expect(computeGpm(10, 0)).toBe(0);
    expect(computeGpm(0, 60_000)).toBe(0);
    expect(computeCpm(10, 0)).toBe(0);
    expect(computeSpm(10, 0)).toBe(0);
    expect(computeStandardWpm(10, 0)).toBe(0);
    expect(deriveWpmFromGpm(0)).toBe(0);
  });

  it('computes CPM and SPM with the same per-minute divisor', () => {
    expect(computeCpm(120, 60_000)).toBe(120);
    expect(computeSpm(90, 60_000)).toBe(90);
  });

  it('defines accuracy as correct / total attempts', () => {
    expect(computeAccuracy(10, 10)).toBe(100);
    expect(computeAccuracy(8, 10)).toBe(80);
    expect(computeAccuracy(0, 10)).toBe(0);
    // No attempts yet is conventionally 100 (no mistake made).
    expect(computeAccuracy(0, 0)).toBe(100);
    // Never exceeds 100 even if counts are inconsistent.
    expect(computeAccuracy(12, 10)).toBe(100);
  });

  it('derives the practical Bengali WPM from GPM', () => {
    expect(GRAPHEMES_PER_BENGALI_WORD).toBe(4);
    expect(deriveWpmFromGpm(40)).toBe(10);
    // At least 1 when there is any speed, so a pass never reads as 0 WPM.
    expect(deriveWpmFromGpm(2)).toBe(1);
  });

  it('keeps standardized WPM on the classic 5-keystroke convention', () => {
    expect(KEYSTROKES_PER_STANDARD_WORD).toBe(5);
    // 300 keystrokes in 60s = 60 words/min
    expect(computeStandardWpm(300, 60_000)).toBe(60);
  });
});

describe('cross-screen consistency', () => {
  it('practice hook reports the shared GPM and accuracy formulas', () => {
    const { result } = renderHook(() =>
      useTypingPractice({ initialText: 'abcdefghij other', isPracticeDrill: false })
    );

    for (const ch of Array.from('abcdefghij')) {
      act(() => {
        result.current.inputChar(ch, 100);
      });
    }
    act(() => {
      result.current.calculateStats(60);
    });

    const s = result.current.state;
    expect(s.gpm).toBe(10);
    // Same formula the contract module exposes.
    expect(s.gpm).toBe(computeGpm(s.totalChars, 60_000));
    expect(s.accuracy).toBe(computeAccuracy(s.totalChars - s.totalErrors, s.totalChars));
    expect(s.accuracy).toBe(100);
  });

  it('practice hook stays consistent when errors are present', () => {
    const { result } = renderHook(() =>
      useTypingPractice({ initialText: 'hello world', isPracticeDrill: false })
    );

    for (const ch of Array.from('hxllo')) {
      act(() => {
        result.current.inputChar(ch, 100);
      });
    }
    act(() => {
      result.current.calculateStats(60);
    });

    const s = result.current.state;
    expect(s.totalErrors).toBe(1);
    expect(s.accuracy).toBe(computeAccuracy(s.totalChars - s.totalErrors, s.totalChars));
    expect(s.accuracy).toBe(80);
  });

  it('session engine reports the shared GPM and accuracy formulas', () => {
    // 8 correct graphemes + 2 uncorrected wrong attempts in one minute.
    const events: TypingEvent[] = [];
    for (let i = 0; i < 8; i++) {
      events.push(makeEvent({ sequence: i, graphemeIndex: i, timestamp: i * 1000 }));
    }
    for (let i = 0; i < 2; i++) {
      events.push(
        makeEvent({
          correct: false,
          actualInput: 'খ',
          expectedGrapheme: 'ক',
          errorType: 'wrong-key',
          sequence: 8 + i,
          graphemeIndex: 8,
          timestamp: (8 + i) * 1000,
        })
      );
    }

    const stats = computeMetrics(events, 'ক'.repeat(10), 60_000);

    expect(stats.gpm).toBe(computeGpm(8, 60_000));
    expect(stats.accuracy).toBe(computeAccuracy(8, 8 + stats.uncorrectedErrors));
    expect(stats.accuracy).toBe(80);
  });
});
