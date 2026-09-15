export type KeyboardLayoutKey = 'avro' | 'bijoy' | 'banglaword';

export type KeyboardLayoutConfig = {
  id: KeyboardLayoutKey;
  label: string;
  top: Array<{ key: string; keyCode: string; bn: string; bnShift?: string; bnExtra?: string; bnShiftExtra?: string; width?: string; align?: 'left' | 'right'; special?: 'shift'; fingerPosition?: number; fingerName?: string }>;
  home: Array<{ key: string; keyCode: string; bn: string; bnShift?: string; bnExtra?: string; bnShiftExtra?: string; width?: string; align?: 'left' | 'right'; special?: 'shift'; fingerPosition?: number; fingerName?: string }>;
  bottom: Array<{ key: string; keyCode: string; bn: string; bnShift?: string; bnExtra?: string; bnShiftExtra?: string; width?: string; align?: 'left' | 'right'; special?: 'shift'; fingerPosition?: number; fingerName?: string }>;
  space: Array<{ key: string; keyCode: string; bn: string; bnShift?: string; bnExtra?: string; bnShiftExtra?: string; width?: string; align?: 'left' | 'right'; special?: 'shift'; fingerPosition?: number; fingerName?: string }>;
};

const baseFinger = (position: number, name: string) => ({ fingerPosition: position, fingerName: name });

const avroLayout: KeyboardLayoutConfig = {
  id: 'avro',
  label: 'Avro Phonetic',
  top: [
    { key: 'q', keyCode: 'KeyQ', bn: 'ঙ', bnShift: 'ঔ', ...baseFinger(1, 'Pinky') },
    { key: 'w', keyCode: 'KeyW', bn: 'ও', bnShift: 'ঐ', ...baseFinger(2, 'Ring') },
    { key: 'e', keyCode: 'KeyE', bn: 'এ', bnShift: 'ঈ', ...baseFinger(3, 'Middle') },
    { key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'য', bnShift: 'য়', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'উ', bnShift: 'ঊ', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'ই', bnShift: 'ী', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'ও', bnShift: 'ৌ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ফ', ...baseFinger(10, 'Pinky') },
  ],
  home: [
    { key: 'a', keyCode: 'KeyA', bn: 'া', bnShift: 'অ', ...baseFinger(1, 'Pinky') },
    { key: 's', keyCode: 'KeyS', bn: 'স', bnShift: 'শ', ...baseFinger(2, 'Ring') },
    { key: 'd', keyCode: 'KeyD', bn: 'ড', bnShift: 'ঢ', ...baseFinger(3, 'Middle') },
    { key: 'f', keyCode: 'KeyF', bn: 'ফ', bnShift: 'ৎ', ...baseFinger(4, 'Index') },
    { key: 'g', keyCode: 'KeyG', bn: 'গ', bnShift: 'ঘ', ...baseFinger(4, 'Index') },
    { key: 'h', keyCode: 'KeyH', bn: '্', bnShift: 'হ', ...baseFinger(7, 'Index') },
    { key: 'j', keyCode: 'KeyJ', bn: 'জ', bnShift: 'ঝ', ...baseFinger(7, 'Index') },
    { key: 'k', keyCode: 'KeyK', bn: 'ক', bnShift: 'খ', ...baseFinger(8, 'Middle') },
    { key: 'l', keyCode: 'KeyL', bn: 'ল', bnShift: 'ষ', ...baseFinger(9, 'Ring') },
  ],
  bottom: [
    { key: 'ShiftLeft', keyCode: 'ShiftLeft', bn: 'Shift', width: 'w-24', align: 'left', special: 'shift', ...baseFinger(5, 'Thumb') },
    { key: 'z', keyCode: 'KeyZ', bn: '্য', bnShift: 'ং', ...baseFinger(1, 'Pinky') },
    { key: 'x', keyCode: 'KeyX', bn: 'ত', bnShift: 'থ', ...baseFinger(2, 'Ring') },
    { key: 'c', keyCode: 'KeyC', bn: 'চ', bnShift: 'ছ', ...baseFinger(3, 'Middle') },
    { key: 'v', keyCode: 'KeyV', bn: 'দ', bnShift: 'ধ', ...baseFinger(4, 'Index') },
    { key: 'b', keyCode: 'KeyB', bn: 'ব', bnShift: 'ভ', ...baseFinger(4, 'Index') },
    { key: 'n', keyCode: 'KeyN', bn: 'ন', bnShift: 'ণ', ...baseFinger(7, 'Index') },
    { key: 'm', keyCode: 'KeyM', bn: 'ম', ...baseFinger(7, 'Index') },
    { key: ',', keyCode: 'Comma', bn: ',', ...baseFinger(8, 'Middle') },
    { key: '.', keyCode: 'Period', bn: '.', ...baseFinger(9, 'Ring') },
    { key: 'ShiftRight', keyCode: 'ShiftRight', bn: 'Shift', width: 'flex-grow', align: 'right', special: 'shift', ...baseFinger(6, 'Thumb') },
  ],
  space: [{ key: ' ', keyCode: 'Space', bn: 'Space', width: 'w-96', ...baseFinger(5, 'Thumb') }],
};

