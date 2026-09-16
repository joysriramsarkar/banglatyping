"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Keyboard, 
  Check, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  Info, 
  Zap, 
  Trophy,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn, toBengaliNumber } from '@/lib/utils';
import { 
  KeyboardLayoutKey, 
  getKeyboardLayoutOptions, 
  getActiveKeyboardLayout, 
  setActiveKeyboardLayout,
  getKeyboardLayoutConfig,
  KeyboardLayoutOption
} from '@/lib/keyboard-layouts';
import { gameAudio } from '@/lib/game/game-audio';
import { getArcadeStats, resetArcadeStats, ArcadeStats } from '@/lib/game/game-storage';
import { SimplifiedKeyboard } from '../common/VirtualKeyboard';

interface ArcadeSettingsProps {
  onBackToHub: () => void;
}

export default function ArcadeSettings({ onBackToHub }: ArcadeSettingsProps) {
  const [selectedLayout, setSelectedLayout] = useState<KeyboardLayoutKey>('banglaword');
  const [soundOn, setSoundOn] = useState(true);
  const [stats, setStats] = useState<ArcadeStats | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const layoutOptions = getKeyboardLayoutOptions();

  useEffect(() => {
    const active = getActiveKeyboardLayout();
    setSelectedLayout(active);
    setSoundOn(gameAudio.isEnabled());
    setStats(getArcadeStats());
  }, []);

  const handleSelectLayout = (layoutKey: KeyboardLayoutKey) => {
    setSelectedLayout(layoutKey);
    setActiveKeyboardLayout(layoutKey);
    gameAudio.playKeyClick();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
    if (next) {
      gameAudio.playCombo(3);
    }
  };

  const handleResetScores = () => {
    resetArcadeStats();
    setStats(getArcadeStats());
    setShowResetConfirm(false);
    gameAudio.playError();
  };

  const currentConfig = getKeyboardLayoutConfig(selectedLayout);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 select-none animate-in fade-in duration-200">
      {/* Settings Navigation Bar */}
      <div className="flex items-center justify-between gap-3 p-4 bg-card border rounded-2xl shadow-xs">
        <Button
          onClick={onBackToHub}
          variant="ghost"
          size="sm"
          className="gap-2 font-medium hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> আর্কেড মেন্যু
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
            <Sliders className="h-3.5 w-3.5" /> সেটিংস প্যানেল
          </Badge>
          {savedToast && (
            <Badge className="bg-emerald-500 text-white text-xs gap-1 animate-pulse">
              <CheckCircle2 className="h-3 w-3" /> সেটিংস সংরক্ষিত!
            </Badge>
          )}
        </div>
      </div>

      {/* 1. Keyboard Layout Selection Section */}
      <Card className="border shadow-md overflow-hidden">
        <CardHeader className="bg-muted/40 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" /> কীবোর্ড লেআউট নির্বাচন
              </CardTitle>
              <CardDescription className="text-xs">
                বাংলা টাইপিং ও আর্কেড গেমের জন্য আপনার পছন্দের লেআউট পছন্দ করুন। ডিফল্টভাবে লিপিঘর বাংলাওয়ার্ড কার্যকর থাকবে।
              </CardDescription>
            </div>
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">
              ডিফল্ট: লিপিঘর বাংলাওয়ার্ড
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Layout Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {layoutOptions.map((opt: KeyboardLayoutOption) => {
              const isSelected = selectedLayout === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelectLayout(opt.value)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-2",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm font-headline text-foreground flex items-center gap-1.5">
                        {opt.label}
                      </h4>
                      {isSelected ? (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        opt.isDefault && (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                            ডিফল্ট
                          </Badge>
                        )
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {opt.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground/90 leading-relaxed pt-1">
                      {opt.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="pt-2 border-t border-primary/20 flex items-center justify-between text-[11px] text-primary font-semibold">
                      <span>সক্রিয় লেআউট</span>
                      <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded">নির্বাচিত ✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Real-time Virtual Keyboard Preview of the Selected Layout */}
          <div className="space-y-2 pt-3 border-t">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-headline text-foreground">
                  লাইভ কীবোর্ড প্রিভিউ:
                </span>
                <Badge variant="secondary" className="text-xs font-mono font-bold">
                  {currentConfig.label}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                নির্বাচিত লেআউটের অক্ষর বিন্যাস নিচে দৃশ্যমান
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border bg-background/50 p-2 sm:p-3">
              <SimplifiedKeyboard
                layout={selectedLayout}
                showFingerGuide={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Audio & Game Sound Effects Section */}
      <Card className="border shadow-md">
        <CardHeader className="bg-muted/40 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-indigo-500" /> অডিও ও সাউন্ড ইফেক্টস
              </CardTitle>
              <CardDescription className="text-xs">
                গেমে লেজার, বিস্ফোরণ, নাইট্রো বুস্ট ও টাইপিং ক্লিক সাউন্ড সক্রিয় বা নিষ্ক্রিয় রাখুন।
              </CardDescription>
            </div>
            <Button
              onClick={toggleSound}
              variant={soundOn ? "default" : "outline"}
              size="sm"
              className={cn("gap-1.5 font-bold h-9", soundOn ? "bg-indigo-600 hover:bg-indigo-700" : "")}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>{soundOn ? 'সাউন্ড সক্রিয়' : 'মিউট করা'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            নিচের বোতামগুলো ক্লিক করে বিভিন্ন গেম সাউন্ড টেস্ট করুন:
          </p>

          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => {
                gameAudio.playLaser();
              }}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-500" /> লেজার সাউন্ড (Laser)
            </Button>

            <Button
              onClick={() => {
                gameAudio.playExplosion();
              }}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-500" /> বিস্ফোরণ সাউন্ড (Explosion)
            </Button>

            <Button
              onClick={() => {
                gameAudio.playNitro();
              }}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-500" /> নাইট্রো বুস্ট (Nitro)
            </Button>

            <Button
              onClick={() => {
                gameAudio.playCombo(8);
              }}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" /> কম্বো কাইম (Chime)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Game History & Records Section */}
      <Card className="border shadow-md">
        <CardHeader className="bg-muted/40 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> স্কোর ও ডেটা ব্যবস্থাপনা
              </CardTitle>
              <CardDescription className="text-xs">
                আর্কেড গেমের সর্বোচ্চ স্কোর ও পরিসংখ্যান পর্যবেক্ষণ বা রিসেট করুন।
              </CardDescription>
            </div>

            {!showResetConfirm ? (
              <Button
                onClick={() => setShowResetConfirm(true)}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
              >
                <RotateCcw className="h-3.5 w-3.5" /> স্কোর রিসেট
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleResetScores}
                  variant="destructive"
                  size="sm"
                  className="text-xs font-bold"
                >
                  নিশ্চিত রিসেট করুন
                </Button>
                <Button
                  onClick={() => setShowResetConfirm(false)}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  বাতিল
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-secondary/50 border space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">ঝরন্ত শব্দ (Falling Words)</p>
                <p className="text-lg font-bold font-mono text-primary">
                  স্কোর: {toBengaliNumber(stats.falling.highScore)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  ম্যাক্স কম্বো: {toBengaliNumber(stats.falling.maxCombo)}× | ম্যাচ: {toBengaliNumber(stats.falling.gamesPlayed)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/50 border space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">শব্দ শিকারী (Space Defender)</p>
                <p className="text-lg font-bold font-mono text-indigo-500">
                  স্কোর: {toBengaliNumber(stats.space.highScore)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  জাহাজ ধ্বংস: {toBengaliNumber(stats.space.shipsDestroyed)} | ম্যাচ: {toBengaliNumber(stats.space.gamesPlayed)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/50 border space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">টাইপ দৌড় (Speed Racer)</p>
                <p className="text-lg font-bold font-mono text-amber-500">
                  সেরা গতি: {toBengaliNumber(stats.racer.bestWpm)} WPM
                </p>
                <p className="text-[11px] text-muted-foreground">
                  ১ম স্থান জয়: {toBengaliNumber(stats.racer.firstPlaceWins)} | ম্যাচ: {toBengaliNumber(stats.racer.gamesPlayed)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
