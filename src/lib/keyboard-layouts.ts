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
    { key: 'q', keyCode: 'KeyQ', bn: 'ও', bnShift: 'ঔ', ...baseFinger(1, 'Pinky') },
    { key: 'w', keyCode: 'KeyW', bn: 'য়', bnShift: 'ঐ', ...baseFinger(2, 'Ring') },
    { key: 'e', keyCode: 'KeyE', bn: 'এ', bnShift: 'ঈ', ...baseFinger(3, 'Middle') },
    { key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'য', bnShift: 'য়', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'উ', bnShift: 'ঊ', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'ই', bnShift: 'ঈ', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'ও', bnShift: 'ৌ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ফ', ...baseFinger(10, 'Pinky') },
  ],
  home: [
    { key: 'a', keyCode: 'KeyA', bn: 'অ', bnShift: 'আ', ...baseFinger(1, 'Pinky') },
    { key: 's', keyCode: 'KeyS', bn: 'স', bnShift: 'শ', ...baseFinger(2, 'Ring') },
    { key: 'd', keyCode: 'KeyD', bn: 'দ', bnShift: 'ধ', ...baseFinger(3, 'Middle') },
    { key: 'f', keyCode: 'KeyF', bn: 'ফ', bnShift: 'ৎ', ...baseFinger(4, 'Index') },
    { key: 'g', keyCode: 'KeyG', bn: 'গ', bnShift: 'ঘ', ...baseFinger(4, 'Index') },
    { key: 'h', keyCode: 'KeyH', bn: 'হ', bnShift: '্', ...baseFinger(7, 'Index') },
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