const bijoyLayout: KeyboardLayoutConfig = {
  id: 'bijoy',
  label: 'Bijoy Classic',
  top: [
    { key: 'q', keyCode: 'KeyQ', bn: 'অ', bnShift: 'অ', ...baseFinger(1, 'Pinky') },
    { key: 'w', keyCode: 'KeyW', bn: 'ই', bnShift: 'ঈ', ...baseFinger(2, 'Ring') },
    { key: 'e', keyCode: 'KeyE', bn: 'উ', bnShift: 'ঊ', ...baseFinger(3, 'Middle') },
    { key: 'r', keyCode: 'KeyR', bn: 'ঋ', bnShift: 'ৠ', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'য', bnShift: 'য়', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'উ', bnShift: 'ঊ', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'ই', bnShift: 'ঈ', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'ও', bnShift: 'ঔ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ফ', ...baseFinger(10, 'Pinky') },
  ],
  home: [
    { key: 'a', keyCode: 'KeyA', bn: 'অ', bnShift: 'আ', ...baseFinger(1, 'Pinky') },
    { key: 's', keyCode: 'KeyS', bn: 'স', bnShift: 'শ', ...baseFinger(2, 'Ring') },
    { key: 'd', keyCode: 'KeyD', bn: 'ড', bnShift: 'ঢ', ...baseFinger(3, 'Middle') },
    { key: 'f', keyCode: 'KeyF', bn: 'ফ', bnShift: 'ৎ', ...baseFinger(4, 'Index') },
    { key: 'g', keyCode: 'KeyG', bn: 'গ', bnShift: 'ঘ', ...baseFinger(4, 'Index') },
    { key: 'h', keyCode: 'KeyH', bn: 'হ', bnShift: 'ঃ', ...baseFinger(7, 'Index') },
    { key: 'j', keyCode: 'KeyJ', bn: 'জ', bnShift: 'ঝ', ...baseFinger(7, 'Index') },
    { key: 'k', keyCode: 'KeyK', bn: 'ক', bnShift: 'খ', ...baseFinger(8, 'Middle') },
    { key: 'l', keyCode: 'KeyL', bn: 'ল', bnShift: 'ষ', ...baseFinger(9, 'Ring') },
  ],
  bottom: [
    { key: 'ShiftLeft', keyCode: 'ShiftLeft', bn: 'Shift', width: 'w-24', align: 'left', special: 'shift', ...baseFinger(5, 'Thumb') },
    { key: 'z', keyCode: 'KeyZ', bn: 'য', bnShift: 'য়', ...baseFinger(1, 'Pinky') },
    { key: 'x', keyCode: 'KeyX', bn: 'ত', bnShift: 'থ', ...baseFinger(2, 'Ring') },
    { key: 'c', keyCode: 'KeyC', bn: 'চ', bnShift: 'ছ', ...baseFinger(3, 'Middle') },
    { key: 'v', keyCode: 'KeyV', bn: 'দ', bnShift: 'ধ', ...baseFinger(4, 'Index') },
    { key: 'b', keyCode: 'KeyB', bn: 'ব', bnShift: 'ভ', ...baseFinger(4, 'Index') },
    { key: 'n', keyCode: 'KeyN', bn: 'ন', bnShift: 'ণ', ...baseFinger(7, 'Index') },
    { key: 'm', keyCode: 'KeyM', bn: 'ম', bnShift: 'ং', ...baseFinger(7, 'Index') },
    { key: ',', keyCode: 'Comma', bn: ',', ...baseFinger(8, 'Middle') },
    { key: '.', keyCode: 'Period', bn: '.', ...baseFinger(9, 'Ring') },
    { key: 'ShiftRight', keyCode: 'ShiftRight', bn: 'Shift', width: 'flex-grow', align: 'right', special: 'shift', ...baseFinger(6, 'Thumb') },
  ],
  space: [{ key: ' ', keyCode: 'Space', bn: 'Space', width: 'w-96', ...baseFinger(5, 'Thumb') }],
};

