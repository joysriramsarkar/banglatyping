/**
 * Unit Tests for Typing Audio Engine
 */

import { typingAudio } from '../lib/audio';

// Mock Web Audio API
class MockAudioNode {
  connect = jest.fn();
  disconnect = jest.fn();
}

class MockGainNode extends MockAudioNode {
  gain = {
    value: 1,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = {
    value: 440,
    setValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  };
  start = jest.fn();
  stop = jest.fn();
}

class MockAudioContext {
  state = 'running';
  currentTime = 0;
  destination = new MockAudioNode();
  createOscillator = jest.fn(() => new MockOscillatorNode());
  createGain = jest.fn(() => new MockGainNode());
  resume = jest.fn();
}

describe('Typing Audio Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    (window as any).AudioContext = MockAudioContext;
  });

  test('reads and updates audio settings', () => {
    const settings = typingAudio.getSettings();
    expect(settings.soundEnabled).toBe(true);

    typingAudio.updateSettings({ volume: 0.8, soundType: 'soft' });
    const updated = typingAudio.getSettings();
    expect(updated.volume).toBe(0.8);
    expect(updated.soundType).toBe('soft');
  });

  test('plays key click, error sound, and completion chime', () => {
    typingAudio.updateSettings({ soundEnabled: true, volume: 0.5 });

    expect(() => {
      typingAudio.playKeyClick();
      typingAudio.playErrorSound();
      typingAudio.playCompletionChime();
    }).not.toThrow();
  });

  test('does not play sounds when disabled', () => {
    typingAudio.updateSettings({ soundEnabled: false });

    expect(() => {
      typingAudio.playKeyClick();
      typingAudio.playErrorSound();
      typingAudio.playCompletionChime();
    }).not.toThrow();
  });
});
