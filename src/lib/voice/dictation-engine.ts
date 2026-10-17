'use client';

/**
 * Dictation engine using SpeechSynthesis (bn-BD).
 */

export interface DictationOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
}

function pickBnVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'bn-BD') ?? voices.find((v) => v.lang.startsWith('bn')) ?? null
  );
}

export class DictationEngine {
  private lang: string;

  constructor(lang: string = 'bn-BD') {
    this.lang = lang;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speakWord(word: string, options: DictationOptions = {}): void {
    if (!this.isSupported()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = options.lang ?? this.lang;
    utter.rate = options.rate ?? 0.85;
    utter.pitch = options.pitch ?? 1;
    const voice = pickBnVoice();
    if (voice) utter.voice = voice;
    synth.speak(utter);
  }

  /** Stub: speak each word in sequence with a pause. TODO: add pause/repeat controls. */
  public runDictation(words: string[], options: DictationOptions = {}): void {
    if (!this.isSupported()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    words.forEach((word, i) => {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = options.lang ?? this.lang;
      utter.rate = options.rate ?? 0.8;
      utter.pitch = options.pitch ?? 1;
      const voice = pickBnVoice();
      if (voice) utter.voice = voice;
      // Slight queue offset; SpeechSynthesis queues utterances in order.
      void i;
      synth.speak(utter);
    });
  }

  public stop(): void {
    if (this.isSupported()) window.speechSynthesis.cancel();
  }
}

export const dictationEngine = new DictationEngine();

export default DictationEngine;
