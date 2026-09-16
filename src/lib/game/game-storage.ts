/**
 * Arcade Game Statistics and High Scores Storage
 */

export interface ArcadeStats {
  falling: {
    highScore: number;
    maxLevel: number;
    maxCombo: number;
    gamesPlayed: number;
  };
  space: {
    highScore: number;
    shipsDestroyed: number;
    maxLevel: number;
    gamesPlayed: number;
  };
  racer: {
    bestWpm: number;
    firstPlaceWins: number;
    gamesPlayed: number;
  };
  totalPlayTimeMinutes: number;
}

const STORAGE_KEY = 'banglatyping_arcade_stats';

export function getDefaultStats(): ArcadeStats {
  return {
    falling: { highScore: 0, maxLevel: 1, maxCombo: 0, gamesPlayed: 0 },
    space: { highScore: 0, shipsDestroyed: 0, maxLevel: 1, gamesPlayed: 0 },
    racer: { bestWpm: 0, firstPlaceWins: 0, gamesPlayed: 0 },
    totalPlayTimeMinutes: 0,
  };
}

export function getArcadeStats(): ArcadeStats {
  const defaults = getDefaultStats();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      falling: { ...defaults.falling, ...(parsed.falling || {}) },
      space: { ...defaults.space, ...(parsed.space || {}) },
      racer: { ...defaults.racer, ...(parsed.racer || {}) },
    };
  } catch {
    return defaults;
  }
}

export function saveArcadeStats(stats: ArcadeStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function recordFallingGameResult(score: number, level: number, combo: number): ArcadeStats {
  const current = getArcadeStats();
  current.falling.gamesPlayed += 1;
  if (score > current.falling.highScore) {
    current.falling.highScore = score;
  }
  if (level > current.falling.maxLevel) {
    current.falling.maxLevel = level;
  }
  if (combo > current.falling.maxCombo) {
    current.falling.maxCombo = combo;
  }
  saveArcadeStats(current);
  return current;
}

export function recordSpaceGameResult(score: number, ships: number, level: number): ArcadeStats {
  const current = getArcadeStats();
  current.space.gamesPlayed += 1;
  current.space.shipsDestroyed += ships;
  if (score > current.space.highScore) {
    current.space.highScore = score;
  }
  if (level > current.space.maxLevel) {
    current.space.maxLevel = level;
  }
  saveArcadeStats(current);
  return current;
}

export function recordRacerGameResult(wpm: number, isFirstPlace: boolean): ArcadeStats {
  const current = getArcadeStats();
  current.racer.gamesPlayed += 1;
  if (wpm > current.racer.bestWpm) {
    current.racer.bestWpm = wpm;
  }
  if (isFirstPlace) {
    current.racer.firstPlaceWins += 1;
  }
  saveArcadeStats(current);
  return current;
}

export function resetArcadeStats(): ArcadeStats {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return getDefaultStats();
}

