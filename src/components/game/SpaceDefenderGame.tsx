"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Shield, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Trophy, 
  Crosshair,
  Skull,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRandomGameWord, GAME_WORDS_CONJUNCTS, GameDifficulty } from '@/lib/game/game-words';
import { gameAudio } from '@/lib/game/game-audio';
import { recordSpaceGameResult, getArcadeStats } from '@/lib/game/game-storage';
import { toBengaliNumber } from '@/lib/utils';

interface EnemyShip {
  id: string;
  text: string;
  typedLen: number;
  xPercent: number; // 10% to 85%
  yPercent: number; // 5% to 85%
  speed: number;
  isBoss?: boolean;
  bossHealth?: number;
  maxBossHealth?: number;
}

interface LaserShot {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

export default function SpaceDefenderGame({ onBackToHub }: { onBackToHub?: () => void }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [enemies, setEnemies] = useState<EnemyShip[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [shield, setShield] = useState(100);
  const [wave, setWave] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [shipsDestroyed, setShipsDestroyed] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [targetedEnemyId, setTargetedEnemyId] = useState<string | null>(null);
  const [lasers, setLasers] = useState<LaserShot[]>([]);
  const [bossActive, setBossActive] = useState(false);

  const arenaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);

  useEffect(() => {
    setSoundOn(gameAudio.isEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
  };

  const startGame = useCallback(() => {
    setEnemies([]);
    setScore(0);
    setShield(100);
    setWave(1);
    setGameOver(false);
    setShipsDestroyed(0);
    setInputValue('');
    setTargetedEnemyId(null);
    setBossActive(false);
    lastSpawnTimeRef.current = performance.now();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame, difficulty]);

  useEffect(() => {
    if (!gameOver) {
      inputRef.current?.focus();
    }
  }, [gameOver]);

  // Main game tick loop
  useEffect(() => {
    if (gameOver) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Check Boss Wave (every 5th wave)
      const isBossWave = wave % 5 === 0;

      // 1. Spawning
      const spawnInterval = difficulty === 'easy' ? 2800 : difficulty === 'medium' ? 2200 : 1700;
      const maxEnemies = isBossWave ? 2 : Math.min(3 + wave, 7);

      if (currentTime - lastSpawnTimeRef.current > spawnInterval && enemies.length < maxEnemies) {
        lastSpawnTimeRef.current = currentTime;

        if (isBossWave && !bossActive && enemies.every((e) => !e.isBoss)) {
          // Spawn Boss!
          setBossActive(true);
          const bossWord = GAME_WORDS_CONJUNCTS[Math.floor(Math.random() * GAME_WORDS_CONJUNCTS.length)];
          const boss: EnemyShip = {
            id: `boss-${Date.now()}`,
            text: bossWord,
            typedLen: 0,
            xPercent: 45,
            yPercent: 8,
            speed: 2.5,
            isBoss: true,
            bossHealth: 3,
            maxBossHealth: 3,
          };
          setEnemies((prev) => [...prev, boss]);
        } else if (!isBossWave || enemies.length < 1) {
          const newWord = getRandomGameWord(difficulty, true);
          const baseSpeed = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 9 : 12;
          const speed = baseSpeed + wave * 0.5 + Math.random() * 2;

          const ship: EnemyShip = {
            id: `enemy-${Date.now()}-${Math.random()}`,
            text: newWord,
            typedLen: 0,
            xPercent: Math.max(12, Math.min(80, Math.random() * 75 + 10)),
            yPercent: 0,
            speed,
          };
          setEnemies((prev) => [...prev, ship]);
        }
      }

      // 2. Movement & Shield Collision
      setEnemies((prev) => {
        const nextEnemies: EnemyShip[] = [];
        let damage = 0;

        for (const e of prev) {
          const nextY = e.yPercent + e.speed * dt;
          if (nextY >= 82) {
            // Reached base shield
            damage += e.isBoss ? 40 : 20;
            gameAudio.playError();
          } else {
            nextEnemies.push({ ...e, yPercent: nextY });
          }
        }

        if (damage > 0) {
          setShield((s) => {
            const nextShield = Math.max(0, s - damage);
            if (nextShield <= 0) {
              setGameOver(true);
              gameAudio.playGameOver();
              recordSpaceGameResult(score, shipsDestroyed, wave);
            }
            return nextShield;
          });
        }

        return nextEnemies;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameOver, wave, difficulty, enemies, bossActive, score, shipsDestroyed]);

  // Clean laser shots
  useEffect(() => {
    if (lasers.length === 0) return;
    const t = setTimeout(() => setLasers([]), 180);
    return () => clearTimeout(t);
  }, [lasers]);

  // Fire laser towards a target
  const fireLaserAt = useCallback((targetX: number, targetY: number) => {
    gameAudio.playLaser();
    setLasers((prev) => [
      ...prev,
      {
        id: `laser-${Date.now()}-${Math.random()}`,
        startX: 50,
        startY: 90,
        targetX,
        targetY,
      },
    ]);
  }, []);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const clean = text.trim();

    if (clean.length === 0) {
      setInputValue('');
      return;
    }

    // Find which enemy is currently being locked-on, or find best matching candidate
    let target = enemies.find((en) => en.id === targetedEnemyId && en.text.startsWith(clean));

    if (!target) {
      // Find new target that starts with clean
      target = enemies.find((en) => en.text.startsWith(clean));
      if (target) {
        setTargetedEnemyId(target.id);
      }
    }

    if (target) {
      setInputValue(clean);
      fireLaserAt(target.xPercent, target.yPercent);

      // Check if enemy word fully matched
      if (clean === target.text) {
        // Destroy or damage boss
        if (target.isBoss && target.bossHealth && target.bossHealth > 1) {
          gameAudio.playExplosion();
          const nextHealth = target.bossHealth - 1;
          const nextWord = GAME_WORDS_CONJUNCTS[Math.floor(Math.random() * GAME_WORDS_CONJUNCTS.length)];
          setEnemies((prev) =>
            prev.map((en) =>
              en.id === target?.id
                ? { ...en, text: nextWord, bossHealth: nextHealth, yPercent: Math.max(10, en.yPercent - 15) }
                : en
            )
          );
          setScore((s) => s + 50);
          setInputValue('');
          setTargetedEnemyId(null);
        } else {
          // Normal kill or Boss finale
          gameAudio.playExplosion();
          const killScore = target.isBoss ? 200 : target.text.length * 15;
          setScore((s) => s + killScore);
          setShipsDestroyed((n) => n + 1);

          if (target.isBoss) {
            setBossActive(false);
            setWave((w) => w + 1);
            setShield((s) => Math.min(100, s + 25)); // Boss reward
          } else {
            // Normal enemy kill
            if ((shipsDestroyed + 1) % 8 === 0) {
              setWave((w) => w + 1);
              gameAudio.playCombo(8);
            }
          }

          setEnemies((prev) => prev.filter((en) => en.id !== target?.id));
          setInputValue('');
          setTargetedEnemyId(null);
        }
      }
    } else {
      // Missed keystroke
      gameAudio.playError();
      setInputValue('');
      setTargetedEnemyId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 select-none">
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-card border rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <Button onClick={onBackToHub} variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> আর্কেড মেন্যু
            </Button>
          )}
          <Badge variant="outline" className="text-xs font-semibold gap-1 bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
            <Rocket className="h-3.5 w-3.5 text-indigo-400" /> শব্দ শিকারী (Space Defender)
          </Badge>
        </div>

        {/* Difficulty */}
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
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d === 'easy' ? 'সহজ' : d === 'medium' ? 'মাঝারি' : 'কঠিন'}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <Button onClick={startGame} variant="outline" size="sm" className="h-8 w-8 p-0" title="নতুন করে শুরু">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button onClick={toggleSound} variant="outline" size="sm" className="h-8 w-8 p-0" title="সাউন্ড টগল">
            {soundOn ? <Volume2 className="h-3.5 w-3.5 text-indigo-400" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Main Space Arena */}
      <div
        ref={arenaRef}
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "relative w-full h-[78vh] min-h-[580px] max-h-[860px] rounded-2xl overflow-hidden border shadow-xl",
          "bg-gradient-to-b from-[#020617] via-[#090d24] to-[#110e2e] text-white cursor-crosshair"
        )}
      >
        {/* Nebular space background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/10 to-transparent pointer-events-none" />

        {/* Active Laser Beams */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {lasers.map((l) => (
            <line
              key={l.id}
              x1={`${l.startX}%`}
              y1={`${l.startY}%`}
              x2={`${l.targetX}%`}
              y2={`${l.targetY}%`}
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 8px #0284c7)"
            />
          ))}
        </svg>

        {/* Base Defense Shield Line */}
        <div className="absolute bottom-[68px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] pointer-events-none" />

        {/* Defender Turret/Ship at Bottom */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div className="w-12 h-10 bg-gradient-to-t from-indigo-700 to-cyan-400 rounded-t-full shadow-[0_0_20px_#38bdf8] flex items-center justify-center border-t border-cyan-200">
            <Crosshair className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div className="w-20 h-3 bg-indigo-900 rounded-b-md border border-indigo-700" />
        </div>

        {/* Enemy Ships */}
        {enemies.map((enemy) => {
          const isTargeted = enemy.id === targetedEnemyId;
          const cleanInput = inputValue.trim();
          const matchedLen = enemy.text.startsWith(cleanInput) ? cleanInput.length : 0;

          return (
            <div
              key={enemy.id}
              className={cn(
                "absolute -translate-x-1/2 flex flex-col items-center transition-all duration-100 z-15",
                isTargeted && "scale-105"
              )}
              style={{
                left: `${enemy.xPercent}%`,
                top: `${enemy.yPercent}%`,
              }}
            >
              {/* Word Badge over ship */}
              <div
                className={cn(
                  "px-3 py-1 rounded-lg border text-sm font-headline font-bold tracking-wide shadow-lg mb-1 flex items-center gap-1",
                  enemy.isBoss
                    ? "bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-600/40 text-base"
                    : isTargeted
                    ? "bg-cyan-950/90 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400 shadow-cyan-500/40"
                    : "bg-slate-900/80 border-slate-700 text-slate-200"
                )}
              >
                {enemy.isBoss && <Skull className="h-4 w-4 text-rose-400 animate-bounce" />}
                <span>
                  {matchedLen > 0 ? (
                    <>
                      <span className="text-emerald-400 font-extrabold">{enemy.text.slice(0, matchedLen)}</span>
                      <span className="opacity-80">{enemy.text.slice(matchedLen)}</span>
                    </>
                  ) : (
                    enemy.text
                  )}
                </span>
              </div>

              {/* Alien Ship Graphics */}
              <div
                className={cn(
                  "flex items-center justify-center transition-transform",
                  enemy.isBoss
                    ? "w-16 h-12 bg-gradient-to-b from-rose-600 to-purple-900 rounded-b-2xl border-2 border-rose-400 shadow-[0_0_15px_#f43f5e]"
                    : "w-10 h-7 bg-gradient-to-b from-slate-700 to-indigo-800 rounded-b-xl border border-indigo-400 shadow-md"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
              </div>

              {/* Boss Health Bar */}
              {enemy.isBoss && enemy.bossHealth && (
                <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden border border-rose-500/40">
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${(enemy.bossHealth / (enemy.maxBossHealth || 3)) * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom HUD Bar & Input Box */}
        <div className="absolute bottom-2 left-3 right-3 flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 z-20 shadow-lg">
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">স্কোর</span>
              <span className="text-base font-bold text-yellow-400 font-mono">{toBengaliNumber(score)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">তরঙ্গ (Wave)</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{toBengaliNumber(wave)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">শিকারকৃত জাহাজ</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{toBengaliNumber(shipsDestroyed)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">শিল্ড স্থায়িত্ব</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className={cn("h-3.5 w-3.5", shield > 30 ? "text-cyan-400" : "text-rose-500 animate-pulse")} />
                <div className="w-20 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      shield > 50 ? "bg-cyan-400" : shield > 25 ? "bg-amber-400" : "bg-rose-500"
                    )}
                    style={{ width: `${shield}%` }}
                  />
                </div>
                <span className="font-mono text-xs">{toBengaliNumber(shield)}%</span>
              </div>
            </div>
          </div>

          {/* Target Input Box */}
          <div className="relative w-full sm:w-72">
            <Input
              ref={inputRef}
              type="text"
              placeholder="শত্রু জাহাজ লক করে টাইপ করুন..."
              value={inputValue}
              onChange={handleInputChange}
              disabled={gameOver}
              className="w-full h-10 px-4 bg-slate-900 border-indigo-700/60 text-white font-headline text-base rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-400 placeholder:text-slate-500 text-center"
              autoFocus
            />
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-2xl text-white"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <Trophy className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold font-headline text-rose-400">শিল্ড ধ্বংস হয়েছে!</h2>
                <p className="text-xs text-slate-400 mt-0.5">এলিয়েন বহর প্রতিরক্ষা সীমানা ভেদ করেছে।</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-400">মোট স্কোর</p>
                  <p className="text-lg font-bold text-yellow-400 font-mono">{toBengaliNumber(score)}</p>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-400">জাহাজ ধ্বংস</p>
                  <p className="text-lg font-bold text-emerald-400 font-mono">{toBengaliNumber(shipsDestroyed)}</p>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-400">সর্বোচ্চ তরঙ্গ</p>
                  <p className="text-lg font-bold text-cyan-400 font-mono">{toBengaliNumber(wave)}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={startGame} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5">
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