const banglaWordLayout: KeyboardLayoutConfig = {
  id: 'banglaword',
  label: 'BanglaWord',
  top: [
    { key: 'q', keyCode: 'KeyQ', bn: 'ক্ষ', bnShift: 'ঁ', ...baseFinger(1, 'Pinky') },
    { key: 'w', keyCode: 'KeyW', bn: 'ঙ', bnShift: 'ঃ', ...baseFinger(2, 'Ring') },
    { key: 'e', keyCode: 'KeyE', bn: 'ে', bnShift: 'ৈ', ...baseFinger(3, 'Middle') },
    { key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'য', bnShift: 'য়', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'ু', bnShift: 'ূ', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'ি', bnShift: 'ী', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'ো', bnShift: 'ৌ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ঢ়', ...baseFinger(10, 'Pinky') },
    { key: '[', keyCode: 'BracketLeft', bn: '[', bnShift: '{', ...baseFinger(10, 'Pinky') },
    { key: ']', keyCode: 'BracketRight', bn: ']', bnShift: '}', ...baseFinger(10, 'Pinky') },
    { key: '\\', keyCode: 'Backslash', bn: 'ৃ', bnShift: 'ঞ', ...baseFinger(10, 'Pinky') },
  ],
  home: [
    { key: 'a', keyCode: 'KeyA', bn: 'া', bnShift: 'অ', ...baseFinger(1, 'Pinky') },
    { key: 's', keyCode: 'KeyS', bn: 'স', bnShift: 'শ', ...baseFinger(2, 'Ring') },
    { key: 'd', keyCode: 'KeyD', bn: 'ড', bnShift: 'ঢ', ...baseFinger(3, 'Middle') },
    { key: 'f', keyCode: 'KeyF', bn: 'ফ', bnShift: 'ৎ', ...baseFinger(4, 'Index') },
    { key: 'g', keyCode: 'KeyG', bn: 'গ', bnShift: 'ঘ', ...baseFinger(4, 'Index') },
    { key: 'h', keyCode: 'KeyH', bn: '্', bnShift: 'হ', ...baseFinger(7, 'Index') },
    { key: 'j', keyCode: 'KeyJ', bn: 'জ', bnShift: 'ঝ', ...baseFinger(7, 'Index') },
    { key: 'k', keyCode: 'KeyK', bn: 'ক', bnShift: 'খ', ...baseFinger(8, 'Middle') },
    { key: 'l', keyCode: 'KeyL', bn: 'ল', bnShift: 'ষ', ...baseFinger(9, 'Ring') },
    { key: ';', keyCode: 'Semicolon', bn: ';', bnShift: ':', ...baseFinger(10, 'Pinky') },
    { key: "'", keyCode: 'Quote', bn: "'", bnShift: '"', ...baseFinger(10, 'Pinky') },
  ],
  bottom: [
    { key: 'ShiftLeft', keyCode: 'ShiftLeft', bn: 'Shift', align: 'left', special: 'shift', ...baseFinger(5, 'Thumb') },
    { key: 'z', keyCode: 'KeyZ', bn: '্য', bnShift: 'ং', ...baseFinger(1, 'Pinky') },
    { key: 'x', keyCode: 'KeyX', bn: 'ত', bnShift: 'থ', ...baseFinger(2, 'Ring') },
    { key: 'c', keyCode: 'KeyC', bn: 'চ', bnShift: 'ছ', ...baseFinger(3, 'Middle') },
    { key: 'v', keyCode: 'KeyV', bn: 'দ', bnShift: 'ধ', ...baseFinger(4, 'Index') },
    { key: 'b', keyCode: 'KeyB', bn: 'ব', bnShift: 'ভ', ...baseFinger(4, 'Index') },
    { key: 'n', keyCode: 'KeyN', bn: 'ন', bnShift: 'ণ', ...baseFinger(7, 'Index') },
    { key: 'm', keyCode: 'KeyM', bn: 'ম', bnShift: 'ং', ...baseFinger(7, 'Index') },
    { key: ',', keyCode: 'Comma', bn: ',', bnShift: '<', ...baseFinger(8, 'Middle') },
    { key: '.', keyCode: 'Period', bn: '।', bnShift: '>', ...baseFinger(9, 'Ring') },
    { key: '/', keyCode: 'Slash', bn: '/', bnShift: '?', ...baseFinger(10, 'Pinky') },
    { key: 'ShiftRight', keyCode: 'ShiftRight', bn: 'Shift', align: 'right', special: 'shift', ...baseFinger(6, 'Thumb') },
  ],
  space: [{ key: ' ', keyCode: 'Space', bn: 'Space', ...baseFinger(5, 'Thumb') }],
};

