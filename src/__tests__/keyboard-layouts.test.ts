import { getKeyboardLayoutConfig, normalizeKeyboardLayout } from '../lib/keyboard-layouts';

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
    expect(getKeyboardLayoutConfig('banglaword').home[0].bn).toBe('অ');
  });
});
