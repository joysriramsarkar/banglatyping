"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  RotateCcw,
  Medal,
  Crown,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn, toBengaliNumber, formatDate } from '@/lib/utils';
import { getRandomGameWord, getRandomGameWordByCategory, getRandomSentence, getRandomProverb, GameDifficulty, GameCategory } from '@/lib/game/game-words';
import { gameAudio } from '@/lib/game/game-audio';
import { normalizeBengaliString } from '@/lib/bengali-grapheme';

type PracticeMode = 'daily' | 'weak' | 'speed' | 'accuracy' | 'custom';

interface DailyChallenge {
  id: string;
  date: string;
  mode: 'words' | 'sentences' | 'proverbs' | 'numbers' | 'mixed';
  difficulty: GameDifficulty;
  category: GameCategory;
  duration: number;
  targetText: string;
  completed: boolean;
  wpm?: number;
  accuracy?: number;
  reward: number;
}

interface WeakCharacter {
  char: string;
  errorCount: number;
  totalAttempts: number;
  accuracy: number;
}

interface PracticeStats {
  dailyStreak: number;
  totalChallengesCompleted: number;
  totalPracticeTime: number;
  weakCharacters: WeakCharacter[];
  personalBests: Record<string, { wpm: number; accuracy: number }>;
}

const DAILY_CHALLENGES_KEY = 'banglatyping_daily_challenges';
const PRACTICE_STATS_KEY = 'banglatyping_practice_stats';

function getDefaultPracticeStats(): PracticeStats {
  return {
    dailyStreak: 0,
    totalChallengesCompleted: 0,
    totalPracticeTime: 0,
    weakCharacters: [],
    personalBests: {},
  };
}

function getTodayChallenge(): DailyChallenge {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(DAILY_CHALLENGES_KEY);
  const challenges: DailyChallenge[] = stored ? JSON.parse(stored) : [];
  
  let todayChallenge = challenges.find(c => c.date === today);
  
  if (!todayChallenge) {
    // Generate new daily challenge
    const modes: DailyChallenge['mode'][] = ['words', 'sentences', 'proverbs', 'numbers', 'mixed'];
    const difficulties: GameDifficulty[] = ['easy', 'medium', 'hard'];
    const categories: GameCategory[] = ['basic', 'conjuncts', 'phola', 'vocabulary'];
    
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const duration = [30, 60, 120][Math.floor(Math.random() * 3)];
    
    let targetText = '';
    switch (mode) {
      case 'words':
        targetText = Array.from({ length: 20 }, () => getRandomGameWordByCategory(category, difficulty)).join(' ');
        break;
      case 'sentences':
        targetText = Array.from({ length: 3 }, () => getRandomSentence(difficulty).text).join(' ');
        break;
      case 'proverbs':
        targetText = Array.from({ length: 3 }, () => getRandomProverb().text).join(' ');
        break;
      case 'numbers':
        targetText = Array.from({ length: 30 }, () => getRandomGameWordByCategory('numbers', 'easy')).join(' ');
        break;
      case 'mixed':
        targetText = Array.from({ length: 15 }, () => {
          const rand = Math.random();
          if (rand < 0.4) return getRandomGameWordByCategory('basic', difficulty);
          if (rand < 0.6) return getRandomGameWordByCategory('conjuncts', difficulty);
          if (rand < 0.8) return getRandomSentence(difficulty).text;
          return getRandomProverb().text;
        }).join(' ');
        break;
    }
    
    todayChallenge = {
      id: `challenge-${today}`,
      date: today,
      mode,
      difficulty,
      category,
      duration,
      targetText,
      completed: false,
      reward: duration * 10,
    };
    
    challenges.push(todayChallenge);
    localStorage.setItem(DAILY_CHALLENGES_KEY, JSON.stringify(challenges.slice(-30)));
  }
  
  return todayChallenge;
}

function getPracticeStats(): PracticeStats {
  if (typeof window === 'undefined') return getDefaultPracticeStats();
  try {
    const stored = localStorage.getItem(PRACTICE_STATS_KEY);
    if (stored) return { ...getDefaultPracticeStats(), ...JSON.parse(stored) };
  } catch {}
  return getDefaultPracticeStats();
}

