/**
 * Achievements + XP engine for typing sessions.
 */

export type AchievementId = 'firststeps' | 'century' | 'speeddemon' | 'marathon' | 'polyglot';

export interface Achievement {
  id: AchievementId;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  xp: number;
  threshold: number;
  metric: 'sessions' | 'words' | 'wpm' | 'minutes' | 'layouts';
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  firststeps: {
    id: 'firststeps',
    titleBn: 'প্রথম পদক্ষেপ',
    titleEn: 'First Steps',
    descriptionBn: 'প্রথম টাইপিং সেশন সম্পন্ন করুন',
    xp: 50,
    threshold: 1,
    metric: 'sessions',
  },
  century: {
    id: 'century',
    titleBn: 'শতক',
    titleEn: 'Century',
    descriptionBn: 'মোট ১০০টি শব্দ টাইপ করুন',
    xp: 100,
    threshold: 100,
    metric: 'words',
  },
  speeddemon: {
    id: 'speeddemon',
    titleBn: 'গতিদানব',
    titleEn: 'Speed Demon',
    descriptionBn: '৪০+ WPM গতি অর্জন করুন',
    xp: 200,
    threshold: 40,
    metric: 'wpm',
  },
  marathon: {
    id: 'marathon',
    titleBn: 'ম্যারাথন',
    titleEn: 'Marathon',
    descriptionBn: 'মোট ৬০ মিনিট অনুশীলন করুন',
    xp: 250,
    threshold: 60,
    metric: 'minutes',
  },
  polyglot: {
    id: 'polyglot',
    titleBn: 'বহুভাষী',
    titleEn: 'Polyglot',
    descriptionBn: '৩টি ভিন্ন লেআউটে টাইপ করুন',
    xp: 300,
    threshold: 3,
    metric: 'layouts',
  },
};

export interface TypingSessionSummary {
  wpm: number;
  accuracy: number;
  wordsTyped: number;
  minutesPracticed: number;
  layoutsUsed?: number;
}

export function calculateXP(session: TypingSessionSummary): number {
  const base = Math.round(session.wordsTyped * 0.5 + session.wpm * 2);
  const accuracyBonus = session.accuracy >= 95 ? 50 : session.accuracy >= 90 ? 20 : 0;
  const timeBonus = Math.round(session.minutesPracticed * 2);
  return Math.max(0, base + accuracyBonus + timeBonus);
}

export function unlockedAchievements(
  stats: { sessions: number; words: number; bestWpm: number; minutes: number; layouts: number },
  alreadyUnlocked: AchievementId[] = [],
): AchievementId[] {
  const owned = new Set(alreadyUnlocked);
  const values: Record<Achievement['metric'], number> = {
    sessions: stats.sessions,
    words: stats.words,
    wpm: stats.bestWpm,
    minutes: stats.minutes,
    layouts: stats.layouts,
  };
  return (Object.keys(ACHIEVEMENTS) as AchievementId[]).filter((id) => {
    if (owned.has(id)) return false;
    const a = ACHIEVEMENTS[id];
    return values[a.metric] >= a.threshold;
  });
}

export default ACHIEVEMENTS;