const layouts: Record<KeyboardLayoutKey, KeyboardLayoutConfig> = {
  avro: avroLayout,       // disabled
  bijoy: bijoyLayout,     // disabled
  banglaword: banglaWordLayout,
};

export function normalizeKeyboardLayout(value?: string): KeyboardLayoutKey {
  if (!value) return 'banglaword';
  const lower = value.toLowerCase();
  if (lower.includes('avro')) return 'avro';
  if (lower.includes('bijoy')) return 'bijoy';
  if (lower.includes('banglaword')) return 'banglaword';
  return 'avro'; // Fallback for unknown
}

export function getKeyboardLayoutConfig(layout?: string): KeyboardLayoutConfig {
  const normalized = normalizeKeyboardLayout(layout);
  return layouts[normalized] || banglaWordLayout;
}

export function getKeyboardLayoutOptions() {
  return [{ value: banglaWordLayout.id, label: banglaWordLayout.label }];
}

export interface ResolvedKeyInfo {
  keyCode: string;
  key: string;
  char: string;
  needsShift: boolean;
  fingerPosition: number;
  fingerName: string;
  hand: 'left' | 'right';
  bengaliFingerLabel: string;
}

export const FINGER_BENGALI_NAMES: Record<number, string> = {
  1: 'বাম হাতের কনিষ্ঠা (Left Pinky)',
  2: 'বাম হাতের অনামিকা (Left Ring)',
  3: 'বাম হাতের মধ্যমা (Left Middle)',
  4: 'বাম হাতের তর্জনী (Left Index)',
  5: 'বাম হাতের বৃদ্ধাঙ্গুল (Spacebar)',
  6: 'ডান হাতের বৃদ্ধাঙ্গুল (Spacebar)',
  7: 'ডান হাতের তর্জনী (Right Index)',
  8: 'ডান হাতের মধ্যমা (Right Middle)',
  9: 'ডান হাতের অনামিকা (Right Ring)',
  10: 'ডান হাতের কনিষ্ঠা (Right Pinky)',
};

const BANGLAWORD_INDEPENDENT_VOWEL_KEY_MAP: Record<
  string,
  { keyCode: string; key: string; needsShift: boolean; fingerPosition: number; fingerName: string }
