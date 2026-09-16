/**
 * Unit Tests for Learning Mastery & Recommender Modules
 */

import {
  createSkillMastery,
  updateMastery,
  aggregateMasteryStats,
  graphemeToSkillId,
  isDueForReview,
  getMasteryLabel,
  weakCharsToMastery,
} from '../lib/learning/mastery';
import {
  generateRecommendations,
  generateDrillContent,
  generateDailyPlan,
} from '../lib/learning/recommender';
import type { WeakCharacterView } from '../lib/types';

describe('Skill Mastery Engine', () => {
  test('creates skill mastery with initial state', () => {
    const mastery = createSkillMastery('user-1', 'kar-i');
    expect(mastery.userId).toBe('user-1');
    expect(mastery.skillId).toBe('kar-i');
    expect(mastery.status).toBe('LEARNING');
    expect(mastery.strength).toBe(0);
  });

  test('updates mastery on successful session', () => {
    let mastery = createSkillMastery('user-1', 'kar-i');
    mastery = updateMastery(mastery, 98);
    expect(mastery.successCount).toBe(1);
    expect(mastery.strength).toBeGreaterThan(0);
  });

  test('calculates overall mastery stats', () => {
    const records = [
      { ...createSkillMastery('user-1', 's1'), status: 'MASTERED' as const, strength: 100 },
      { ...createSkillMastery('user-1', 's2'), status: 'PROFICIENT' as const, strength: 80 },
    ];
    const stats = aggregateMasteryStats(records);
    expect(stats.mastered).toBe(1);
    expect(stats.proficient).toBe(1);
    expect(stats.masteryPercent).toBe(100);
    expect(getMasteryLabel('MASTERED')).toBe('আয়ত্ত');
  });

  test('converts grapheme to skill ID and checks review due', () => {
    expect(graphemeToSkillId('া')).toBe('kar-া');
    expect(graphemeToSkillId('ক্ষ')).toBe('conjunct-ক্ষ');

    const pastDate = new Date(Date.now() - 10000).toISOString();
    const mastery = {
      ...createSkillMastery('u', 's'),
      nextReviewAt: pastDate,
    };
    expect(isDueForReview(mastery)).toBe(true);

    const weakChars: WeakCharacterView[] = [
      {
        user_id: 'u1',
        character: 'ক',
        total_attempts: 10,
        error_count: 1,
        accuracy_rate: 90,
        avg_latency_ms: 200,
        last_seen: new Date().toISOString(),
      },
    ];
    const converted = weakCharsToMastery('u1', weakChars);
    expect(converted.length).toBe(1);
    expect(converted[0].status).toBe('PROFICIENT');
  });
});

describe('Adaptive Practice Recommender', () => {
  test('returns empty array when no weak characters exist', () => {
    const recs = generateRecommendations([]);
    expect(recs).toEqual([]);
  });

  test('generates ranked recommendations from weak characters', () => {
    const weakChars: WeakCharacterView[] = [
      {
        user_id: 'user-1',
        character: 'ক্ষ',
        total_attempts: 20,
        error_count: 10,
        accuracy_rate: 50,
        avg_latency_ms: 600,
        last_seen: new Date().toISOString(),
      },
      {
        user_id: 'user-1',
        character: 'ি',
        total_attempts: 30,
        error_count: 5,
        accuracy_rate: 83,
        avg_latency_ms: 300,
        last_seen: new Date().toISOString(),
      },
    ];

    const recs = generateRecommendations(weakChars);
    expect(recs.length).toBe(2);
    // Lower accuracy (ক্ষ = 50%) should rank first
    expect(recs[0].character).toBe('ক্ষ');
    expect(recs[0].recommendedDrillType).toBe('weakness');
    expect(recs[1].character).toBe('ি');
    expect(recs[1].recommendedDrillType).toBe('precision');

    // Generate drill content
    const drillContent = generateDrillContent(recs);
    expect(drillContent.title).toContain('দুর্বলতা অনুশীলন');
    expect(drillContent.items.length).toBeGreaterThan(0);

    // Empty drill content fallback
    const emptyDrill = generateDrillContent([]);
    expect(emptyDrill.type).toBe('mixed');

    // Generate daily plan
    const plan = generateDailyPlan(weakChars);
    expect(plan.focusSkills.length).toBe(2);
    expect(plan.estimatedMinutes).toBeGreaterThan(0);
  });
});


