import {
  getKeyboardLayoutConfig,
  normalizeKeyboardLayout,
  findKeyInfoForChar,
  getKeyboardLayoutOptions,
  getActiveKeyboardLayout,
  setActiveKeyboardLayout,
} from '../lib/keyboard-layouts';

describe('keyboard layout helpers', () => {
  it('normalizes supported layout names to canonical values with banglaword as default', () => {
    expect(normalizeKeyboardLayout('Avro Phonetic')).toBe('avro');
    expect(normalizeKeyboardLayout('Bijoy Classic')).toBe('bijoy');
    expect(normalizeKeyboardLayout('BanglaWord')).toBe('banglaword');
    expect(normalizeKeyboardLayout('Lipighor BanglaWord')).toBe('banglaword');
    expect(normalizeKeyboardLayout('Khipro')).toBe('khipro');
    expect(normalizeKeyboardLayout('khipro-m17n')).toBe('khipro');
    expect(normalizeKeyboardLayout('Probhat')).toBe('probhat');
    expect(normalizeKeyboardLayout('Unijoy')).toBe('unijoy');
    expect(normalizeKeyboardLayout('unknown')).toBe('banglaword');
    expect(normalizeKeyboardLayout('')).toBe('banglaword');
  });

  it('returns all 6 keyboard layout options with banglaword as default and khipro included', () => {
    const options = getKeyboardLayoutOptions();
    expect(options.length).toBe(6);
    expect(options[0].value).toBe('banglaword');
    expect(options[0].isDefault).toBe(true);
    expect(options[1].value).toBe('khipro');
    expect(options[1].badge).toBe('জিরো-শিফট');
    expect(options.map(o => o.value)).toEqual(['banglaword', 'khipro', 'probhat', 'bijoy', 'avro', 'unijoy']);
  });

  it('returns the expected Bengali labels for each layout including khipro', () => {
    expect(getKeyboardLayoutConfig('avro').home[0].bn).toBe('া');
    expect(getKeyboardLayoutConfig('bijoy').home[0].bn).toBe('ৃ');
    expect(getKeyboardLayoutConfig('banglaword').home[0].bn).toBe('া');
    expect(getKeyboardLayoutConfig('probhat').home[0].bn).toBe('া');
    expect(getKeyboardLayoutConfig('unijoy').home[0].bn).toBe('ৃ');
    expect(getKeyboardLayoutConfig('khipro').home[0].bn).toBe('আ');
    expect(getKeyboardLayoutConfig('khipro').home.find(k => k.keyCode === 'KeyF')?.bn).toBe('Mod');
    expect(getKeyboardLayoutConfig('khipro').home.find(k => k.keyCode === 'KeyK')?.bn).toBe('ক');
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

  it('finds key info for Khipro characters with zero shift (needsShift: false)', () => {
    const oInfo = findKeyInfoForChar('অ', 'khipro');
    expect(oInfo?.keyCode).toBe('KeyO');
    expect(oInfo?.key).toBe('o');
    expect(oInfo?.needsShift).toBe(false);

    const aInfo = findKeyInfoForChar('আ', 'khipro');
    expect(aInfo?.keyCode).toBe('KeyA');
    expect(aInfo?.needsShift).toBe(false);

    const kInfo = findKeyInfoForChar('ক', 'khipro');
    expect(kInfo?.keyCode).toBe('KeyK');
    expect(kInfo?.needsShift).toBe(false);

    const khInfo = findKeyInfoForChar('খ', 'khipro');
    expect(khInfo?.keyCode).toBe('KeyK');
    expect(khInfo?.needsShift).toBe(false);

    const tInfo = findKeyInfoForChar('ট', 'khipro');
    expect(tInfo?.keyCode).toBe('KeyT');
    expect(tInfo?.needsShift).toBe(false);

    const kfInfo = findKeyInfoForChar('ক্ষ', 'khipro');
    expect(kfInfo?.keyCode).toBe('KeyK');
    expect(kfInfo?.needsShift).toBe(false);
  });

  it('persists and retrieves active layout from localStorage including khipro', () => {
    setActiveKeyboardLayout('khipro');
    expect(getActiveKeyboardLayout()).toBe('khipro');

    setActiveKeyboardLayout('probhat');
    expect(getActiveKeyboardLayout()).toBe('probhat');

    setActiveKeyboardLayout('banglaword');
    expect(getActiveKeyboardLayout()).toBe('banglaword');
  });
});
