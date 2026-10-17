/**
 * Arcade Game Statistics and High Scores Storage
 *
 * @deprecated Import from '@/lib/game/score-store' instead. This module is a
 * thin re-export kept so existing imports (ArcadeHub, ArcadeSettings, tests)
 * keep working. The old storage key 'banglatyping_arcade_stats' is now
 * read-only: score-store migrates it once to 'arcade-scores' and all new
 * writes go to the new key.
 */
export * from './score-store';
