/**
 * Feature gates — progressive disclosure of typing aids by user mode.
 *
 * Complements user-mode.test.ts (which covers the base configs and storage
 * round-trip): this file pins the gating matrix itself — which aids each mode
 * hides, the monotonic accuracy targets, and invalid stored values falling
 * back to the safest (beginner) mode.
 */

import {
  USER_MODE_CONFIGS,
  getStoredUserMode,
  saveStoredUserMode,
  type UserMode,
} from '../lib/user-mode';
import {
  PREMIUM_FEATURES,
  canAccessFeature,
  type PlanTier,
  type PremiumFeature,
} from '../lib/billing/feature-gate';

const MODES: UserMode[] = ['beginner', 'intermediate', 'advanced'];

describe('mode-gated typing aids', () => {
  test('beginner shows every aid, advanced shows none', () => {
    const beginner = USER_MODE_CONFIGS.beginner;
    expect(beginner.showKeyboard).toBe(true);
    expect(beginner.showFingerGuide).toBe(true);
    expect(beginner.showStepHints).toBe(true);
    expect(beginner.showErrorExplanation).toBe(true);

    const advanced = USER_MODE_CONFIGS.advanced;
    expect(advanced.showKeyboard).toBe(false);
    expect(advanced.showFingerGuide).toBe(false);
    expect(advanced.showStepHints).toBe(false);
    expect(advanced.showErrorExplanation).toBe(false);
  });

  test('intermediate keeps the keyboard but drops finger and step guidance', () => {
    const mid = USER_MODE_CONFIGS.intermediate;
    expect(mid.showKeyboard).toBe(true);
    expect(mid.showFingerGuide).toBe(false);
    expect(mid.showStepHints).toBe(false);
    expect(mid.showErrorExplanation).toBe(true);
  });

  test('accuracy targets rise monotonically with mode', () => {
    const targets = MODES.map((m) => USER_MODE_CONFIGS[m].accuracyTarget);
    expect(targets).toEqual([90, 95, 98]);
    for (let i = 1; i < targets.length; i++) {
      expect(targets[i]).toBeGreaterThan(targets[i - 1]);
    }
  });

  test('aids only ever turn off as the mode advances (no reappearing aid)', () => {
    const aids = [
      'showKeyboard',
      'showFingerGuide',
      'showStepHints',
      'showErrorExplanation',
    ] as const;
    for (const aid of aids) {
      const flags = MODES.map((m) => USER_MODE_CONFIGS[m][aid]);
      // Once gated off, an aid must stay off in higher modes.
      const firstOff = flags.indexOf(false);
      if (firstOff !== -1) {
        expect(flags.slice(firstOff)).toEqual(flags.slice(firstOff).map(() => false));
      }
    }
  });
});

describe('stored mode gating fallback', () => {
  test('unknown stored values fall back to beginner (safest mode)', () => {
    localStorage.setItem('banglatyping_user_mode', 'expert');
    expect(getStoredUserMode()).toBe('beginner');
    localStorage.setItem('banglatyping_user_mode', '');
    expect(getStoredUserMode()).toBe('beginner');
  });

  test('every mode round-trips through storage', () => {
    for (const mode of MODES) {
      saveStoredUserMode(mode);
      expect(getStoredUserMode()).toBe(mode);
    }
    saveStoredUserMode('beginner');
  });
});

describe('premium feature gates by plan tier', () => {
  const tiers: PlanTier[] = ['free', 'pro', 'institution'];
  const features = Object.keys(PREMIUM_FEATURES) as PremiumFeature[];

  test('every feature names its minimum tier in Bengali', () => {
    expect(features).toHaveLength(10);
    for (const feature of features) {
      expect(PREMIUM_FEATURES[feature].titleBn.length).toBeGreaterThan(0);
      expect(tiers).toContain(PREMIUM_FEATURES[feature].minTier);
    }
  });

  test('free tier opens only the certificate PDF', () => {
    expect(canAccessFeature('free', 'certificate-pdf')).toBe(true);
    for (const feature of features) {
      if (feature === 'certificate-pdf') continue;
      expect(canAccessFeature('free', feature)).toBe(false);
    }
  });

  test('pro unlocks everything except the institutional features', () => {
    const institutional: PremiumFeature[] = ['ai-coach', 'teacher-dashboard'];
    for (const feature of features) {
      expect(canAccessFeature('pro', feature)).toBe(!institutional.includes(feature));
    }
  });

  test('institution unlocks every feature and unknown features stay locked', () => {
    for (const feature of features) {
      expect(canAccessFeature('institution', feature)).toBe(true);
    }
    expect(canAccessFeature('institution', 'no-such-feature' as PremiumFeature)).toBe(false);
  });
});
