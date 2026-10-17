/**
 * Premium feature gating.
 */

export type PlanTier = 'free' | 'pro' | 'institution';

export type PremiumFeature =
  | 'advanced-analytics'
  | 'custom-drills'
  | 'offline-mode'
  | 'certificate-pdf'
  | 'multiplayer-races'
  | 'ai-coach'
  | 'ai-feedback'
  | 'srs-system'
  | 'premium-certificate'
  | 'teacher-dashboard';

export const PREMIUM_FEATURES: Record<PremiumFeature, { minTier: PlanTier; titleBn: string }> = {
  'advanced-analytics': { minTier: 'pro', titleBn: 'উন্নত বিশ্লেষণ' },
  'custom-drills': { minTier: 'pro', titleBn: 'কাস্টম ড্রিল' },
  'offline-mode': { minTier: 'pro', titleBn: 'অফলাইন মোড' },
  'certificate-pdf': { minTier: 'free', titleBn: 'সার্টিফিকেট PDF' },
  'multiplayer-races': { minTier: 'pro', titleBn: 'মাল্টিপ্লেয়ার রেস' },
  'ai-coach': { minTier: 'institution', titleBn: 'এআই কোচ' },
  'ai-feedback': { minTier: 'pro', titleBn: 'এআই ফিডব্যাক' },
  'srs-system': { minTier: 'pro', titleBn: 'SRS রিভিশন সিস্টেম' },
  'premium-certificate': { minTier: 'pro', titleBn: 'প্রিমিয়াম সার্টিফিকেট' },
  'teacher-dashboard': { minTier: 'institution', titleBn: 'শিক্ষক ড্যাশবোর্ড' },
};

const TIER_RANK: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  institution: 2,
};

export function canAccessFeature(tier: PlanTier, feature: PremiumFeature): boolean {
  const entry = PREMIUM_FEATURES[feature];
  if (!entry) return false;
  return TIER_RANK[tier] >= TIER_RANK[entry.minTier];
}

export default canAccessFeature;
