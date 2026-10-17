/**
 * Dictation content stub — contract for future dictation playback.
 *
 * There is no dictation engine yet; this file pins the content invariants a
 * dictation feature will consume (unique prompt ids, Bengali-only word pools,
 * terminal punctuation on sentences, conjunct words that actually contain a
 * hasanta), so content regressions break here first, not in the player UI.
 */

import {
  GAME_WORDS_CONJUNCTS,
  GAME_WORDS_EASY,
  GAME_WORDS_HARD,
  GAME_WORDS_MEDIUM,
  RACING_SENTENCES,
} from '../lib/game/game-words';
import { DictationEngine } from '../lib/voice/dictation-engine';

const BENGALI = /[ঀ-৿]/;

function expectUniqueStrings(pool: string[]): void {
  expect(pool.length).toBeGreaterThan(0);
  expect(new Set(pool).size).toBe(pool.length);
  for (const word of pool) {
    expect(typeof word).toBe('string');
    expect(word.trim().length).toBeGreaterThan(0);
    expect(BENGALI.test(word)).toBe(true);
  }
}

describe('dictation word pools', () => {
  test('every difficulty pool is unique and Bengali', () => {
    expectUniqueStrings(GAME_WORDS_EASY);
    expectUniqueStrings(GAME_WORDS_MEDIUM);
    expectUniqueStrings(GAME_WORDS_HARD);
    expectUniqueStrings(GAME_WORDS_CONJUNCTS);
  });

  test('conjunct pool words actually contain a hasanta', () => {
    for (const word of GAME_WORDS_CONJUNCTS) {
      expect(word).toMatch(/্/);
    }
  });
});

describe('dictation sentence prompts', () => {
  test('racing sentences have unique ids and speakable Bengali text', () => {
    expect(RACING_SENTENCES.length).toBeGreaterThanOrEqual(5);
    const ids = RACING_SENTENCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const sentence of RACING_SENTENCES) {
      expect(sentence.id.trim().length).toBeGreaterThan(0);
      expect(sentence.text.trim().length).toBeGreaterThan(10);
      expect(BENGALI.test(sentence.text)).toBe(true);
    }
  });

  test('every prompt ends with terminal punctuation for clean TTS stops', () => {
    for (const sentence of RACING_SENTENCES) {
      expect(sentence.text.trim()).toMatch(/[।!?]$/);
    }
  });
});

describe('dictation engine (SpeechSynthesis bn-BD)', () => {
  const REAL_SYNTH = window.speechSynthesis;
  const REAL_UTTER = window.SpeechSynthesisUtterance;

  class MockUtterance {
    text: string;
    lang = '';
    rate = 1;
    pitch = 1;
    voice: unknown = null;
    constructor(text: string) {
      this.text = text;
    }
  }

  function installSpeechSynthesis(voices: Array<{ lang: string }> = []): {
    spoken: MockUtterance[];
    cancelled: number;
  } {
    const spoken: MockUtterance[] = [];
    let cancelled = 0;
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: {
        getVoices: () => voices,
        speak: (u: MockUtterance) => {
          spoken.push(u);
        },
        cancel: () => {
          cancelled += 1;
        },
      },
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      writable: true,
      value: MockUtterance,
    });
    return {
      spoken,
      get cancelled(): number {
        return cancelled;
      },
    };
  }

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: REAL_SYNTH,
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      writable: true,
      value: REAL_UTTER,
    });
  });

  test('reports unsupported and no-ops without speechSynthesis', () => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    const engine = new DictationEngine();
    expect(engine.isSupported()).toBe(false);
    expect(() => engine.speakWord('কথা')).not.toThrow();
    expect(() => engine.runDictation(['কথা', 'বাংলা'])).not.toThrow();
    expect(() => engine.stop()).not.toThrow();
  });

  test('speakWord uses bn-BD defaults and cancels first', () => {
    const state = installSpeechSynthesis([{ lang: 'bn-BD' }, { lang: 'en-US' }]);
    const engine = new DictationEngine();
    expect(engine.isSupported()).toBe(true);
    engine.speakWord('কথা');
    expect(state.cancelled).toBe(1);
    expect(state.spoken).toHaveLength(1);
    expect(state.spoken[0].text).toBe('কথা');
    expect(state.spoken[0].lang).toBe('bn-BD');
    expect(state.spoken[0].rate).toBe(0.85);
    expect(state.spoken[0].pitch).toBe(1);
    expect(state.spoken[0].voice).toEqual({ lang: 'bn-BD' });
  });

  test('options override lang/rate/pitch and voice falls back by prefix', () => {
    const state = installSpeechSynthesis([{ lang: 'bn-IN' }]);
    const engine = new DictationEngine('en-US');
    engine.speakWord('hello', { lang: 'en-US', rate: 1.2, pitch: 0.8 });
    expect(state.spoken[0].lang).toBe('en-US');
    expect(state.spoken[0].rate).toBe(1.2);
    expect(state.spoken[0].pitch).toBe(0.8);
    // No bn-BD voice: falls back to the bn- prefix match.
    expect(state.spoken[0].voice).toEqual({ lang: 'bn-IN' });
  });

  test('no Bengali voice leaves the utterance voiceless', () => {
    const state = installSpeechSynthesis([{ lang: 'en-US' }]);
    new DictationEngine().speakWord('কথা');
    expect(state.spoken[0].voice).toBeNull();
  });

  test('runDictation speaks every word in order, then stop cancels', () => {
    const state = installSpeechSynthesis([]);
    const engine = new DictationEngine();
    engine.runDictation(['কথা', 'বাংলা']);
    expect(state.spoken.map((u) => u.text)).toEqual(['কথা', 'বাংলা']);
    expect(state.spoken[0].rate).toBe(0.8);
    engine.stop();
    expect(state.cancelled).toBeGreaterThanOrEqual(2);
  });
});
