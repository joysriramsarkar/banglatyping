/**
 * User Mode Management
 *
 * Beginner / Intermediate / Advanced mode settings (পরিকল্পনা.md #33).
 */

export type UserMode = 'beginner' | 'intermediate' | 'advanced';

export interface UserModeConfig {
  mode: UserMode;
  label: string;
  description: string;
  showKeyboard: boolean;
  showFingerGuide: boolean;
  showStepHints: boolean;
  showErrorExplanation: boolean;
  accuracyTarget: number;
}

export const USER_MODE_CONFIGS: Record<UserMode, UserModeConfig> = {
  beginner: {
    mode: 'beginner',
    label: 'শিক্ষানবিশ (Beginner)',
    description: 'ভার্চুয়াল কীবোর্ড, আঙুলের অবস্থান ও ধাপে ধাপে দিকনির্দেশনা চালু থাকবে।',
    showKeyboard: true,
    showFingerGuide: true,
    showStepHints: true,
    showErrorExplanation: true,
    accuracyTarget: 90,
  },
  intermediate: {
    mode: 'intermediate',
    label: 'মধ্যম (Intermediate)',
    description: 'ভার্চুয়াল কীবোর্ড ঐচ্ছিক, ন্যূনতম ইঙ্গিত, নির্ভুলতা ও ধারাবাহিকতায় জোর।',
    showKeyboard: true,
    showFingerGuide: false,
    showStepHints: false,
    showErrorExplanation: true,
    accuracyTarget: 95,
  },
  advanced: {
    mode: 'advanced',
    label: 'উন্নত (Advanced)',
    description: 'কোনো ইঙ্গিত ছাড়া বাস্তব অনুচ্ছেদ টাইপিং, গতি বৃদ্ধি ও কঠোর নিয়োগ পরীক্ষা।',
    showKeyboard: false,
    showFingerGuide: false,
    showStepHints: false,
    showErrorExplanation: false,
    accuracyTarget: 98,
  },
};

const USER_MODE_STORAGE_KEY = 'banglatyping_user_mode';

export function getStoredUserMode(): UserMode {
  if (typeof window === 'undefined') return 'beginner';
  try {
    const saved = localStorage.getItem(USER_MODE_STORAGE_KEY);
    if (saved && (saved === 'beginner' || saved === 'intermediate' || saved === 'advanced')) {
      return saved as UserMode;
    }
  } catch {
    // Ignore
  }
  return 'beginner';
}

export function saveStoredUserMode(mode: UserMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore
  }
}
