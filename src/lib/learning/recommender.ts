/**
 * Adaptive Practice Recommender
 *
 * Analyzes user's weak skills and generates targeted practice recommendations.
 * This is the "Practice My Mistakes" engine (পরিকল্পনা.md #24, #43).
 *
 * Algorithm:
 *   1. Rank weak skills by: accuracy rate × recency weight × frequency weight
 *   2. Determine drill type based on accuracy range:
 *      < 70%  → weakness drill (isolated, repeated)
 *      70-85% → precision drill (careful, no time pressure)
 *      85-95% → mixed drill (with other learned skills)
 *      > 95%  → speed drill (faster, timed)
 *   3. Generate a drill content list for the weak skills
 *   4. Return recommendations in priority order
 */

import type { WeakCharacterView, SkillRecommendation, ErredCharacter } from '../types';
import { graphemeToSkillId } from './mastery';

// ── Recommendation thresholds ───────────────────────────────────

/** Below this accuracy → weakness drill */
const WEAKNESS_THRESHOLD = 70;

/** Below this accuracy → precision drill */
const PRECISION_THRESHOLD = 85;

/** Below this accuracy → mixed drill */
const MIXED_THRESHOLD = 95;

/** Number of top recommendations to return */
const MAX_RECOMMENDATIONS = 10;

// ── Common Bengali words for each skill group ───────────────────
// Used to generate meaningful drill content

const COMMON_WORD_BANK: Record<string, string[]> = {
  'kar-া': ['কথা', 'মানুষ', 'বাংলা', 'আমার', 'তোমার', 'পানি', 'খাবার'],
  'kar-ি': ['কি', 'কিছু', 'কিন্তু', 'দিন', 'বিষয়', 'নিয়ে', 'করি'],
  'kar-ী': ['কী', 'কীভাবে', 'জীবন', 'নীল', 'দীর্ঘ', 'গভীর'],
  'kar-ু': ['কুকুর', 'তুমি', 'বুঝি', 'শুরু', 'পুরো', 'দুই'],
  'kar-ূ': ['কূল', 'ভূল', 'সূর্য', 'পূর্ণ', 'তূলনা'],
  'kar-ে': ['কেন', 'দেখি', 'বলে', 'নেই', 'আসে', 'যেতে'],
  'kar-ৈ': ['কৈশোর', 'বৈশাখ', 'সৈনিক', 'তৈরি', 'নৈতিক'],
  'kar-ো': ['কোথা', 'বলো', 'যাও', 'দেখো', 'হলো', 'গেলো'],
  'kar-ৌ': ['কৌশল', 'কৌতূহল', 'বৌদ্ধ', 'জৌলুস', 'নৌকা'],
  'conjunct-ক্ষ': ['ক্ষমা', 'শিক্ষা', 'দক্ষ', 'সক্ষম', 'ক্ষতি', 'প্রতিক্ষা'],
  'conjunct-জ্ঞ': ['জ্ঞান', 'বিজ্ঞান', 'বিজ্ঞাপন', 'আজ্ঞা', 'প্রজ্ঞা'],
  'conjunct-ত্র': ['ত্রুটি', 'মিত্র', 'পাত্র', 'মন্ত্র', 'স্ত্রী'],
  'conjunct-শ্র': ['শ্রম', 'শ্রদ্ধা', 'বিশ্রাম', 'আশ্রয়', 'পরিশ্রম'],
  'conjunct-ন্ত': ['সন্তান', 'প্রান্ত', 'শান্ত', 'ক্লান্ত', 'অন্ত'],
  'conjunct-ক্ত': ['শক্তি', 'ভক্তি', 'রক্ত', 'মুক্ত', 'সক্ত'],
  'conjunct-স্ত': ['স্তব', 'মস্ত', 'অস্ত', 'বস্তু', 'পোস্ত'],
};

const FALLBACK_WORDS = ['বাংলা', 'মানুষ', 'ভালো', 'আসুন', 'করুন', 'দেখুন', 'বলুন'];

