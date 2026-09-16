export type KeyboardLayoutKey = 'banglaword' | 'khipro' | 'probhat' | 'bijoy' | 'avro' | 'unijoy';

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
    { key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'য', bnShift: 'য়', ...baseFinger(7, 'Index') },
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
    { key: 'q', keyCode: 'KeyQ', bn: 'ঙ', bnShift: 'ং', ...baseFinger(1, 'Pinky') },
    { key: 'w', keyCode: 'KeyW', bn: 'য', bnShift: 'য়', ...baseFinger(2, 'Ring') },
    { key: 'e', keyCode: 'KeyE', bn: 'ড', bnShift: 'ঢ', ...baseFinger(3, 'Middle') },
    { key: 'r', keyCode: 'KeyR', bn: 'প', bnShift: 'ফ', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'চ', bnShift: 'ছ', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'জ', bnShift: 'ঝ', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'হ', bnShift: 'ঞ', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'গ', bnShift: 'ঘ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'ড়', bnShift: 'ঢ়', ...baseFinger(10, 'Pinky') },
  ],
  home: [
    { key: 'a', keyCode: 'KeyA', bn: 'ৃ', bnShift: 'র্', ...baseFinger(1, 'Pinky') },
    { key: 's', keyCode: 'KeyS', bn: 'ু', bnShift: 'ূ', ...baseFinger(2, 'Ring') },
    { key: 'd', keyCode: 'KeyD', bn: 'ি', bnShift: 'ী', ...baseFinger(3, 'Middle') },
    { key: 'f', keyCode: 'KeyF', bn: 'া', bnShift: 'অ', ...baseFinger(4, 'Index') },
    { key: 'g', keyCode: 'KeyG', bn: '্', bnShift: '।', ...baseFinger(4, 'Index') },
    { key: 'h', keyCode: 'KeyH', bn: 'ব', bnShift: 'ভ', ...baseFinger(7, 'Index') },
    { key: 'j', keyCode: 'KeyJ', bn: 'ক', bnShift: 'খ', ...baseFinger(7, 'Index') },
    { key: 'k', keyCode: 'KeyK', bn: 'ত', bnShift: 'থ', ...baseFinger(8, 'Middle') },
    { key: 'l', keyCode: 'KeyL', bn: 'দ', bnShift: 'ধ', ...baseFinger(9, 'Ring') },
    { key: ';', keyCode: 'Semicolon', bn: ';', bnShift: ':', ...baseFinger(10, 'Pinky') },
    { key: "'", keyCode: 'Quote', bn: "'", bnShift: '"', ...baseFinger(10, 'Pinky') },
  ],
  bottom: [
    { key: 'ShiftLeft', keyCode: 'ShiftLeft', bn: 'Shift', width: 'w-24', align: 'left', special: 'shift', ...baseFinger(5, 'Thumb') },
    { key: 'z', keyCode: 'KeyZ', bn: '্র', bnShift: '্য', ...baseFinger(1, 'Pinky') },
    { key: 'x', keyCode: 'KeyX', bn: 'ও', bnShift: 'ৌ', ...baseFinger(2, 'Ring') },
    { key: 'c', keyCode: 'KeyC', bn: 'ে', bnShift: 'ৈ', ...baseFinger(3, 'Middle') },
    { key: 'v', keyCode: 'KeyV', bn: 'র', bnShift: 'ল', ...baseFinger(4, 'Index') },
    { key: 'b', keyCode: 'KeyB', bn: 'ন', bnShift: 'ণ', ...baseFinger(4, 'Index') },
    { key: 'n', keyCode: 'KeyN', bn: 'স', bnShift: 'ষ', ...baseFinger(7, 'Index') },
    { key: 'm', keyCode: 'KeyM', bn: 'ম', bnShift: 'ঃ', ...baseFinger(7, 'Index') },
    { key: ',', keyCode: 'Comma', bn: ',', bnShift: '<', ...baseFinger(8, 'Middle') },
    { key: '.', keyCode: 'Period', bn: '.', bnShift: '>', ...baseFinger(9, 'Ring') },
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
    { key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'য', bnShift: 'য়', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'ু', bnShift: 'ূ', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'ি', bnShift: 'ী', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'ো', bnShift: 'ৌ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ঢ়', ...baseFinger(10, 'Pinky') },
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

const probhatLayout: KeyboardLayoutConfig = {
  id: 'probhat',
  label: 'প্রভাত (Probhat)',
  top: [
    { key: 'q', keyCode: 'KeyQ', bn: 'ৎ', bnShift: 'ৠ', ...baseFinger(1, 'Pinky') },
    { key: 'w', keyCode: 'KeyW', bn: 'ঢ়', bnShift: 'ঢ়', ...baseFinger(2, 'Ring') },
    { key: 'e', keyCode: 'KeyE', bn: 'ী', bnShift: 'ঈ', ...baseFinger(3, 'Middle') },
    { key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'য়', bnShift: '্য', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'ু', bnShift: 'ঊ', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'ি', bnShift: 'ই', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'ও', bnShift: 'ঔ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ফ', ...baseFinger(10, 'Pinky') },
    { key: '[', keyCode: 'BracketLeft', bn: 'ে', bnShift: 'ঐ', ...baseFinger(10, 'Pinky') },
    { key: ']', keyCode: 'BracketRight', bn: 'ো', bnShift: 'ৌ', ...baseFinger(10, 'Pinky') },
  ],
  home: [
    { key: 'a', keyCode: 'KeyA', bn: 'া', bnShift: 'অ', ...baseFinger(1, 'Pinky') },
    { key: 's', keyCode: 'KeyS', bn: 'স', bnShift: 'শ', ...baseFinger(2, 'Ring') },
    { key: 'd', keyCode: 'KeyD', bn: 'ড', bnShift: 'ঢ', ...baseFinger(3, 'Middle') },
    { key: 'f', keyCode: 'KeyF', bn: 'ত', bnShift: 'থ', ...baseFinger(4, 'Index') },
    { key: 'g', keyCode: 'KeyG', bn: 'গ', bnShift: 'ঘ', ...baseFinger(4, 'Index') },
    { key: 'h', keyCode: 'KeyH', bn: 'হ', bnShift: 'ঃ', ...baseFinger(7, 'Index') },
    { key: 'j', keyCode: 'KeyJ', bn: 'জ', bnShift: 'ঝ', ...baseFinger(7, 'Index') },
    { key: 'k', keyCode: 'KeyK', bn: 'ক', bnShift: 'খ', ...baseFinger(8, 'Middle') },
    { key: 'l', keyCode: 'KeyL', bn: 'ল', bnShift: 'ং', ...baseFinger(9, 'Ring') },
    { key: ';', keyCode: 'Semicolon', bn: ';', bnShift: ':', ...baseFinger(10, 'Pinky') },
    { key: "'", keyCode: 'Quote', bn: "'", bnShift: '"', ...baseFinger(10, 'Pinky') },
  ],
  bottom: [
    { key: 'ShiftLeft', keyCode: 'ShiftLeft', bn: 'Shift', align: 'left', special: 'shift', ...baseFinger(5, 'Thumb') },
    { key: 'z', keyCode: 'KeyZ', bn: 'য', bnShift: 'ঁ', ...baseFinger(1, 'Pinky') },
    { key: 'x', keyCode: 'KeyX', bn: 'ষ', bnShift: '্', ...baseFinger(2, 'Ring') },
    { key: 'c', keyCode: 'KeyC', bn: 'চ', bnShift: 'ছ', ...baseFinger(3, 'Middle') },
    { key: 'v', keyCode: 'KeyV', bn: 'আ', bnShift: 'ঋ', ...baseFinger(4, 'Index') },
    { key: 'b', keyCode: 'KeyB', bn: 'ব', bnShift: 'ভ', ...baseFinger(4, 'Index') },
    { key: 'n', keyCode: 'KeyN', bn: 'ন', bnShift: 'ণ', ...baseFinger(7, 'Index') },
    { key: 'm', keyCode: 'KeyM', bn: 'ম', bnShift: 'ঙ', ...baseFinger(7, 'Index') },
    { key: ',', keyCode: 'Comma', bn: ',', bnShift: '<', ...baseFinger(8, 'Middle') },
    { key: '.', keyCode: 'Period', bn: '।', bnShift: '>', ...baseFinger(9, 'Ring') },
    { key: '/', keyCode: 'Slash', bn: '/', bnShift: '?', ...baseFinger(10, 'Pinky') },
    { key: 'ShiftRight', keyCode: 'ShiftRight', bn: 'Shift', align: 'right', special: 'shift', ...baseFinger(6, 'Thumb') },
  ],
  space: [{ key: ' ', keyCode: 'Space', bn: 'Space', ...baseFinger(5, 'Thumb') }],
};

const unijoyLayout: KeyboardLayoutConfig = {
  id: 'unijoy',
  label: 'ইউনিজয় (Unijoy)',
  top: [
    { key: 'q', keyCode: 'KeyQ', bn: 'ঙ', bnShift: 'ং', ...baseFinger(1, 'Pinky') },
    { key: 'w', keyCode: 'KeyW', bn: 'য', bnShift: 'য়', ...baseFinger(2, 'Ring') },
    { key: 'e', keyCode: 'KeyE', bn: 'ড', bnShift: 'ঢ', ...baseFinger(3, 'Middle') },
    { key: 'r', keyCode: 'KeyR', bn: 'প', bnShift: 'ফ', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'চ', bnShift: 'ছ', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'জ', bnShift: 'ঝ', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'হ', bnShift: 'ঞ', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'গ', bnShift: 'ঘ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'ড়', bnShift: 'ঢ়', ...baseFinger(10, 'Pinky') },
  ],
  home: [
    { key: 'a', keyCode: 'KeyA', bn: 'ৃ', bnShift: 'র্', ...baseFinger(1, 'Pinky') },
    { key: 's', keyCode: 'KeyS', bn: 'ু', bnShift: 'ূ', ...baseFinger(2, 'Ring') },
    { key: 'd', keyCode: 'KeyD', bn: 'ি', bnShift: 'ী', ...baseFinger(3, 'Middle') },
    { key: 'f', keyCode: 'KeyF', bn: 'া', bnShift: 'অ', ...baseFinger(4, 'Index') },
    { key: 'g', keyCode: 'KeyG', bn: '্', bnShift: '।', ...baseFinger(4, 'Index') },
    { key: 'h', keyCode: 'KeyH', bn: 'ব', bnShift: 'ভ', ...baseFinger(7, 'Index') },
    { key: 'j', keyCode: 'KeyJ', bn: 'ক', bnShift: 'খ', ...baseFinger(7, 'Index') },
    { key: 'k', keyCode: 'KeyK', bn: 'ত', bnShift: 'থ', ...baseFinger(8, 'Middle') },
    { key: 'l', keyCode: 'KeyL', bn: 'দ', bnShift: 'ধ', ...baseFinger(9, 'Ring') },
    { key: ';', keyCode: 'Semicolon', bn: 'স', bnShift: 'শ', ...baseFinger(10, 'Pinky') },
  ],
  bottom: [
    { key: 'ShiftLeft', keyCode: 'ShiftLeft', bn: 'Shift', align: 'left', special: 'shift', ...baseFinger(5, 'Thumb') },
    { key: 'z', keyCode: 'KeyZ', bn: '্র', bnShift: '্য', ...baseFinger(1, 'Pinky') },
    { key: 'x', keyCode: 'KeyX', bn: 'ও', bnShift: 'ৌ', ...baseFinger(2, 'Ring') },
    { key: 'c', keyCode: 'KeyC', bn: 'ে', bnShift: 'ৈ', ...baseFinger(3, 'Middle') },
    { key: 'v', keyCode: 'KeyV', bn: 'র', bnShift: 'ল', ...baseFinger(4, 'Index') },
    { key: 'b', keyCode: 'KeyB', bn: 'ন', bnShift: 'ণ', ...baseFinger(4, 'Index') },
    { key: 'n', keyCode: 'KeyN', bn: 'স', bnShift: 'ষ', ...baseFinger(7, 'Index') },
    { key: 'm', keyCode: 'KeyM', bn: 'ম', bnShift: 'ঃ', ...baseFinger(7, 'Index') },
    { key: ',', keyCode: 'Comma', bn: ',', bnShift: '<', ...baseFinger(8, 'Middle') },
    { key: '.', keyCode: 'Period', bn: '.', bnShift: '>', ...baseFinger(9, 'Ring') },
    { key: 'ShiftRight', keyCode: 'ShiftRight', bn: 'Shift', align: 'right', special: 'shift', ...baseFinger(6, 'Thumb') },
  ],
  space: [{ key: ' ', keyCode: 'Space', bn: 'Space', ...baseFinger(5, 'Thumb') }],
};

const khiproLayout: KeyboardLayoutConfig = {
  id: 'khipro',
  label: 'ক্ষিপ্র (Khipro)',
  top: [
    { key: 'q', keyCode: 'KeyQ', bn: 'ঋ', bnShift: 'ৃ', ...baseFinger(1, 'Pinky') },
    { key: 'w', keyCode: 'KeyW', bn: 'ও', bnShift: 'ো', ...baseFinger(2, 'Ring') },
    { key: 'e', keyCode: 'KeyE', bn: 'এ', bnShift: 'ে', ...baseFinger(3, 'Middle') },
    { key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', ...baseFinger(4, 'Index') },
    { key: 't', keyCode: 'KeyT', bn: 'ত', bnShift: 'ট', ...baseFinger(4, 'Index') },
    { key: 'y', keyCode: 'KeyY', bn: 'য়', bnShift: '্য', ...baseFinger(7, 'Index') },
    { key: 'u', keyCode: 'KeyU', bn: 'উ', bnShift: 'ু', ...baseFinger(7, 'Index') },
    { key: 'i', keyCode: 'KeyI', bn: 'ই', bnShift: 'ি', ...baseFinger(8, 'Middle') },
    { key: 'o', keyCode: 'KeyO', bn: 'অ', bnShift: 'ঃ', ...baseFinger(9, 'Ring') },
    { key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ফ', ...baseFinger(10, 'Pinky') },
    { key: '[', keyCode: 'BracketLeft', bn: '[', bnShift: '{', ...baseFinger(10, 'Pinky') },
    { key: ']', keyCode: 'BracketRight', bn: ']', bnShift: '}', ...baseFinger(10, 'Pinky') },
    { key: '\\', keyCode: 'Backslash', bn: '\\', bnShift: '|', ...baseFinger(10, 'Pinky') },
  ],
  home: [
    { key: 'a', keyCode: 'KeyA', bn: 'আ', bnShift: 'া', ...baseFinger(1, 'Pinky') },
    { key: 's', keyCode: 'KeyS', bn: 'স', bnShift: 'শ', ...baseFinger(2, 'Ring') },
    { key: 'd', keyCode: 'KeyD', bn: 'দ', bnShift: 'ড', ...baseFinger(3, 'Middle') },
    { key: 'f', keyCode: 'KeyF', bn: 'Mod', bnShift: 'f', ...baseFinger(4, 'Index') },
    { key: 'g', keyCode: 'KeyG', bn: 'গ', bnShift: 'ঘ', ...baseFinger(4, 'Index') },
    { key: 'h', keyCode: 'KeyH', bn: 'হ', bnShift: 'h', ...baseFinger(7, 'Index') },
    { key: 'j', keyCode: 'KeyJ', bn: 'জ', bnShift: 'ঝ', ...baseFinger(7, 'Index') },
    { key: 'k', keyCode: 'KeyK', bn: 'ক', bnShift: 'খ', ...baseFinger(8, 'Middle') },
    { key: 'l', keyCode: 'KeyL', bn: 'ল', bnShift: 'ল', ...baseFinger(9, 'Ring') },
    { key: ';', keyCode: 'Semicolon', bn: ';', bnShift: ':', ...baseFinger(10, 'Pinky') },
    { key: "'", keyCode: 'Quote', bn: "'", bnShift: '"', ...baseFinger(10, 'Pinky') },
  ],
  bottom: [
    { key: 'ShiftLeft', keyCode: 'ShiftLeft', bn: 'Shift', align: 'left', special: 'shift', ...baseFinger(5, 'Thumb') },
    { key: 'z', keyCode: 'KeyZ', bn: 'য', bnShift: '্য', ...baseFinger(1, 'Pinky') },
    { key: 'x', keyCode: 'KeyX', bn: 'ং', bnShift: 'ং', ...baseFinger(2, 'Ring') },
    { key: 'c', keyCode: 'KeyC', bn: 'চ', bnShift: 'ছ', ...baseFinger(3, 'Middle') },
    { key: 'v', keyCode: 'KeyV', bn: 'ভ', bnShift: 'ভ', ...baseFinger(4, 'Index') },
    { key: 'b', keyCode: 'KeyB', bn: 'ব', bnShift: 'ব', ...baseFinger(4, 'Index') },
    { key: 'n', keyCode: 'KeyN', bn: 'ন', bnShift: 'ণ', ...baseFinger(7, 'Index') },
    { key: 'm', keyCode: 'KeyM', bn: 'ম', bnShift: 'ঞ', ...baseFinger(7, 'Index') },
    { key: ',', keyCode: 'Comma', bn: ',', bnShift: '়', ...baseFinger(8, 'Middle') },
    { key: '.', keyCode: 'Period', bn: '।', bnShift: '॥', ...baseFinger(9, 'Ring') },
    { key: '/', keyCode: 'Slash', bn: '/', bnShift: 'ঁ', ...baseFinger(10, 'Pinky') },
    { key: 'ShiftRight', keyCode: 'ShiftRight', bn: 'Shift', align: 'right', special: 'shift', ...baseFinger(6, 'Thumb') },
  ],
  space: [{ key: ' ', keyCode: 'Space', bn: 'Space', ...baseFinger(5, 'Thumb') }],
};

const layouts: Record<KeyboardLayoutKey, KeyboardLayoutConfig> = {
  banglaword: banglaWordLayout,
  khipro: khiproLayout,
  probhat: probhatLayout,
  bijoy: bijoyLayout,
  avro: avroLayout,
  unijoy: unijoyLayout,
};

export function normalizeKeyboardLayout(value?: string): KeyboardLayoutKey {
  if (!value) return 'banglaword';
  const lower = value.toLowerCase();
  if (lower.includes('banglaword') || lower.includes('lipighor')) return 'banglaword';
  if (lower.includes('khipro') || lower.includes('khi')) return 'khipro';
  if (lower.includes('probhat')) return 'probhat';
  if (lower.includes('unijoy')) return 'unijoy';
  if (lower.includes('bijoy')) return 'bijoy';
  if (lower.includes('avro')) return 'avro';
  return 'banglaword'; // Default fallback is always Lipighor BanglaWord
}

export function getKeyboardLayoutConfig(layout?: string): KeyboardLayoutConfig {
  const normalized = normalizeKeyboardLayout(layout);
  return layouts[normalized] || banglaWordLayout;
}

export interface KeyboardLayoutOption {
  value: KeyboardLayoutKey;
  label: string;
  subtitle: string;
  description: string;
  isDefault?: boolean;
  badge?: string;
}

export const KEYBOARD_LAYOUT_OPTIONS: KeyboardLayoutOption[] = [
  {
    value: 'banglaword',
    label: 'লিপিঘর বাংলাওয়ার্ড (BanglaWord)',
    subtitle: 'লিপিঘর স্ট্যান্ডার্ড ফোনেটিক কি-ম্যাপিং',
    description: 'ডিফল্ট লেআউট — সাধারণ ব্যবহারকারী ও প্র্যাকটিসের জন্য সবচেয়ে জনপ্রিয়, স্বাভাবিক ও দ্রুতগতিসম্পন্ন বিন্যাস।',
    isDefault: true,
    badge: 'ডিফল্ট লেআউট',
  },
  {
    value: 'khipro',
    label: 'ক্ষিপ্র (Khipro)',
    subtitle: 'র‌্যাংক-কোডার ক্ষিপ্র জিরো-শিফট লেআউট',
    description: 'আধুনিক জিরো-শিফট কম্পোজিশনাল লেআউট — এফ (f) ও এইচ (h) মডিফায়ার দিয়ে দ্রুততম ইউনিকোড টাইপিং (Shift ছাড়াই)।',
    isDefault: false,
    badge: 'জিরো-শিফট',
  },
  {
    value: 'probhat',
    label: 'প্রভাত (Probhat)',
    subtitle: 'একুশে প্রভাত ফোনেটিক লেআউট',
    description: 'ধ্বনিভিত্তিক সহজবোধ্য লেআউট যা ইউনিকোড স্ট্যান্ডার্ড অনুযায়ী ডিজাইন করা।',
    isDefault: false,
  },
  {
    value: 'bijoy',
    label: 'বিজয় ক্লাসিক (Bijoy Classic)',
    subtitle: 'আনন্দ কম্পিউটার্স বিজয় লেআউট',
    description: 'মুদ্রণ ও প্রকাশনা শিল্পে বহু বছর ধরে প্রচলিত জাতীয় ও ক্লাসিক কীবোর্ড লেআউট।',
    isDefault: false,
  },
  {
    value: 'avro',
    label: 'অভ্র ফোনেটিক (Avro Phonetic)',
    subtitle: 'ওমিক্রনল্যাব অভ্র ফোনেটিক',
    description: 'ইংরেজি অক্ষর টাইপ করে সরাসরি বাংলা লেখার আধুনিক ও বহুল পরিচিত ফোনেটিক লেআউট।',
    isDefault: false,
  },
  {
    value: 'unijoy',
    label: 'ইউনিজয় (Unijoy)',
    subtitle: 'একুশে ইউনিজয় লেআউট',
    description: 'বিজয় লেআউটের অনুরূপ সহজ মুক্ত ইউনিকোড মানসম্মত বিন্যাস।',
    isDefault: false,
  },
];

export function getKeyboardLayoutOptions(): KeyboardLayoutOption[] {
  return KEYBOARD_LAYOUT_OPTIONS;
}

const LAYOUT_STORAGE_KEY = 'banglatyping_active_layout';

export function getActiveKeyboardLayout(): KeyboardLayoutKey {
  if (typeof window === 'undefined') return 'banglaword';
  try {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return normalizeKeyboardLayout(saved || 'banglaword');
  } catch {
    return 'banglaword';
  }
}

export function setActiveKeyboardLayout(layout: KeyboardLayoutKey): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
    window.dispatchEvent(new CustomEvent('banglatyping_layout_change', { detail: layout }));
  } catch {
    // ignore
  }
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

const KHIPRO_CHAR_KEY_MAP: Record<
  string,
  { keyCode: string; key: string; needsShift: boolean; fingerPosition: number; fingerName: string }
> = {
  // Independent vowels
  'অ': { keyCode: 'KeyO', key: 'o', needsShift: false, fingerPosition: 9, fingerName: 'Ring' },
  'আ': { keyCode: 'KeyA', key: 'a', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },
  'ই': { keyCode: 'KeyI', key: 'i', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  'ঈ': { keyCode: 'KeyI', key: 'i', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  'উ': { keyCode: 'KeyU', key: 'u', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ঊ': { keyCode: 'KeyU', key: 'u', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ঋ': { keyCode: 'KeyQ', key: 'q', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },
  'এ': { keyCode: 'KeyE', key: 'e', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'ঐ': { keyCode: 'KeyW', key: 'w', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'ও': { keyCode: 'KeyW', key: 'w', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'ঔ': { keyCode: 'KeyW', key: 'w', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'অ্যা': { keyCode: 'KeyA', key: 'a', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },

  // Vowel signs (Kars)
  'া': { keyCode: 'KeyA', key: 'a', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },
  'ি': { keyCode: 'KeyI', key: 'i', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  'ী': { keyCode: 'KeyI', key: 'i', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  'ু': { keyCode: 'KeyU', key: 'u', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ূ': { keyCode: 'KeyU', key: 'u', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ৃ': { keyCode: 'KeyQ', key: 'q', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },
  'ে': { keyCode: 'KeyE', key: 'e', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'ৈ': { keyCode: 'KeyW', key: 'w', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'ো': { keyCode: 'KeyW', key: 'w', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'ৌ': { keyCode: 'KeyW', key: 'w', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },

  // Consonants
  'ক': { keyCode: 'KeyK', key: 'k', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  'খ': { keyCode: 'KeyK', key: 'k', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  'গ': { keyCode: 'KeyG', key: 'g', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ঘ': { keyCode: 'KeyG', key: 'g', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ঙ': { keyCode: 'KeyN', key: 'n', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'চ': { keyCode: 'KeyC', key: 'c', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'ছ': { keyCode: 'KeyC', key: 'c', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'জ': { keyCode: 'KeyJ', key: 'j', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ঝ': { keyCode: 'KeyJ', key: 'j', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ঞ': { keyCode: 'KeyM', key: 'm', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ট': { keyCode: 'KeyT', key: 't', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ঠ': { keyCode: 'KeyT', key: 't', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ড': { keyCode: 'KeyD', key: 'd', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'ঢ': { keyCode: 'KeyD', key: 'd', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'ণ': { keyCode: 'KeyN', key: 'n', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ত': { keyCode: 'KeyT', key: 't', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'থ': { keyCode: 'KeyT', key: 't', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'দ': { keyCode: 'KeyD', key: 'd', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'ধ': { keyCode: 'KeyD', key: 'd', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  'ন': { keyCode: 'KeyN', key: 'n', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'প': { keyCode: 'KeyP', key: 'p', needsShift: false, fingerPosition: 10, fingerName: 'Pinky' },
  'ফ': { keyCode: 'KeyP', key: 'p', needsShift: false, fingerPosition: 10, fingerName: 'Pinky' },
  'ব': { keyCode: 'KeyB', key: 'b', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ভ': { keyCode: 'KeyV', key: 'v', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ম': { keyCode: 'KeyM', key: 'm', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'য': { keyCode: 'KeyZ', key: 'z', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },
  'র': { keyCode: 'KeyR', key: 'r', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ল': { keyCode: 'KeyL', key: 'l', needsShift: false, fingerPosition: 9, fingerName: 'Ring' },
  'শ': { keyCode: 'KeyS', key: 's', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'ষ': { keyCode: 'KeyS', key: 's', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'স': { keyCode: 'KeyS', key: 's', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'হ': { keyCode: 'KeyH', key: 'h', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ড়': { keyCode: 'KeyR', key: 'r', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ঢ়': { keyCode: 'KeyR', key: 'r', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'য়': { keyCode: 'KeyY', key: 'y', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  'ৎ': { keyCode: 'KeyT', key: 't', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ক্ষ': { keyCode: 'KeyK', key: 'k', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  'জ্ঞ': { keyCode: 'KeyG', key: 'g', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  'ং': { keyCode: 'KeyX', key: 'x', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  'ঃ': { keyCode: 'KeyO', key: 'o', needsShift: false, fingerPosition: 9, fingerName: 'Ring' },
  'ঁ': { keyCode: 'Slash', key: '/', needsShift: false, fingerPosition: 10, fingerName: 'Pinky' },
  '্': { keyCode: 'KeyQ', key: 'q', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },
  '়': { keyCode: 'Comma', key: ',', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  '।': { keyCode: 'Period', key: '.', needsShift: false, fingerPosition: 9, fingerName: 'Ring' },
  '॥': { keyCode: 'Period', key: '.', needsShift: false, fingerPosition: 9, fingerName: 'Ring' },
  '৳': { keyCode: 'Digit4', key: '4', needsShift: false, fingerPosition: 4, fingerName: 'Index' },

  // Digits
  '০': { keyCode: 'Digit0', key: '0', needsShift: false, fingerPosition: 10, fingerName: 'Pinky' },
  '১': { keyCode: 'Digit1', key: '1', needsShift: false, fingerPosition: 1, fingerName: 'Pinky' },
  '২': { keyCode: 'Digit2', key: '2', needsShift: false, fingerPosition: 2, fingerName: 'Ring' },
  '৩': { keyCode: 'Digit3', key: '3', needsShift: false, fingerPosition: 3, fingerName: 'Middle' },
  '৪': { keyCode: 'Digit4', key: '4', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  '৫': { keyCode: 'Digit5', key: '5', needsShift: false, fingerPosition: 4, fingerName: 'Index' },
  '৬': { keyCode: 'Digit6', key: '6', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  '৭': { keyCode: 'Digit7', key: '7', needsShift: false, fingerPosition: 7, fingerName: 'Index' },
  '৮': { keyCode: 'Digit8', key: '8', needsShift: false, fingerPosition: 8, fingerName: 'Middle' },
  '৯': { keyCode: 'Digit9', key: '9', needsShift: false, fingerPosition: 9, fingerName: 'Ring' },
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

  const normalized = normalizeKeyboardLayout(layoutName);

  // Check Khipro zero-shift mapping
  if (normalized === 'khipro') {
    const khiproMapping = KHIPRO_CHAR_KEY_MAP[char];
    if (khiproMapping) {
      const pos = khiproMapping.fingerPosition;
      return {
        keyCode: khiproMapping.keyCode,
        key: khiproMapping.key,
        char,
        needsShift: false,
        fingerPosition: pos,
        fingerName: khiproMapping.fingerName,
        hand: pos <= 5 ? 'left' : 'right',
        bengaliFingerLabel: FINGER_BENGALI_NAMES[pos] || 'অজানা',
      };
    }
  }

  // Check independent vowel guide mapping for BanglaWord
  if (normalized === 'banglaword') {
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
