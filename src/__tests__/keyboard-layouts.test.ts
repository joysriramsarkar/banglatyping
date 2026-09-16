import {
  getKeyboardLayoutConfig,
  normalizeKeyboardLayout,
  findKeyInfoForChar,
} from '../lib/keyboard-layouts';

describe('keyboard layout helpers', () => {
  it('normalizes supported layout names to canonical values', () => {
    expect(normalizeKeyboardLayout('Avro Phonetic')).toBe('avro');
    expect(normalizeKeyboardLayout('Bijoy Classic')).toBe('bijoy');
    expect(normalizeKeyboardLayout('BanglaWord')).toBe('banglaword');
    expect(normalizeKeyboardLayout('unknown')).toBe('avro');
  });

  it('returns the expected Bengali labels for each layout', () => {
    expect(getKeyboardLayoutConfig('avro').home[0].bn).toBe('া');
    expect(getKeyboardLayoutConfig('bijoy').home[0].bn).toBe('অ');
    expect(getKeyboardLayoutConfig('banglaword').home[0].bn).toBe('া');
  });

  it('includes Backslash key mapped to ri-kar (ৃ) in banglaword layout', () => {
    const layout = getKeyboardLayoutConfig('banglaword');
    const backslash = layout.top.find(k => k.keyCode === 'Backslash');
    expect(backslash).toBeDefined();
    expect(backslash?.bn).toBe('ৃ');
    expect(backslash?.bnShift).toBe('ঞ');
  });

  it('finds key info for various characters', () => {
    expect(findKeyInfoForChar('')).toBeNull();

    const spaceInfo = findKeyInfoForChar(' ');
    expect(spaceInfo?.keyCode).toBe('Space');
    expect(spaceInfo?.bengaliFingerLabel).toContain('Spacebar');

    const vowelInfo = findKeyInfoForChar('আ');
    expect(vowelInfo?.keyCode).toBe('KeyA');
    expect(vowelInfo?.needsShift).toBe(false);

    const normalInfo = findKeyInfoForChar('ক', 'banglaword');
    expect(normalInfo?.key).toBe('k');
    expect(normalInfo?.needsShift).toBe(false);

    const shiftInfo = findKeyInfoForChar('খ', 'banglaword');
    expect(shiftInfo?.key).toBe('k');
    expect(shiftInfo?.needsShift).toBe(true);

    const latinInfo = findKeyInfoForChar('a', 'banglaword');
    expect(latinInfo?.keyCode).toBe('KeyA');

    expect(findKeyInfoForChar('—', 'banglaword')).toBeNull();
  });
});

