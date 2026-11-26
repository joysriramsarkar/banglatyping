"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  Sliders,
  Keyboard,
  Crown,
  Medal,
  Target,
  Castle,
  Zap as ZapIcon,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Sword
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toBengaliNumber } from '@/lib/utils';
import { getArcadeStats, ArcadeStats } from '@/lib/game/score-store';
import { gameAudio } from '@/lib/game/game-audio';
import { getActiveKeyboardLayout, getKeyboardLayoutConfig } from '@/lib/keyboard-layouts';
import FallingWordsGame from '../falling-words-game';
import SpaceDefenderGame from './SpaceDefenderGame';
import SpeedRacerGame from './SpeedRacerGame';
import WordCascadeGame from './WordCascadeGame';
import TypingDefenseGame from './TypingDefenseGame';
import SpeedChallengeGame from './SpeedChallengeGame';
import ArcadeSettings from './ArcadeSettings';

export type GameMode = 'hub' | 'falling' | 'space' | 'racer' | 'cascade' | 'defense' | 'speedchallenge' | 'settings';

export default function ArcadeHub({ initialMode = 'hub' }: { initialMode?: GameMode }) {
  const router = useRouter();
  const [activeGame, setActiveGame] = useState<GameMode>(initialMode);
  const [stats, setStats] = useState<ArcadeStats | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'classic' | 'new' | 'challenge'>('classic');

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

  if (activeGame === 'cascade') {
    return <WordCascadeGame onBackToHub={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'defense') {
    return <TypingDefenseGame onBackToHub={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'speedchallenge') {
    return <SpeedChallengeGame onBackToHub={() => setActiveGame('hub')} />;
  }

  if (activeGame === 'settings') {
    return <ArcadeSettings onBackToHub={() => setActiveGame('hub')} />;
  }

  // Otherwise render the Arcade Hub
  const totalGames = (stats?.falling.gamesPlayed || 0) + (stats?.space.gamesPlayed || 0) + (stats?.racer.gamesPlayed || 0) + (stats?.cascade.gamesPlayed || 0) + (stats?.defense.gamesPlayed || 0) + (stats?.speedChallenge.gamesPlayed || 0);
  const activeLayoutKey = typeof window !== 'undefined' ? getActiveKeyboardLayout() : 'banglaword';
  const currentLayoutConfig = getKeyboardLayoutConfig(activeLayoutKey);

  const games = {
    classic: [
      {
        id: 'falling' as GameMode,
        icon: Sparkles,
        color: 'primary',
        bgColor: 'bg-primary/10 border-primary/20',
        iconColor: 'text-primary',
        badge: 'আর্কেড ক্লাসিক',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        title: 'ঝরন্ত শব্দ (Falling Meteors)',
        desc: 'উপর থেকে নেমে আসা উল্কা শব্দগুলোকে নিচে পড়ার আগেই টাইপ করে ধ্বংস করুন। রয়েছে বরফ ফ্রিজ, স্মার্ট বোমা ও কম্বো মাল্টিপ্লায়ার!',
        stats: [
          { label: 'হাইস্কোর', value: toBengaliNumber(stats?.falling.highScore || 0) },
          { label: 'কম্বো', value: `${toBengaliNumber(stats?.falling.maxCombo || 0)}×` },
          { label: 'ম্যাচ', value: `${toBengaliNumber(stats?.falling.gamesPlayed || 0)} টি` },
        ],
      },
      {
        id: 'space' as GameMode,
        icon: Rocket,
        color: 'indigo',
        bgColor: 'bg-indigo-500/10 border-indigo-500/20',
        iconColor: 'text-indigo-500',
        badge: 'স্পেস শুটার',
        badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
        title: 'শব্দ শিকারী (Space Defender)',
        desc: 'মহাকাশ প্রতিরক্ষা কামানের সাহায্যে আক্রমণকারী এলিয়েন জাহাজ লক করে লেজার ফায়ার করুন। প্রতি ৫ লেভেলে যুক্তাক্ষরযুক্ত বস যুদ্ধ!',
        stats: [
          { label: 'হাইস্কোর', value: toBengaliNumber(stats?.space.highScore || 0) },
          { label: 'জাহাজ ধ্বংস', value: toBengaliNumber(stats?.space.shipsDestroyed || 0) },
          { label: 'তরঙ্গ', value: toBengaliNumber(stats?.space.maxLevel || 1) },
        ],
      },
      {
        id: 'racer' as GameMode,
        icon: Car,
        color: 'amber',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        iconColor: 'text-amber-500',
        badge: 'গ্র্যান্ড প্রিক্স রেস',
        badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        title: 'টাইপ দৌড় (Speed Racer)',
        desc: '৪-লেন ট্র্যাকের সাইবার রেস! টাইপিং গতি সরাসরি গাড়ির ইঞ্জিন চালায়। ৩৫+ WPM স্পিডে নাইট্রো বুস্ট সক্রিয় হয়ে জয় এনে দেয়!',
        stats: [
          { label: 'সেরা গতি', value: `${toBengaliNumber(stats?.racer.bestWpm || 0)} WPM` },
          { label: '১ম স্থান', value: toBengaliNumber(stats?.racer.firstPlaceWins || 0) },
          { label: 'ম্যাচ', value: `${toBengaliNumber(stats?.racer.gamesPlayed || 0)} টি` },
        ],
      },
    ],
    new: [
      {
        id: 'cascade' as GameMode,
        icon: ZapIcon,
        color: 'purple',
        bgColor: 'bg-purple-500/10 border-purple-500/20',
        iconColor: 'text-purple-500',
        badge: 'টেট্রিস স্টাইল',
        badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
        title: 'শব্দ ক্যাসকেড (Word Cascade)',
        desc: 'টেট্রিস-স্টাইল ব্লক ফলিং গেম! শব্দ টাইপ করে লাইন ক্লিয়ার করুন। কম্বো, লাইন ক্লিয়ার বোনাস ও পাওয়ার-আপস!',
        stats: [
          { label: 'হাইস্কোর', value: toBengaliNumber(stats?.cascade.highScore || 0) },
          { label: 'সেরা লেভেল', value: toBengaliNumber(stats?.cascade.bestLevel || 1) },
          { label: 'লাইন ক্লিয়ার', value: toBengaliNumber(stats?.cascade.totalLinesCleared || 0) },
        ],
      },
      {
        id: 'defense' as GameMode,
        icon: Castle,
        color: 'orange',
        bgColor: 'bg-orange-500/10 border-orange-500/20',
        iconColor: 'text-orange-500',
        badge: 'টাওয়ার ডিফেন্স',
        badgeColor: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
        title: 'টাইপিং ডিফেন্স (Typing Defense)',
        desc: 'টাওয়ার বিল্ড করে শত্রু দলে প্রতিরক্ষা করুন! ৪ ধরনের টাওয়ার, আপগ্রেড সিস্টেম, বস ব্যাটল ও রিসোর্স ম্যানেজমেন্ট।',
        stats: [
          { label: 'হাইস্কোর', value: toBengaliNumber(stats?.defense.highScore || 0) },
          { label: 'সেরা তরঙ্গ', value: toBengaliNumber(stats?.defense.bestWave || 1) },
          { label: 'শত্রু পরাজিত', value: toBengaliNumber(stats?.defense.enemiesDefeated || 0) },
        ],
      },
    ],
    challenge: [
      {
        id: 'speedchallenge' as GameMode,
        icon: Target,
        color: 'cyan',
        bgColor: 'bg-cyan-500/10 border-cyan-500/20',
        iconColor: 'text-cyan-500',
        badge: 'টাইমড চ্যালেঞ্জ',
        badgeColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
        title: 'স্পিড চ্যালেঞ্জ (Speed Challenge)',
        desc: 'টাইমড টাইপিং টেস্ট! শব্দ, বাক্য, প্রবাদ, সংখ্যা বা মিশ্র মোডে ৩০s-৫m পর্যন্ত। লাইভ WPM, নির্ভুলতা, পারসোনাল বেস্ট ট্র্যাকিং।',
        stats: [
          { label: 'সেরা WPM', value: `${toBengaliNumber(stats?.speedChallenge.bestWpm || 0)} WPM` },
          { label: 'সেরা নির্ভুলতা', value: `${toBengaliNumber(stats?.speedChallenge.bestAccuracy || 0)}%` },
          { label: 'মোট টেস্ট', value: toBengaliNumber(stats?.speedChallenge.gamesPlayed || 0) },
        ],
      },
    ],
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-300">
      {/* Arcade Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 p-6 sm:p-8 text-white border shadow-xl">
        <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
          <Gamepad2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-400 text-xs gap-1">
                <Sparkles className="h-3.5 w-3.5 fill-slate-950" /> বাংলা টাইপিং আর্কেড
              </Badge>
              <span className="text-xs text-indigo-200">বিনোদন ও টাইপিং অনুশীলনের মিলন — ৬টি অনন্য গেম</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-white">
              আর্কেড মোড 🎮
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed">
              একঘেয়ে মি টাইপিং অনুশীলন করতে বিলকুল চাই না? গেম খেলে বাংলা টাইপিংয়ের গতি, রিফ্লেক্স ও নির্ভুলতা বৃদ্ধি করুন।
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
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-amber-300">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">সর্বোচ্চ স্কোর</p>
                <p className="text-base font-bold font-mono text-white">
                  {toBengaliNumber(Math.max(stats.falling.highScore, stats.space.highScore, stats.cascade.highScore, stats.defense.highScore))}
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
                  {toBengaliNumber(Math.max(stats.falling.maxCombo, stats.cascade.maxCombo))}×
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

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-blue-300">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">স্পিড চ্যালেঞ্জ WPM</p>
                <p className="text-base font-bold font-mono text-white">
                  {toBengaliNumber(stats.speedChallenge.bestWpm)} WPM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10 text-rose-300">
                <Castle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-indigo-200 font-medium">ডিফেন্স তরঙ্গ</p>
                <p className="text-base font-bold font-mono text-white">
                  {toBengaliNumber(stats.defense.bestWave)}
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

      {/* Game Categories Tabs */}
      <div className="bg-card border rounded-2xl shadow-xs overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'classic' | 'new' | 'challenge')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50">
            <TabsTrigger value="classic" className="gap-2 py-2.5 text-sm font-medium">
              <Gamepad2 className="h-4 w-4" />
              ক্লাসিক গেমস
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-2 py-2.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              নতুন গেমস
            </TabsTrigger>
            <TabsTrigger value="challenge" className="gap-2 py-2.5 text-sm font-medium">
              <Target className="h-4 w-4" />
              চ্যালেঞ্জ মোড
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classic" className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {games.classic.map((game) => (
                <GameCard key={game.id} game={game} onPlay={() => setActiveGame(game.id)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {games.new.map((game) => (
                <GameCard key={game.id} game={game} onPlay={() => setActiveGame(game.id)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenge" className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-5 max-w-2xl mx-auto">
              {games.challenge.map((game) => (
                <GameCard key={game.id} game={game} onPlay={() => setActiveGame(game.id)} featured />
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
                কীবোর্ডের দিকে না তাকিয়ে স্ক্রিনের দিকে তাকিয়ে টাইপ করুন। একটানা নির্ভুল টাইপ করলে কম্বো মাল্টিপ্লায়ার বাড়ে এবং পাওয়ার-আপ দ্রুত পাওয়া যায়। প্রতিদিন ১০-১৫ মিনিট গেম খেললে টাইপিং গতি দ্রুত বাড়বে!
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3 sm:mt-0">
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/30 text-xs gap-1">
              <Clock className="h-3 w-3" /> টাইমড চ্যালেঞ্জ
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30 text-xs gap-1">
              <ZapIcon className="h-3 w-3" /> ক্যাসকেড মোড
            </Badge>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-xs gap-1">
              <Castle className="h-3 w-3" /> টাওয়ার ডিফেন্স
            </Badge>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30 text-xs gap-1">
              <Rocket className="h-3 w-3" /> স্পেস ডিফেন্ডার
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs gap-1">
              <Car className="h-3 w-3" /> স্পিড রেসার
            </Badge>
          </div>
        </div>
      </Card>

      {/* Footer CTA */}
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">
          আরও ফিচার আসছে: মাল্টিপ্লেয়ার রেস, ডেইলি চ্যালেঞ্জ, অ্যাচিভমেন্ট সিস্টেম, লিডারবোর্ড...
        </p>
      </div>
    </div>
  );
}

interface GameCardProps {
  game: {
    id: GameMode;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    iconColor: string;
    badge: string;
    badgeColor: string;
    title: string;
    desc: string;
    stats: { label: string; value: string }[];
  };
  onPlay: () => void;
  featured?: boolean;
}

function GameCard({ game, onPlay, featured = false }: GameCardProps) {
  const { icon: Icon, badge, badgeColor, title, desc, stats, bgColor, iconColor } = game;
  
  return (
    <Card className={`group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${featured ? 'md:max-w-xl mx-auto' : ''}`}>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className={`text-xs font-semibold ${badgeColor}`}>
            {badge}
          </Badge>
        </div>

        <div>
          <h2 className="text-xl font-bold font-headline group-hover:text-primary transition-colors">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {desc}
          </p>
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground grid grid-cols-3 gap-2">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 pt-0">
        <Button
          onClick={onPlay}
          className={`w-full font-bold gap-2 shadow-sm ${featured ? 'text-lg py-3' : ''}`}
          style={{
            backgroundColor: featured ? 'var(--primary)' : undefined,
            borderColor: featured ? 'var(--primary)' : undefined,
          }}
        >
          <Play className="h-4 w-4 fill-current" /> {featured ? 'চ্যালেঞ্জ শুরু করুন' : 'খেলুন'}
        </Button>
      </div>
    </Card>
  );
}