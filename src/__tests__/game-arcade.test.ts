/**
 * Unit Tests for Arcade Game Engine, Words Dictionary & High Scores Storage
 */

import {
  GAME_WORDS_EASY,
  GAME_WORDS_MEDIUM,
  GAME_WORDS_HARD,
  GAME_WORDS_CONJUNCTS,
  RACING_SENTENCES,
  getRandomGameWord,
  getRandomGameWords,
} from '../lib/game/game-words';

import {
  getArcadeStats,
  recordFallingGameResult,
  recordSpaceGameResult,
  recordRacerGameResult,
  resetArcadeStats,
  saveArcadeStats,
} from '../lib/game/game-storage';

import { gameAudio } from '../lib/game/game-audio';

describe('Game Words Dictionary & Selection', () => {
  test('all difficulty pools contain valid non-empty Bengali words', () => {
    expect(GAME_WORDS_EASY.length).toBeGreaterThanOrEqual(30);
    expect(GAME_WORDS_MEDIUM.length).toBeGreaterThanOrEqual(30);
    expect(GAME_WORDS_HARD.length).toBeGreaterThanOrEqual(25);
    expect(GAME_WORDS_CONJUNCTS.length).toBeGreaterThanOrEqual(15);
    expect(RACING_SENTENCES.length).toBeGreaterThanOrEqual(5);

    for (const w of [...GAME_WORDS_EASY, ...GAME_WORDS_MEDIUM, ...GAME_WORDS_HARD]) {
      expect(typeof w).toBe('string');
      expect(w.trim().length).toBeGreaterThan(0);
      expect(/[\u0980-\u09FF]/.test(w)).toBe(true);
    }
  });

  test('getRandomGameWord returns valid word according to requested difficulty', () => {
    const easyWord = getRandomGameWord('easy');
    expect(GAME_WORDS_EASY).toContain(easyWord);

    const mediumWord = getRandomGameWord('medium');
    expect(typeof mediumWord).toBe('string');
    expect(mediumWord.length).toBeGreaterThan(1);

    const hardWord = getRandomGameWord('hard');
    expect(typeof hardWord).toBe('string');
    expect(hardWord.length).toBeGreaterThan(1);
  });

  test('getRandomGameWords returns unique word selections', () => {
    const words = getRandomGameWords(5, 'medium');
    expect(words.length).toBe(5);
    const unique = new Set(words);
    expect(unique.size).toBe(5);
  });
});

describe('Arcade Stats & High Scores Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initial stats return safe default values', () => {
    const stats = getArcadeStats();
    expect(stats.falling.highScore).toBe(0);
    expect(stats.falling.gamesPlayed).toBe(0);
    expect(stats.space.highScore).toBe(0);
    expect(stats.racer.bestWpm).toBe(0);
  });

  test('recordFallingGameResult updates high score, maxLevel, and gamesPlayed', () => {
    const updated = recordFallingGameResult(250, 3, 5);
    expect(updated.falling.highScore).toBe(250);
    expect(updated.falling.maxLevel).toBe(3);
    expect(updated.falling.maxCombo).toBe(5);
    expect(updated.falling.gamesPlayed).toBe(1);

    // Recording lower score should preserve high score
    const next = recordFallingGameResult(100, 2, 2);
    expect(next.falling.highScore).toBe(250);
    expect(next.falling.gamesPlayed).toBe(2);
  });

  test('recordSpaceGameResult updates space defender stats', () => {
    const res = recordSpaceGameResult(500, 18, 4);
    expect(res.space.highScore).toBe(500);
    expect(res.space.shipsDestroyed).toBe(18);
    expect(res.space.maxLevel).toBe(4);
    expect(res.space.gamesPlayed).toBe(1);
  });

  test('recordRacerGameResult updates racing stats and first place wins', () => {
    const res = recordRacerGameResult(45, true);
    expect(res.racer.bestWpm).toBe(45);
    expect(res.racer.firstPlaceWins).toBe(1);
    expect(res.racer.gamesPlayed).toBe(1);
  });

  test('resetArcadeStats restores all metrics to zero defaults', () => {
    recordFallingGameResult(400, 5, 10);
    recordSpaceGameResult(600, 20, 6);
    recordRacerGameResult(55, true);

    const beforeReset = getArcadeStats();
    expect(beforeReset.falling.highScore).toBe(400);
    expect(beforeReset.space.highScore).toBe(600);

    const afterReset = resetArcadeStats();
    expect(afterReset.falling.highScore).toBe(0);
    expect(afterReset.space.highScore).toBe(0);
    expect(afterReset.racer.bestWpm).toBe(0);
    expect(afterReset.falling.gamesPlayed).toBe(0);
  });
});

describe('Arcade Bengali Orthography & Atomic Character Guarantee', () => {
  test('all racing sentences contain 0 decomposed nukta characters and use atomic য়, ড়, ঢ়', () => {
    for (const item of RACING_SENTENCES) {
      // Nukta code point \u09BC should not exist
      expect(item.text.includes('\u09BC')).toBe(false);
      if (item.author) {
        expect(item.author.includes('\u09BC')).toBe(false);
      }
    }
  });

  test('all word pools contain 0 decomposed nukta characters', () => {
    const allWords = [...GAME_WORDS_EASY, ...GAME_WORDS_MEDIUM, ...GAME_WORDS_HARD, ...GAME_WORDS_CONJUNCTS];
    for (const w of allWords) {
      expect(w.includes('\u09BC')).toBe(false);
    }
  });
});

describe('Arcade Audio Settings', () => {
  test('sound can be toggled on and off cleanly', () => {
    gameAudio.setEnabled(false);
    expect(gameAudio.isEnabled()).toBe(false);

    gameAudio.setEnabled(true);
    expect(gameAudio.isEnabled()).toBe(true);
  });
});
