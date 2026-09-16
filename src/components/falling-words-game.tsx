"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Heart, 
  Pause, 
  Play, 
  RotateCcw, 
  Flame, 
  Snowflake, 
  Bomb, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  Trophy,
  Zap,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRandomGameWord, GameDifficulty } from '@/lib/game/game-words';
import { gameAudio } from '@/lib/game/game-audio';
import { recordFallingGameResult, getArcadeStats } from '@/lib/game/game-storage';
import { toBengaliNumber } from '@/lib/utils';

interface ActiveWord {
  id: string;
  text: string;
  xPercent: number; // 5% to 85%
  yPercent: number; // 0% to 100%
  speed: number;    // falling speed
  isPowerup?: 'freeze' | 'bomb' | 'heart';
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  dx: number;
  dy: number;
}

export default function FallingWordsGame({ onBackToHub }: { onBackToHub?: () => void }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [activeWords, setActiveWords] = useState<ActiveWord[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalWordsTyped, setTotalWordsTyped] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatText, setFloatText] = useState<{ id: string; text: string; x: number; y: number } | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize sound state
  useEffect(() => {
    setSoundOn(gameAudio.isEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
  };

  // Particle burst generator
  const createBurst = useCallback((xPercent: number, yPercent: number, count = 12) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = (xPercent / 100) * rect.width;
    const y = (yPercent / 100) * rect.height;

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
      });
    }
    setParticles((prev) => [...prev.slice(-30), ...newParticles]);
  }, []);

  // Update particles animation
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles([]);
    }, 450);
    return () => clearTimeout(timer);
  }, [particles]);

  // Start / Restart Game
  const startGame = useCallback(() => {
    setActiveWords([]);
    setScore(0);
    setLives(5);
    setGameOver(false);
    setInputValue('');
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    setTotalWordsTyped(0);
    setIsPaused(false);
    setIsFrozen(false);
    lastSpawnTimeRef.current = performance.now();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame, difficulty]);

  // Focus input automatically
  useEffect(() => {
    if (!gameOver && !isPaused) {
      inputRef.current?.focus();
    }
  }, [gameOver, isPaused]);

  // Main game loop (tick)
  useEffect(() => {
    if (gameOver || isPaused) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // 1. Spawning words
      const baseSpawnInterval = difficulty === 'easy' ? 2600 : difficulty === 'medium' ? 2100 : 1600;
      const currentSpawnInterval = Math.max(900, baseSpawnInterval - level * 90);
      const maxConcurrentWords = Math.min(3 + level, 8);

      if (
        !isFrozen &&
        currentTime - lastSpawnTimeRef.current > currentSpawnInterval &&
        activeWords.length < maxConcurrentWords
      ) {
        lastSpawnTimeRef.current = currentTime;
        const newWordText = getRandomGameWord(difficulty);
        // 10% chance for a powerup word
        const powerRoll = Math.random();
        let power: 'freeze' | 'bomb' | 'heart' | undefined = undefined;
        if (powerRoll < 0.04) power = 'freeze';
        else if (powerRoll < 0.08) power = 'bomb';
        else if (powerRoll < 0.11 && lives < 5) power = 'heart';

        // Speed calculation based on level & difficulty
        const baseSpeed = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 11 : 14;
        const speed = baseSpeed + level * 0.8 + (Math.random() * 2 - 1);

        const newWord: ActiveWord = {
          id: `word-${Date.now()}-${Math.random()}`,
          text: newWordText,
          xPercent: Math.max(8, Math.min(80, Math.random() * 80 + 5)),
          yPercent: 0,
          speed,
          isPowerup: power,
        };

        setActiveWords((prev) => [...prev, newWord]);
      }

      // 2. Update positions
      if (!isFrozen) {
        setActiveWords((prev) => {
          const nextWords: ActiveWord[] = [];
          let lostLife = false;

          for (const w of prev) {
            const nextY = w.yPercent + w.speed * dt;
            if (nextY >= 92) {
              // Word hit ground!
              lostLife = true;
            } else {
              nextWords.push({ ...w, yPercent: nextY });
            }
          }

          if (lostLife) {
            gameAudio.playError();
            setCombo(0);
            setLives((curr) => {
              const updated = curr - 1;
              if (updated <= 0) {
                setGameOver(true);
                gameAudio.playGameOver();
                recordFallingGameResult(score, level, maxCombo);
              }
              return updated;
            });
          }

          return nextWords;
        });
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameOver, isPaused, isFrozen, level, difficulty, lives, score, maxCombo, activeWords.length]);

  // Activate Powerup
  const triggerPowerup = useCallback((type: 'freeze' | 'bomb' | 'heart', xPercent: number, yPercent: number) => {
    if (type === 'freeze') {
      gameAudio.playFreeze();
      setIsFrozen(true);
      setFloatText({ id: `f-${Date.now()}`, text: '❄️ হিমায়িত বরফ!', x: xPercent, y: yPercent });
      setTimeout(() => setIsFrozen(false), 4500);
    } else if (type === 'bomb') {
      gameAudio.playBomb();
      setFloatText({ id: `f-${Date.now()}`, text: '💣 স্মার্ট বোমা!', x: xPercent, y: yPercent });
      setActiveWords((prev) => {
        prev.forEach((w) => createBurst(w.xPercent, w.yPercent, 10));
        setScore((s) => s + prev.length * 15);
        return [];
      });
    } else if (type === 'heart') {
      gameAudio.playCombo(5);
      setFloatText({ id: `f-${Date.now()}`, text: '💖 জীবন পুনরুদ্ধার!', x: xPercent, y: yPercent });
      setLives((l) => Math.min(5, l + 1));
    }
  }, [createBurst]);

  // Handle Input Typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.trim();

    // Check if clean matches any active word
    const matchedIndex = activeWords.findIndex((w) => w.text === clean);

    if (matchedIndex !== -1) {
      // Word completely matched!
      const matched = activeWords[matchedIndex];
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Multiplier: 1x, 2x (combo>=3), 3x (combo>=6), 5x (combo>=10)
      const multiplier = newCombo >= 10 ? 5 : newCombo >= 6 ? 3 : newCombo >= 3 ? 2 : 1;
      const wordScore = (matched.text.length * 10 + 5) * multiplier;

      setScore((s) => s + wordScore);
      setTotalWordsTyped((t) => t + 1);

      // Audio feedback
      gameAudio.playCombo(newCombo);
      createBurst(matched.xPercent, matched.yPercent, 14);

      // Check level-up every 120 points
      if (Math.floor((score + wordScore) / 120) > Math.floor(score / 120)) {
        setLevel((l) => l + 1);
        gameAudio.playCombo(12);
      }

      // Check powerup
      if (matched.isPowerup) {
        triggerPowerup(matched.isPowerup, matched.xPercent, matched.yPercent);
      }

      // Remove matched word
      setActiveWords((prev) => prev.filter((_, idx) => idx !== matchedIndex));
      setInputValue('');
    } else {
      setInputValue(raw);
      gameAudio.playKeyClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      const clean = inputValue.trim();
      const matchedIndex = activeWords.findIndex((w) => w.text === clean);
      if (matchedIndex === -1 && clean.length > 0) {
        // Missed word penalty
        gameAudio.playError();
        setCombo(0);
      }
      setInputValue('');
      e.preventDefault();
    }
  };

  const stats = getArcadeStats();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 select-none">
      {/* Top Controls & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-card border rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <Button onClick={onBackToHub} variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> আর্কেড মেন্যু
            </Button>
          )}
          <Badge variant="outline" className="text-xs font-semibold gap-1 bg-primary/5">
            <Sparkles className="h-3 w-3 text-primary" /> ঝরন্ত শব্দ (Falling Meteors)
          </Badge>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          {(['easy', 'medium', 'hard'] as GameDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                startGame();
              }}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                difficulty === d
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d === 'easy' ? 'সহজ' : d === 'medium' ? 'মাঝারি' : 'কঠিন'}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => setIsPaused((p) => !p)}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title={isPaused ? "চালু করুন" : "থামান"}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-green-600" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>

          <Button
            onClick={startGame}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title="নতুন করে শুরু"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            onClick={toggleSound}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title={soundOn ? "সাউন্ড বন্ধ" : "সাউন্ড চালু"}
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div
        ref={arenaRef}
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "relative w-full h-[78vh] min-h-[580px] max-h-[860px] rounded-2xl overflow-hidden border shadow-lg transition-all duration-300",
          "bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white cursor-text",
          lives <= 2 && "ring-2 ring-red-500/50",
          isFrozen && "ring-2 ring-cyan-400/50"
        )}
      >
        {/* Starfield / Grid background effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Defense Barrier line at bottom */}
        <div className="absolute bottom-[72px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_12px_#38bdf8] pointer-events-none" />
        <div className="absolute bottom-[75px] right-4 text-[10px] text-cyan-400 font-mono tracking-widest uppercase opacity-70">
          সুরক্ষা সীমানা (Defense Line)
        </div>

        {/* Falling Words Rendering */}
        {activeWords.map((word) => {
          const typedPart = inputValue.trim();
          const isPrefix = word.text.startsWith(typedPart);
          const matchedLen = isPrefix ? typedPart.length : 0;

          return (
            <div
              key={word.id}
              className={cn(
                "absolute -translate-x-1/2 px-3.5 py-1.5 rounded-full border text-base font-headline font-bold tracking-wide transition-shadow duration-150 flex items-center gap-1.5 shadow-md",
                word.isPowerup === 'freeze'
                  ? "bg-cyan-900/80 border-cyan-400 text-cyan-200 shadow-cyan-500/30"
                  : word.isPowerup === 'bomb'
                  ? "bg-amber-900/80 border-amber-400 text-amber-200 shadow-amber-500/30"
                  : word.isPowerup === 'heart'
                  ? "bg-rose-900/80 border-rose-400 text-rose-200 shadow-rose-500/30"
                  : "bg-slate-800/85 border-slate-600 text-slate-100",
                matchedLen > 0 && "ring-2 ring-green-400 shadow-green-500/40"
              )}
              style={{
                left: `${word.xPercent}%`,
                top: `${word.yPercent}%`,
              }}
            >
              {word.isPowerup === 'freeze' && <Snowflake className="h-3.5 w-3.5 text-cyan-300 animate-spin" />}
              {word.isPowerup === 'bomb' && <Bomb className="h-3.5 w-3.5 text-amber-300 animate-pulse" />}
              {word.isPowerup === 'heart' && <Heart className="h-3.5 w-3.5 text-rose-300 fill-rose-300 animate-bounce" />}

              <span>
                {matchedLen > 0 ? (
                  <>
                    <span className="text-emerald-400 font-black">{word.text.slice(0, matchedLen)}</span>
                    <span className="opacity-90">{word.text.slice(matchedLen)}</span>
                  </>
                ) : (
                  word.text
                )}
              </span>
            </div>
          );
        })}

        {/* Floating Text Event (Powerup popup) */}
        <AnimatePresence>
          {floatText && (
            <motion.div
              key={floatText.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute text-lg font-bold text-yellow-300 pointer-events-none drop-shadow-md z-30"
              style={{ left: `${floatText.x}%`, top: `${floatText.y}%` }}
            >
              {floatText.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              left: p.x + p.dx * 8,
              top: p.y + p.dy * 8,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              opacity: 0.85,
            }}
          />
        ))}

        {/* Freeze Screen Overlay */}
        {isFrozen && (
          <div className="absolute inset-0 bg-cyan-950/25 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
            <div className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-bold tracking-wider flex items-center gap-1.5 animate-pulse">
              <Snowflake className="h-4 w-4 text-cyan-300 animate-spin" /> শব্দগুলো হিমায়িত রয়েছে!
            </div>
          </div>
        )}

        {/* Bottom HUD Bar & Input Box */}
        <div className="absolute bottom-2 left-3 right-3 flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 z-20 shadow-md">
          {/* Status Metrics */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">স্কোর</span>
              <span className="text-base font-bold text-yellow-400 font-mono">{toBengaliNumber(score)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">লেভেল</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{toBengaliNumber(level)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">লাইফ</span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      i < lives ? "text-rose-500 fill-rose-500" : "text-slate-600"
                    )}
                  />
                ))}
              </div>
            </div>

            {combo >= 2 && (
              <div className="flex items-center gap-1 text-amber-400 animate-bounce">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                <span className="font-bold text-xs">{toBengaliNumber(combo)}× কম্বো!</span>
              </div>
            )}
          </div>

          {/* Target Input Box */}
          <div className="relative w-full sm:w-72">
            <Input
              ref={inputRef}
              type="text"
              placeholder="শব্দ টাইপ করুন..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={gameOver || isPaused}
              className="w-full h-10 px-4 bg-slate-950/80 border-slate-600 text-white font-headline text-base rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 placeholder:text-slate-500 text-center"
              autoFocus
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 hidden sm:inline">
              Space/↵
            </span>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full p-6 bg-slate-900 border border-slate-700 rounded-2xl text-center space-y-4 shadow-2xl text-white"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <Trophy className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold font-headline text-rose-400">গেম ওভার!</h2>
                <p className="text-xs text-slate-400 mt-0.5">শব্দগুলো সুরক্ষা প্রাচীরে আঘাত হেনেছে।</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-400">চূড়ান্ত স্কোর</p>
                  <p className="text-lg font-bold text-yellow-400 font-mono">{toBengaliNumber(score)}</p>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-400">সর্বোচ্চ কম্বো</p>
                  <p className="text-lg font-bold text-amber-400 font-mono">{toBengaliNumber(maxCombo)}×</p>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-400">অর্জিত লেভেল</p>
                  <p className="text-lg font-bold text-cyan-400 font-mono">{toBengaliNumber(level)}</p>
                </div>
              </div>

              {score > stats.falling.highScore && (
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 fill-yellow-400" /> নতুন সর্বোচ্চ রেকর্ড তৈরি হয়েছে!
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={startGame} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-1.5">
                  <RotateCcw className="h-4 w-4" /> আবার খেলুন
                </Button>
                {onBackToHub && (
                  <Button onClick={onBackToHub} variant="outline" className="border-slate-700 hover:bg-slate-800">
                    আর্কেড মেন্যু
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
