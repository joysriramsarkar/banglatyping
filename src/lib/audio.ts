/**
 * Typing Audio Engine (Web Audio API Synthesizer)
 *
 * Provides zero-asset, high-performance synthesized sound effects for typing:
 * - subtle mechanical click on keystroke
 * - soft error thud on typing error
 * - harmonious completion chime
 *
 * Includes mute / volume settings stored in localStorage.
 */

const AUDIO_SETTINGS_KEY = 'banglatyping_audio_settings';

export interface AudioSettings {
  soundEnabled: boolean;
  volume: number; // 0.0 to 1.0
  soundType: 'mechanical' | 'soft' | 'bubble';
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  soundEnabled: true,
  volume: 0.3,
  soundType: 'mechanical',
};

class TypingSoundEngine {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.settings));
      } catch {
        // ignore
      }
    }
  }

  private loadSettings(): void {
    try {
      const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (raw) {
        this.settings = { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {
      this.settings = DEFAULT_AUDIO_SETTINGS;
    }
  }

  /** Play subtle keystroke sound */
  public playKeyClick(): void {
    if (!this.settings.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      const freq = this.settings.soundType === 'soft' ? 400 : 700 + Math.random() * 80;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

      gain.gain.setValueAtTime(this.settings.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /** Play error sound */
  public playErrorSound(): void {
    if (!this.settings.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

      gain.gain.setValueAtTime(this.settings.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }

  /** Play success / completion chime */
  public playCompletionChime(): void {
    if (!this.settings.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = now + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.settings.volume * 0.4, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {
      // Ignore
    }
  }
}

export const typingAudio = new TypingSoundEngine();

/**
 * OptimizedTypingSoundEngine — pooled Web Audio engine.
 *
 * Pre-creates a pool of 8 oscillator+gain pairs and reuses them
 * round-robin, avoiding per-keystroke node allocation/GC churn.
 * Kept alongside the legacy `TypingSoundEngine` for compatibility.
 */
const POOL_SIZE = 8;

interface PooledVoice {
  osc: OscillatorNode | null;
  gain: GainNode | null;
}

export class OptimizedTypingSoundEngine {
  private ctx: AudioContext | null = null;
  private pool: PooledVoice[] = [];
  private cursor = 0;
  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadSettings();
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.pool = Array.from({ length: POOL_SIZE }, () => {
        if (!this.ctx) return { osc: null, gain: null };
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        return { osc, gain };
      });
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private loadSettings(): void {
    try {
      const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AudioSettings>;
        this.settings = { ...DEFAULT_AUDIO_SETTINGS, ...parsed };
      }
    } catch {
      this.settings = DEFAULT_AUDIO_SETTINGS;
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(next: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...next };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.settings));
      } catch {
        // ignore
      }
    }
  }

  private nextVoice(): PooledVoice | null {
    const voice = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % POOL_SIZE;
    return voice ?? null;
  }

  private blip(freqFrom: number, freqTo: number, duration: number, peak: number, type: OscillatorType): void {
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const voice = this.nextVoice();
      if (!voice?.osc || !voice?.gain) return;
      const now = ctx.currentTime;
      voice.osc.type = type;
      voice.osc.frequency.cancelScheduledValues(now);
      voice.osc.frequency.setValueAtTime(freqFrom, now);
      voice.osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqTo), now + duration);
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(peak, now);
      voice.gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    } catch {
      // ignore synthesis errors
    }
  }

  public playKeyClick(): void {
    const freq = this.settings.soundType === "soft" ? 400 : 700 + Math.random() * 80;
    this.blip(freq, 100, 0.04, this.settings.volume * 0.4, "sine");
  }

  public playErrorSound(): void {
    this.blip(180, 110, 0.08, this.settings.volume * 0.5, "sawtooth");
  }

  public playCompletionChime(): void {
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const voice = this.pool[(this.cursor + idx) % POOL_SIZE];
        if (!voice?.osc || !voice?.gain) return;
        const start = now + idx * 0.08;
        voice.osc.type = "triangle";
        voice.osc.frequency.setValueAtTime(freq, start);
        voice.gain.gain.cancelScheduledValues(start);
        voice.gain.gain.setValueAtTime(0.0001, start);
        voice.gain.gain.linearRampToValueAtTime(this.settings.volume * 0.4, start + 0.02);
        voice.gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      });
      this.cursor = (this.cursor + notes.length) % POOL_SIZE;
    } catch {
      // ignore
    }
  }
}

export const optimizedTypingAudio = new OptimizedTypingSoundEngine();
