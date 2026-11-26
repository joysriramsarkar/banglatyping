"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Trophy, 
  Zap, 
  TrendingUp,
  Target,
  Crown
} from 'lucide-react';
import { cn, toBengaliNumber } from '@/lib/utils';
import { getRandomGameWord, getRandomGameWordByCategory, GameDifficulty, GameCategory } from '@/lib/game/game-words';
import { gameAudio } from '@/lib/game/game-audio';
import { recordCascadeGameResult, getArcadeStats } from '@/lib/game/score-store';

interface FallingBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  category: GameCategory;
  matched: boolean;
  matchedChars: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#eab308'];
const COLUMNS = 6;
const BLOCK_WIDTH_RATIO = 0.9;

export default function WordCascadeGame({ onBackToHub }: { onBackToHub?: () => void }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [category, setCategory] = useState<GameCategory>('basic');
  const [blocks, setBlocks] = useState<FallingBlock[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatText, setFloatText] = useState<{ id: string; text: string; x: number; y: number; color: string } | null>(null);
  const [nextBlock, setNextBlock] = useState<{ text: string; color: string; category: GameCategory } | null>(null);
  const [stats, setStats] = useState<{ highScore: number; bestLevel: number; totalLines: number } | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    setSoundOn(gameAudio.isEnabled());
    const s = getArcadeStats();
    setStats({ highScore: s.falling.highScore, bestLevel: s.falling.maxLevel, totalLines: s.falling.gamesPlayed });
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
  };

  const createBlock = useCallback((x: number, text: string, cat: GameCategory): FallingBlock => {
    return {
      id: `block-${Date.now()}-${Math.random()}`,
      text,
      x,
      y: -50,
      width: 0,
      height: 40,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      category: cat,
      matched: false,
      matchedChars: 0,
    };
  }, []);

  const spawnBlock = useCallback(() => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const colWidth = rect.width / COLUMNS;
    const col = Math.floor(Math.random() * COLUMNS);
    const x = col * colWidth + (colWidth * (1 - BLOCK_WIDTH_RATIO)) / 2;
    const text = getRandomGameWordByCategory(category, difficulty);
    const newBlock = createBlock(x, text, category);
    newBlock.width = colWidth * BLOCK_WIDTH_RATIO;
    setBlocks(prev => [...prev, newBlock]);
    
    // Set next preview
    const nextText = getRandomGameWordByCategory(category, difficulty);
    setNextBlock({ text: nextText, color: COLORS[Math.floor(Math.random() * COLORS.length)], category });
  }, [category, difficulty, createBlock]);

  const startGame = useCallback(() => {
    setBlocks([]);
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setCombo(0);
    setMaxCombo(0);
    setGameOver(false);
    setInputValue('');
    setIsPaused(false);
    lastSpawnTimeRef.current = performance.now();
    lastTimeRef.current = performance.now();
    spawnBlock();
    inputRef.current?.focus();
  }, [spawnBlock]);

  useEffect(() => {
    startGame();
  }, [startGame, difficulty, category]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      inputRef.current?.focus();
    }
  }, [gameOver, isPaused]);

  const createParticles = useCallback((x: number, y: number, color: string, count = 15) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 5;
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x,
        y,
        color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
      });
    }
    setParticles(prev => [...prev.slice(-50), ...newParticles]);
  }, []);

  const updateParticles = useCallback(() => {
    setParticles(prev => {
      const updated = prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.15,
        life: p.life - 0.02,
      })).filter(p => p.life > 0);
      return updated;
    });
  }, []);

  const checkLineClear = useCallback((blocksToCheck: FallingBlock[]) => {
    if (!arenaRef.current) return { newBlocks: blocksToCheck, linesCleared: 0 };
    const rect = arenaRef.current.getBoundingClientRect();
    const rowHeight = 45;
    const rows: { [key: number]: FallingBlock[] } = {};
    
    blocksToCheck.forEach(block => {
      const row = Math.floor((block.y + block.height / 2) / rowHeight);
      if (!rows[row]) rows[row] = [];
      rows[row].push(block);
    });

    let linesCleared = 0;
    const fullRows: number[] = [];
    Object.keys(rows).forEach(rowKey => {
      const row = parseInt(rowKey);
      const rowBlocks = rows[row];
      const totalWidth = rowBlocks.reduce((sum, b) => sum + b.width, 0);
      if (totalWidth > rect.width * 0.85) {
        fullRows.push(row);
      }
    });

    if (fullRows.length > 0) {
      linesCleared = fullRows.length;
      const clearedBlockIds = new Set<string>();
      fullRows.forEach(row => {
        rows[row].forEach(b => clearedBlockIds.add(b.id));
        createParticles(rect.width / 2, row * rowHeight + rowHeight / 2, '#fbbf24', 30);
      });
      gameAudio.playCombo(combo + linesCleared * 2);
      setFloatText({ 
        id: `line-${Date.now()}`, 
        text: `+${linesCleared} লাইন!`, 
        x: 50, 
        y: 30, 
        color: '#fbbf24' 
      });
      
      return { 
        newBlocks: blocksToCheck.filter(b => !clearedBlockIds.has(b.id)), 
        linesCleared 
      };
    }
    return { newBlocks: blocksToCheck, linesCleared: 0 };
  }, [combo, createParticles]);

  // Main game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Spawn new blocks
      const spawnInterval = Math.max(800, 2500 - level * 150);
      if (currentTime - lastSpawnTimeRef.current > spawnInterval && blocks.length < 12) {
        lastSpawnTimeRef.current = currentTime;
        spawnBlock();
      }

      // Update block positions
      setBlocks(prev => {
        let newBlocks = prev.map(block => {
          if (block.matched) return block;
          const fallSpeed = 30 + level * 5 + (blocks.length * 2);
          return { ...block, y: block.y + fallSpeed * dt };
        });

        // Check for blocks reaching bottom
        if (arenaRef.current) {
          const rect = arenaRef.current.getBoundingClientRect();
          const hitBottom = newBlocks.some(b => !b.matched && b.y + b.height > rect.height - 100);
          if (hitBottom) {
            gameAudio.playGameOver();
            setGameOver(true);
            recordCascadeGameResult(score, level, linesCleared, maxCombo);
          }
        }

        // Check line clears
        const { newBlocks: afterClear, linesCleared: cleared } = checkLineClear(newBlocks);
        if (cleared > 0) {
          setLinesCleared(prev => prev + cleared);
          setLevel(prev => Math.floor((prev + cleared) / 5) + 1);
        }
        newBlocks = afterClear;

        return newBlocks;
      });

      updateParticles();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameOver, isPaused, level, blocks.length, spawnBlock, checkLineClear, updateParticles, score, linesCleared, maxCombo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.trim();

    // Find matching block
    const targetBlock = blocks.find(b => !b.matched && b.text.startsWith(clean));
    
    if (targetBlock) {
      const matchedLen = clean.length;
      const wasNewMatch = matchedLen > targetBlock.matchedChars;
      
      setBlocks(prev => prev.map(b => 
        b.id === targetBlock.id 
          ? { ...b, matchedChars: matchedLen, matched: matchedLen === b.text.length }
          : b
      ));
      setInputValue(clean);

      if (wasNewMatch) {
        gameAudio.playKeyClick();
      }

      // Block fully matched
      if (matchedLen === targetBlock.text.length) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        
        const multiplier = newCombo >= 10 ? 5 : newCombo >= 6 ? 3 : newCombo >= 3 ? 2 : 1;
        const blockScore = (targetBlock.text.length * 15 + 20) * multiplier;
        setScore(prev => prev + blockScore);
        
        gameAudio.playCombo(newCombo);
        createParticles(targetBlock.x + targetBlock.width / 2, targetBlock.y + targetBlock.height / 2, targetBlock.color, 20);
        
        setFloatText({ 
          id: `score-${Date.now()}`, 
          text: `+${toBengaliNumber(blockScore)}`, 
          x: (targetBlock.x / (arenaRef.current?.getBoundingClientRect().width || 1)) * 100, 
          y: 30, 
          color: '#10b981' 
        });

        setBlocks(prev => prev.filter(b => b.id !== targetBlock.id));
        setInputValue('');
      }
    } else if (clean.length > 0) {
      // Check if it matches any block
      const anyMatch = blocks.some(b => !b.matched && b.text.startsWith(clean));
      if (!anyMatch) {
        gameAudio.playError();
        setCombo(0);
      }
      setInputValue(raw);
    } else {
      setInputValue(raw);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      const clean = inputValue.trim();
      if (clean.length > 0 && !blocks.some(b => !b.matched && b.text === clean)) {
        gameAudio.playError();
        setCombo(0);
      }
      setInputValue('');
      e.preventDefault();
    }
  };

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
          <Badge variant="outline" className="text-xs font-semibold gap-1 bg-purple-500/10 text-purple-500 border-purple-500/30">
            <Zap className="h-3 w-3 text-purple-500" /> শব্দ ক্যাসকেড (Word Cascade)
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          {(['easy', 'medium', 'hard'] as GameDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); startGame(); }}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                difficulty === d ? "bg-purple-600 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {d === 'easy' ? 'সহজ' : d === 'medium' ? 'মাঝারি' : 'কঠিন'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          {(['basic', 'conjuncts', 'phola', 'vocabulary'] as GameCategory[]).map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); startGame(); }}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium rounded-md transition-all",
                category === c ? "bg-indigo-600 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c === 'basic' ? 'বেসিক' : c === 'conjuncts' ? 'যুক্তাক্ষর' : c === 'phola' ? 'ফলা' : 'শব্দভাণ্ডার'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Button onClick={() => setIsPaused(p => !p)} variant="outline" size="sm" className="h-8 w-8 p-0" title={isPaused ? "চালু করুন" : "থামান"}>
            {isPaused ? <Play className="h-3.5 w-3.5 text-green-600" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
          <Button onClick={startGame} variant="outline" size="sm" className="h-8 w-8 p-0" title="নতুন করে শুরু">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button onClick={toggleSound} variant="outline" size="sm" className="h-8 w-8 p-0" title={soundOn ? "সাউন্ড বন্ধ" : "সাউন্ড চালু"}>
            {soundOn ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Game Arena */}
        <div className="lg:col-span-3 relative">
          <div
            ref={arenaRef}
            onClick={() => inputRef.current?.focus()}
            className={cn(
              "relative w-full h-[78vh] min-h-[580px] max-h-[860px] rounded-2xl overflow-hidden border shadow-xl",
              "bg-gradient-to-b from-slate-950 via-slate-900 to-purple-950 text-white cursor-text",
              gameOver && "ring-2 ring-red-500/50"
            )}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
            
            {/* Column Dividers */}
            <div className="absolute inset-0 flex pointer-events-none">
              {Array.from({ length: COLUMNS - 1 }).map((_, i) => (
                <div key={i} className="w-1/6 border-r border-slate-700/30" style={{ width: `${100 / COLUMNS}%` }} />
              ))}
            </div>

            {/* Bottom Line */}
            <div className="absolute bottom-[72px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/80 to-transparent shadow-[0_0_12px_#ef4444] pointer-events-none" />
            <div className="absolute bottom-[75px] right-4 text-[10px] text-red-500 font-mono tracking-widest uppercase opacity-70">
              Game Over Line
            </div>

            {/* Falling Blocks */}
            {blocks.map((block) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute flex items-center justify-center transition-all duration-100"
                style={{
                  left: block.x,
                  top: block.y,
                  width: block.width,
                  height: block.height,
                  zIndex: block.matched ? 10 : 1,
                }}
              >
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-sm font-headline font-bold tracking-wide shadow-lg flex items-center gap-1.5 w-full",
                    block.matched 
                      ? "bg-emerald-500/90 border-emerald-400 text-white animate-pulse" 
                      : `bg-${block.color.replace('#', '')}/90 border-${block.color.replace('#', '')}-400 text-white`,
                    block.matchedChars > 0 && "ring-2 ring-green-400 shadow-green-500/40"
                  )}
                  style={{ backgroundColor: block.matched ? '#10b981' : block.color }}
                >
                  <span className="truncate">
                    {block.matchedChars > 0 ? (
                      <>
                        <span className="text-emerald-300 font-black">{block.text.slice(0, block.matchedChars)}</span>
                        <span className="opacity-90">{block.text.slice(block.matchedChars)}</span>
                      </>
                    ) : (
                      block.text
                    )}
                  </span>
                  {block.matched && <span className="text-emerald-200">✓</span>}
                </div>
              </motion.div>
            ))}

            {/* Particles */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  left: p.x,
                  top: p.y,
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                  opacity: p.life,
                }}
              />
            ))}

            {/* Floating Text */}
            <AnimatePresence>
              {floatText && (
                <motion.div
                  key={floatText.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -50, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute text-lg font-bold pointer-events-none drop-shadow-md z-30 text-center"
                  style={{ left: `${floatText.x}%`, top: `${floatText.y}%`, color: floatText.color, transform: 'translateX(-50%)' }}
                >
                  {floatText.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area at Bottom */}
            <div className="absolute bottom-2 left-3 right-3 flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 z-20 shadow-md">
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
                  <span className="text-[10px] text-slate-400 block font-semibold">লাইন</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{toBengaliNumber(linesCleared)}</span>
                </div>
                {combo >= 2 && (
                  <div className="flex items-center gap-1 text-amber-400 animate-bounce">
                    <Zap className="h-3.5 w-3.5 fill-amber-400" />
                    <span className="font-bold text-xs">{toBengaliNumber(combo)}× কম্বো!</span>
                  </div>
                )}
              </div>
              <div className="relative w-full sm:w-80">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="শব্দ টাইপ করে ব্লক كليর করুন..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={gameOver || isPaused}
                  className="w-full h-10 px-4 bg-slate-950/80 border-purple-600/60 text-white font-headline text-base rounded-lg focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:border-purple-400 placeholder:text-slate-500 text-center"
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
                    <h2 className="text-2xl font-bold font-headline text-rose-400">গেম ওভার!</h2>
                    <p className="text-xs text-slate-400 mt-0.5">ব্লকগুলো নিচের লাইন স্পর্শ করেছে।</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2">
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[10px] text-slate-400">স্কোর</p>
                      <p className="text-lg font-bold text-yellow-400 font-mono">{toBengaliNumber(score)}</p>
                    </div>
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[10px] text-slate-400">লেভেল</p>
                      <p className="text-lg font-bold text-cyan-400 font-mono">{toBengaliNumber(level)}</p>
                    </div>
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[10px] text-slate-400">লাইন ক্লিয়ার</p>
                      <p className="text-lg font-bold text-emerald-400 font-mono">{toBengaliNumber(linesCleared)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={startGame} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5">
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

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Next Block Preview */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-purple-400">পরবর্তী ব্লক</h3>
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                প্রিভিউ
              </Badge>
            </div>
            <div className="aspect-square rounded-xl bg-slate-900/50 border border-slate-700 flex items-center justify-center p-4">
              {nextBlock && (
                <div className="px-4 py-2 rounded-lg border-2 text-center w-full" style={{ 
                  backgroundColor: nextBlock.color + 'CC', 
                  borderColor: nextBlock.color 
                }}>
                  <span className="text-lg font-bold font-headline text-white">{nextBlock.text}</span>
                  <div className="text-[10px] text-slate-400 mt-1 capitalize">{nextBlock.category}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-amber-400">সেশন পরিসংখ্যান</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">সর্বোচ্চ স্কোর</p>
                <p className="font-bold text-yellow-400 font-mono">{toBengaliNumber(stats?.highScore || 0)}</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">সেরা লেভেল</p>
                <p className="font-bold text-cyan-400 font-mono">{toBengaliNumber(stats?.bestLevel || 1)}</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">ম্যাক্স কম্বো</p>
                <p className="font-bold text-amber-400 font-mono">{toBengaliNumber(maxCombo)}×</p>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400">ব্লক ক্লিয়ার</p>
                <p className="font-bold text-emerald-400 font-mono">{toBengaliNumber(blocks.filter(b => b.matched).length)}</p>
              </div>
            </div>
          </Card>

          {/* Controls Help */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">নિયন্ত্রণ</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between"><span>টাইপ করুন</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">শব্দ</kbd></div>
              <div className="flex justify-between"><span>সাবমিট</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">Space / Enter</kbd></div>
              <div className="flex justify-between"><span>পজ/রিজিউম</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">P</kbd></div>
              <div className="flex justify-between"><span>রিস্টার্ট</span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white">R</kbd></div>
            </div>
          </Card>

          {/* Category Legend */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3">শব্দ ক্যাটাগরি</h3>
            <div className="space-y-1.5 text-xs">
              {([
                { cat: 'basic', label: 'বেসিক শব্দ', color: '#10b981' },
                { cat: 'conjuncts', label: 'যুক্তাক্ষর', color: '#ec4899' },
                { cat: 'phola', label: 'ফলা (Phola)', color: '#3b82f6' },
                { cat: 'vocabulary', label: 'উন্নত শব্দ', color: '#f59e0b' },
              ] as const).map(({ cat, label, color }) => (
                <div key={cat} className="flex items-center gap-2" style={{ opacity: category === cat ? 1 : 0.6 }}>
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                  <span className="font-medium">{label}</span>
                  {category === cat && <span className="ml-auto text-indigo-400 text-xs">✓</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}