> = {
  'অ': { keyCode: 'KeyA', key: 'a', needsShift: true, fingerPosition: 1, fingerName: 'Pinky' },
  'আ': { keyCode: 'KeyA', key: 'a', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },
  'ই': { keyCode: 'KeyI', key: 'i', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  'ঈ': { keyCode: 'KeyI', key: 'i', needsShift: true, fingerPosition: 8, fingerName: 'Middle' },
  'উ': { keyCode: 'KeyU', key: 'u', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ঊ': { keyCode: 'KeyU', key: 'u', needsShift: true, fingerPosition: 7, fingerName: 'Index' },
  'ঋ': { keyCode: 'Backslash', key: '\\', needsShift: false, fingerPosition: 10, fingerName: 'Pinky' },
  'এ': { keyCode: 'KeyE', key: 'e', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'ঐ': { keyCode: 'KeyE', key: 'e', needsShift: true, fingerPosition: 3, fingerName: 'Middle' },
  'ও': { keyCode: 'KeyO', key: 'o', needsShift: false, fingerPosition: 9, fingerName: 'Ring' },
  'ঔ': { keyCode: 'KeyO', key: 'o', needsShift: true, fingerPosition: 9, fingerName: 'Ring' },
};

export function findKeyInfoForChar(char: string, layoutName?: string): ResolvedKeyInfo | null {
  if (!char) return null;
  if (char === ' ') {
    return {
      keyCode: 'Space',
      key: 'Space',
      char: ' ',
      needsShift: false,
      fingerPosition: 5,
      fingerName: 'Thumb',
      hand: 'left',
      bengaliFingerLabel: 'বৃদ্ধাঙ্গুল (Spacebar)',
    };
  }

  // Check independent vowel guide mapping for BanglaWord
  const vowelMapping = BANGLAWORD_INDEPENDENT_VOWEL_KEY_MAP[char];
  if (vowelMapping) {
    const pos = vowelMapping.fingerPosition;
    return {
      keyCode: vowelMapping.keyCode,
      key: vowelMapping.key,
      char,
      needsShift: vowelMapping.needsShift,
      fingerPosition: pos,
      fingerName: vowelMapping.fingerName,
      hand: pos <= 5 ? 'left' : 'right',
      bengaliFingerLabel: FINGER_BENGALI_NAMES[pos] || 'অজানা',
    };
  }

  const config = getKeyboardLayoutConfig(layoutName);
  const allKeys = [...config.top, ...config.home, ...config.bottom, ...config.space];

  for (const k of allKeys) {
    if (k.special === 'shift') continue;

    // Check normal Bengali
    if (k.bn === char) {
      const pos = k.fingerPosition || 1;
      return {
        keyCode: k.keyCode,
        key: k.key,
        char,
        needsShift: false,
        fingerPosition: pos,
        fingerName: k.fingerName || 'Index',
        hand: pos <= 5 ? 'left' : 'right',
        bengaliFingerLabel: FINGER_BENGALI_NAMES[pos] || 'অজানা',
      };
    }

    // Check Shift Bengali
    if (k.bnShift === char) {
      const pos = k.fingerPosition || 1;
      return {
        keyCode: k.keyCode,
        key: k.key,
        char,
        needsShift: true,
        fingerPosition: pos,
        fingerName: k.fingerName || 'Index',
        hand: pos <= 5 ? 'left' : 'right',
        bengaliFingerLabel: FINGER_BENGALI_NAMES[pos] || 'অজানা',
      };
    }

    // Check Latin key matching
    if (k.key.toLowerCase() === char.toLowerCase()) {
      const pos = k.fingerPosition || 1;
      const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
      return {
        keyCode: k.keyCode,
        key: k.key,
        char,
        needsShift: isUpper,
        fingerPosition: pos,
        fingerName: k.fingerName || 'Index',
        hand: pos <= 5 ? 'left' : 'right',
        bengaliFingerLabel: FINGER_BENGALI_NAMES[pos] || 'অজানা',
      };
    }
  }

  return null;
}