// ── Core recommendation function ────────────────────────────────

/**
 * Generate ranked practice recommendations from user's weak character data.
 *
 * @param weakChars   Characters with low accuracy (from user_weak_characters view)
 * @param recentErrors  Recent session errors (higher weight for recent mistakes)
 */
export function generateRecommendations(
  weakChars: WeakCharacterView[],
  recentErrors: ErredCharacter[] = []
): SkillRecommendation[] {
  if (weakChars.length === 0) return [];

  // Build a recency boost map from recent errors
  const recencyBoost = new Map<string, number>();
  const maxRecentCount = recentErrors.reduce((m, e) => Math.max(m, e.count), 1);
  for (const err of recentErrors) {
    recencyBoost.set(err.char, err.count / maxRecentCount);
  }

  // Score and rank each weak skill
  const scored = weakChars.map(wc => {
    const baseScore = 100 - wc.accuracy_rate;    // Higher score = weaker
    const boost = (recencyBoost.get(wc.character) ?? 0) * 20; // Recency boost up to 20pts
    const frequencyFactor = Math.min(wc.error_count / 10, 1) * 10; // Up to 10pts for frequency

    return {
      character: wc.character,
      accuracyRate: wc.accuracy_rate,
      score: baseScore + boost + frequencyFactor,
    };
  });

  // Sort by score descending (most critical first)
  scored.sort((a, b) => b.score - a.score);

  // Build recommendations
  return scored
    .slice(0, MAX_RECOMMENDATIONS)
    .map((s, index) => ({
      skillId: graphemeToSkillId(s.character),
      character: s.character,
      accuracyRate: s.accuracyRate,
      recommendedDrillType: getDrillType(s.accuracyRate),
      priority: index + 1,
    }));
}

/**
 * Determine drill type based on accuracy.
 */
function getDrillType(accuracy: number): SkillRecommendation['recommendedDrillType'] {
  if (accuracy < WEAKNESS_THRESHOLD) return 'weakness';
  if (accuracy < PRECISION_THRESHOLD) return 'precision';
  if (accuracy < MIXED_THRESHOLD) return 'mixed';
  return 'speed';
}

// ── Drill content generation ────────────────────────────────────

export interface DrillContent {
  title: string;
  description: string;
  items: DrillItem[];
  type: SkillRecommendation['recommendedDrillType'];
  targetAccuracy: number;
}

export interface DrillItem {
  text: string;
  category: 'character' | 'pattern' | 'word' | 'phrase';
  repetitions: number;
}

/**
 * Generate drill content for a list of weak skills.
 * Creates a progressive drill: isolated → pattern → word.
 */
