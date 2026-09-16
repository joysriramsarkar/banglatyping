/**
 * Unit Tests for Typing Comparator, Metrics & Engine API
 */

import {
  normalizeBengali,
  segmentGraphemes,
  isBengaliEqual,
  compareGrapheme,
  compareText,
  graphemeHasVowelSign,
  graphemeHasHasanta,
} from '../lib/typing/comparator';
import {
  computeMetrics,
  formatDuration,
  classifyPerformance,
} from '../lib/typing/metrics';
import {
  classifyGraphemeError,
  getErrorExplanation,
  errorTypeToSkillArea,
  aggregateErrorBreakdown,
} from '../lib/typing/error-classifier';
import {
  buildDisplayState,
  INITIAL_SESSION_STATE,
} from '../lib/typing/engine';
import type { TypingEvent } from '../lib/types';

describe('Bengali Typing Comparator', () => {
  test('normalizes Bengali string and checks equality', () => {
    expect(normalizeBengali('বাংলা')).toBe('বাংলা');
    expect(isBengaliEqual('পানি', 'পানি')).toBe(true);
    expect(isBengaliEqual('পানি', 'দুধ')).toBe(false);
  });

  test('segments text into graphemes', () => {
    const graphemes = segmentGraphemes('বাংলা');
    expect(graphemes.length).toBe(2);
    expect(graphemes[0]).toBe('বাং');
    expect(graphemes[1]).toBe('লা');
  });

  test('compares graphemes for exact, partial, and mismatched inputs', () => {
    const exact = compareGrapheme('ক', 'ক');
    expect(exact.correct).toBe(true);
    expect(exact.isPartial).toBe(false);

    const mismatch = compareGrapheme('কা', 'কি');
    expect(mismatch.correct).toBe(false);
    expect(mismatch.firstDiffPos).toBeGreaterThanOrEqual(0);
  });

  test('compares full text against typed text', () => {
    const res = compareText('আমি বাংলায় গান গাই', 'আমি বাংলায়');
    expect(res.correctCount).toBeGreaterThan(0);
    expect(res.missingCount).toBeGreaterThan(0);
    expect(res.accuracy).toBeGreaterThanOrEqual(0);
  });

  test('identifies vowel signs and hasanta in graphemes', () => {
    expect(graphemeHasVowelSign('কা')).toBe(true);
    expect(graphemeHasVowelSign('ক')).toBe(false);
    expect(graphemeHasHasanta('ক্ত')).toBe(true);
    expect(graphemeHasHasanta('ক')).toBe(false);
  });
});

describe('Typing Metrics Engine', () => {
  test('formats duration into mm:ss or hh:mm:ss', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3665)).toBe('61:05');
  });

  test('classifies performance level based on WPM and accuracy', () => {
    expect(classifyPerformance(80)).toBe('precision');
    expect(classifyPerformance(92)).toBe('balanced');
    expect(classifyPerformance(98)).toBe('speed');
  });

  test('computes metrics from recorded events', () => {
    const events: TypingEvent[] = [
      {
        expected: 'বা',
        actualInput: 'বা',
        correct: true,
        sequence: 0,
        timestamp: 1000,
        latencyMs: 300,
        graphemeLength: 1,
      },
      {
        expected: 'ং',
        actualInput: 'ং',
        correct: true,
        sequence: 1,
        timestamp: 1500,
        latencyMs: 500,
        graphemeLength: 1,
      },
      {
        expected: 'লা',
        actualInput: 'লা',
        correct: true,
        sequence: 2,
        timestamp: 2000,
        latencyMs: 500,
        graphemeLength: 1,
      },
    ];

    const stats = computeMetrics(events, 'বাংলা', 2000);
    expect(stats.accuracy).toBe(100);
    expect(stats.grossWpm).toBeGreaterThan(0);
    expect(stats.gpm).toBeGreaterThan(0);
  });
});

describe('Error Classification & Breakdown', () => {
  test('classifies various Bengali error types', () => {
    expect(classifyGraphemeError('কি', 'কা')).toBe('wrong-kar');
    expect(classifyGraphemeError('ক্ত', 'কত')).toBe('wrong-hasanta');
    expect(classifyGraphemeError(' ', 'ক')).toBe('space-error');
    expect(classifyGraphemeError('।', ',')).toBe('punctuation-error');
  });

  test('aggregates error breakdown and retrieves explanations', () => {
    const breakdown = aggregateErrorBreakdown(['wrong-kar', 'wrong-hasanta', 'wrong-kar']);
    expect(breakdown['wrong-kar']).toBe(2);
    expect(breakdown['wrong-hasanta']).toBe(1);

    expect(getErrorExplanation('wrong-kar')).toContain('কার');
    expect(errorTypeToSkillArea('wrong-hasanta')).toBe('hasanta');
  });
});

describe('Typing Engine Display State Builder', () => {
  test('builds display state from initial session', () => {
    const state = {
      ...INITIAL_SESSION_STATE,
      expectedText: 'বাংলা',
      expectedGraphemes: ['বা', 'ং', 'লা'],
      currentGraphemeIndex: 0,
    };

    const display = buildDisplayState(state);
    expect(display.currentGrapheme).toBe('বা');
    expect(display.graphemes.length).toBe(3);
    expect(display.graphemes[0].state).toBe('current');
    expect(display.graphemes[1].state).toBe('upcoming');
  });
});
