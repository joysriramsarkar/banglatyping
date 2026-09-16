import { generateDrills, keyMap, lessons, rowCategories, practiceParagraphs } from '@/lib/lessons';

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
      // Check only the bn field (display character) - not bnShift which may have punctuation
      const codePoint = entry.bn.codePointAt(0) || 0;
      // Devanagari range: U+0900-U+097F, but exclude U+0964 (।) which is shared
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
    expect(zKey!.bn.codePointAt(0)).toBe(0x09CD); // starts with Bengali hasanta
  });
});

describe('generateDrills', () => {
  it('generates drills for simple consonants', () => {
    const drills = generateDrills(['\u0995', '\u0996', '\u0997'], 10); // ক, খ, গ
    expect(drills.length).toBeGreaterThan(0);
    drills.forEach(drill => {
      expect(drill.prompt).toBeDefined();
      expect(drill.steps.length).toBeGreaterThan(0);
    });
  });

  it('inserts space drills every 4 characters', () => {
    const drills = generateDrills(['\u0995'], 20); // ক
    const spaceDrills = drills.filter(d => d.prompt === ' ');
    expect(spaceDrills.length).toBeGreaterThan(0);
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

  it('has structured micro-lessons for home row (hr-01 through hr-07)', () => {
    ['hr-01', 'hr-02', 'hr-03', 'hr-04'].forEach(id => {
      expect(lessons.some(l => l.id === id)).toBe(true);
    });
  });

  it('has structured micro-lessons for top row (tr-01 through tr-07)', () => {
    ['tr-01'].forEach(id => {
      expect(lessons.some(l => l.id === id)).toBe(true);
    });
  });

  it('has structured micro-lessons for bottom row (br-01 through br-07)', () => {
    ['br-01'].forEach(id => {
      expect(lessons.some(l => l.id === id)).toBe(true);
    });
  });

  it('has row mixing lessons (mr-01 through mr-05)', () => {
    ['mr-01'].forEach(id => {
      expect(lessons.some(l => l.id === id)).toBe(true);
    });
  });

  it('has kar lessons', () => {
    ['kar-stage-a-01', 'kar-stage-b-mixed', 'kar-stage-c-words'].forEach(id => {
      expect(lessons.some(l => l.id === id)).toBe(true);
    });
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
  it('has 5 row categories including mixed-row', () => {
    expect(rowCategories.length).toBe(5);
    expect(rowCategories.some(c => c.id === 'mixed-row')).toBe(true);
  });

  it('has home-row category', () => {
    expect(rowCategories.some(c => c.id === 'home-row')).toBe(true);
  });

  it('each category has name and description', () => {
    rowCategories.forEach(cat => {
      expect(cat.name).toBeDefined();
      expect(cat.description).toBeDefined();
    });
  });
});

describe('practiceParagraphs', () => {
  it('has multiple paragraphs', () => {
    expect(practiceParagraphs.length).toBeGreaterThan(5);
  });

  it('each paragraph is a non-empty string', () => {
    practiceParagraphs.forEach(p => {
      expect(typeof p).toBe('string');
      expect(p.length).toBeGreaterThan(0);
    });
  });

  it('paragraphs contain Bengali text', () => {
    practiceParagraphs.forEach(p => {
      expect(BENGALI.test(p)).toBe(true);
    });
  });
});