export function generateDrillContent(recommendations: SkillRecommendation[]): DrillContent {
  if (recommendations.length === 0) {
    return {
      title: 'সাধারণ অনুশীলন',
      description: 'আপনার সামগ্রিক দক্ষতা উন্নত করতে অনুশীলন করুন।',
      items: FALLBACK_WORDS.map(w => ({ text: w, category: 'word', repetitions: 3 })),
      type: 'mixed',
      targetAccuracy: 95,
    };
  }

  const topRec = recommendations[0];
  const drillType = topRec.recommendedDrillType;
  const weakChars = recommendations.slice(0, 5).map(r => r.character);

  const items: DrillItem[] = [];

  // Phase 1: Isolated character practice
  for (const char of weakChars) {
    const reps = drillType === 'weakness' ? 5 : drillType === 'precision' ? 4 : 3;
    items.push({ text: char, category: 'character', repetitions: reps });
  }

  // Phase 2: Pattern combinations (consonant + weak char)
  if (drillType !== 'speed') {
    const baseConsonants = ['ক', 'ম', 'ন', 'স', 'ত'];
    for (const char of weakChars.slice(0, 3)) {
      for (const consonant of baseConsonants.slice(0, 2)) {
        const pattern = consonant + char;
        items.push({ text: pattern, category: 'pattern', repetitions: 3 });
      }
    }
  }

  // Phase 3: Words containing the weak characters
  for (const char of weakChars) {
    const skillId = graphemeToSkillId(char);
    const words = COMMON_WORD_BANK[skillId] ?? findWordsContaining(char);

    for (const word of words.slice(0, 4)) {
      items.push({ text: word, category: 'word', repetitions: 2 });
    }
  }

  // Phase 4: Mixed drill (if not weakness mode)
  if (drillType === 'mixed' || drillType === 'speed') {
    const mixedWords = [
      ...weakChars.flatMap(c => COMMON_WORD_BANK[graphemeToSkillId(c)] ?? []).slice(0, 5),
      ...FALLBACK_WORDS.slice(0, 3),
    ];
    for (const word of [...new Set(mixedWords)].slice(0, 6)) {
      items.push({ text: word, category: 'word', repetitions: 1 });
    }
  }

  const title = `দুর্বলতা অনুশীলন: ${weakChars.slice(0, 3).join(', ')}`;
  const description = buildDescription(recommendations, drillType);
  const targetAccuracy = drillType === 'weakness' ? 90 : drillType === 'precision' ? 93 : 95;

  return { title, description, items, type: drillType, targetAccuracy };
}

/**
 * Find common words containing a specific character.
 * Fallback when no curated word list exists.
 */
function findWordsContaining(char: string): string[] {
  const allWords = Object.values(COMMON_WORD_BANK).flat();
  return allWords.filter(w => w.includes(char)).slice(0, 4);
}

/**
 * Build a motivating description for the drill.
 */
function buildDescription(
  recommendations: SkillRecommendation[],
  drillType: SkillRecommendation['recommendedDrillType']
): string {
  const topChars = recommendations.slice(0, 3).map(r => r.character).join(', ');
  const avgAccuracy = Math.round(
    recommendations.slice(0, 3).reduce((sum, r) => sum + r.accuracyRate, 0) /
    Math.min(recommendations.length, 3)
  );

  const typeLabels = {
    weakness: 'মনোযোগ দিয়ে, ধীরে ধীরে এই অক্ষরগুলো অনুশীলন করুন।',
    precision: 'নির্ভুলতার দিকে মনোযোগ দিন—গতির চেয়ে accuracy বেশি গুরুত্বপূর্ণ।',
    mixed: 'নতুন ও পুরনো দক্ষতা মিলিয়ে অনুশীলন করুন।',
    speed: 'আপনার দক্ষতা ভালো! এখন গতি বাড়ানোর সময়।',
  };

  return `${topChars} (গড় নির্ভুলতা: ${avgAccuracy}%) — ${typeLabels[drillType]}`;
}

// ── Daily training plan ─────────────────────────────────────────

export interface DailyTrainingPlan {
  date: string;
  estimatedMinutes: number;
  focusSkills: string[];
  recommendations: SkillRecommendation[];
  message: string;
}

/**
 * Generate a daily training plan based on weak skills and review schedule.
 */
export function generateDailyPlan(
  weakChars: WeakCharacterView[],
  recentErrors: ErredCharacter[] = [],
  now: string = new Date().toISOString()
): DailyTrainingPlan {
  const recommendations = generateRecommendations(weakChars, recentErrors);
  const focusSkills = recommendations.slice(0, 3).map(r => r.character);

  const estimatedMinutes = recommendations.length > 0
    ? Math.min(20, 5 + recommendations.length * 1.5)
    : 10;

  const message = focusSkills.length > 0
    ? `আজ ${focusSkills.join(', ')} অনুশীলনে মনোযোগ দিন।`
    : 'চমৎকার! আজ সামগ্রিক অনুশীলন করুন।';

  return {
    date: now.split('T')[0],
    estimatedMinutes: Math.round(estimatedMinutes),
    focusSkills,
    recommendations,
    message,
  };
}
