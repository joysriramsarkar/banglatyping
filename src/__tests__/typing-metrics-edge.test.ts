/**
 * Edge cases and comprehensive unit tests for:
 * - Bengali Typing Error Classifier (error-classifier.ts)
 * - Typing Metrics Engine (metrics.ts)
 */

import {
  classifyGraphemeError,
  classifySpaceError,
  aggregateErrorBreakdown,
  errorTypeToSkillArea,
  getErrorExplanation,
} from '@/lib/typing/error-classifier';
import {
  computeMetrics,
  formatDuration,
  classifyPerformance,
} from '@/lib/typing/metrics';
import type { TypingEvent } from '@/lib/types';

describe('Typing Error Classifier Edge Cases', () => {
  it('returns null when characters match identically or normalized', () => {
    expect(classifyGraphemeError('ক', 'ক')).toBeNull();
    expect(classifyGraphemeError('বাংলা', 'বাংলা')).toBeNull();
  });

  it('detects extra-key when expected is empty but actual is present', () => {
    expect(classifyGraphemeError('', 'ক')).toBe('extra-key');
  });

  it('detects missing-key when expected is present but actual is empty', () => {
    expect(classifyGraphemeError('ক', '')).toBe('missing-key');
  });

  it('detects space-error when either expected or actual is a space', () => {
    expect(classifyGraphemeError(' ', 'ক')).toBe('space-error');
    expect(classifyGraphemeError('ক', ' ')).toBe('space-error');
    expect(classifySpaceError('আমি ', 'আমি')).toBe('space-error');
  });

  it('detects punctuation-error when punctuation symbols mismatch', () => {
    expect(classifyGraphemeError('।', ',')).toBe('punctuation-error');
    expect(classifyGraphemeError('!', '?')).toBe('punctuation-error');
    expect(classifyGraphemeError('ক', '।')).toBe('punctuation-error');
  });

  it('detects wrong-hasanta when expected has hasanta but actual lacks it', () => {
    // ক্ত (has hasanta) vs কত (no hasanta)
    expect(classifyGraphemeError('ক্ত', 'কত')).toBe('wrong-hasanta');
  });

  it('detects wrong-conjunct when actual has hasanta but expected does not', () => {
    expect(classifyGraphemeError('কত', 'ক্ত')).toBe('wrong-conjunct');
  });

  it('detects wrong-kar when vowel signs differ or are missing', () => {
    expect(classifyGraphemeError('কা', 'কি')).toBe('wrong-kar');
    expect(classifyGraphemeError('কে', 'কো')).toBe('wrong-kar');
    expect(classifyGraphemeError('ক', 'কা')).toBe('wrong-kar');
  });

  it('detects wrong-key when base consonants differ', () => {
    expect(classifyGraphemeError('ক', 'খ')).toBe('wrong-key');
    expect(classifyGraphemeError('ব', 'র')).toBe('wrong-key');
  });

  it('detects wrong-order when same consonants are ordered differently', () => {
    // র্ক (র + ্ + ক) vs ক্র (ক + ্ + র)
    expect(classifyGraphemeError('র্ক', 'ক্র')).toBe('wrong-order');
  });

  it('correctly aggregates error breakdown map', () => {
    const errorTypes = [
      'wrong-kar',
      'wrong-kar',
      'wrong-hasanta',
      'wrong-key',
      null,
    ] as any[];

    const breakdown = aggregateErrorBreakdown(errorTypes);
    expect(breakdown['wrong-kar']).toBe(2);
    expect(breakdown['wrong-hasanta']).toBe(1);
    expect(breakdown['wrong-key']).toBe(1);
  });

  it('maps error types to appropriate learning skill areas', () => {
    expect(errorTypeToSkillArea('wrong-hasanta')).toBe('hasanta');
    expect(errorTypeToSkillArea('wrong-conjunct')).toBe('conjuncts');
    expect(errorTypeToSkillArea('wrong-kar')).toBe('vowel-signs');
    expect(errorTypeToSkillArea('space-error')).toBe('spacing');
    expect(errorTypeToSkillArea('punctuation-error')).toBe('punctuation');
    expect(errorTypeToSkillArea('wrong-key')).toBe('basic-keys');
  });

  it('provides helpful Bengali error explanations', () => {
    expect(getErrorExplanation('wrong-hasanta')).toContain('হসন্ত');
    expect(getErrorExplanation('wrong-kar')).toContain('কার');
    expect(getErrorExplanation('wrong-conjunct')).toContain('যুক্তাক্ষর');
  });
});

