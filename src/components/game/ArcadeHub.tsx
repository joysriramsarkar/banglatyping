"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Sparkles, 
  Rocket, 
  Car, 
  Trophy, 
  Flame, 
  Gamepad2, 
  Play, 
  Zap, 
  Home, 
  Volume2, 
  VolumeX, 
  Award, 
  Clock,
  Sliders,
  Keyboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, toBengaliNumber } from '@/lib/utils';
import { getArcadeStats, ArcadeStats } from '@/lib/game/game-storage';
import { gameAudio } from '@/lib/game/game-audio';
import { getActiveKeyboardLayout, getKeyboardLayoutConfig } from '@/lib/keyboard-layouts';
import FallingWordsGame from '../falling-words-game';
import SpaceDefenderGame from './SpaceDefenderGame';
import SpeedRacerGame from './SpeedRacerGame';
import ArcadeSettings from './ArcadeSettings';

export type GameMode = 'hub' | 'falling' | 'space' | 'racer' | 'settings';

export default function ArcadeHub({ initialMode = 'hub' }: { initialMode?: GameMode }) {
  const router = useRouter();
  const [activeGame, setActiveGame] = useState<GameMode>(initialMode);
  const [stats, setStats] = useState<ArcadeStats | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setStats(getArcadeStats());
    setSoundOn(gameAudio.isEnabled());
  }, [activeGame]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
  };

  // If a game is active, render that game component with a back button to Hub
  if (activeGame === 'falling') {
    return <FallingWordsGame onBackToHub={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'space') {
    return <SpaceDefenderGame onBackToHub={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'racer') {
    return <SpeedRacerGame onBackToHub={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'settings') {
    return <ArcadeSettings onBackToHub={() => setActiveGame('hub')} />;
  }

  // Otherwise render the Arcade Hub
  const totalGames = (stats?.falling.gamesPlayed || 0) + (stats?.space.gamesPlayed || 0) + (stats?.racer.gamesPlayed || 0);
  const activeLayoutKey = typeof window !== 'undefined' ? getActiveKeyboardLayout() : 'banglaword';
  const currentLayoutConfig = getKeyboardLayoutConfig(activeLayoutKey);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 select-none">
      {/* Arcade Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 p-6 sm:p-8 text-white border shadow-xl">
        <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
          <Gamepad2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-400 text-xs gap-1">
                <Sparkles className="h-3.5 w-3.5 fill-slate-950" /> গেমিং আর্কেড
              </Badge>
              <span className="text-xs text-indigo-200">বিনোদন ও টাইপিং অনুশীলনের মিলন</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-white">
              বাংলা টাইপিং আর্কেড 🎮
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed">
              একঘেয়েমি কাটিয়ে দারুণ সব আর্কেড গেম খেলে বাংলা টাইপিংয়ের গতি, রিফ্লেক্স ও নির্ভুলতা বৃদ্ধি করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              onClick={() => setActiveGame('settings')}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 h-9 font-medium"
            >
              <Sliders className="h-4 w-4 text-emerald-300" />
              <span>সেটিংস ও লেআউট</span>
            </Button>

            <Button
              onClick={toggleSound}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 h-9"
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-amber-300" /> : <VolumeX className="h-4 w-4 text-white/50" />}
              <span className="hidden sm:inline">{soundOn ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}</span>
            </Button>

            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 h-9"
            >
              <Home className="h-4 w-4" />
              <span>ড্যাশবোর্ড</span>
            </Button>
          </div>
        </div>

        {/* Global Stats Ribbon */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-amber-300">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">সর্বোচ্চ স্কোর</p>
                <p className="text-base font-bold font-mono text-white">
                  {toBengaliNumber(Math.max(stats.falling.highScore, stats.space.highScore))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-cyan-300">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">সেরা রেস স্পিড</p>
                <p className="text-base font-bold font-mono text-white">
                  {toBengaliNumber(stats.racer.bestWpm)} WPM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-emerald-300">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">সর্বোচ্চ কম্বো</p>
                <p className="text-base font-bold font-mono text-white">
                  {toBengaliNumber(stats.falling.maxCombo)}×
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-purple-300">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">মোট ম্যাচ খেলা</p>
                <p className="text-base font-bold font-mono text-white">
                  {toBengaliNumber(totalGames)} টি
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Layout & Settings Quick Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Keyboard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">সক্রিয় কীবোর্ড লেআউট:</span>
              <Badge variant="outline" className="text-xs font-bold bg-primary/10 text-primary border-primary/20">
                {currentLayoutConfig.label}
              </Badge>
              {currentLayoutConfig.id === 'banglaword' && (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">
                  ডিফল্ট
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              লিপিঘর বাংলাওয়ার্ড ডিফল্ট লেআউট হিসেবে সেট করা। প্রভাত, বিজয়, অভ্র বা ইউনিজয়ে পরিবর্তন করতে সেটিংস ওপেন করুন।
            </p>
          </div>
        </div>

        <Button
          onClick={() => setActiveGame('settings')}
          variant="outline"
          size="sm"
          className="gap-2 font-medium shrink-0"
        >
          <Sliders className="h-3.5 w-3.5 text-primary" /> লেআউট পরিবর্তন / সেটিংস
        </Button>
      </div>

      {/* 3 Featured Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Game 1: Falling Words */}
        <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-semibold">
                আর্কেড ক্লাসিক
              </Badge>
            </div>

            <div>
              <h2 className="text-xl font-bold font-headline group-hover:text-primary transition-colors">
                ঝরন্ত শব্দ (Falling Meteors)
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                উপর থেকে নেমে আসা উল্কা শব্দগুলোকে নিচে পড়ার আগেই টাইপ করে ধ্বংস করুন। রয়েছে বরফ ফ্রিজ, স্মার্ট বোমা ও কম্বো মাল্টিপ্লায়ার!
              </p>
            </div>

            <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
              <span>হাইস্কোর: <strong className="text-foreground">{toBengaliNumber(stats?.falling.highScore || 0)}</strong></span>
              <span>কম্বো: <strong className="text-foreground">{toBengaliNumber(stats?.falling.maxCombo || 0)}×</strong></span>
            </div>
          </div>

          <div className="p-5 pt-0">
            <Button
              onClick={() => setActiveGame('falling')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 shadow-sm"
            >
              <Play className="h-4 w-4 fill-current" /> খেলুন
            </Button>
          </div>
        </Card>

        {/* Game 2: Space Defender */}
        <Card className="group relative overflow-hidden border-2 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <Rocket className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30 text-xs font-semibold">
                স্পেস শুটার
              </Badge>
            </div>

            <div>
              <h2 className="text-xl font-bold font-headline group-hover:text-indigo-500 transition-colors">
                শব্দ শিকারী (Space Defender)
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                মহাকাশ প্রতিরক্ষা কামানের সাহায্যে আক্রমণকারী এলিয়েন জাহাজ লক করে লেজার ফায়ার করুন। প্রতি ৫ লেভেলে যুক্তাক্ষরযুক্ত বস যুদ্ধ!
              </p>
            </div>

            <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
              <span>হাইস্কোর: <strong className="text-foreground">{toBengaliNumber(stats?.space.highScore || 0)}</strong></span>
              <span>জাহাজ ধ্বংস: <strong className="text-foreground">{toBengaliNumber(stats?.space.shipsDestroyed || 0)}</strong></span>
            </div>
          </div>

          <div className="p-5 pt-0">
            <Button
              onClick={() => setActiveGame('space')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-sm"
            >
              <Play className="h-4 w-4 fill-current" /> খেলুন
            </Button>
          </div>
        </Card>

        {/* Game 3: Speed Racer */}
        <Card className="group relative overflow-hidden border-2 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Car className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-semibold">
                গ্র্যান্ড প্রিক্স রেস
              </Badge>
            </div>

            <div>
              <h2 className="text-xl font-bold font-headline group-hover:text-amber-500 transition-colors">
                টাইপ দৌড় (Speed Racer)
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                ৪-লেন ট্র্যাকের সাইবার রেস! টাইপিং গতি সরাসরি গাড়ির ইঞ্জিন চালায়। ৩৫+ WPM স্পিডে নাইট্রো বুস্ট সক্রিয় হয়ে জয় এনে দেয়!
              </p>
            </div>

            <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
              <span>সেরা গতি: <strong className="text-foreground">{toBengaliNumber(stats?.racer.bestWpm || 0)} WPM</strong></span>
              <span>১ম স্থান জয়: <strong className="text-foreground">{toBengaliNumber(stats?.racer.firstPlaceWins || 0)}</strong></span>
            </div>
          </div>

          <div className="p-5 pt-0">
            <Button
              onClick={() => setActiveGame('racer')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 shadow-sm"
            >
              <Play className="h-4 w-4 fill-current" /> খেলুন
            </Button>
          </div>
        </Card>
      </div>

      {/* Arcade Rules / Tips Card */}
      <Card className="p-5 bg-secondary/30 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-headline">আর্কেড টিপস: কীভাবে সেরা স্কোর করবেন?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                কীবোর্ডের দিকে না তাকিয়ে স্ক্রিনের দিকে তাকিয়ে টাইপ করুন। একটানা নির্ভুল টাইপ করলে কম্বো মাল্টিপ্লায়ার বাড়ে এবং নাইট্রো বুস্ট দ্রুত পাওয়া যায়।
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
