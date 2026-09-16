/**
 * Unit Tests for User Mode Module
 */

import {
  USER_MODE_CONFIGS,
  getStoredUserMode,
  saveStoredUserMode,
} from '../lib/user-mode';

describe('User Mode Configs & Storage', () => {
  test('defines valid configs for beginner, intermediate, and advanced', () => {
    expect(USER_MODE_CONFIGS.beginner.showKeyboard).toBe(true);
    expect(USER_MODE_CONFIGS.beginner.showFingerGuide).toBe(true);
    expect(USER_MODE_CONFIGS.beginner.accuracyTarget).toBe(90);

    expect(USER_MODE_CONFIGS.intermediate.showFingerGuide).toBe(false);
    expect(USER_MODE_CONFIGS.intermediate.accuracyTarget).toBe(95);

    expect(USER_MODE_CONFIGS.advanced.showKeyboard).toBe(false);
    expect(USER_MODE_CONFIGS.advanced.accuracyTarget).toBe(98);
  });

  test('handles localStorage retrieval and fallback in mock environment', () => {
    // Default fallback
    expect(getStoredUserMode()).toBe('beginner');

    // Save and load
    saveStoredUserMode('intermediate');
    expect(getStoredUserMode()).toBe('intermediate');

    saveStoredUserMode('advanced');
    expect(getStoredUserMode()).toBe('advanced');
  });
});
