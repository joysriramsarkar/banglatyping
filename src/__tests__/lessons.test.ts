import { generateDrills, createDeterministicDrills, getStepsForWord, keyMap, lessons, rowCategories, practiceParagraphs } from '@/lib/lessons';

const HASANTA = '\u09CD';       // ্ Bengali hasanta
const _DEVANAGARI = /[\u0900-\u097F]/;
const BENGALI = /[\u0980-\u09FF]/;

describe('keyMap', () => {
  it('has entries for all home row keys', () => {
    const homeRowKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
    homeRowKeys.forEach(key => {
      expect(keyMap.some(k => k.key === key)).toBe(true);
    });
  });

  it('has Bengali character for each alphabetic key', () => {
    keyMap.forEach(entry => {
      if (entry.key.length === 1 && entry.key.match(/[a-z]/)) {
        expect(entry.bn).toBeDefined();
        expect(entry.bn.length).toBeGreaterThan(0);
      }
    });
  });

  it('has no Devanagari characters in any key mapping', () => {
    keyMap.forEach(entry => {
      const codePoint = entry.bn.codePointAt(0) || 0;
      const isDevanagariOnly = codePoint >= 0x0900 && codePoint <= 0x0963;
      expect(isDevanagariOnly).toBe(false);
    });
  });

  it('h key maps to Bengali hasanta U+09CD', () => {
    const hKey = keyMap.find(k => k.key === 'h');
    expect(hKey).toBeDefined();
    expect(hKey!.bn).toBe(HASANTA);
    expect(hKey!.bn.codePointAt(0)).toBe(0x09CD);
  });

  it('z key maps to hasanta+ya (্য)', () => {
    const zKey = keyMap.find(k => k.key === 'z');
    expect(zKey).toBeDefined();
    expect(zKey!.bn.codePointAt(0)).toBe(0x09CD);
  });
});

describe('generateDrills & createDeterministicDrills', () => {
  it('generates drills for simple consonants', () => {
    const drills = generateDrills(['\u0995', '\u0996', '\u0997'], 10); // ক, খ, গ
    expect(drills.length).toBeGreaterThan(0);
    drills.forEach(drill => {
      expect(drill.prompt).toBeDefined();
      expect(drill.steps.length).toBeGreaterThan(0);
    });
  });

  it('inserts space drills every 4 characters in random generator', () => {
    const drills = generateDrills(['\u0995'], 20); // ক
    const spaceDrills = drills.filter(d => d.prompt === ' ');
    expect(spaceDrills.length).toBeGreaterThan(0);
  });

  it('createDeterministicDrills preserves exact curated item sequence with spaces', () => {
    const items = ['জল', 'ফল', 'সাদা'];
    const drills = createDeterministicDrills(items);
    expect(drills.length).toBe(5); // 3 items + 2 spaces
    expect(drills[0].prompt).toBe('জল');
    expect(drills[1].prompt).toBe(' ');
    expect(drills[2].prompt).toBe('ফল');
    expect(drills[3].prompt).toBe(' ');
    expect(drills[4].prompt).toBe('সাদা');
  });

  it('does not end with a space drill', () => {
    const drills = generateDrills(['\u0995', '\u0996'], 20);
    if (drills.length > 0) {
      expect(drills[drills.length - 1].prompt).not.toBe(' ');
    }
  });

  it('each drill step has required fields', () => {
    const drills = generateDrills(['\u0995'], 5);
    drills.forEach(drill => {
      drill.steps.forEach(step => {
        expect(step.key).toBeDefined();
        expect(step.keyCode).toBeDefined();
        expect(typeof step.shift).toBe('boolean');
        expect(step.display).toBeDefined();
      });
    });
  });

  it('generates drills for vowel signs', () => {
    const drills = generateDrills(['\u09BE', '\u09BF', '\u09C1', '\u09C3'], 10); // া, ি, ু, ৃ
    expect(drills.length).toBeGreaterThan(0);
  });

  it('generates drills for hasanta', () => {
    const drills = generateDrills([HASANTA], 5);
    expect(drills.length).toBeGreaterThan(0);
  });

  it('generates 2 steps for consonant + kar combinations like কৃ', () => {
    const drills = generateDrills(['কৃ'], 5);
    const nonSpaceDrills = drills.filter(d => d.prompt !== ' ');
    expect(nonSpaceDrills.length).toBeGreaterThan(0);
    nonSpaceDrills.forEach(drill => {
      expect(drill.prompt).toBe('কৃ');
      expect(drill.steps.length).toBe(2);
      expect(drill.steps[0].display).toBe('ক');
      expect(drill.steps[0].keyCode).toBe('KeyK');
      expect(drill.steps[1].display).toBe('ৃ');
      expect(drill.steps[1].keyCode).toBe('Backslash');
    });
  });

  it('generates steps for standalone vowel ঋ', () => {
    const drills = generateDrills(['ঋ'], 5);
    const nonSpaceDrills = drills.filter(d => d.prompt !== ' ');
    expect(nonSpaceDrills.length).toBeGreaterThan(0);
    nonSpaceDrills.forEach(drill => {
      expect(drill.prompt).toBe('ঋ');
      expect(drill.steps.length).toBe(2);
      expect(drill.steps[0].display).toBe('্');
      expect(drill.steps[1].display).toBe('ৃ');
    });
  });
});

