"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Trophy, 
  Zap, 
  Timer,
  Target,
  Flag,
  Medal,
  Sparkles,
  TrendingUp,
  Crown,
  Star,
  Heart
} from 'lucide-react';
import { cn, toBengaliNumber } from '@/lib/utils';
import { getRandomGameWord, getRandomGameWordByCategory, getRandomSentence, getRandomProverb, GameDifficulty, GameCategory } from '@/lib/game/game-words';
import { gameAudio } from '@/lib/game/game-audio';
import { recordSpeedChallengeResult, getArcadeStats } from '@/lib/game/score-store';
import { normalizeBengaliString } from '@/lib/bengali-grapheme';

type ChallengeMode = 'words' | 'sentences' | 'proverbs' | 'numbers' | 'mixed';
type ChallengeDuration = 30 | 60 | 120 | 300;

interface ChallengeResult {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  errors: number;
  timeElapsed: number;
  mode: ChallengeMode;
  duration: ChallengeDuration;
}

export default function SpeedChallengeGame({ onBackToHub }: { onBackToHub?: () => void }) {
  const [mode, setMode] = useState<ChallengeMode>('words');
  const [duration, setDuration] = useState<ChallengeDuration>(60);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [category, setCategory] = useState<GameCategory>('basic');
  
  const [currentText, setCurrentText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<ChallengeResult | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [stats, setStats] = useState<{ bestWpm: number; bestAccuracy: number; totalTests: number } | null>(null);
  const [personalBests, setPersonalBests] = useState<Record<ChallengeMode, { wpm: number; accuracy: number }>>({
    words: { wpm: 0, accuracy: 0 },
    sentences: { wpm: 0, accuracy: 0 },
    proverbs: { wpm: 0, accuracy: 0 },
    numbers: { wpm: 0, accuracy: 0 },
    mixed: { wpm: 0, accuracy: 0 },
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const targetTextRef = useRef<string>('');

  useEffect(() => {
    setSoundOn(gameAudio.isEnabled());
    const s = getArcadeStats();
    setStats({ bestWpm: s.racer.bestWpm, bestAccuracy: 0, totalTests: s.racer.gamesPlayed });
    
    // Load personal bests from localStorage
    try {
      const saved = localStorage.getItem('speed-challenge-bests');
      if (saved) setPersonalBests(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
  };

  const generateTargetText = useCallback((): string => {
    switch (mode) {
      case 'words': {
        const count = duration <= 30 ? 15 : duration <= 60 ? 30 : 50;
        const words = Array.from({ length: count }, () => 
          getRandomGameWordByCategory(category, difficulty)
        );
        return words.join(' ');
      }
      case 'sentences': {
        const count = duration <= 30 ? 2 : duration <= 60 ? 4 : 8;
        const sentences = Array.from({ length: count }, () => 
          getRandomSentence(difficulty).text
        );
        return sentences.join(' ');
      }
      case 'proverbs': {
        const count = duration <= 30 ? 3 : duration <= 60 ? 5 : 10;
        const proverbs = Array.from({ length: count }, () => 
          getRandomProverb().text
        );
        return proverbs.join(' ');
      }
      case 'numbers': {
        const count = duration <= 30 ? 20 : duration <= 60 ? 40 : 80;
        const numbers = Array.from({ length: count }, () => 
          getRandomGameWordByCategory('numbers', 'easy')
        );
        return numbers.join(' ');
      }
      case 'mixed': {
        const count = duration <= 30 ? 12 : duration <= 60 ? 25 : 45;
        const items = Array.from({ length: count }, () => {
          const rand = Math.random();
          if (rand < 0.4) return getRandomGameWordByCategory('basic', difficulty);
          if (rand < 0.6) return getRandomGameWordByCategory('conjuncts', difficulty);
          if (rand < 0.8) return getRandomSentence(difficulty).text;
          return getRandomProverb().text;
        });
        return items.join(' ');
      }
    }
  }, [mode, duration, category, difficulty]);

  const startTest = useCallback(() => {
    const text = generateTargetText();
    const normalized = normalizeBengaliString(text);
    
    setTargetText(normalized);
    setCurrentText(normalized);
    setTypedInput('');
    setStartTime(null);
    setEndTime(null);
    setTimeLeft(duration);
    setIsActive(true);
    setIsFinished(false);
    setResults(null);
    startTimeRef.current = 0;
    targetTextRef.current = normalized;
    
    inputRef.current?.focus();
    
    // Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev: ChallengeDuration) => {
        if (prev <= 1) {
          finishTest();
          return 0 as ChallengeDuration;
        }
        return (prev - 1) as ChallengeDuration;
      });
    }, 1000);
  }, [generateTargetText, duration]);

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setIsFinished(true);
    setEndTime(performance.now());
    
    const elapsed = startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : duration;
    const typed = normalizeBengaliString(typedInput);
    const target = targetTextRef.current;
    
    // Calculate metrics
    let correctChars = 0;
    let errors = 0;
    const minLen = Math.min(typed.length, target.length);
    
    for (let i = 0; i < minLen; i++) {
      if (typed[i] === target[i]) correctChars++;
      else errors++;
    }
    errors += Math.abs(typed.length - target.length);
    
    const totalChars = target.length;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    const wpm = elapsed > 0 ? Math.round((correctChars / 4) / (elapsed / 60)) : 0;
    const timeElapsed = Math.round(elapsed);
    
    const result: ChallengeResult = {
      wpm,
      accuracy,
      correctChars,
      totalChars,
      errors,
      timeElapsed,
      mode,
      duration,
    };
    
    setResults(result);
    gameAudio.playCombo(wpm > 40 ? 10 : wpm > 25 ? 5 : 1);
    
    // Update personal bests
    setPersonalBests(prev => {
      const currentBest = prev[mode];
      if (wpm > currentBest.wpm || (wpm === currentBest.wpm && accuracy > currentBest.accuracy)) {
        const updated = { ...prev, [mode]: { wpm, accuracy } };
        try { localStorage.setItem('speed-challenge-bests', JSON.stringify(updated)); } catch {}
        return updated;
      }
      return prev;
    });
    
    recordSpeedChallengeResult(wpm, accuracy, mode, duration);
  }, [typedInput, duration, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive || isFinished) return;
    
    const val = normalizeBengaliString(e.target.value);
    
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
      setStartTime(performance.now());
    }
    
    // Only allow correct prefix
    if (targetTextRef.current.startsWith(val)) {
      setTypedInput(val);
      gameAudio.playKeyClick();
    } else {
      gameAudio.playError();
      setTypedInput(val); // Still allow typing but mark as error visually
    }
  };

  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTypedInput('');
    setCurrentText('');
    setTargetText('');
    setStartTime(null);
    setEndTime(null);
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setResults(null);
    startTimeRef.current = 0;
    targetTextRef.current = '';
    inputRef.current?.focus();
  }, [duration]);

  // Live WPM calculation
  const liveWpm = useMemo(() => {
    if (!startTimeRef.current || !isActive) return 0;
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    if (elapsed < 0.5) return 0;
    const typed = normalizeBengaliString(typedInput);
    let correct = 0;
    const target = targetTextRef.current;
    for (let i = 0; i < Math.min(typed.length, target.length); i++) {
      if (typed[i] === target[i]) correct++;
    }
    return Math.round((correct / 4) / (elapsed / 60));
  }, [typedInput, isActive]);

  const liveAccuracy = useMemo(() => {
    if (!isActive) return 100;
    const typed = normalizeBengaliString(typedInput);
    const target = targetTextRef.current;
    if (typed.length === 0) return 100;
    let correct = 0;
    for (let i = 0; i < Math.min(typed.length, target.length); i++) {
      if (typed[i] === target[i]) correct++;
    }
    return Math.round((correct / typed.length) * 100);
  }, [typedInput, isActive]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 select-none">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-card border rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <Button onClick={onBackToHub} variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> আর্কেড মেন্যু
            </Button>
          )}
          <Badge variant="outline" className="text-xs font-semibold gap-1 bg-cyan-500/10 text-cyan-500 border-cyan-500/30">
            <Zap className="h-3 w-3 text-cyan-500" /> স্পিড চ্যালেঞ্জ (Speed Challenge)
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          {(['words', 'sentences', 'proverbs', 'numbers', 'mixed'] as ChallengeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); resetTest(); }}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium rounded-md transition-all",
                mode === m ? "bg-cyan-600 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === 'words' ? 'শব্দ' : m === 'sentences' ? 'বাক্য' : m === 'proverbs' ? 'প্রবাদ' : m === 'numbers' ? 'সংখ্যা' : 'মিশ্র'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          {([30, 60, 120, 300] as ChallengeDuration[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDuration(d); resetTest(); }}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                duration === d ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d}s
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          {(['easy', 'medium', 'hard'] as GameDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); resetTest(); }}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                difficulty === d ? "bg-purple-600 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d === 'easy' ? 'সহজ' : d === 'medium' ? 'মাঝারি' : 'কঠিন'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Button onClick={toggleSound} variant="outline" size="sm" className="h-8 w-8 p-0" title={soundOn ? "সাউন্ড বন্ধ" : "সাউন্ড চালু"}>
            {soundOn ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border rounded-xl shadow-xs">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 bg-cyan-500/10 px-3 py-1.5 rounded-lg">
            <Timer className="h-4 w-4 text-cyan-500" />
            <span className="font-bold text-cyan-500 font-mono">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="font-bold text-emerald-500 font-mono">{toBengaliNumber(liveWpm)} WPM</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg">
            <Target className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-amber-500 font-mono">{toBengaliNumber(liveAccuracy)}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-lg">
            <Flag className="h-4 w-4 text-purple-500" />
            <span className="font-bold text-purple-500 font-mono">{toBengaliNumber(typedInput.length)}/{toBengaliNumber(targetTextRef.current.length)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {!isActive && !isFinished && (
            <Button onClick={startTest} size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold gap-2 px-6">
              <Play className="h-4 w-4" /> চ্যালেঞ্জ শুরু করুন
            </Button>
          )}
          {isActive && (
            <Button onClick={finishTest} variant="destructive" size="lg" className="font-bold gap-2 px-6">
              <Timer className="h-4 w-4" /> সমাপ্ত করুন
            </Button>
          )}
          {(isFinished || isActive) && (
            <Button onClick={resetTest} variant="outline" size="lg" className="font-bold gap-2 px-4">
              <RotateCcw className="h-4 w-4" /> পুনরায় শুরু
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Typing Area */}
        <div className="lg:col-span-2 space-y-3">
          {/* Target Text Display */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-cyan-400">টার্গেট টেক্সট</h3>
              <Badge variant="outline" className="text-xs" style={{ 
                backgroundColor: mode === 'words' ? '#10b98133' : mode === 'sentences' ? '#3b82f633' : mode === 'proverbs' ? '#ec489933' : mode === 'numbers' ? '#f59e0b33' : '#8b5cf633',
                borderColor: mode === 'words' ? '#10b981' : mode === 'sentences' ? '#3b82f6' : mode === 'proverbs' ? '#ec4899' : mode === 'numbers' ? '#f59e0b' : '#8b5cf6',
                color: mode === 'words' ? '#10b981' : mode === 'sentences' ? '#3b82f6' : mode === 'proverbs' ? '#ec4899' : mode === 'numbers' ? '#f59e0b' : '#8b5cf6',
              }}>
                {mode === 'words' ? 'শব্দ মোড' : mode === 'sentences' ? 'বাক্য মোড' : mode === 'proverbs' ? 'প্রবাদ মোড' : mode === 'numbers' ? 'সংখ্যা মোড' : 'মিশ্র মোড'}
              </Badge>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 min-h-[120px] max-h-[200px] overflow-y-auto">
              {targetTextRef.current && (
                <p className="text-lg sm:text-xl font-headline leading-relaxed whitespace-pre-wrap break-words">
                  <span className="text-emerald-500 font-bold">{normalizeBengaliString(typedInput)}</span>
                  <span className="text-slate-300">{targetTextRef.current.slice(typedInput.length)}</span>
                  {isActive && !isFinished && (
                    <span className="relative">
                      <span className="absolute left-0 top-0 h-full w-px bg-cyan-400 animate-pulse" />
                    </span>
                  )}
                </p>
              )}
              {!targetTextRef.current && !isActive && (
                <p className="text-center text-slate-500 py-8">
                  উপরের বোতাম থেকে মোড ও সময় বেছে নিয়ে <strong>「চ্যালেঞ্জ শুরু করুন」</strong> ক্লিক করুন।
                </p>
              )}
            </div>
          </Card>

          {/* Input Area */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-emerald-400">আপনার ইনপুট</h3>
              {isActive && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>লাইভ WPM: <strong className="text-emerald-400">{toBengaliNumber(liveWpm)}</strong></span>
                  <span>| নির্ভুলতা: <strong className="text-amber-400">{toBengaliNumber(liveAccuracy)}%</strong></span>
                </div>
              )}
            </div>
            
            <Input
              ref={inputRef}
              type="text"
              placeholder={isActive ? "টাইপিং শুরু করুন..." : isFinished ? "পুনরায় শুরু করতে রিসেট বোতাম চাপুন" : "চ্যালেঞ্জ শুরু করুন বোতাম চাপুন"}
              value={typedInput}
              onChange={handleInputChange}
              disabled={!isActive || isFinished}
              className={cn(
                "w-full h-12 px-4 bg-slate-950/80 text-white font-headline text-lg rounded-lg placeholder:text-slate-500 text-center",
                isActive ? "border-cyan-500/60 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400" : "border-slate-700",
                typedInput.length > 0 && targetTextRef.current && !targetTextRef.current.startsWith(normalizeBengaliString(typedInput)) && "border-red-500/60 ring-1 ring-red-500/30"
              )}
              autoFocus
            />
            
            {isActive && (
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (timeLeft / duration) * 100)}%` }}
                  transition={{ duration: 1000, ease: 'linear' }}
                />
              </div>
            )}
          </Card>

          {/* Results Modal */}
          <AnimatePresence>
            {isFinished && results && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <div className="max-w-2xl w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-2xl text-white">
                  <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                    <Medal className="h-8 w-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold font-headline text-cyan-400">চ্যালেঞ্জ সম্পন্ন!</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {duration}s {mode === 'words' ? 'শব্দ' : mode === 'sentences' ? 'বাক্য' : mode === 'proverbs' ? 'প্রবাদ' : mode === 'numbers' ? 'সংখ্যা' : 'মিশ্র'} মোড
                    </p>
                  </div>

                  {/* Main Metrics */}
                  <div className="grid grid-cols-3 gap-3 py-2">
                    <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[11px] text-slate-400 mb-1">গতি (WPM)</p>
                      <p className="text-3xl font-bold text-emerald-400 font-mono">{toBengaliNumber(results.wpm)}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        সেরা: {toBengaliNumber(personalBests[mode].wpm)} WPM
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[11px] text-slate-400 mb-1">নির্ভুলতা</p>
                      <p className="text-3xl font-bold text-amber-400 font-mono">{toBengaliNumber(results.accuracy)}%</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        সেরা: {toBengaliNumber(personalBests[mode].accuracy)}%
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[11px] text-slate-400 mb-1">স্কোর</p>
                      <p className="text-3xl font-bold text-purple-400 font-mono">
                        {toBengaliNumber(Math.round(results.wpm * results.accuracy / 100))}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        সময়: {toBengaliNumber(results.timeElapsed)}s
                      </p>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-t border-slate-700 pt-3">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-[10px] text-slate-400">সঠিক অক্ষর</p>
                      <p className="font-bold text-emerald-400 font-mono">{toBengaliNumber(results.correctChars)}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-[10px] text-slate-400">ভুল অক্ষর</p>
                      <p className="font-bold text-red-400 font-mono">{toBengaliNumber(results.errors)}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-[10px] text-slate-400">মোট অক্ষর</p>
                      <p className="font-bold text-cyan-400 font-mono">{toBengaliNumber(results.totalChars)}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-[10px] text-slate-400">কার্যকর সময়</p>
                      <p className="font-bold text-amber-400 font-mono">{toBengaliNumber(results.timeElapsed)}s</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="py-2">
                    {(() => {
                      const score = Math.round(results.wpm * results.accuracy / 100);
                      if (score >= 60) return (
                        <div className="flex items-center justify-center gap-2 text-yellow-400">
                          <Star className="h-5 w-5 fill-yellow-400" />
                          <Star className="h-5 w-5 fill-yellow-400" />
                          <Star className="h-5 w-5 fill-yellow-400" />
                          <span className="font-bold text-lg">প্রতিভাবান টাইপিস্ট!</span>
                        </div>
                      );
                      if (score >= 40) return (
                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                          <Star className="h-5 w-5 fill-emerald-400" />
                          <Star className="h-5 w-5 fill-emerald-400" />
                          <Star className="h-5 w-5 text-emerald-400" />
                          <span className="font-bold text-lg">খুব ভালো!</span>
                        </div>
                      );
                      if (score >= 25) return (
                        <div className="flex items-center justify-center gap-2 text-blue-400">
                          <Star className="h-5 w-5 fill-blue-400" />
                          <Star className="h-5 w-5 text-blue-400" />
                          <Star className="h-5 w-5 text-blue-400" />
                          <span className="font-bold text-lg">ভালো শুরু!</span>
                        </div>
                      );
                      return (
                        <div className="flex items-center justify-center gap-2 text-amber-400">
                          <Star className="h-5 w-5 fill-amber-400" />
                          <Star className="h-5 w-5 text-amber-400" />
                          <Star className="h-5 w-5 text-amber-400" />
                          <span className="font-bold text-lg">অনুশীলন চালিয়ে যান!</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={resetTest} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold gap-1.5">
                      <RotateCcw className="h-4 w-4" /> আবার চেষ্টা করুন
                    </Button>
                    {onBackToHub && (
                      <Button onClick={onBackToHub} variant="outline" className="border-slate-700 hover:bg-slate-800">
                        আর্কেড মেন্যু
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - Personal Bests & Leaderboard */}
        <div className="space-y-3">
          {/* Personal Bests */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" /> ব্যক্তিগত সেরা রেকর্ড
              </h3>
              <Badge variant="outline" className="text-[10px]">লোকাল স্টোরেজ</Badge>
            </div>
            <div className="space-y-2">
              {([
                { key: 'words', label: 'শব্দ', icon: '📝', color: '#10b981' },
                { key: 'sentences', label: 'বাক্য', icon: '📖', color: '#3b82f6' },
                { key: 'proverbs', label: 'প্রবাদ', icon: '💬', color: '#ec4899' },
                { key: 'numbers', label: 'সংখ্যা', icon: '🔢', color: '#f59e0b' },
                { key: 'mixed', label: 'মিশ্র', icon: '🎲', color: '#8b5cf6' },
              ] as const).map(({ key, label, icon, color }) => {
                const best = personalBests[key];
                const isCurrentMode = mode === key;
                return (
                  <div 
                    key={key} 
                    className={cn(
                      "p-2.5 rounded-lg border text-xs transition-all",
                      isCurrentMode ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : "border-slate-700 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 font-medium" style={{ color }}>
                        <span>{icon}</span>
                        <span>{label}</span>
                        {isCurrentMode && <Sparkles className="h-3 w-3 text-primary animate-pulse" />}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>WPM: <strong className="text-emerald-400 font-mono">{toBengaliNumber(best.wpm)}</strong></span>
                      <span>নির্ভুলতা: <strong className="text-amber-400 font-mono">{toBengaliNumber(best.accuracy)}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Session Stats */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-cyan-400">সেশন পরিসংখ্যান</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">সেরা WPM</p>
                <p className="font-bold text-emerald-400 font-mono">{toBengaliNumber(stats?.bestWpm || 0)}</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">মোট টেস্ট</p>
                <p className="font-bold text-cyan-400 font-mono">{toBengaliNumber(stats?.totalTests || 0)}</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">চ্যালেঞ্জ মোড</p>
                <p className="font-bold text-purple-400 font-mono capitalize">{mode}</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">সময় সীমা</p>
                <p className="font-bold text-amber-400 font-mono">{toBengaliNumber(duration)}s</p>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> টিপস
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">①</span> স্ক্রিনের দিকে তাকিয়ে টাইপ করুন, কীবোর্ডের দিকে নয়</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">②</span> ধীরে শুরু করুন, নির্ভুলতা বাড়ালে গতি আটোমেটিকলি বাড়বে</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">③</span> হোম রো পজিশন মেনে চলুন সবসময়</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">④</span> ভুল হলে Backspace না চাপাই 次の শব্দে যান</li>
              <li className="flex gap-2"><span className="text-amber-400 shrink-0">⑤</span> প্রতিদিন ৫-১০ মিনিট চ্যালেঞ্জ দিন আপনার প্রগ্রেস ট্র্যাক করতে</li>
            </ul>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3">শর্টকাট কী</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span>শুরু/রিস্টার্ট</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">Space</kbd></div>
              <div className="flex justify-between"><span>সমাপ্ত করুন</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">Enter</kbd></div>
              <div className="flex justify-between"><span>রিসেট</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">R</kbd></div>
              <div className="flex justify-between"><span>পজ/রিজিউম</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">P</kbd></div>
              <div className="flex justify-between"><span>মোড পরিবর্তন</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">1-5</kbd></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';