"use client";

import { useState, useEffect, useCallback } from "react";
import { typingAudio, type AudioSettings } from "@/lib/audio";

export function useTypingSound() {
  const [settings, setSettings] = useState<AudioSettings>(typingAudio.getSettings());

  useEffect(() => {
    setSettings(typingAudio.getSettings());
  }, []);

  const toggleSound = useCallback(() => {
    const updated = { soundEnabled: !settings.soundEnabled };
    typingAudio.updateSettings(updated);
    setSettings((prev) => ({ ...prev, ...updated }));
  }, [settings.soundEnabled]);

  const setVolume = useCallback((volume: number) => {
    typingAudio.updateSettings({ volume });
    setSettings((prev) => ({ ...prev, volume }));
  }, []);

  const playClick = useCallback(() => {
    typingAudio.playKeyClick();
  }, []);

  const playError = useCallback(() => {
    typingAudio.playErrorSound();
  }, []);

  const playSuccess = useCallback(() => {
    typingAudio.playCompletionChime();
  }, []);

  return {
    soundEnabled: settings.soundEnabled,
    volume: settings.volume,
    toggleSound,
    setVolume,
    playClick,
    playError,
    playSuccess,
  };
}