describe('lessons', () => {
  it('has lessons defined', () => {
    expect(lessons.length).toBeGreaterThan(0);
  });

  it('each lesson has required fields', () => {
    lessons.forEach(lesson => {
      expect(lesson.id).toBeDefined();
      expect(lesson.title).toBeDefined();
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(lesson.level);
      expect(lesson.text || lesson.drills).toBeDefined();
    });
  });

  it('has structured home-row lessons (HR-01 to HR-07)', () => {
    expect(lessons.some(l => l.id === 'home-row-chars')).toBe(true);
    expect(lessons.some(l => l.id === 'home-row-right')).toBe(true);
    expect(lessons.some(l => l.id === 'home-row-mix')).toBe(true);
    expect(lessons.some(l => l.id === 'home-row-combos')).toBe(true);
    expect(lessons.some(l => l.id === 'home-row-syllables')).toBe(true);
    expect(lessons.some(l => l.id === 'home-row-word-drill')).toBe(true);
    expect(lessons.some(l => l.id === 'home-row-mastery')).toBe(true);
  });

  it('has structured top-row lessons (TR-01 to TR-07)', () => {
    expect(lessons.some(l => l.id === 'top-row-chars')).toBe(true);
    expect(lessons.some(l => l.id === 'top-row-right')).toBe(true);
    expect(lessons.some(l => l.id === 'top-row-special')).toBe(true);
    expect(lessons.some(l => l.id === 'top-row-mix')).toBe(true);
    expect(lessons.some(l => l.id === 'top-row-word-drill')).toBe(true);
    expect(lessons.some(l => l.id === 'top-row-sentences')).toBe(true);
    expect(lessons.some(l => l.id === 'top-row-mastery')).toBe(true);
  });

  it('has structured bottom-row lessons (BR-01 to BR-07)', () => {
    expect(lessons.some(l => l.id === 'bottom-row-chars')).toBe(true);
    expect(lessons.some(l => l.id === 'bottom-row-mid')).toBe(true);
    expect(lessons.some(l => l.id === 'bottom-row-shift')).toBe(true);
    expect(lessons.some(l => l.id === 'bottom-row-all-mix')).toBe(true);
    expect(lessons.some(l => l.id === 'bottom-row-word-drill')).toBe(true);
    expect(lessons.some(l => l.id === 'bottom-row-paragraph')).toBe(true);
    expect(lessons.some(l => l.id === 'bottom-row-mastery')).toBe(true);
  });

  it('has row mixing lessons (mixed-row-1 to 5)', () => {
    expect(lessons.some(l => l.id === 'mixed-row-1')).toBe(true);
    expect(lessons.some(l => l.id === 'mixed-row-5')).toBe(true);
  });

  it('all lesson IDs are unique', () => {
    const ids = lessons.map(l => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('lesson texts contain Bengali characters', () => {
    lessons.filter(l => l.text).forEach(lesson => {
      expect(BENGALI.test(lesson.text!)).toBe(true);
    });
  });
});

describe('rowCategories', () => {
  it('has all 11 row and skill categories defined', () => {
    expect(rowCategories.length).toBe(11);
  });

  it('has home-row, top-row, bottom-row and mixed-row categories', () => {
    expect(rowCategories.some(c => c.id === 'home-row')).toBe(true);
    expect(rowCategories.some(c => c.id === 'top-row')).toBe(true);
    expect(rowCategories.some(c => c.id === 'bottom-row')).toBe(true);
    expect(rowCategories.some(c => c.id === 'mixed-row')).toBe(true);
    expect(rowCategories.some(c => c.id === 'hasanta-row')).toBe(true);
    expect(rowCategories.some(c => c.id === 'phola-row')).toBe(true);
    expect(rowCategories.some(c => c.id === 'conjunct-row')).toBe(true);
  });

  it('each category has name and description', () => {
    rowCategories.forEach(cat => {
      expect(cat.name).toBeDefined();
      expect(cat.description).toBeDefined();
    });
  });
});

describe('getStepsForWord with complex Bengali words', () => {
  it('correctly decomposes সংস্কৃতি into all 8 steps without skipping any letters', () => {
    const steps = getStepsForWord('সংস্কৃতি');
    expect(steps.length).toBe(8);
    expect(steps.map(s => s.display)).toEqual(['স', 'ং', 'স', '্', 'ক', 'ৃ', 'ত', 'ি']);
  });

  it('correctly decomposes বাংলা into all 5 steps', () => {
    const steps = getStepsForWord('বাংলা');
    expect(steps.length).toBe(5);
    expect(steps.map(s => s.display)).toEqual(['ব', 'া', 'ং', 'ল', 'া']);
  });

  it('correctly decomposes স্বাধীনতা into all 9 steps', () => {
    const steps = getStepsForWord('স্বাধীনতা');
    expect(steps.length).toBe(9);
    expect(steps.map(s => s.display)).toEqual(['স', '্', 'ব', 'া', 'ধ', 'ী', 'ন', 'ত', 'া']);
  });

  it('correctly decomposes চাঁদ into all 4 steps', () => {
    const steps = getStepsForWord('চাঁদ');
    expect(steps.length).toBe(4);
    expect(steps.map(s => s.display)).toEqual(['চ', 'া', 'ঁ', 'দ']);
  });
});

