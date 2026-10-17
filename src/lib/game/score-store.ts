/**
 * Arcade score store — localStorage high scores for typing games.
 *
 * Separate from typing progress on purpose: game scores never touch
 * user_progress / test_results, so arcade play cannot inflate WPM stats.
 * Same API shape as the legacy game-storage module (drop-in import swap).
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

export const ARCADE_SCORES_KEY = 'arcade-scores';

/**
 * Legacy key kept for one-time migration only.
 * @deprecated Do not write here — read once via migrateLegacyScores(), then use ARCADE_SCORES_KEY.
 */
export const LEGACY_ARCADE_STATS_KEY = 'banglatyping_arcade_stats';

export function getDefaultStats(): ArcadeStats {
  return {
    falling: { highScore: 0, maxLevel: 1, maxCombo: 0, gamesPlayed: 0 },
    space: { highScore: 0, shipsDestroyed: 0, maxLevel: 1, gamesPlayed: 0 },
    racer: { bestWpm: 0, firstPlaceWins: 0, gamesPlayed: 0 },
    totalPlayTimeMinutes: 0,
  };
}

function mergeStats(defaults: ArcadeStats, parsed: Partial<ArcadeStats>): ArcadeStats {
  return {
    ...defaults,
    ...parsed,
    falling: { ...defaults.falling, ...(parsed.falling || {}) },
    space: { ...defaults.space, ...(parsed.space || {}) },
    racer: { ...defaults.racer, ...(parsed.racer || {}) },
  };
}

/** One-time migration: copy legacy key to the new key if the new key is absent. */
function migrateLegacyScores(): void {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(ARCADE_SCORES_KEY) !== null) return;
    const legacy = localStorage.getItem(LEGACY_ARCADE_STATS_KEY);
    if (legacy !== null) {
      localStorage.setItem(ARCADE_SCORES_KEY, legacy);
    }
  } catch {
    // ignore
  }
}

export function getArcadeStats(): ArcadeStats {
  const defaults = getDefaultStats();
  if (typeof window === 'undefined') return defaults;
  migrateLegacyScores();
  try {
    const raw = localStorage.getItem(ARCADE_SCORES_KEY);
    if (!raw) return defaults;
    return mergeStats(defaults, JSON.parse(raw) as Partial<ArcadeStats>);
  } catch {
    return defaults;
  }
}

export function saveArcadeStats(stats: ArcadeStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARCADE_SCORES_KEY, JSON.stringify(stats));
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
      localStorage.removeItem(ARCADE_SCORES_KEY);
    } catch {
      // ignore
    }
  }
  return getDefaultStats();
}
