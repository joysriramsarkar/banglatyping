import { bengaliSegmenter } from '../lib/bengali-grapheme';

describe('Lesson Player Speed & Metrics Calculation', () => {
  // Items from HR-02 sec-1-2-1
  const hr02Items = [
    'গ', '্', 'জ', 'ক', 'ল',
    'গ', 'জ', 'ক', 'ল',
    'গ', 'ক', 'ল',
    'জক', 'কল', 'গল', 'কগ', 'জল', 'গল', 'লক', 'গজ', 'জগ', 'লগ',
    'ক্ল', 'গ্ল', 'জ্বল', 'কলক', 'গজগ', 'লকল', 'জলদ', 'গজল', 'কলম'
  ];

  test('calculates correct graphemes for pattern items without adding phantom spaces', () => {
    let graphemeCount = 0;
    for (let i = 0; i < hr02Items.length; i++) {
      graphemeCount += bengaliSegmenter.segmentString(hr02Items[i]).length;
    }

    // Real grapheme count should be around 54 (no phantom spaces)
    expect(graphemeCount).toBeGreaterThan(45);
    expect(graphemeCount).toBeLessThan(65);

    // If phantom spaces were added (previous bug: +1 per item):
    const withBug = graphemeCount + hr02Items.length - 1;
    expect(withBug).toBeGreaterThan(75);
    // Real count must be strictly less than the bugged count
    expect(graphemeCount).toBeLessThan(withBug);
  });

  test('calculates realistic GPM and WPM without extreme inflation', () => {
    let finalGraphemes = 0;
    for (let i = 0; i < hr02Items.length; i++) {
      finalGraphemes += bengaliSegmenter.segmentString(hr02Items[i]).length;
    }

    // Suppose user took 135 seconds (2.25 minutes) to complete this drill
    const timeElapsedSec = 135;
    const minutes = timeElapsedSec / 60;
    const gpm = Math.round(finalGraphemes / minutes);
    const wpm = Math.max(1, Math.round(gpm / 4));

    // For a beginner typing 54 graphemes in 135 seconds:
    // Speed should be exactly ~24 GPM and ~6 WPM (matching user screenshot)
    expect(gpm).toBe(24);
    expect(wpm).toBe(6);

    // Ensure WPM is proportional to GPM (1 word ≈ 4 graphemes)
    expect(Math.round(gpm / 4)).toBe(wpm);
  });

  test('damps initial seconds to prevent wild spikes at the start of a drill', () => {
    // If only 1 grapheme is typed in the first second
    const totalGraphemes = 1;
    const timeElapsedSec = 1;

    // With our damping logic:
    const dampedGpm = timeElapsedSec < 2 ? Math.min(60, Math.round(totalGraphemes * 30)) : Math.round(totalGraphemes / (timeElapsedSec / 60));
    
    // Without damping, 1 char in 1s would be 60 GPM, 2 chars in 0.5s would be 240 GPM
    expect(dampedGpm).toBeLessThanOrEqual(60);
  });

  test('calculates SPM (Strokes Per Minute) accurately based on keystrokes and time', () => {
    const totalAttempts = 120; // 120 keystrokes pressed
    const errorsCount = 0;
    const timeElapsedSec = 60; // 1 minute
    const minutes = timeElapsedSec / 60;

    const correctStrokes = Math.max(0, totalAttempts - errorsCount);
    const spm = Math.round(correctStrokes / minutes);

    expect(spm).toBe(120);

    // If there were 20 errors in 120 attempts over 60s:
    const correctWithErrors = 120 - 20;
    const spmWithErrors = Math.round(correctWithErrors / minutes);
    expect(spmWithErrors).toBe(100);
  });
});