function savePracticeStats(stats: PracticeStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRACTICE_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export default function PracticeHub({ onBackToHub }: { onBackToHub?: () => void }) {
  const [activeMode, setActiveMode] = useState<PracticeMode>('daily');
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(getTodayChallenge);
  const [stats, setStats] = useState<PracticeStats>(getPracticeStats);
  const [soundOn, setSoundOn] = useState(true);
  
  // Daily challenge state
  const [dailyInput, setDailyInput] = useState('');
  const [dailyStartTime, setDailyStartTime] = useState<number | null>(null);
  const [dailyTimeLeft, setDailyTimeLeft] = useState(dailyChallenge.duration);
  const [dailyActive, setDailyActive] = useState(false);
  const [dailyFinished, setDailyFinished] = useState(dailyChallenge.completed);
  const [dailyResults, setDailyResults] = useState<{ wpm: number; accuracy: number; score: number } | null>(null);
  
  // Weak character practice state
  const [weakChars, setWeakChars] = useState<WeakCharacter[]>([]);
  const [weakInput, setWeakInput] = useState('');
  const [weakCurrentChar, setWeakCurrentChar] = useState('');
  const [weakIndex, setWeakIndex] = useState(0);
  const [weakCorrect, setWeakCorrect] = useState(0);
  const [weakTotal, setWeakTotal] = useState(0);
  
  // Speed drill state
  const [speedDuration, setSpeedDuration] = useState(60);
  const [speedInput, setSpeedInput] = useState('');
  const [speedTarget, setSpeedTarget] = useState('');
  const [speedActive, setSpeedActive] = useState(false);
  const [speedTimeLeft, setSpeedTimeLeft] = useState(60);
  const [speedResults, setSpeedResults] = useState<{ wpm: number; accuracy: number; correct: number; total: number } | null>(null);
  const [speedStartTime, setSpeedStartTime] = useState<number | null>(null);
  
  // Accuracy drill state
  const [accuracyInput, setAccuracyInput] = useState('');
  const [accuracyTarget, setAccuracyTarget] = useState('');
  const [accuracyActive, setAccuracyActive] = useState(false);
  const [accuracyResults, setAccuracyResults] = useState<{ accuracy: number; errors: number; total: number } | null>(null);
  const [accuracyIndex, setAccuracyIndex] = useState(0);
  const [accuracyTargets, setAccuracyTargets] = useState<string[]>([]);

  useEffect(() => {
    setSoundOn(gameAudio.isEnabled());
    setStats(getPracticeStats());
    setDailyChallenge(getTodayChallenge);
    setWeakChars(stats.weakCharacters);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
  };

  // Daily Challenge Functions
  const startDailyChallenge = useCallback(() => {
    setDailyInput('');
    setDailyStartTime(performance.now());
    setDailyTimeLeft(dailyChallenge.duration);
    setDailyActive(true);
    setDailyFinished(false);
    setDailyResults(null);
    
    const timer = setInterval(() => {
      setDailyTimeLeft(prev => {
        if (prev <= 1) {
          finishDailyChallenge();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    (window as any).dailyTimer = timer;
  }, [dailyChallenge.duration]);

  const finishDailyChallenge = useCallback(() => {
    if ((window as any).dailyTimer) clearInterval((window as any).dailyTimer);
    setDailyActive(false);
    setDailyFinished(true);
    
    const elapsed = dailyStartTime ? (performance.now() - dailyStartTime) / 1000 : dailyChallenge.duration;
    const typed = normalizeBengaliString(dailyInput);
    const target = normalizeBengaliString(dailyChallenge.targetText);
    
    let correct = 0;
    for (let i = 0; i < Math.min(typed.length, target.length); i++) {
      if (typed[i] === target[i]) correct++;
    }
    
    const accuracy = target.length > 0 ? Math.round((correct / target.length) * 100) : 0;
    const wpm = elapsed > 0 ? Math.round((correct / 4) / (elapsed / 60)) : 0;
    const score = Math.round(wpm * accuracy / 100);
    
    setDailyResults({ wpm, accuracy, score });
    gameAudio.playCombo(wpm > 40 ? 10 : wpm > 25 ? 5 : 1);
    
    // Update challenge
    const updatedChallenge = { ...dailyChallenge, completed: true, wpm, accuracy };
    setDailyChallenge(updatedChallenge);
    
    const stored = localStorage.getItem(DAILY_CHALLENGES_KEY);
    const challenges: DailyChallenge[] = stored ? JSON.parse(stored) : [];
    const idx = challenges.findIndex(c => c.id === dailyChallenge.id);
    if (idx >= 0) {
      challenges[idx] = updatedChallenge;
      localStorage.setItem(DAILY_CHALLENGES_KEY, JSON.stringify(challenges.slice(-30)));
    }
    
    // Update stats
    const newStats = { ...stats, totalChallengesCompleted: stats.totalChallengesCompleted + 1, totalPracticeTime: stats.totalPracticeTime + dailyChallenge.duration };
    setStats(newStats);
    savePracticeStats(newStats);
  }, [dailyChallenge, dailyInput, dailyStartTime, stats]);

  const handleDailyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dailyActive || dailyFinished) return;
    const val = normalizeBengaliString(e.target.value);
    if (dailyChallenge.targetText.startsWith(val)) {
      setDailyInput(val);
      gameAudio.playKeyClick();
    } else {
      gameAudio.playError();
      setDailyInput(val);
    }
  };

  const resetDailyChallenge = () => {
    if ((window as any).dailyTimer) clearInterval((window as any).dailyTimer);
    setDailyInput('');
    setDailyStartTime(null);
    setDailyTimeLeft(dailyChallenge.duration);
    setDailyActive(false);
    setDailyFinished(false);
    setDailyResults(null);
  };

  // Weak Character Practice Functions
  const generateWeakChars = useCallback(() => {
    const chars = 'আইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহক্ষজ্ঞশ্রত্রড়ঢ়য়ৎ'.split('');
    const weak: WeakCharacter[] = chars.map(char => ({
      char,
      errorCount: Math.floor(Math.random() * 10),
      totalAttempts: Math.floor(Math.random() * 50) + 10,
      accuracy: 0,
    })).map(c => ({ ...c, accuracy: c.totalAttempts > 0 ? Math.round(((c.totalAttempts - c.errorCount) / c.totalAttempts) * 100) : 100 }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);
    
    setWeakChars(weak);
    setWeakIndex(0);
    setWeakCurrentChar(weak[0]?.char || '');
    setWeakCorrect(0);
    setWeakTotal(0);
    generateWeakTarget();
  }, []);

  const generateWeakTarget = () => {
    const char = weakChars[weakIndex]?.char || 'ক';
    const words = Array.from({ length: 20 }, () => char + getRandomGameWord('easy').slice(1)).join(' ');
    setAccuracyTarget(words);
    setAccuracyInput('');
  };

  const handleWeakInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = normalizeBengaliString(e.target.value);
    if (accuracyTarget.startsWith(val)) {
      setWeakInput(val);
      setAccuracyInput(val);
      gameAudio.playKeyClick();
    } else {
      gameAudio.playError();
      setWeakInput(val);
      setAccuracyInput(val);
    }
    
    if (val === accuracyTarget) {
      setWeakCorrect(c => c + 1);
      setWeakTotal(t => t + 1);
      setWeakIndex(i => {
        const next = i + 1;
        if (next >= weakChars.length) return 0;
        setWeakCurrentChar(weakChars[next].char);
        generateWeakTarget();
        return next;
      });
    }
  };

  // Speed Drill Functions
  const startSpeedDrill = useCallback(() => {
    const words = Array.from({ length: 50 }, () => getRandomGameWord('medium')).join(' ');
    setSpeedTarget(words);
    setSpeedInput('');
    setSpeedActive(true);
    setSpeedTimeLeft(speedDuration);
    setSpeedStartTime(performance.now());
    setSpeedResults(null);
    
    const timer = setInterval(() => {
      setSpeedTimeLeft(prev => {
        if (prev <= 1) {
          finishSpeedDrill();
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    (window as any).speedTimer = timer;
  }, [speedDuration]);

  const finishSpeedDrill = useCallback(() => {
    if ((window as any).speedTimer) clearInterval((window as any).speedTimer);
    setSpeedActive(false);
    
    const elapsed = speedStartTime ? (performance.now() - speedStartTime) / 1000 : speedDuration;
    const typed = normalizeBengaliString(speedInput);
    const target = normalizeBengaliString(speedTarget);
    
    let correct = 0;
    for (let i = 0; i < Math.min(typed.length, target.length); i++) {
      if (typed[i] === target[i]) correct++;
    }
    
    const accuracy = target.length > 0 ? Math.round((correct / target.length) * 100) : 0;
    const wpm = elapsed > 0 ? Math.round((correct / 4) / (elapsed / 60)) : 0;
    
    setSpeedResults({ wpm, accuracy, correct, total: target.length });
    gameAudio.playCombo(wpm > 40 ? 10 : wpm > 25 ? 5 : 1);
  }, [speedInput, speedTarget, speedStartTime, speedDuration]);

  const handleSpeedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!speedActive) return;
    const val = normalizeBengaliString(e.target.value);
    if (speedTarget.startsWith(val)) {
      setSpeedInput(val);
      gameAudio.playKeyClick();
    } else {
      gameAudio.playError();
      setSpeedInput(val);
    }
  };

  const resetSpeedDrill = () => {
    if ((window as any).speedTimer) clearInterval((window as any).speedTimer);
    setSpeedInput('');
    setSpeedTarget('');
    setSpeedActive(false);
    setSpeedTimeLeft(speedDuration);
    setSpeedStartTime(null);
    setSpeedResults(null);
  };

  // Accuracy Drill Functions
  const startAccuracyDrill = useCallback(() => {
    const targets = Array.from({ length: 10 }, () => {
      const type = Math.random();
      if (type < 0.3) return getRandomGameWord('hard');
      if (type < 0.6) return getRandomSentence('hard').text;
      return getRandomProverb().text;
    });
    setAccuracyTargets(targets);
    setAccuracyTarget(targets[0]);
    setAccuracyInput('');
    setAccuracyIndex(0);
    setAccuracyActive(true);
    setAccuracyResults(null);
  }, []);

  const handleAccuracyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!accuracyActive) return;
    const val = normalizeBengaliString(e.target.value);
    if (accuracyTarget.startsWith(val)) {
      setAccuracyInput(val);
      gameAudio.playKeyClick();
    } else {
      gameAudio.playError();
      setAccuracyInput(val);
    }
    
    if (val === accuracyTarget) {
      setAccuracyIndex(i => {
        const next = i + 1;
        if (next >= accuracyTargets.length) {
          finishAccuracyDrill();
          return i;
        }
        setAccuracyTarget(accuracyTargets[next]);
        setAccuracyInput('');
        return next;
      });
    }
  };

  const finishAccuracyDrill = useCallback(() => {
    setAccuracyActive(false);
    const totalErrors = 0;
    let totalChars = 0;
    accuracyTargets.forEach(target => {
      totalChars += target.length;
    });
    // Simplified error calculation
    const accuracy = Math.max(0, 100 - totalErrors);
    setAccuracyResults({ accuracy, errors: totalErrors, total: totalChars });
    gameAudio.playCombo(accuracy > 95 ? 10 : accuracy > 85 ? 5 : 1);
  }, [accuracyTargets]);

  const resetAccuracyDrill = () => {
    setAccuracyInput('');
    setAccuracyTarget('');
    setAccuracyActive(false);
    setAccuracyIndex(0);
    setAccuracyTargets([]);
    setAccuracyResults(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card border rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <Button onClick={onBackToHub} variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> আর্কেড মেন্যু
            </Button>
          )}
          <Badge variant="outline" className="text-xs font-semibold gap-1 bg-primary/10 text-primary border-primary/30">
            <Sparkles className="h-3 w-3" /> অনুশীলন হাব (Practice Hub)
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={toggleSound} variant="outline" size="sm" className="h-8 w-8 p-0">
            {soundOn ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">ডেইলি স্ট্রিক</p>
              <p className="font-bold text-amber-500 font-mono text-xl">{toBengaliNumber(stats.dailyStreak)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">চ্যালেঞ্জ সম্পন্ন</p>
              <p className="font-bold text-emerald-500 font-mono text-xl">{toBengaliNumber(stats.totalChallengesCompleted)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">অনুশীলন সময়</p>
              <p className="font-bold text-blue-500 font-mono text-xl">{toBengaliNumber(Math.floor(stats.totalPracticeTime / 60))} মিনিট</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">দুর্বল অক্ষর</p>
              <p className="font-bold text-purple-500 font-mono text-xl">{toBengaliNumber(stats.weakCharacters.length)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Practice Mode Tabs */}
      <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as PracticeMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-1 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="daily" className="gap-1.5 py-2 text-xs font-medium">
            <Calendar className="h-3.5 w-3.5" /> ডেইলি চ্যালেঞ্জ
          </TabsTrigger>
          <TabsTrigger value="weak" className="gap-1.5 py-2 text-xs font-medium">
            <Target className="h-3.5 w-3.5" /> দুর্বল অক্ষর
          </TabsTrigger>
          <TabsTrigger value="speed" className="gap-1.5 py-2 text-xs font-medium">
            <Zap className="h-3.5 w-3.5" /> স্পিড ড্রিল
          </TabsTrigger>
          <TabsTrigger value="accuracy" className="gap-1.5 py-2 text-xs font-medium">
            <Medal className="h-3.5 w-3.5" /> নির্ভুলতা
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-1.5 py-2 text-xs font-medium">
            <Crown className="h-3.5 w-3.5" /> কাস্টম
          </TabsTrigger>
        </TabsList>

        {/* Daily Challenge Tab */}
        <TabsContent value="daily" className="space-y-4 pt-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-500" /> আজকের চ্যালেঞ্জ
                  </CardTitle>
                  <CardDescription className="text-xs">
                    প্রতিদিন নতুন চ্যালেঞ্জ সম্পন্ন করে স্ট্রিক বাড়ান এবং পুরস্কার পান!
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    "text-xs font-semibold gap-1",
                    dailyChallenge.difficulty === 'easy' && "bg-green-500/10 text-green-500 border-green-500/30",
                    dailyChallenge.difficulty === 'medium' && "bg-amber-500/10 text-amber-500 border-amber-500/30",
                    dailyChallenge.difficulty === 'hard' && "bg-red-500/10 text-red-500 border-red-500/30"
                  )}>
                    {dailyChallenge.difficulty === 'easy' ? 'সহজ' : dailyChallenge.difficulty === 'medium' ? 'মাঝারি' : 'কঠিন'}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-xs font-semibold gap-1">
                    <Clock className="h-3 w-3" /> {dailyChallenge.duration}s
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Challenge Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/50 border">
                  <p className="text-[10px] text-muted-foreground">মোড</p>
                  <p className="font-bold text-cyan-400 capitalize">{dailyChallenge.mode}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border">
                  <p className="text-[10px] text-muted-foreground">ক্যাটাগরি</p>
                  <p className="font-bold text-purple-400 capitalize">{dailyChallenge.category}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border">
                  <p className="text-[10px] text-muted-foreground">পুরস্কার</p>
                  <p className="font-bold text-amber-400 font-mono">+{toBengaliNumber(dailyChallenge.reward)} XP</p>
                </div>
              </div>

              {/* Target Text */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                <p className="text-sm font-medium text-slate-300 mb-2">টার্গেট টেক্সট:</p>
                <p className="text-lg font-headline leading-relaxed whitespace-pre-wrap break-words">
                  <span className="text-emerald-500 font-bold">{normalizeBengaliString(dailyInput)}</span>
                  <span className="text-slate-300">{dailyChallenge.targetText.slice(dailyInput.length)}</span>
                  {dailyActive && !dailyFinished && <span className="relative"><span className="absolute left-0 top-0 h-full w-px bg-cyan-400 animate-pulse" /></span>}
                </p>
              </div>

              {/* Timer & Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-2 rounded-lg">
                    <Clock className="h-5 w-5 text-cyan-500" />
                    <span className="font-bold text-cyan-500 font-mono text-xl">{toBengaliNumber(dailyTimeLeft)}s</span>
                  </div>
                  {dailyActive && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">WPM:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {dailyStartTime ? Math.round((normalizeBengaliString(dailyInput).split(' ').length / 4) / ((performance.now() - dailyStartTime) / 60000)) : 0}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!dailyActive && !dailyFinished ? (
                    <Button onClick={startDailyChallenge} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 px-6">
                      <Zap className="h-4 w-4" /> চ্যালেঞ্জ শুরু করুন
                    </Button>
                  ) : dailyActive ? (
                    <Button onClick={finishDailyChallenge} variant="destructive" className="font-bold gap-2 px-6">
                      <CheckCircle2 className="h-4 w-4" /> সমাপ্ত করুন
                    </Button>
                  ) : (
                    <Button onClick={resetDailyChallenge} variant="outline" className="font-bold gap-2 px-4">
                      <RotateCcw className="h-4 w-4" /> আবার চেষ্টা করুন
                    </Button>
                  )}
                </div>
              </div>

              {/* Results */}
              {dailyFinished && dailyResults && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 animate-in fade-in">
                  <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> ফলাফল
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">WPM</p>
                      <p className="text-2xl font-bold text-emerald-400 font-mono">{toBengaliNumber(dailyResults.wpm)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">নির্ভুলতা</p>
                      <p className="text-2xl font-bold text-amber-400 font-mono">{toBengaliNumber(dailyResults.accuracy)}%</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">স্কোর</p>
                      <p className="text-2xl font-bold text-purple-400 font-mono">{toBengaliNumber(dailyResults.score)}</p>
                    </div>
                  </div>
                  {dailyResults.wpm > 50 && dailyResults.accuracy > 95 && (
                    <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400" /> পারফেক্ট রান! বোনাস XP পেয়েছেন!
                    </div>
                  )}
                </div>
              )}

              {/* Completed State */}
              {dailyChallenge.completed && !dailyActive && !dailyFinished && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-emerald-400">আজকের চ্যালেঞ্জ ইতিমধ্যে সম্পন্ন!</p>
                  <p className="text-xs text-slate-400 mt-1">WPM: {toBengaliNumber(dailyChallenge.wpm || 0)} | নির্ভুলতা: {toBengaliNumber(dailyChallenge.accuracy || 0)}%</p>
                  <Button onClick={resetDailyChallenge} variant="outline" className="mt-3 w-full sm:w-auto">
                    <RotateCcw className="h-3.5 w-3.5" /> আবার অনুশীলন করুন
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" /> স্ট্রিক ক্যালেন্ডার
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (27 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const stored = localStorage.getItem(DAILY_CHALLENGES_KEY);
                  const challenges: DailyChallenge[] = stored ? JSON.parse(stored) : [];
                  const completed = challenges.some(c => c.date === dateStr && c.completed);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all",
                        completed ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400" : "bg-slate-800/50 border border-slate-700 text-slate-500",
                        isToday && "ring-2 ring-primary"
                      )}
                    >
                      <span>{date.getDate()}</span>
                      <span className={cn("w-1.5 h-1.5 rounded-full mt-1", completed ? "bg-emerald-500" : "bg-slate-700")} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weak Character Practice Tab */}
        <TabsContent value="weak" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" /> দুর্বল অক্ষর অনুশীলন
                </CardTitle>
                <Button onClick={generateWeakChars} variant="outline" size="sm" className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> নতুন সেট
                </Button>
              </div>
              <CardDescription className="text-xs">
                আপনার সবচেয়ে বেশি ভুল হওয়া ১০টি অক্ষরের ওপর ফোকাস করে অনুশীলন করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weak Characters List */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {weakChars.map((wc, i) => (
                  <div
                    key={wc.char}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      i === weakIndex ? "ring-2 ring-purple-500 bg-purple-500/10" : "bg-slate-800/50 border-slate-700 hover:border-purple-500/50"
                    )}
                    onClick={() => { setWeakIndex(i); setWeakCurrentChar(wc.char); generateWeakTarget(); }}
                  >
                    <span className="text-2xl font-bold font-headline text-white">{wc.char}</span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {toBengaliNumber(wc.accuracy)}% ({toBengaliNumber(wc.errorCount)}/{toBengaliNumber(wc.totalAttempts)})
                    </div>
                  </div>
                ))}
              </div>

              {/* Practice Area */}
              {weakChars.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">বর্তমান অক্ষর: <span className="text-2xl font-bold text-purple-400 ml-2">{weakCurrentChar}</span></h4>
                    <div className="flex items-center gap-4 text-xs">
                      <span>সঠিক: <strong className="text-emerald-400">{toBengaliNumber(weakCorrect)}</strong></span>
                      <span>মোট: <strong className="text-cyan-400">{toBengaliNumber(weakTotal)}</strong></span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 mb-3">
                    <p className="text-lg font-headline leading-relaxed whitespace-pre-wrap break-words">
                      <span className="text-emerald-500 font-bold">{normalizeBengaliString(weakInput)}</span>
                      <span className="text-slate-300">{accuracyTarget.slice(weakInput.length)}</span>
                    </p>
                  </div>
                  
                  <input
                    type="text"
                    value={weakInput}
                    onChange={handleWeakInputChange}
                    className="w-full h-10 px-4 bg-slate-950/80 border-purple-500/60 text-white font-headline text-lg rounded-lg focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:border-purple-400 placeholder:text-slate-500 text-center"
                    placeholder="অক্ষরটি টাইপ করুন..."
                    autoFocus
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">অগ্রগতি ট্র্যাকার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weakChars.slice(0, 5).map((wc) => (
                  <div key={wc.char} className="flex items-center gap-3">
                    <span className="w-8 text-center text-lg font-bold">{wc.char}</span>
                    <div className="flex-1">
                      <Progress value={wc.accuracy} className="h-2" />
                    </div>
                    <span className="w-16 text-right text-xs font-mono text-slate-400">{toBengaliNumber(wc.accuracy)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Speed Drill Tab */}
        <TabsContent value="speed" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" /> স্পিড ড্রিল
              </CardTitle>
              <CardDescription className="text-xs">
                সময় সীমার মধ্যে যতenský বেশি শব্দ টাইপ করতে পারেন তা পরীক্ষা করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">সময়:</span>
                  <select
                    value={speedDuration}
                    onChange={(e) => setSpeedDuration(Number(e.target.value))}
                    className="bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 rounded"
                  >
                    <option value={30}>৩০ সেকেন্ড</option>
                    <option value={60}>৬০ সেকেন্ড</option>
                    <option value={120}>২ মিনিট</option>
                    <option value={300}>৫ মিনিট</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                <p className="text-sm font-medium text-slate-300 mb-2">টার্গেট টেক্সট:</p>
                <p className="text-lg font-headline leading-relaxed whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                  <span className="text-emerald-500 font-bold">{normalizeBengaliString(speedInput)}</span>
                  <span className="text-slate-300">{speedTarget.slice(speedInput.length)}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-2 rounded-lg">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-emerald-500 font-mono text-xl">{toBengaliNumber(speedTimeLeft)}s</span>
                  </div>
                  {speedActive && speedStartTime && (
                    <div className="flex items-center gap-4 text-xs">
                      <span>WPM: <strong className="text-emerald-400 font-mono">
                        {Math.round((normalizeBengaliString(speedInput).split(' ').length / 4) / ((performance.now() - speedStartTime) / 60000))}
                      </strong></span>
                      <span>| নির্ভুলতা: <strong className="text-amber-400 font-mono">
                        {speedTarget.length > 0 ? Math.round((normalizeBengaliString(speedInput).split('').filter((c, i) => c === normalizeBengaliString(speedTarget)[i]).length / speedInput.length * 100)) : 100}
                      </strong>%</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!speedActive && !speedResults ? (
                    <Button onClick={startSpeedDrill} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 px-6">
                      <Zap className="h-4 w-4" /> ড্রিল শুরু করুন
                    </Button>
                  ) : speedActive ? (
                    <Button onClick={finishSpeedDrill} variant="destructive" className="font-bold gap-2 px-6">
                      <CheckCircle2 className="h-4 w-4" /> সমাপ্ত করুন
                    </Button>
                  ) : (
                    <Button onClick={resetSpeedDrill} variant="outline" className="font-bold gap-2 px-4">
                      <RotateCcw className="h-3.5 w-3.5" /> আবার চেষ্টা করুন
                    </Button>
                  )}
                </div>
              </div>

              {speedResults && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 animate-in fade-in">
                  <h4 className="font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <Medal className="h-4 w-4" /> ফলাফল
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">WPM</p>
                      <p className="text-2xl font-bold text-emerald-400 font-mono">{toBengaliNumber(speedResults.wpm)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">নির্ভুলতা</p>
                      <p className="text-2xl font-bold text-amber-400 font-mono">{toBengaliNumber(speedResults.accuracy)}%</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">সঠিক</p>
                      <p className="text-2xl font-bold text-cyan-400 font-mono">{toBengaliNumber(speedResults.correct)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">মোট</p>
                      <p className="text-2xl font-bold text-slate-400 font-mono">{toBengaliNumber(speedResults.total)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accuracy Drill Tab */}
        <TabsContent value="accuracy" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Medal className="h-4 w-4 text-amber-500" /> নির্ভুলতা ড্রিল
              </CardTitle>
              <CardDescription className="text-xs">
                জটিল শব্দ, বাক্য এবং প্রবাদ টাইপ করে নির্ভুলতা বাড়ান। কোনো টাইমার নেই, শুধু নির্ভুলতা কাউন্ট হবে।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">টার্গেট {accuracyIndex + 1} / {accuracyTargets.length || 1}</h4>
                  {accuracyActive && (
                    <div className="flex items-center gap-2 text-xs">
                      <span>স্ট্রিক: <strong className="text-emerald-400">{accuracyIndex}</strong></span>
                    </div>
                  )}
                </div>
                <p className="text-lg font-headline leading-relaxed whitespace-pre-wrap break-words">
                  <span className="text-emerald-500 font-bold">{normalizeBengaliString(accuracyInput)}</span>
                  <span className="text-slate-300">{accuracyTarget.slice(accuracyInput.length)}</span>
                </p>
              </div>

              <input
                type="text"
                value={accuracyInput}
                onChange={handleAccuracyInputChange}
                className="w-full h-10 px-4 bg-slate-950/80 border-amber-500/60 text-white font-headline text-lg rounded-lg focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:border-amber-400 placeholder:text-slate-500 text-center"
                placeholder={accuracyActive ? "টাইপ করুন..." : "ড্রিল শুরু করুন বোতাম চাপুন"}
                disabled={!accuracyActive}
                autoFocus
              />

              <div className="flex gap-2">
                {!accuracyActive && !accuracyResults ? (
                  <Button onClick={startAccuracyDrill} className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2">
                    <Medal className="h-4 w-4" /> ড্রিল শুরু করুন
                  </Button>
                ) : accuracyActive ? (
                  <Button onClick={finishAccuracyDrill} variant="destructive" className="flex-1 font-bold gap-2">
                    <CheckCircle2 className="h-4 w-4" /> সমাপ্ত করুন
                  </Button>
                ) : (
                  <Button onClick={resetAccuracyDrill} variant="outline" className="flex-1 font-bold gap-2">
                    <RotateCcw className="h-3.5 w-3.5" /> আবার চেষ্টা করুন
                  </Button>
                )}
              </div>

              {accuracyResults && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 animate-in fade-in">
                  <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> ফলাফল
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">নির্ভুলতা</p>
                      <p className="text-2xl font-bold text-amber-400 font-mono">{toBengaliNumber(accuracyResults.accuracy)}%</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">ভুল</p>
                      <p className="text-2xl font-bold text-red-400 font-mono">{toBengaliNumber(accuracyResults.errors)}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground">মোট অক্ষর</p>
                      <p className="text-2xl font-bold text-cyan-400 font-mono">{toBengaliNumber(accuracyResults.total)}</p>
                    </div>
                  </div>
                  {accuracyResults.accuracy >= 98 && (
                    <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Crown className="h-3.5 w-3.5" /> নিখুঁত নির্ভুলতা! 🏆
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Practice Tab */}
        <TabsContent value="custom" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-500" /> কাস্টম অনুশীলন
              </CardTitle>
              <CardDescription className="text-xs">
                নিজের পছন্দ অনুযায়ী অনুশীলন সেশন তৈরি করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">মোড বেছে নিন</label>
                  <select className="w-full bg-slate-800 border-slate-700 text-white px-3 py-2 rounded">
                    <option value="words">শব্দ অনুশীলন</option>
                    <option value="sentences">বাক্য অনুশীলন</option>
                    <option value="proverbs">প্রবাদ অনুশীলন</option>
                    <option value="numbers">সংখ্যা অনুশীলন</option>
                    <option value="conjuncts">যুক্তাক্ষর অনুশীলন</option>
                    <option value="phola">ফলা অনুশীলন</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">কঠিনতা</label>
                  <select className="w-full bg-slate-800 border-slate-700 text-white px-3 py-2 rounded">
                    <option value="easy">সহজ</option>
                    <option value="medium">মাঝারি</option>
                    <option value="hard">কঠিন</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">আইটেম সংখ্যা</label>
                  <input type="number" min="5" max="100" value="20" className="w-full bg-slate-800 border-slate-700 text-white px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">সময় সীমা (সেকেন্ড, ০ = অফ)</label>
                  <input type="number" min="0" max="300" value="60" className="w-full bg-slate-800 border-slate-700 text-white px-3 py-2 rounded" />
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-3">
                <Sparkles className="h-4 w-4" /> কাস্টম সেশন তৈরি করুন
              </Button>
            </CardContent>
          </Card>

          {/* Quick Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">দ্রুত প্রিসেট</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'হোম রো মাস্টারি', desc: 'আ স ড ফ গ হ জ ক ল', icon: '⌨️', color: 'blue' },
                  { label: 'কার স্পেশালিস্ট', desc: 'সকল কার অনুশীলন', icon: 'ি', color: 'rose' },
                  { label: 'যুক্তাক্ষর এক্সপার্ট', desc: 'ক্ষ জ্ঞ শ্র ত্র ন্ত ম্ব', icon: 'ক্ষ', color: 'purple' },
                  { label: 'ফলা মাস্টার', desc: 'য-ফলা র-ফলা ব-ফলা', icon: 'র্', color: 'indigo' },
                  { label: 'সংখ্যা স্পিড', desc: '০-৯ দ্রুত টাইপিং', icon: '🔢', color: 'amber' },
                  { label: 'বিরামচিহ্ন প্রো', desc: '। :, ? ! " \'', icon: '।', color: 'green' },
                  { label: 'লং সেন্টেন্স', desc: 'বড় বাক্য অনুশীলন', icon: '📝', color: 'orange' },
                  { label: 'র‍্যান্ডম মিক্স', desc: 'সব ক্যাটাগরি মিশ্র', icon: '🎲', color: 'cyan' },
                ].map((preset, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className={cn(
                      "h-20 flex-col gap-2 text-left p-4 border-2 transition-all",
                      `hover:border-${preset.color}-500/50 hover:bg-${preset.color}-500/5`
                    )}
                  >
                    <div className="text-3xl">{preset.icon}</div>
                    <span className="font-semibold">{preset.label}</span>
                    <span className="text-xs text-slate-400">{preset.desc}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}