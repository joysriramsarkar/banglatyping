import type { Lesson, RowDrillCategory, Drill, SingleDrill } from "./types";
import { 
  bengaliSegmenter, 
  isConjunct, 
  parseConjunct, 
  isBengaliVowelSign, 
  normalizeBengaliString 
} from "./bengali-grapheme";

// Finger position mapping: 1-5 left hand, 6-10 right hand
// Left: 1=Pinky, 2=Ring, 3=Middle, 4=Index, 5=Thumb
// Right: 6=Thumb, 7=Index, 8=Middle, 9=Ring, 10=Pinky
export type KeyMapEntry = {
    key: string;
    keyCode: string;
    bn: string;
    bnShift?: string;
    row: 'top'|'home'|'bottom'|'other';
    hand: 'left'|'right';
    fingerPosition: number;
    fingerName: 'Pinky'|'Ring'|'Middle'|'Index'|'Thumb';
};

export const keyMap: KeyMapEntry[] = [
    // Top Row
    {key: 'q', keyCode: 'KeyQ', bn: 'ক্ষ', bnShift: 'ঁ', row: 'top', hand: 'left', fingerPosition: 1, fingerName: 'Pinky'}, 
    {key: 'w', keyCode: 'KeyW', bn: 'ঙ', bnShift: 'ঃ', row: 'top', hand: 'left', fingerPosition: 2, fingerName: 'Ring'}, 
    {key: 'e', keyCode: 'KeyE', bn: 'ে', bnShift: 'ৈ', row: 'top', hand: 'left', fingerPosition: 3, fingerName: 'Middle'}, 
    {key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', row: 'top', hand: 'left', fingerPosition: 4, fingerName: 'Index'},
    {key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', row: 'top', hand: 'left', fingerPosition: 4, fingerName: 'Index'}, 
    {key: 'y', keyCode: 'KeyY', bn: 'য', bnShift: 'য়', row: 'top', hand: 'right', fingerPosition: 7, fingerName: 'Index'},
    {key: 'u', keyCode: 'KeyU', bn: 'ু', bnShift: 'ূ', row: 'top', hand: 'right', fingerPosition: 7, fingerName: 'Index'}, 
    {key: 'i', keyCode: 'KeyI', bn: 'ি', bnShift: 'ী', row: 'top', hand: 'right', fingerPosition: 8, fingerName: 'Middle'},
    {key: 'o', keyCode: 'KeyO', bn: 'ো', bnShift: 'ৌ', row: 'top', hand: 'right', fingerPosition: 9, fingerName: 'Ring'}, 
    {key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ঢ়', row: 'top', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},
    {key: '[', keyCode: 'BracketLeft', bn: '[', bnShift: '{', row: 'top', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},
    {key: ']', keyCode: 'BracketRight', bn: ']', bnShift: '}', row: 'top', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},
    {key: '\\', keyCode: 'Backslash', bn: 'ৃ', bnShift: 'ঞ', row: 'other', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},

    // Home Row
    {key: 'a', keyCode: 'KeyA', bn: 'া', bnShift: 'অ', row: 'home', hand: 'left', fingerPosition: 1, fingerName: 'Pinky'}, 
    {key: 's', keyCode: 'KeyS', bn: 'স', bnShift: 'শ', row: 'home', hand: 'left', fingerPosition: 2, fingerName: 'Ring'}, 
    {key: 'd', keyCode: 'KeyD', bn: 'ড', bnShift: 'ঢ', row: 'home', hand: 'left', fingerPosition: 3, fingerName: 'Middle'},
    {key: 'f', keyCode: 'KeyF', bn: 'ফ', bnShift: 'ৎ', row: 'home', hand: 'left', fingerPosition: 4, fingerName: 'Index'},
    {key: 'g', keyCode: 'KeyG', bn: 'গ', bnShift: 'ঘ', row: 'home', hand: 'left', fingerPosition: 4, fingerName: 'Index'}, 
    {key: 'h', keyCode: 'KeyH', bn: '্', bnShift: 'হ', row: 'home', hand: 'right', fingerPosition: 7, fingerName: 'Index'},
    {key: 'j', keyCode: 'KeyJ', bn: 'জ', bnShift: 'ঝ', row: 'home', hand: 'right', fingerPosition: 7, fingerName: 'Index'}, 
    {key: 'k', keyCode: 'KeyK', bn: 'ক', bnShift: 'খ', row: 'home', hand: 'right', fingerPosition: 8, fingerName: 'Middle'}, 
    {key: 'l', keyCode: 'KeyL', bn: 'ল', bnShift: 'ষ', row: 'home', hand: 'right', fingerPosition: 9, fingerName: 'Ring'},
    {key: ';', keyCode: 'Semicolon', bn: ';', bnShift: ':', row: 'home', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},
    {key: "'", keyCode: 'Quote', bn: "'", bnShift: '"', row: 'home', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},

    // Bottom Row
    {key: 'z', keyCode: 'KeyZ', bn: '্য', bnShift: 'ং', row: 'bottom', hand: 'left', fingerPosition: 1, fingerName: 'Pinky'},
    {key: 'x', keyCode: 'KeyX', bn: 'ত', bnShift: 'থ', row: 'bottom', hand: 'left', fingerPosition: 2, fingerName: 'Ring'},
    {key: 'c', keyCode: 'KeyC', bn: 'চ', bnShift: 'ছ', row: 'bottom', hand: 'left', fingerPosition: 3, fingerName: 'Middle'}, 
    {key: 'v', keyCode: 'KeyV', bn: 'দ', bnShift: 'ধ', row: 'bottom', hand: 'left', fingerPosition: 4, fingerName: 'Index'}, 
    {key: 'b', keyCode: 'KeyB', bn: 'ব', bnShift: 'ভ', row: 'bottom', hand: 'left', fingerPosition: 4, fingerName: 'Index'},
    {key: 'n', keyCode: 'KeyN', bn: 'ন', bnShift: 'ণ', row: 'bottom', hand: 'right', fingerPosition: 7, fingerName: 'Index'}, 
    {key: 'm', keyCode: 'KeyM', bn: 'ম', row: 'bottom', hand: 'right', fingerPosition: 7, fingerName: 'Index'}, 
    {key: ',', keyCode: 'Comma', bn: ',', bnShift: '<', row: 'bottom', hand: 'right', fingerPosition: 8, fingerName: 'Middle'},
    {key: '.', keyCode: 'Period', bn: '।', bnShift: '>', row: 'bottom', hand: 'right', fingerPosition: 9, fingerName: 'Ring'},
    {key: '/', keyCode: 'Slash', bn: '/', bnShift: '?', row: 'bottom', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},
    {key: '-', keyCode: 'Minus', bn: '়', row: 'other', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},

    // Numerals Row
    {key: '0', keyCode: 'Digit0', bn: '০', row: 'other', hand: 'right', fingerPosition: 10, fingerName: 'Pinky'},
    {key: '1', keyCode: 'Digit1', bn: '১', row: 'other', hand: 'left', fingerPosition: 1, fingerName: 'Pinky'},
    {key: '2', keyCode: 'Digit2', bn: '২', row: 'other', hand: 'left', fingerPosition: 2, fingerName: 'Ring'},
    {key: '3', keyCode: 'Digit3', bn: '৩', row: 'other', hand: 'left', fingerPosition: 3, fingerName: 'Middle'},
    {key: '4', keyCode: 'Digit4', bn: '৪', row: 'other', hand: 'left', fingerPosition: 4, fingerName: 'Index'},
    {key: '5', keyCode: 'Digit5', bn: '৫', row: 'other', hand: 'left', fingerPosition: 4, fingerName: 'Index'},
    {key: '6', keyCode: 'Digit6', bn: '৬', row: 'other', hand: 'right', fingerPosition: 7, fingerName: 'Index'},
    {key: '7', keyCode: 'Digit7', bn: '৭', row: 'other', hand: 'right', fingerPosition: 7, fingerName: 'Index'},
    {key: '8', keyCode: 'Digit8', bn: '৮', row: 'other', hand: 'right', fingerPosition: 8, fingerName: 'Middle'},
    {key: '9', keyCode: 'Digit9', bn: '৯', row: 'other', hand: 'right', fingerPosition: 9, fingerName: 'Ring'},
];

export const findKey = (bengaliChar: string) => {
  const normalized = normalizeBengaliString(bengaliChar);
  return keyMap.find(k => 
    normalizeBengaliString(k.bn) === normalized || 
    (k.bnShift && normalizeBengaliString(k.bnShift) === normalized)
  );
};

const hasantKey = findKey('্');
if (!hasantKey) {
  throw new Error("Hasant key mapping not found!");
}

const vowelMap: Record<string, { kar: string, vowel: string }> = {
    'a': { kar: 'া', vowel: 'আ' },
    'i': { kar: 'ি', vowel: 'ই' },
    'I': { kar: 'ী', vowel: 'ঈ' },
    'u': { kar: 'ু', vowel: 'উ' },
    'U': { kar: 'ূ', vowel: 'ঊ' },
    'e': { kar: 'ে', vowel: 'এ' },
    'E': { kar: 'ৈ', vowel: 'ঐ' },
    'o': { kar: 'ো', vowel: 'ও' },
    'O': { kar: 'ৌ', vowel: 'ঔ' },
    '\\': { kar: 'ৃ', vowel: 'ঋ' },
};

export const getStepsForChar = (char: string): SingleDrill[] => {
    const steps: SingleDrill[] = [];
    const normalizedChar = normalizeBengaliString(char);

    // Special case for 'ক্ষ'
    if (normalizedChar === 'ক্ষ') {
        const directMapping = findKey(normalizedChar);
        if (directMapping) {
             steps.push({
                key: directMapping.key,
                keyCode: directMapping.keyCode,
                fingerPosition: directMapping.fingerPosition,
                fingerName: directMapping.fingerName,
                shift: directMapping.bnShift === normalizedChar,
                display: normalizedChar
            });
            return steps;
        }
    }

    // Case 1: Standalone vowel
    const vowelEntry = Object.values(vowelMap).find(v => v.vowel === normalizedChar);
    if (vowelEntry) {
        const signKey = findKey(vowelEntry.kar);
        if (signKey && hasantKey) {
            steps.push({ key: hasantKey.key, keyCode: hasantKey.keyCode, fingerPosition: hasantKey.fingerPosition, fingerName: hasantKey.fingerName, shift: hasantKey.bnShift === '্', display: '্' });
            steps.push({ key: signKey.key, keyCode: signKey.keyCode, fingerPosition: signKey.fingerPosition, fingerName: signKey.fingerName, shift: signKey.bnShift === vowelEntry.kar, display: vowelEntry.kar });
            return steps;
        }
    }
    
    // Case 2: Direct key mapping
    const directMapping = findKey(normalizedChar);
    if (directMapping) {
        steps.push({
            key: directMapping.key,
            keyCode: directMapping.keyCode,
            fingerPosition: directMapping.fingerPosition,
            fingerName: directMapping.fingerName,
            shift: directMapping.bnShift === normalizedChar,
            display: normalizedChar
        });
        return steps;
    }
    
    // Case 3: Conjunct (যুক্তাক্ষর)
    if (isConjunct(normalizedChar)) {
        const { consonants, halants, trailingKar } = parseConjunct(normalizedChar);
        
        if (consonants.length >= 2) {
            const firstKey = findKey(consonants[0]);
            if (!firstKey) return [];
            
            steps.push({ 
                key: firstKey.key,
                keyCode: firstKey.keyCode,
                fingerPosition: firstKey.fingerPosition,
                fingerName: firstKey.fingerName,
                shift: !!firstKey.bnShift && firstKey.bnShift === consonants[0], 
                display: consonants[0] 
            });

            for (let i = 1; i < consonants.length; i++) {
                const halantCountBefore = halants[i - 1] || 1;
                for (let j = 0; j < halantCountBefore; j++) {
                    steps.push({ key: hasantKey.key, keyCode: hasantKey.keyCode, fingerPosition: hasantKey.fingerPosition, fingerName: hasantKey.fingerName, shift: false, display: '্' });
                }

                const consonantKey = findKey(consonants[i]);
                if (!consonantKey) return [];
                steps.push({ 
                    key: consonantKey.key,
                    keyCode: consonantKey.keyCode,
                    fingerPosition: consonantKey.fingerPosition,
                    fingerName: consonantKey.fingerName,
                    shift: !!consonantKey.bnShift && consonantKey.bnShift === consonants[i], 
                    display: consonants[i] 
                });
            }

            if (trailingKar) {
                const karKey = findKey(trailingKar);
                if (karKey) {
                    steps.push({ 
                        key: karKey.key,
                        keyCode: karKey.keyCode,
                        fingerPosition: karKey.fingerPosition,
                        fingerName: karKey.fingerName,
                        shift: karKey.bnShift === trailingKar, 
                        display: trailingKar 
                    });
                }
            }

            if (steps.length > 0) return steps;
        }
    }

    // Case 4: Base + vowel sign
    const codePoints = Array.from(normalizedChar);
    if (codePoints.length > 1) {
        const lastChar = codePoints[codePoints.length - 1];
        const isKar = isBengaliVowelSign(lastChar);
        
        if (isKar) {
            const baseChar = codePoints.slice(0, -1).join('');
            const baseSteps = getStepsForChar(baseChar);
            const karKey = findKey(lastChar);
            
            if (baseSteps.length > 0 && karKey) {
                steps.push(...baseSteps);
                steps.push({ 
                    key: karKey.key,
                    keyCode: karKey.keyCode,
                    fingerPosition: karKey.fingerPosition,
                    fingerName: karKey.fingerName,
                    shift: !!karKey.bnShift && karKey.bnShift === lastChar, 
                    display: lastChar 
                });
                return steps;
            }
        }
    }

    return [];
};

export const getStepsForWord = (word: string): SingleDrill[] => {
    const graphemes = bengaliSegmenter.segmentString(word);
    return graphemes.flatMap(char => getStepsForChar(char));
};

/**
 * Deterministic Drill Generator: converts curated sequence of items to drills with spaces
 */
export const createDeterministicDrills = (items: string[]): Drill[] => {
    const drills: Drill[] = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const steps = getStepsForWord(item);
        if (steps.length > 0) {
            drills.push({ prompt: item, steps });
        }
        // Add a space between items (except after the last item)
        if (i < items.length - 1) {
            drills.push({
                prompt: ' ',
                steps: [{ key: ' ', keyCode: 'Space', shift: false, display: ' ', fingerPosition: 0, fingerName: 'Pinky' }]
            });
        }
    }
    return drills;
};

/**
 * Backward-compatible Random Drill Generator
 */
export const generateDrills = (chars: string[], count: number): Drill[] => {
    const drills: Drill[] = [];
    let spaceCounter = 0;
    
    for (let i = 0; i < count; i++) {
        if (spaceCounter === 4) {
            drills.push({
                prompt: ' ',
                steps: [{ key: ' ', keyCode: 'Space', shift: false, display: ' ', fingerPosition: 0, fingerName: 'Pinky' }]
            });
            spaceCounter = 0;
            i--; 
            continue;
        }

        const char = chars[Math.floor(Math.random() * chars.length)];
        const steps = getStepsForChar(char);

        if (steps.length > 0) {
             drills.push({
                prompt: char,
                steps: steps
            });
            spaceCounter++;
        }
    }
    if (drills.length > 0 && drills[drills.length - 1].prompt === ' ') {
        drills.pop();
    }
    return drills;
};

export const generateWordDrills = (words: string[]): Drill[] => {
    const drills: Drill[] = [];
    const wordPool = [...words];

    for (let i = 0; i < 200; i++) {
        const wordIndex = Math.floor(Math.random() * wordPool.length);
        const word = wordPool[wordIndex];
        const steps = getStepsForWord(word);
        if (steps.length > 0) {
             drills.push({
                prompt: word,
                steps: steps
            });
        }
    }
    return drills;
};

const consonants: {bn: string, en: string}[] = [
    { bn: 'ক', en: 'ka' }, { bn: 'খ', en: 'kha' }, { bn: 'গ', en: 'ga' }, { bn: 'ঘ', en: 'gha' }, { bn: 'ঙ', en: 'nga' }, 
    { bn: 'চ', en: 'ca' }, { bn: 'ছ', en: 'cha' }, { bn: 'জ', en: 'ja' }, { bn: 'ঝ', en: 'jha' }, { bn: 'ঞ', en: 'nja' }, 
    { bn: 'ট', en: 'tta' }, { bn: 'ঠ', en: 'ttha' }, { bn: 'ড', en: 'dda' }, { bn: 'ঢ', en: 'ddha' }, { bn: 'ণ', en: 'nna' }, 
    { bn: 'ত', en: 'ta' }, { bn: 'থ', en: 'tha' }, { bn: 'দ', en: 'da' }, { bn: 'ধ', en: 'dha' }, { bn: 'ন', en: 'na' }, 
    { bn: 'প', en: 'pa' }, { bn: 'ফ', en: 'pha' }, { bn: 'ব', en: 'ba' }, { bn: 'ভ', en: 'bha' }, { bn: 'ম', en: 'ma' }, 
    { bn: 'য', en: 'ya' }, { bn: 'র', en: 'ra' }, { bn: 'ল', en: 'la' }, { bn: 'শ', en: 'sha' }, { bn: 'ষ', en: 'ssa' }, 
    { bn: 'স', en: 'sa' }, { bn: 'হ', en: 'ha' }, { bn: 'ড়', en: 'rra' }, { bn: 'ঢ়', en: 'rrha' }, { bn: 'য়', en: 'yya' }
];

const vowelSignsForCompounds: { sign: string; name: string }[] = [
    { sign: 'া', name: 'a-kar' },
    { sign: 'ি', name: 'i-kar' },
    { sign: 'ী', name: 'ee-kar' },
    { sign: 'ু', name: 'u-kar' },
    { sign: 'ূ', name: 'oo-kar' },
    { sign: 'ৃ', name: 'ri-kar' },
    { sign: 'ে', name: 'e-kar' },
    { sign: 'ৈ', name: 'oi-kar' },
    { sign: 'ো', name: 'o-kar' },
    { sign: 'ৌ', name: 'ou-kar' },
    { sign: '্য', name: 'ja-fola'}
];

const getStepsForCompound = (consonant: {bn: string, en: string}, sign: { sign: string; name: string }): Drill | null => {
    const steps: SingleDrill[] = [];
    const conKey = findKey(consonant.bn);
    if (!conKey) return null;
    steps.push({ key: conKey.key, keyCode: conKey.keyCode, fingerPosition: conKey.fingerPosition, fingerName: conKey.fingerName, shift: !!conKey.bnShift && conKey.bnShift === consonant.bn, display: consonant.bn });
    
    if (sign.sign === '্য') {
         const jaFolaKey = findKey('্য');
         if (jaFolaKey) {
             steps.push({ key: jaFolaKey.key, keyCode: jaFolaKey.keyCode, fingerPosition: jaFolaKey.fingerPosition, fingerName: jaFolaKey.fingerName, shift: !!jaFolaKey.bnShift && jaFolaKey.bnShift === '্য', display: '্য'});
         } else {
             return null;
         }
    } else {
        const signKey = findKey(sign.sign);
        if (signKey) {
            steps.push({ key: signKey.key, keyCode: signKey.keyCode, fingerPosition: signKey.fingerPosition, fingerName: signKey.fingerName, shift: !!signKey.bnShift && signKey.bnShift === sign.sign, display: sign.sign });
        } else {
             return null;
        }
    }
    
    let prompt = consonant.bn + sign.sign;
    prompt = prompt.normalize('NFC');
    return { prompt, steps };
};

const generateKarDrillsForConsonant = (consonant: {bn: string, en: string}): Drill[] => {
    const drills: Drill[] = [];
    let spaceCounter = 0;
    const combinations = vowelSignsForCompounds.flatMap(sign => Array(8).fill(sign));
    combinations.sort(() => Math.random() - 0.5);

    for (const sign of combinations) {
        if (spaceCounter === 4) {
            drills.push({
                prompt: ' ',
                steps: [{ key: ' ', keyCode: 'Space', shift: false, display: ' ', fingerPosition: 0, fingerName: 'Pinky' }]
            });
            spaceCounter = 0;
            continue;
        }

        const drill = getStepsForCompound(consonant, sign);
        if (drill) {
            drills.push(drill);
            spaceCounter++;
        }
    }
    return drills;
};

// Word bank data
export const homeRowWords = "জল ফল গল ডল জাল গাল ফাল সাল জগ গজ সাজ ডগা গজা জলা ফালা গালা ডালা সাজা সফল ফসল গজল ফস লগা অজ অঘ অলস অশ খল খস খাসা ঘষা ঘাস ঢল ঝল শখ সৎ হজ হল সহ ঢাল গলা ঝাল শসা শাখা শাল শালা হলফ হাসা হাল জগৎ জঙ্গল জলসা সহসা অলস জজ শাস হাহা খসখস খলখল ঝলসা অঢল".split(" ");
export const topRowWords = "ক্ষর রঙ রট রক্ষ টের ঠের এঁর ওঁর রঙে এঁটে ঠরঠর পর পট পিঠ পুড় পুর পীর টুপ টিপ টুঁটি টোপর টোপ ঠুঁটো ঠোঁট রূপ রূঢ় রীতি ঢের ক্ষয় ক্ষীর ক্ষুর যূপ যেই উর ঊরু পিউ টুট টুটি টোটো টইটই টুঁ রিপু পুঁটি পৈঠা পৈতে ইঁট এয়ো রুই রুটি পুঁই পিঁড়ি পরে পড়ে টর ঠর ঊর উঠ রোঁ টীট পুঁ ঠুঁই".split(" ");
export const bottomRowWords = "তথ্য তব বদ মন বন ভব ধন নদ দম নব মদ বধ ছন্দ বন্ধ মধ্য ভবন দম্ভ দ্বন্দ্ব চন্দন মন্থন তন নত মত মম নভ পণ বচন দমন মদন নন্দন বন্ধন বন্দন দন্ত ধন্য নব্য".split(" ");
export const gameWords = ["বই", "কলম", "বল", "জল", "ফল", "ঘর", "বন", "পথ", "মত", "নদ", "জন", "সব", "কম", "গম", "আম", "জাম", "গান", "ধান", "মালা", "চাকা", "পাতা", "লতা", "কাকা", "মামা", "নানা", "দাদা", "দিদি", "ফুল", "পাখি", "মাছ"];

export const homeRowChars = ['া', 'স', 'ড', 'ফ', 'গ', '্', 'জ', 'ক', 'ল', 'অ', 'শ', 'ঢ', 'ৎ', 'ঘ', 'হ', 'ঝ', 'খ', 'ষ'];
export const topRowChars = ['\u0999', '\u09b0', '\u099f', '\u09c7', '\u0995\u09cd\u09b7', '\u09af', '\u09c1', '\u09bf', '\u09cb', '\u09aa', '\u09a1', '\u09ac', '\u09c3', '\u0981', '\u0983', '\u09c8', '\u09a1\u09bc', '\u09a0', '\u09af\u09bc', '\u09c2', '\u09c0', '\u09cc', '\u09a2\u09bc', '\u09a2', '\u099e'];
export const bottomRowChars = ['্য', 'ত', 'চ', 'দ', 'ব', 'ন', 'ম', 'ং', 'থ', 'ছ', 'ধ', 'ভ', 'ণ'];

export const lessons: Lesson[] = [
  // ── HOME ROW (৭টি কিউরেটেড পাঠ) ──────────────────────────────────
  {
    id: "home-row-chars",
    title: "HR-01: প্রথম হাতের অক্ষর (া স ড ফ)",
    level: "Beginner",
    row: "home-row",
    drills: createDeterministicDrills(['া', 'স', 'ড', 'ফ', 'া', 'স', 'া', 'ফ', 'স', 'ড', 'স', 'ফ', 'ফা', 'সা', 'ডা'])
  },
  {
    id: "home-row-right",
    title: "HR-02: ডান পাশের হোম কী (গ ্ জ ক ল)",
    level: "Beginner",
    row: "home-row",
    drills: createDeterministicDrills(['গ', '্', 'জ', 'ক', 'ল', 'গ', 'জ', 'ক', 'ল', 'গজ', 'কল', 'গল', 'জগ', 'লগ'])
  },
  {
    id: "home-row-mix",
    title: "HR-03: হোম রো মিক্স (সুষম ফ্রিকোয়েন্সি)",
    level: "Beginner",
    row: "home-row",
    drills: createDeterministicDrills(['স', 'স', 'স', 'গ', 'গ', 'ফ', 'ফ', 'ড', 'ড', 'জ', 'ক', 'ক', 'ল', 'ল', 'সগ', 'ফড', 'জক', 'লসা'])
  },
  {
    id: "home-row-combos",
    title: "HR-04: দুই অক্ষরের কম্বিনেশন (সা, দা, গা, কা, লা)",
    level: "Beginner",
    row: "home-row",
    drills: createDeterministicDrills(['সা', 'গা', 'কা', 'লা', 'ফা', 'ডা', 'জা', 'সা', 'গা', 'কা', 'কালা', 'গালা', 'সালা'])
  },
  {
    id: "home-row-syllables",
    title: "HR-05: তিন অক্ষরের সিলেবল (সাদা, গাদা, জালা, দাদা)",
    level: "Beginner",
    row: "home-row",
    drills: createDeterministicDrills(['সাদা', 'গাদা', 'জালা', 'দাদা', 'ফালা', 'কালা', 'গালা', 'ডালা', 'শালা', 'হাল'])
  },
  {
    id: "home-row-word-drill",
    title: "HR-06: বাস্তব হোম রো শব্দ (টিয়ার ১, ২, ৩)",
    level: "Beginner",
    row: "home-row",
    text: homeRowWords.join(' '),
    isWordDrill: true,
  },
  {
    id: "home-row-mastery",
    title: "HR-07: হোম রো চূড়ান্ত মাস্টারি পরীক্ষা",
    level: "Beginner",
    row: "home-row",
    drills: createDeterministicDrills(['জল', 'ফল', 'সাদা', 'গালা', 'সফল', 'ফসল', 'জাল', 'গাল', 'জালা', 'শালা', 'জঙ্গল', 'জলসা', 'কালা', 'ডালা', 'গজল', 'সহসা'])
  },

  // ── TOP ROW (৭টি কিউরেটেড পাঠ) ───────────────────────────────────
  {
    id: "top-row-chars",
    title: "TR-01: বাম হাতের টপ কী (ঙ র ট ে)",
    level: "Beginner",
    row: "top-row",
    drills: createDeterministicDrills(['ঙ', 'র', 'ট', 'ে', 'ঙ', 'র', 'ট', 'ে', 'রে', 'টে', 'রট', 'রঙ', 'টের'])
  },
  {
    id: "top-row-right",
    title: "TR-02: ডান হাতের টপ কী (য ু ি ো প)",
    level: "Beginner",
    row: "top-row",
    drills: createDeterministicDrills(['য', 'ু', 'ি', 'ো', 'প', 'পু', 'পি', 'পো', 'যো', 'পর', 'পট', 'পিঠ', 'পুর'])
  },
  {
    id: "top-row-special",
    title: "TR-03: বিরল ও বিশেষ টপ কী (ঁ ঃ ৈ ূ ী ৌ ৃ)",
    level: "Beginner",
    row: "top-row",
    drills: createDeterministicDrills(['ঁ', 'ঃ', 'ৈ', 'ূ', 'ী', 'ৌ', 'ৃ', 'ড়', 'ঢ়', 'য়', 'ঞ', 'রঙ', 'পৈতে', 'ক্ষীর', 'পূজা', 'চাঁদ', 'দুঃখ'])
  },
  {
    id: "top-row-mix",
    title: "TR-04: হোম + টপ মিশ্রিত কম্বো (সা, রি, গো, টি, রে)",
    level: "Beginner",
    row: "top-row",
    drills: createDeterministicDrills(['সা', 'রি', 'গো', 'টি', 'রে', 'পো', 'কা', 'রু', 'গে', 'পা', 'সারি', 'গোরু', 'টিরে', 'পোকা', 'গাছ', 'পাখি', 'রুটি'])
  },
  {
    id: "top-row-word-drill",
    title: "TR-05: টপ রো শব্দভাণ্ডার (রুটি, পিঠ, পুঁই, ক্ষীর)",
    level: "Beginner",
    row: "top-row",
    text: topRowWords.join(' '),
    isWordDrill: true,
  },
  {
    id: "top-row-sentences",
    title: "TR-06: হোম + টপ বাক্য অনুশীলন",
    level: "Beginner",
    row: "top-row",
    text: "পাখি ফল খায়। গাছে পাখি গান গায়। জলে মাছ খেলা করে। সাদা রুটি খাই।",
  },
  {
    id: "top-row-mastery",
    title: "TR-07: টপ রো চূড়ান্ত মাস্টারি পরীক্ষা",
    level: "Beginner",
    row: "top-row",
    drills: createDeterministicDrills(['রুটি', 'ক্ষীর', 'পুঁই', 'পৈতে', 'টোপর', 'পিঠ', 'রূপ', 'রীতি', 'পাখি', 'গাছ'])
  },

  // ── BOTTOM ROW (৭টি কিউরেটেড পাঠ) ────────────────────────────────
  {
    id: "bottom-row-chars",
    title: "BR-01: ত চ দ (বাম হাতের বটম কী)",
    level: "Beginner",
    row: "bottom-row",
    drills: createDeterministicDrills(['ত', 'চ', 'দ', 'ত', 'চ', 'দ', 'তদ', 'চত', 'দচ', 'তচদ', 'চাঁদ', 'দান', 'তাল', 'চক'])
  },
  {
    id: "bottom-row-mid",
    title: "BR-02: ব ন ম (ডান হাতের বটম কী)",
    level: "Beginner",
    row: "bottom-row",
    drills: createDeterministicDrills(['ব', 'ন', 'ম', 'বন', 'নব', 'মন', 'মব', 'নম', 'বম', 'বই', 'নদী', 'মাটি', 'মানব'])
  },
  {
    id: "bottom-row-shift",
    title: "BR-03: থ ছ ধ ভ ণ (বটম Shift সমন্বয়)",
    level: "Beginner",
    row: "bottom-row",
    drills: createDeterministicDrills(['থ', 'ছ', 'ধ', 'ভ', 'ণ', 'তথ্য', 'ছাতা', 'ধনী', 'ভালো', 'বাণী', 'ছন্দ', 'ধন', 'ভাত', 'গুণ'])
  },
  {
    id: "bottom-row-all-mix",
    title: "BR-04: Home + Top + Bottom সর্ব-রো মিক্স",
    level: "Beginner",
    row: "bottom-row",
    drills: createDeterministicDrills(['সাদা', 'বাংলা', 'মানুষ', 'জীবন', 'সময়', 'দেশ', 'স্বাধীনতা', 'প্রকৃতি'])
  },
  {
    id: "bottom-row-word-drill",
    title: "BR-05: বটম-হেভি শব্দভাণ্ডার (তথ্য, বন্ধ, চন্দন, ধন্য)",
    level: "Beginner",
    row: "bottom-row",
    text: bottomRowWords.join(' '),
    isWordDrill: true,
  },
  {
    id: "bottom-row-paragraph",
    title: "BR-06: সর্ব-রো সমন্বিত অনুচ্ছেদ",
    level: "Beginner",
    row: "bottom-row",
    text: "আমার সোনার বাংলা আমি তোমায় ভালোবাসি। মানুষের জীবন সাধনা ও অধ্যবসায়ের মাধ্যমে সুন্দর হয়ে ওঠে।",
  },
  {
    id: "bottom-row-mastery",
    title: "BR-07: বটম রো চূড়ান্ত মাস্টারি পরীক্ষা",
    level: "Beginner",
    row: "bottom-row",
    drills: createDeterministicDrills(['তথ্য', 'বন্ধন', 'চন্দন', 'বাংলা', 'মানুষ', 'জীবন', 'ধন্য', 'স্বাধীনতা'])
  },

  // ── ROW MIXING (৫টি পাঠ) ─────────────────────────────────────────
  {
    id: "mixed-row-1",
    title: "রো মিক্সিং ১: হোম রো বিশুদ্ধ গতি (Home Only)",
    level: "Beginner",
    row: "mixed-row",
    drills: createDeterministicDrills(['জল', 'ফল', 'সাদা', 'গালা', 'সফল', 'ফসল', 'জালা', 'শালা', 'হাল', 'ডালা'])
  },
  {
    id: "mixed-row-2",
    title: "রো মিক্সিং ২: হোম + টপ ট্রানজিশন",
    level: "Beginner",
    row: "mixed-row",
    drills: createDeterministicDrills(['পাখি', 'রুটি', 'গাছ', 'পিঠ', 'ক্ষীর', 'পোকা', 'সারি', 'গোরু'])
  },
  {
    id: "mixed-row-3",
    title: "রো মিক্সিং ৩: হোম + বটম ট্রানজিশন",
    level: "Beginner",
    row: "mixed-row",
    drills: createDeterministicDrills(['সাদা', 'বন', 'জল', 'মন', 'ফল', 'নদ', 'দান', 'তাল'])
  },
  {
    id: "mixed-row-4",
    title: "রো মিক্সিং ৪: টপ + বটম জাম্পিং",
    level: "Beginner",
    row: "mixed-row",
    drills: createDeterministicDrills(['নদী', 'পাখি', 'পানি', 'রুটি', 'ভাত', 'মাটি', 'পাহাড়', 'মেঘ'])
  },
  {
    id: "mixed-row-5",
    title: "রো মিক্সিং ৫: সর্ব-রো ফ্লুয়েন্সি (All Rows)",
    level: "Beginner",
    row: "mixed-row",
    drills: createDeterministicDrills(['বাংলাদেশ', 'মানুষ', 'জীবন', 'স্বাধীনতা', 'প্রকৃতি', 'পরিবার', 'সংস্কৃতি', 'শিক্ষা'])
  },

  // ── HASANTA & PHOLA MODULES ──────────────────────────────────────
  {
    id: "hasanta-drill-1",
    title: "HAS-01: একক হসন্ত ট্রানজিশন (ক্, ত্, ন্, স্)",
    level: "Intermediate",
    row: "hasanta-row",
    drills: createDeterministicDrills(['ক্', 'ত্', 'ন্', 'স্', 'ব্', 'দ্', 'প্', 'ম্', 'র্'])
  },
  {
    id: "hasanta-drill-2",
    title: "HAS-02: দ্বিত্ব ও সন্ধি (ক্ক, ক্ত, ন্ত, ন্দ)",
    level: "Intermediate",
    row: "hasanta-row",
    drills: createDeterministicDrills(['পাক্কা', 'রক্ত', 'শান্ত', 'আনন্দ', 'মুক্তি', 'সুন্দর', 'অনন্ত', 'বন্ধন'])
  },
  {
    id: "hasanta-drill-3",
    title: "HAS-03: দন্ত্য-স যুক্ত রূপ (স্ট, স্থ, স্ক, স্প)",
    level: "Intermediate",
    row: "hasanta-row",
    drills: createDeterministicDrills(['স্টেশন', 'স্থান', 'স্কুল', 'স্পর্শ', 'স্পষ্ট', 'স্বাস্থ্য', 'অস্থির', 'পুস্তক'])
  },
  {
    id: "hasanta-drill-4",
    title: "HAS-04: মূর্ধন্য-ষ ও তালব্য-শ যুক্ত রূপ (ষ্ট, ষ্ঠ, শ্চ, ঞ্চ)",
    level: "Intermediate",
    row: "hasanta-row",
    drills: createDeterministicDrills(['কষ্ট', 'শ্রেষ্ঠ', 'নিশ্চয়', 'মঞ্চ', 'বৃষ্টি', 'প্রতিষ্ঠা', 'আশ্চর্য', 'অঞ্চল'])
  },
  {
    id: "hasanta-drill-5",
    title: "HAS-05: হসন্ত মাস্টার পরীক্ষা",
    level: "Intermediate",
    row: "hasanta-row",
    drills: createDeterministicDrills(['রক্ত', 'আনন্দ', 'স্কুল', 'স্টেশন', 'শ্রেষ্ঠ', 'কষ্ট', 'নিশ্চয়', 'স্বাস্থ্য', 'বৃষ্টি'])
  },
  {
    id: "phola-drill-ra",
    title: "ফলা ১: র-ফলা পরিবার (ক্র, গ্র, প্র, ব্র, ত্র, দ্র)",
    level: "Intermediate",
    row: "phola-row",
    drills: createDeterministicDrills(['গ্রাম', 'প্রথম', 'ব্রত', 'ছাত্র', 'দ্রুত', 'শ্রম', 'ভ্রমণ', 'ক্রিকেট', 'প্রকৃতি'])
  },
  {
    id: "phola-drill-ja",
    title: "ফলা ২: য-ফলা পরিবার (ক্য, ব্য, গ্য, দ্য, ন্য)",
    level: "Intermediate",
    row: "phola-row",
    drills: createDeterministicDrills(['বাক্য', 'ব্যয়', 'ব্যবসা', 'ধন্য', 'পদ্য', 'গদ্য', 'মূল্য', 'সত্য', 'বিদ্যা'])
  },
  {
    id: "phola-drill-la",
    title: "ফলা ৩: ল-ফলা পরিবার (ক্ল, গ্ল, প্ল, ব্ল)",
    level: "Intermediate",
    row: "phola-row",
    drills: createDeterministicDrills(['ক্লাস', 'গ্লানি', 'বিপ্লব', 'অম্লান', 'শুক্ল', 'প্লাবন'])
  },
  {
    id: "phola-drill-ref",
    title: "ফলা ৪: রেফ পরিবার (র্ক, র্গ, র্ত, র্দ, র্ম, র্ষ)",
    level: "Intermediate",
    row: "phola-row",
    drills: createDeterministicDrills(['কর্ম', 'ধর্ম', 'গর্ব', 'সূর্য', 'তর্ক', 'বর্ষা', 'স্বর্গ', 'পর্দা'])
  },
  {
    id: "phola-drill-bama",
    title: "ফলা ৫: ব-ফলা ও ম-ফলা পরিবার (দ্ব, শ্ব, স্ব, পদ্ম, গ্রীষ্ম)",
    level: "Intermediate",
    row: "phola-row",
    drills: createDeterministicDrills(['দ্বিধা', 'বিশ্ব', 'স্বাধীনতা', 'স্বদেশ', 'পদ্ম', 'গ্রীষ্ম', 'বিস্ময়', 'আত্মা'])
  },

  // ── CONJUNCTS & SPECIAL ──────────────────────────────────────────
  {
    id: "conjunct-tier-1-2",
    title: "যুক্তাক্ষর টিয়ার ১ ও ২ (সহজ ও মাঝারি)",
    level: "Intermediate",
    row: "conjunct-row",
    drills: createDeterministicDrills(['রক্ত', 'শান্ত', 'আনন্দ', 'বন্ধু', 'প্রথম', 'ছাত্র', 'দ্রুত', 'গ্রাম'])
  },
  {
    id: "conjunct-tier-3",
    title: "যুক্তাক্ষর টিয়ার ৩ (কঠিন: ক্ষ, জ্ঞ, শ্র, হ্ম, চ্ছ)",
    level: "Intermediate",
    row: "conjunct-row",
    drills: createDeterministicDrills(['শিক্ষা', 'পরীক্ষা', 'জ্ঞান', 'বিজ্ঞান', 'ব্রাহ্মণ', 'ইচ্ছা', 'শ্রেষ্ঠ', 'শ্রদ্ধা'])
  },
  {
    id: "conjunct-tier-4",
    title: "যুক্তাক্ষর টিয়ার ৪ (ত্রি-ব্যঞ্জন: ক্ষ্ম, ষ্ক্র, ন্ত্র, ম্প্র, ষ্ট্র)",
    level: "Intermediate",
    row: "conjunct-row",
    drills: createDeterministicDrills(['সূক্ষ্ম', 'নিষ্ক্রিয়', 'যন্ত্র', 'সম্প্রদায়', 'রাষ্ট্র', 'অস্ট্রেলিয়া', 'উচ্ছ্বাস'])
  },
  {
    id: "special-chars-1",
    title: "বিশেষ চিহ্ন: ঁ, ং, ঃ, ৎ, ়",
    level: "Beginner",
    row: "special-row",
    drills: createDeterministicDrills(['চাঁদ', 'হাঁস', 'রংধনু', 'সিংহ', 'দুঃখ', 'উৎসব', 'হঠাৎ', 'বিদ্যুৎ', 'বাংলা'])
  },
  {
    id: "special-chars-2",
    title: "বিশেষ বর্ণ: ড়, ঢ়, য়, ঞ",
    level: "Beginner",
    row: "special-row",
    drills: createDeterministicDrills(['পাহাড়', 'বাড়ি', 'আষাঢ়', 'গাঢ়', 'সময়', 'ভয়', 'মিঞা', 'দাঁড়কাক', 'ঘড়ি'])
  },

  // ── NUMERALS & PUNCTUATION ───────────────────────────────────────
  {
    id: "numerals-1",
    title: "বাংলা সংখ্যা ০ থেকে ৯",
    level: "Beginner",
    row: "number-row",
    drills: createDeterministicDrills(['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০', '২০', '৫০', '১০০', '১৯৭১', '২০২৬'])
  },
  {
    id: "numerals-2",
    title: "বাস্তব ফরম্যাট (তারিখ, মুদ্রা, শতাংশ)",
    level: "Intermediate",
    row: "number-row",
    text: "২০২৬ সাল, ১৩ নভেম্বর ২০০০, ৳ ৫০০, ৳ ১০০০, ২৫%, ৫০%, ১২:৩০ মিনিট।"
  },
  {
    id: "punctuation-1",
    title: "বিরামচিহ্ন ১: দাঁড়ি, কমা, প্রশ্ন, বিস্ময় (।, ,, ?, !)",
    level: "Intermediate",
    row: "number-row",
    text: "আমার দেশ বাংলাদেশ। তুমি কি যাবে? সাবাশ, আমরা পেরেছি! দাঁড়াও, আমি আসছি।"
  },
  {
    id: "punctuation-2",
    title: "বিরামচিহ্ন ২: কোলন, সেমিকোলন, উদ্ধৃতি (: ; — \" \')",
    level: "Intermediate",
    row: "number-row",
    text: 'শিক্ষক বললেন, "সততা সর্বোৎকৃষ্ট পন্থা।" বিষয়: ছুটির আবেদন। নজরুল (১৮৯৯-১৯৭৬) আমাদের জাতীয় কবি।'
  },

  // ── COMMON WORDS & PHRASES ───────────────────────────────────────
  {
    id: "common-words-50",
    title: "শীর্ষ বহুল ব্যবহৃত বাংলা শব্দ",
    level: "Intermediate",
    row: "words-row",
    text: "আমি আমরা তুমি আপনি সে এটা ওটা করে হয় আছে নিয়ে থেকে জন্য করা হবে ছিল মানুষ দেশ জীবন সময় কাজ দিন রাত ভালো"
  },
  {
    id: "common-phrases-1",
    title: "শব্দগুচ্ছ ও স্পেস ট্রানজিশন",
    level: "Intermediate",
    row: "words-row",
    text: "আমি যাব তুমি কি আসবে কেমন আছো আজ খুব ভালো দিন আমরা সবাই যাব সবাই মিলে কাজ করব"
  },

  // ── GAME & KAR ROWS ──────────────────────────────────────────────
  {
    id: "game-easy",
    title: "গেম - সহজ শব্দ",
    level: "Beginner",
    text: gameWords.join(' '),
    isWordDrill: true,
  },
  ...consonants.map(consonant => ({
    id: `kar-drill-${consonant.en}`,
    title: `${consonant.bn}-এর সাথে কার-চিহ্ন অনুশীলন`,
    level: 'Beginner' as const,
    row: 'kar-row' as const,
    drills: generateKarDrillsForConsonant(consonant),
  })),

  // ── ALPHABET & CLASSIC LESSONS ───────────────────────────────────
  {
    id: "char-practice-1",
    title: "বর্ণমালা অনুশীলন",
    level: "Beginner",
    text: "ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ ড় ঢ় য়",
  },
  {
    id: "char-practice-2",
    title: "ব্যাপক কার-চিহ্ন অনুশীলন (রিভিউ)",
    level: "Beginner",
    text: "কা কি কী কু কূ কৃ কে কৈ কো কৌ ক্য। খা খি খী খু খূ খৃ খে খৈ খো খৌ খ্য। গা গি গী গু গূ গৃ গে গৈ গো গৌ গ্য। ঘা ঘি ঘী ঘু ঘূ ঘৃ ঘে ঘৈ ঘো ঘৌ ঘ্য। চা চি চী চু চূ বৃ চে চৈ চো চৌ চ্য। জা জি জী জু জূ জৃ জে জৈ জো জৌ জ্য। টা টি টী টু টূ টৃ টে টৈ টো টৌ ট্য। দা দি দী দু দূ দৃ দে দৈ দো দৌ দ্য। না নি নী নু নূ নৃ নে নৈ নো নৌ ন্য। পা পি পী পু পূ পৃ পে পৈ পো পৌ প্য। বা বি বী বু বূ বৃ বে বৈ বো বৌ ব্য। মা মি মী মু মূ মৃ মে মৈ মো মৌ ম্য। রা রি রী রু রূ রৃ রে রাই রো রৌ র্য। লা লি লী লু লূ বৃ লে লৈ লো লৌ ল্য। সা সি সী সু সূ সৃ সে সৈ সো সৌ স্য। ক্ষা ক্ষি ক্ষী ক্ষু ক্ষূ ক্ষৃ ক্ষে ক্ষৈ ক্ষো খৌ ক্ষ্য।",
  },
  {
    id: "sahaj-path-1",
    title: "সহজ পাঠ - প্রথম ভাগ",
    level: "Beginner",
    text: "বনে থাকে বাঘ। গাছে থাকে পাখি। জলে থাকে মাছ। ডালে আছে ফল। পাখি ফল খায়। পাখা মেলে ওড়ে। বাঘ আছে আম-বনে। গায়ে চাকা চাকা দাগ। পাখি বনে গান গায়। মাছ জলে খেলা করে। ডালে ডালে কাক ডাকে। খালে বক মাছ ধরে। বনে কত মাছি ওড়ে। ওরা সব মৌ-মাছি। ঐখানে মৌ-চাক। তাতে আছে মধু ভরা।",
  },
  {
    id: "sahaj-path-2",
    title: "সহজ পাঠ - দ্বিতীয় ভাগ",
    level: "Intermediate",
    text: "রাম বনে ফুল পাড়ে। গায়ে তার লাল শাল। হাতে তার সাজি। জবা ফুল তোলে। বেল ফুল তোলে। বেল ফুল সাদা। জবা ফুল লাল। জলে আছে নাল ফুল। ফুল তুলে রাম বাড়ি চলে। তার বাড়ি আজ পূজা। পূজা হবে রাতে। তাই রাম ফুল আনে। তাই তার ঘরে খুব ঘটা। ঢাক বাজে, ঢোল বাজে। ঘরে ঘরে ধূপ ধূনা।",
  },
  {
    id: "sahaj-path-3",
    title: "সহজ পাঠ - তৃতীয় ভাগ",
    level: "Intermediate",
    text: "ঐ সাদা ছাতা। দাদা যায় হাটে। গায়ে লাল জামা। মামা যায় খাতা হাতে। গায়ে শাদা শাল। মামা আনে চাল ডাল। আর কেনে শাক। আর কেনে আটা। দাদা কেনে পাকা আটা, সাত আনা দিয়ে। আর, আখ আর জাম চার আনা। বাবা খাবে। কাকা খাবে। আর খাবে মামা। তার পরে কাজ আছে। বাবা কাজে যাবে।",
  },

  // ── ADVANCED & LITERATURE ────────────────────────────────────────
  {
    id: "sentence-practice-1",
    title: "ছোট বাক্য অনুশীলন",
    level: "Advanced",
    text: "আমার প্রিয় দেশ বাংলাদেশ। এই দেশের প্রকৃতি ও মানুষ আমাকে মুগ্ধ করে। আমরা সবাই মিলে এই দেশকে আরও সুন্দর করে গড়ে তুলব। দেশের উন্নতিতে আমাদের সকলের অবদান রাখা উচিত। সবুজ শ্যামল এই দেশটি আমার প্রাণ।",
  },
  {
    id: "sentence-practice-2",
    title: "যতিচিহ্ন সহ বাক্য",
    level: "Advanced",
    text: "আমার দেশের নাম বাংলাদেশ। দেশটির ইতিহাস কত সমৃদ্ধ! তুমি কি জানো? হায়, কত মানুষ প্রাণ দিয়েছেন! সাবাশ, আমরা পেরেছি। এসো, আমরা সবাই মিলে দেশটাকে ভালোবাসি।",
  },
  {
    id: "paragraph-practice-1",
    title: "অনুচ্ছেদ অনুশীলন - সাধারণ",
    level: "Advanced",
    text: "দ্রুত বাদামী শেয়ালটি অলস কুকুরটিকে লাফিয়ে পার হয়ে গেল। এই বাক্যটি ইংরেজি বর্ণমালার সমস্ত অক্ষর ব্যবহার করে লেখা যায়, তেমনই বাংলাতেও এমন বাক্য তৈরি করা সম্ভব যা প্রায় সমস্ত বর্ণ ব্যবহার করে। টাইপিং অনুশীলন ধৈর্য ও অধ্যবসায়ের বিষয়। নিয়মিত অনুশীলন করলে গতি ও নির্ভুলতা দুটোই বাড়ে।",
  },
  {
    id: "paragraph-practice-2",
    title: "অনুচ্ছেদ - ভাষা আন্দোলন",
    level: "Advanced",
    text: "ভাষা আন্দোলন ছিল পূর্ব পাকিস্তানের (বর্তমান বাংলাদেশ) একটি সাংস্কৃতিক ও রাজনৈতিক আন্দোলন। ১৯৪৭ সালে পাকিস্তান গঠনের পর পশ্চিম পাকিস্তানের রাজনীতিবিদরাই পাকিস্তান সরকারের প্রাধান্য পায়। পাকিস্তান সরকার ঠিক করে উর্দু ভাষাকে সমগ্র পাকিস্তানের রাষ্ট্রভাষা করা হবে, কিন্তু পূর্ব পাকিস্তানের বাংলা ভাষাভাষী জনগণ উর্দুকে রাষ্ট্রভাষা হিসেবে মেনে নিতে রাজি ছিল না। তাই তারা বাংলাকে পাকিস্তানের অন্যতম রাষ্ট্রভাষা করার দাবি জানায়। এই বিজয় আমাদের মুক্তির প্রথম সোপান, যা আমাদের স্বাধীনতার পথে এগিয়ে নিয়েছিল। এই ঐতিহাসিক ঘটনা আমাদের জাতীয় জীবনে অত্যন্ত গুরুত্বপূর্ণ এবং তাৎপর্যপূর্ণ।",
  },
  {
    id: "rabindranath-story-1",
    title: "অনুচ্ছেদ - রবি ঠাকুরের গল্প ১",
    level: "Advanced",
    text: "শ্রাবণ মাসের সকালবেলায় মেঘ কাটিয়া গিয়া নির্মল রৌদ্রে কলিকাতার আকাশ ভরিয়া গিয়াছে। রাস্তায় গাড়িঘোড়ার বিরাম নাই, ফেরিওয়ালা অবিশ্রাম হাঁকিয়া চলিয়াছে, যাহারা আপিসে কালেজে আদালতে যাইবে তাহাদের জন্য বাসায় বাসায় মাছ-তরকারির চুপড়ি আসিয়াছে ও রান্নাঘরে উনান জ্বলাইবার ধোঁয়া উঠিয়াছে— কিন্তু তবু এত বড়ো এই-যে কাজের শহর কঠিনহৃদয় কলিকাতা, ইহার শত শত রাস্তা এবং গলির ভিতরে সোনার আলোকের ধারা আজ যেন একটা অপূর্ব যৌবনের প্রবাহ বহিয়া লইয়া চলিয়াছে।",
  },
  {
    id: "rabindranath-story-2",
    title: "অনুচ্ছেদ - রবি ঠাকুরের গল্প ২",
    level: "Advanced",
    text: "এমন সময় ঠিক তাহার বাসার সামনেই একটা ঠিকাগাড়ির উপরে একটা মস্ত জুড়িগাড়ি আসিয়া পড়িল এবং ঠিকাগাড়ির একটা চাকা ভাঙিয়া দিয়া দৃকপাত না করিয়া বেগে চলিয়া গেল। ঠিকাগাড়িটা সম্পূর্ণ উলটাইয়া না পড়িয়া এক পাশে কাত হইয়া পড়িল। বিনয় তাড়াতাড়ি রাস্তায় বাহির হইয়া দেখিল, গাড়ি হইতে একটি সতেরো-আঠারো বৎসরের মেয়ে নামিয়া পড়িয়াছে, এবং ভিতর হইতে একজন বৃদ্ধগোছের ভদ্রলোক নামিবার উপক্রম করিতেছেন। এই আকস্মিক ঘটনায় সে কিছুটা কিংকর্তব্যবিমূঢ় হয়ে পড়েছিল।",
  },
  {
    id: "rabindranath-poem-1",
    title: "কবিতা - নির্ঝরের স্বপ্নভঙ্গ",
    level: "Advanced",
    text: "আজি এ প্রভাতে রবির কর কেমনে পশিল প্রাণের 'পর, কেমনে পশিল গুহার আঁধারে প্রভাতপাখির গান! না জানি কেন রে এতদিন পরে জাগিয়া উঠিল প্রাণ। জাগিয়া উঠেছে প্রাণ, ওরে উথলি উঠেছে বারি, ওরে প্রাণের বাসনা প্রাণের আবেগ রুধিয়া রাখিতে নারি। থরথর করি কাঁপিছে ভূধর, শিলারাশি রাশি পড়িছে খসে, ফুলিয়া ফুলিয়া ফেনিল সলিল গরজি উঠিছে দারুণ রোষে। হেথায় হোথায় পাগলের প্রায় ঘুরিয়া ঘুরিয়া মাতিয়া বেড়ায়- বাহিরেতে চায়, দেখিতে না পায় কোথায় কারার দ্বার। কেন রে বিধাতা পাষাণ হেন, চারি দিকে তার বাঁধন কেন! ভাঙ রে হৃদয়, ভাঙ রে বাঁধন, সাধ্য সাধনে কর রে সাধন, সে লহরীমালা-পাথার-গাত্রে আঘাত কর রে দারুণ ঘাতে।",
  },
  {
    id: "nazrul-poem-1",
    title: "কবিতা - বিদ্রোহী",
    level: "Advanced",
    text: "বল বীর- বল উন্নত মম শির! শির নেহারি' আমারি, নতশির ওই শিখর হিমাদ্রির! বল বীর- বল মহাবিশ্বের মহাকাশ ফাড়ি' চন্দ্র সূর্য গ্রহ তারা ছাড়ি' ভূলোক দ্যুলোক গোলক ভেদিয়া খোদার আসন 'আরশ' ছেদিয়া, উঠিয়াছি চির-বিস্ময় আমি বিশ্ববিধাতৃর! মম ললাটে রুদ্র-ভগবান জ্বলে রাজ-রাজটীকা দীপ্ত জয়শ্রীড়! বল বীর - আমি চির-উন্নত শির!",
  }
];

export const practiceParagraphs: string[] = [
  "ভাষা আন্দোলন ছিল পূর্ব পাকিস্তানের (বর্তমান বাংলাদেশ) একটি সাংস্কৃতিক ও রাজনৈতিক আন্দোলন। ১৯৪৭ সালে পাকিস্তান গঠনের পর পশ্চিম পাকিস্তানের রাজনীতিবিদরাই পাকিস্তান সরকারের প্রাধান্য পায়। পাকিস্তান সরকার ঠিক করে উর্দু ভাষাকে সমগ্র পাকিস্তানের রাষ্ট্রভাষা করা হবে, কিন্তু পূর্ব পাকিস্তানের বাংলা ভাষাভাষী জনগণ উর্দুকে রাষ্ট্রভাষা হিসেবে মেনে নিতে রাজি ছিল না। তাই তারা বাংলাকে পাকিস্তানের অন্যতম রাষ্ট্রভাষা করার দাবি জানায়। এই বিজয় আমাদের মুক্তির প্রথম সোপান, যা আমাদের স্বাধীনতার পথে এগিয়ে নিয়েছিল। এই ঐতিহাসিক ঘটনা আমাদের জাতীয় জীবনে অত্যন্ত গুরুত্বপূর্ণ এবং তাৎপর্যপূর্ণ।",
  "মুক্তিযুদ্ধ ছিল ১৯৭১ সালে অনুষ্ঠিত একটি ঐতিহাসিক যুদ্ধ। এই যুদ্ধের মাধ্যমে বাংলাদেশ পাকিস্তান থেকে স্বাধীনতা লাভ করে। নয় মাস ধরে চলা এই রক্তক্ষয়ী সংগ্রামে প্রায় ত্রিশ লক্ষ মানুষ শহীদ হন এবং বহু নারী ধর্ষণের শিকার হন। বাংলাদেশের স্বাধীনতা লাভে ভারতের অবদান অনস্বীকার্য। এই বিজয় আমাদের অহংকার। এই সংগ্রামের মাধ্যমে আমরা পেয়েছি একটি স্বাধীন দেশ, একটি নতুন পতাকা এবং একটি নতুন পরিচয়। এই স্বাধীনতা রক্ষার দায়িত্ব আমাদের সকলের।",
  "সুন্দরবন বিশ্বের বৃহত্তম ম্যানগ্রোভ বন। এটি বাংলাদেশ ও ভারতের পশ্চিমবঙ্গ জুড়ে বিস্তৃত। সুন্দরবন রয়েল বেঙ্গল টাইগার, চিত্রা হরিণ, কুমির ও নানা প্রজাতির পাখির আবাসস্থল। ১৯৯৭ সালে ইউনেস্কো সুন্দরবনকে বিশ্ব ঐতিহ্যবাহী স্থান হিসেবে স্বীকৃতি দেয়। এই বন আমাদের প্রাকৃতিক রক্ষাকবচ হিসেবে কাজ করে এবং ঝড় ও জলোচ্ছ্বাস থেকে আমাদের রক্ষা করে। এই মূল্যবান সম্পদ রক্ষা করা আমাদের সকলের দায়িত্ব।",
  "আমাদের জাতীয় সংগীত 'আমার সোনার বাংলা' রবীন্দ্রনাথ ঠাকুর রচনা করেছেন। এর প্রথম দশ চরণ বাংলাদেশের জাতীয় সংগীত হিসেবে গৃহীত হয়েছে। এই গানটি মূলত স্বদেশী আন্দোলনের সময় রচিত হয়েছিল। গানটি শুনলে দেশের প্রতি ভালোবাসা আরও বেড়ে যায়। এই গান আমাদের প্রেরণার উৎস। এই গানের প্রতিটি শব্দ আমাদের দেশের প্রতি গভীর মমত্ববোধ এবং ভালোবাসার প্রকাশ করে। এই গান আমাদের জাতীয় চেতনার প্রতীক।",
  "ষড়ঋতুর দেশ বাংলাদেশ। গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত ও বসন্ত এই ছয়টি ঋতু চক্রাকারে আসে। প্রতিটি ঋতুরই রয়েছে নিজস্ব রূপ ও বৈশিষ্ট্য। বর্ষার বৃষ্টি যেমন প্রকৃতিকে সজীব করে তোলে, তেমনি বসন্তের আগমনে প্রকৃতি নতুন সাজে সেজে ওঠে। এই ঋতু বৈচিত্র্যই বাংলাদেশকে করেছে অনন্য সুন্দর। এই বৈচিত্র্যময় প্রকৃতি আমাদের মনকে মুগ্ধ করে এবং আমাদের জীবনকে নানাভাবে প্রভাবিত করে।",
  "ডিজিটাল বাংলাদেশ বর্তমান সরকারের একটি গুরুত্বপূর্ণ কর্মসূচি। এর মূল লক্ষ্য হলো প্রযুক্তির ব্যবহার করে দেশের মানুষের জীবনযাত্রার মান উন্নয়ন করা। শিক্ষা, স্বাস্থ্য, কৃষি, যোগাযোগসহ সকল ক্ষেত্রে ডিজিটাল প্রযুক্তির ছোঁয়া লেগেছে। এর ফলে দেশ দ্রুত উন্নতির দিকে এগিয়ে যাচ্ছে। আমরা সবাই এর সুফল ভোগ করছি। এই কর্মসূচির মাধ্যমে আমরা একটি উন্নত ও সমৃদ্ধ দেশের স্বপ্ন দেখি।"
];

export const rowCategories: RowDrillCategory[] = [
  { 
    id: 'home-row', 
    name: 'হোম রো (৭টি পাঠ)', 
    description: 'বাম হাত, ডান হাত, কম্বিনেশন, সিলেবল, টিয়ার্ড শব্দ ও চূড়ান্ত পরীক্ষা।'
  },
  { 
    id: 'top-row', 
    name: 'টপ রো (৭টি পাঠ)', 
    description: 'টপ রো বর্ণ, বিশেষ চিহ্ন, টপ শব্দ, হোম+টপ কম্বো ও মাস্টারি টেস্ট।'
  },
  { 
    id: 'bottom-row', 
    name: 'বটম রো (৭টি পাঠ)', 
    description: 'বটম রো বর্ণ, শিফট কী, বটম শব্দ, সর্ব-রো মিক্স ও মাস্টারি টেস্ট।'
  },
  { 
    id: 'mixed-row', 
    name: 'রো মিক্সিং মডিউল (৫টি পাঠ)', 
    description: 'Home only, Home+Top, Home+Bottom, Top+Bottom এবং All Rows ট্রানজিশন।'
  },
  {
    id: 'kar-row',
    name: 'কার-চিহ্ন অনুশীলন (২-স্তর)',
    description: 'ব্যঞ্জনবর্ণের সাথে সকল কার চিহ্নের সংযোগ ও নিবিড় ড্রিল।'
  },
  {
    id: 'hasanta-row',
    name: 'হসন্ত নিবিড় পাঠ (HAS 1–5)',
    description: 'হসন্তের একক ট্রানজিশন, ক্ক-ক্ত-ন্ত-ন্দ সন্ধি ও স্ট-স্থ-স্ক-স্প যুক্ত রূপ।'
  },
  {
    id: 'phola-row',
    name: 'ফলা পরিবার (৫টি পাঠ)',
    description: 'র-ফলা, য-ফলা, ল-ফলা, রেফ, ব-ফলা ও ম-ফলা পরিবারভিত্তিক অনুশীলন।'
  },
  {
    id: 'conjunct-row',
    name: 'যুক্তাক্ষর কাঠিন্য স্তর (Tiers 1–4)',
    description: 'সহজ, মাঝারি, কঠিন (ক্ষ, জ্ঞ) ও ত্রি-ব্যঞ্জন জটিল যুক্তাক্ষর।'
  },
  {
    id: 'special-row',
    name: 'বিশেষ বর্ণ ও চিহ্ন (২টি পাঠ)',
    description: 'ঁ, ং, ঃ, ৎ, ় এবং ড়, ঢ়, য়, ঞ এর নিখুঁত টাইপিং।'
  },
  {
    id: 'number-row',
    name: 'সংখ্যা ও যতিচিহ্ন (৪টি পাঠ)',
    description: 'বাংলা সংখ্যা ০-৯, মুদ্রা, তারিখ, শতকরা এবং দাঁড়ি, কমা ও উদ্ধৃতি।'
  },
  {
    id: 'words-row',
    name: 'কমন শব্দ ও ফ্রেজ (২টি পাঠ)',
    description: 'সর্বাধিক ব্যবহৃত বাংলা শব্দ এবং দ্রুত স্পেস ট্রানজিশন।'
  }
];