describe('Typing Metrics Engine Edge Cases', () => {
  function createEvent(overrides: Partial<TypingEvent>): TypingEvent {
    return {
      sequence: 1,
      expectedGrapheme: '',
      actualInput: '',
      timestamp: Date.now(),
      latencyMs: 100,
      correct: true,
      errorType: null,
      layout: 'avro',
      corrected: false,
      ...overrides,
    };
  }

  it('returns empty stats for zero events or non-positive duration', () => {
    const emptyEvents = computeMetrics([], 'বাংলা', 60000);
    expect(emptyEvents.wpm).toBe(0);
    expect(emptyEvents.accuracy).toBe(100);
    expect(emptyEvents.errors).toBe(0);

    const zeroDuration = computeMetrics(
      [createEvent({ expectedGrapheme: 'ক', actualInput: 'ক', correct: true, timestamp: 100, latencyMs: 100 })],
      'ক',
      0
    );
    expect(zeroDuration.wpm).toBe(0);
    expect(zeroDuration.grossWpm).toBe(0);
  });

  it('computes 100% accuracy and accurate GPM for flawless session', () => {
    const now = Date.now();
    const events: TypingEvent[] = [
      createEvent({ sequence: 1, expectedGrapheme: 'আ', actualInput: 'আ', correct: true, timestamp: now + 500, latencyMs: 500 }),
      createEvent({ sequence: 2, expectedGrapheme: 'মি', actualInput: 'মি', correct: true, timestamp: now + 1000, latencyMs: 500 }),
      createEvent({ sequence: 3, expectedGrapheme: ' ', actualInput: ' ', correct: true, timestamp: now + 1500, latencyMs: 500 }),
      createEvent({ sequence: 4, expectedGrapheme: 'বাং', actualInput: 'বাং', correct: true, timestamp: now + 2000, latencyMs: 500 }),
      createEvent({ sequence: 5, expectedGrapheme: 'লা', actualInput: 'লা', correct: true, timestamp: now + 2500, latencyMs: 500 }),
    ];

    const stats = computeMetrics(events, 'আমি বাংলা', 30000); // 30 seconds = 0.5 min
    expect(stats.accuracy).toBe(100);
    expect(stats.errors).toBe(0);
    expect(stats.uncorrectedErrors).toBe(0);
    expect(stats.gpm).toBe(10); // 5 graphemes in 0.5 minutes = 10 GPM
    expect(stats.longestStreak).toBe(5);
  });

  it('accurately counts uncorrected errors, deductions and pause counts', () => {
    const now = Date.now();
    const events: TypingEvent[] = [
      createEvent({ sequence: 1, expectedGrapheme: 'ক', actualInput: 'ক', correct: true, timestamp: now + 500, latencyMs: 500 }),
      // Pause > 2000ms
      createEvent({ sequence: 2, expectedGrapheme: 'খ', actualInput: 'গ', correct: false, timestamp: now + 3500, latencyMs: 3000, errorType: 'wrong-key' }),
      createEvent({ sequence: 3, expectedGrapheme: 'গ', actualInput: 'গ', correct: true, timestamp: now + 4000, latencyMs: 500 }),
    ];

    const stats = computeMetrics(events, 'কখগ', 10000);
    expect(stats.errors).toBe(1);
    expect(stats.uncorrectedErrors).toBe(1);
    expect(stats.pauseCount).toBe(1);
    expect(stats.longestStreak).toBe(1);
    expect(stats.erredCharacters).toEqual([{ char: 'খ', count: 1 }]);
  });

  it('formats duration in mm:ss accurately', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3600)).toBe('60:00');
  });

  it('classifies performance category based on accuracy thresholds', () => {
    expect(classifyPerformance(85)).toBe('precision');
    expect(classifyPerformance(89.9)).toBe('precision');
    expect(classifyPerformance(90)).toBe('balanced');
    expect(classifyPerformance(94.9)).toBe('balanced');
    expect(classifyPerformance(95)).toBe('speed');
    expect(classifyPerformance(100)).toBe('speed');
  });
});
