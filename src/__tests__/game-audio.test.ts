/**
 * Unit Tests for Arcade Sound Engine (game-audio.ts)
 */

import { gameAudio } from '@/lib/game/game-audio';

describe('ArcadeSoundEngine', () => {
  let mockOscillator: any;
  let mockGain: any;
  let mockFilter: any;
  let mockBufferSource: any;

  beforeEach(() => {
    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    };

    mockFilter = {
      type: 'lowpass',
      frequency: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    };

    mockBufferSource = {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    };

    const mockAudioContext = jest.fn().mockImplementation(() => ({
      currentTime: 0,
      sampleRate: 44100,
      state: 'running',
      destination: {},
      createOscillator: jest.fn(() => mockOscillator),
      createGain: jest.fn(() => mockGain),
      createBiquadFilter: jest.fn(() => mockFilter),
      createBuffer: jest.fn((_channels, size) => ({
        getChannelData: () => new Float32Array(size),
      })),
      createBufferSource: jest.fn(() => mockBufferSource),
      resume: jest.fn().mockResolvedValue(undefined),
    }));

    (window as any).AudioContext = mockAudioContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('toggles enabled state and persists to localStorage', () => {
    gameAudio.setEnabled(false);
    expect(gameAudio.isEnabled()).toBe(false);
    expect(localStorage.getItem('banglatyping_game_sound')).toBe('false');

    gameAudio.setEnabled(true);
    expect(gameAudio.isEnabled()).toBe(true);
    expect(localStorage.getItem('banglatyping_game_sound')).toBe('true');
  });

  it('plays key click sound without crashing', () => {
    expect(() => gameAudio.playKeyClick()).not.toThrow();
  });

  it('plays laser sound and configures oscillator frequency ramp', () => {
    gameAudio.playLaser();
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(950, 0);
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it('plays explosion sound using noise buffer and biquad filter', () => {
    gameAudio.playExplosion();
    expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(800, 0);
    expect(mockBufferSource.start).toHaveBeenCalled();
  });

  it('plays combo chimes scaling frequency based on streak count', () => {
    gameAudio.playCombo(1);
    expect(mockOscillator.start).toHaveBeenCalled();

    gameAudio.playCombo(10);
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it('plays nitro, freeze, error, and game over sounds safely', () => {
    expect(() => gameAudio.playNitro()).not.toThrow();
    expect(() => gameAudio.playFreeze()).not.toThrow();
    expect(() => gameAudio.playError()).not.toThrow();
    expect(() => gameAudio.playGameOver()).not.toThrow();
  });

  it('suppresses audio output when disabled', () => {
    gameAudio.setEnabled(false);
    jest.clearAllMocks();

    gameAudio.playLaser();
    expect(mockOscillator.start).not.toHaveBeenCalled();

    // Re-enable for subsequent tests
    gameAudio.setEnabled(true);
  });
});
