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
  Target,
  Shield,
  Sword,
  Gem,
  Castle,
  Sparkles,
  Skull,
  TrendingUp
} from 'lucide-react';
import { cn, toBengaliNumber } from '@/lib/utils';
import { getRandomGameWord, getRandomGameWordByCategory, GameDifficulty, GameCategory } from '@/lib/game/game-words';
import { gameAudio } from '@/lib/game/game-audio';
import { recordDefenseGameResult, getArcadeStats } from '@/lib/game/score-store';

interface Enemy {
  id: string;
  text: string;
  x: number;
  y: number;
  maxHp: number;
  hp: number;
  speed: number;
  type: 'normal' | 'fast' | 'tank' | 'boss';
  reward: number;
  category: GameCategory;
  color: string;
}

interface Tower {
  id: string;
  type: 'basic' | 'sniper' | 'splash' | 'freeze';
  x: number;
  y: number;
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFire: number;
  target: string | null;
  color: string;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  damage: number;
  towerId: string;
  enemyId: string;
  speed: number;
  type: 'normal' | 'splash' | 'freeze';
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

const TOWER_TYPES = {
  basic: { name: 'বেসিক টাওয়ার', cost: 50, damage: 15, range: 180, fireRate: 1000, color: '#3b82f6', upgradeCost: 80 },
  sniper: { name: 'স্নাইপার', cost: 120, damage: 40, range: 300, fireRate: 2000, color: '#ec4899', upgradeCost: 150 },
  splash: { name: 'স্প্ল্যাশ', cost: 150, damage: 20, range: 150, fireRate: 1500, color: '#f59e0b', upgradeCost: 200 },
  freeze: { name: 'ফ্রিজ', cost: 100, damage: 5, range: 160, fireRate: 800, color: '#06b6d4', upgradeCost: 120 },
} as const;

const ENEMY_TYPES = {
  normal: { hp: 50, speed: 25, reward: 10, color: '#ef4444', size: 36 },
  fast: { hp: 30, speed: 45, reward: 15, color: '#f97316', size: 30 },
  tank: { hp: 150, speed: 15, reward: 25, color: '#8b5cf6', size: 44 },
  boss: { hp: 500, speed: 10, reward: 100, color: '#dc2626', size: 60 },
} as const;

const PATH_POINTS = [
  { x: 5, y: 15 }, { x: 25, y: 15 }, { x: 25, y: 40 }, 
  { x: 75, y: 40 }, { x: 75, y: 70 }, { x: 50, y: 70 }, 
  { x: 50, y: 90 }, { x: 95, y: 90 }
];

const TOWER_SLOTS = [
  { x: 12, y: 30 }, { x: 38, y: 30 }, { x: 62, y: 30 }, { x: 88, y: 30 },
  { x: 12, y: 55 }, { x: 38, y: 55 }, { x: 62, y: 55 }, { x: 88, y: 55 },
  { x: 25, y: 80 }, { x: 75, y: 80 },
];

export default function TypingDefenseGame({ onBackToHub }: { onBackToHub?: () => void }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [category, setCategory] = useState<GameCategory>('basic');
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [gold, setGold] = useState(200);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [selectedTowerType, setSelectedTowerType] = useState<keyof typeof TOWER_TYPES>('basic');
  const [selectedTowerSlot, setSelectedTowerSlot] = useState<number | null>(null);
  const [floatTexts, setFloatTexts] = useState<{ id: string; text: string; x: number; y: number; color: string }[]>([]);
  const [stats, setStats] = useState<{ highScore: number; bestWave: number; totalGold: number } | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTimeRef = useRef<number>(0);
  const waveEnemiesSpawnedRef = useRef(0);
  const waveEnemiesTotalRef = useRef(0);

  useEffect(() => {
    setSoundOn(gameAudio.isEnabled());
    const s = getArcadeStats();
    setStats({ highScore: s.falling.highScore, bestWave: s.falling.maxLevel, totalGold: s.falling.gamesPlayed });
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
  };

  const createParticles = useCallback((x: number, y: number, color: string, count = 10, size = 4) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x, y, color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: size * (0.5 + Math.random() * 0.5),
      });
    }
    setParticles(prev => [...prev.slice(-80), ...newParticles]);
  }, []);

  const addFloatText = useCallback((text: string, x: number, y: number, color: string) => {
    setFloatTexts(prev => [...prev.slice(-5), { id: `ft-${Date.now()}-${Math.random()}`, text, x, y, color }]);
    setTimeout(() => {
      setFloatTexts(prev => prev.filter(f => f.text !== text || f.x !== x));
    }, 1000);
  }, []);

  const getPathPosition = (progress: number) => {
    const totalSegments = PATH_POINTS.length - 1;
    const segmentProgress = progress * totalSegments;
    const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
    const localProgress = segmentProgress - segmentIndex;
    
    const p1 = PATH_POINTS[segmentIndex];
    const p2 = PATH_POINTS[segmentIndex + 1];
    
    return {
      x: p1.x + (p2.x - p1.x) * localProgress,
      y: p1.y + (p2.y - p1.y) * localProgress,
    };
  };

  const spawnEnemy = useCallback((type: keyof typeof ENEMY_TYPES = 'normal') => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const startPos = getPathPosition(0);
    const enemyConfig = ENEMY_TYPES[type];
    const hpMultiplier = 1 + (wave - 1) * 0.15;
    const text = getRandomGameWordByCategory(category, difficulty);
    
    const enemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random()}`,
      text,
      x: startPos.x,
      y: startPos.y,
      maxHp: Math.round(enemyConfig.hp * hpMultiplier),
      hp: Math.round(enemyConfig.hp * hpMultiplier),
      speed: enemyConfig.speed * (0.8 + Math.random() * 0.4),
      type,
      reward: Math.round(enemyConfig.reward * hpMultiplier),
      category,
      color: enemyConfig.color,
    };
    
    setEnemies(prev => [...prev, enemy]);
    waveEnemiesSpawnedRef.current++;
  }, [category, difficulty, wave]);

  const startGame = useCallback(() => {
    setEnemies([]);
    setTowers([]);
    setProjectiles([]);
    setParticles([]);
    setInputValue('');
    setGold(200);
    setLives(20);
    setWave(1);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setSelectedTowerType('basic');
    setSelectedTowerSlot(null);
    waveEnemiesSpawnedRef.current = 0;
    waveEnemiesTotalRef.current = 5;
    lastSpawnTimeRef.current = performance.now();
    lastTimeRef.current = performance.now();
    spawnEnemy('normal');
    inputRef.current?.focus();
  }, [spawnEnemy]);

  useEffect(() => {
    startGame();
  }, [startGame, difficulty, category]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      inputRef.current?.focus();
    }
  }, [gameOver, isPaused]);

  const buildTower = useCallback((slotIndex: number) => {
    const slot = TOWER_SLOTS[slotIndex];
    const towerConfig = TOWER_TYPES[selectedTowerType];
    
    if (gold < towerConfig.cost) {
      gameAudio.playError();
      addFloatText('পর্যাপ্ত সোনা নেই!', 50, 20, '#ef4444');
      return;
    }
    
    // Check if slot occupied
    if (towers.some(t => Math.abs(t.x - slot.x) < 2 && Math.abs(t.y - slot.y) < 2)) {
      gameAudio.playError();
      return;
    }

    const newTower: Tower = {
      id: `tower-${Date.now()}`,
      type: selectedTowerType,
      x: slot.x,
      y: slot.y,
      level: 1,
      damage: towerConfig.damage,
      range: towerConfig.range,
      fireRate: towerConfig.fireRate,
      lastFire: 0,
      target: null,
      color: towerConfig.color,
    };

    setTowers(prev => [...prev, newTower]);
    setGold(prev => prev - towerConfig.cost);
    gameAudio.playCombo(1);
    createParticles(slot.x * (rect?.width || 400) / 100, slot.y * (rect?.height || 400) / 100, towerConfig.color, 15);
    addFloatText(`-${towerConfig.cost}`, slot.x, slot.y - 5, '#fbbf24');
  }, [selectedTowerType, gold, towers, createParticles, addFloatText]);

  const upgradeTower = useCallback((towerId: string) => {
    const tower = towers.find(t => t.id === towerId);
    if (!tower) return;
    const config = TOWER_TYPES[tower.type];
    const upgradeCost = config.upgradeCost * tower.level;
    
    if (gold < upgradeCost) {
      gameAudio.playError();
      addFloatText('পর্যাপ্ত সোনা নেই!', 50, 20, '#ef4444');
      return;
    }

    setTowers(prev => prev.map(t => 
      t.id === towerId 
        ? { 
            ...t, 
            level: t.level + 1, 
            damage: Math.round(t.damage * 1.4), 
            range: Math.round(t.range * 1.15),
            fireRate: Math.max(300, Math.round(t.fireRate * 0.85)),
          } 
        : t
    ));
    setGold(prev => prev - upgradeCost);
    gameAudio.playNitro();
    createParticles(tower.x * (rect?.width || 400) / 100, tower.y * (rect?.height || 400) / 100, '#fbbf24', 20);
    addFloatText(`⬆ Lv.${tower.level + 1}`, tower.x, tower.y - 5, '#fbbf24');
  }, [towers, gold, createParticles, addFloatText]);

  const sellTower = useCallback((towerId: string) => {
    const tower = towers.find(t => t.id === towerId);
    if (!tower) return;
    const config = TOWER_TYPES[tower.type];
    const refund = Math.round((config.cost + config.upgradeCost * (tower.level - 1)) * 0.7);
    
    setTowers(prev => prev.filter(t => t.id !== towerId));
    setGold(prev => prev + refund);
    gameAudio.playKeyClick();
    addFloatText(`+${refund}`, tower.x, tower.y - 5, '#10b981');
  }, [towers, addFloatText]);

  const rect = { width: 600, height: 400 }; // Approximate arena size

  // Main game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      // Spawn wave enemies
      const spawnInterval = Math.max(800, 3000 - wave * 100);
      if (currentTime - lastSpawnTimeRef.current > spawnInterval && waveEnemiesSpawnedRef.current < waveEnemiesTotalRef.current) {
        lastSpawnTimeRef.current = currentTime;
        const rand = Math.random();
        if (wave % 5 === 0 && waveEnemiesSpawnedRef.current === waveEnemiesTotalRef.current - 1) {
          spawnEnemy('boss');
        } else if (rand < 0.15) {
          spawnEnemy('fast');
        } else if (rand < 0.25) {
          spawnEnemy('tank');
        } else {
          spawnEnemy('normal');
        }
      }

      // Move enemies
      setEnemies(prev => {
        const nextEnemies: Enemy[] = [];
        let livesLost = 0;

        for (const enemy of prev) {
          const nextProgress = Math.min(1, enemy.x / 100 + (enemy.speed * dt) / 500);
          const pos = getPathPosition(nextProgress);
          
          if (nextProgress >= 1) {
            // Enemy reached castle
            livesLost += enemy.type === 'boss' ? 5 : 1;
            gameAudio.playError();
          } else {
            nextEnemies.push({ ...enemy, x: pos.x, y: pos.y });
          }
        }

        if (livesLost > 0) {
          setLives(prev => {
            const next = Math.max(0, prev - livesLost);
            if (next <= 0) {
              setGameOver(true);
              gameAudio.playGameOver();
              recordDefenseGameResult(score, wave, gold);
            }
            return next;
          });
        }

        return nextEnemies;
      });

      // Tower targeting and firing
      setTowers(prevTowers => {
        const updatedTowers = prevTowers.map(tower => {
          const config = TOWER_TYPES[tower.type];
          const now = currentTime;
          
          if (now - tower.lastFire < tower.fireRate) return tower;

          // Find target in range
          let bestTarget: Enemy | null = null;
          let bestProgress = -1;

          for (const enemy of enemies) {
            const dx = (enemy.x - tower.x) * rect.width / 100;
            const dy = (enemy.y - tower.y) * rect.height / 100;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= tower.range) {
              const progress = enemy.x / 100;
              if (progress > bestProgress) {
                bestProgress = progress;
                bestTarget = enemy;
              }
            }
          }

          if (bestTarget) {
            // Fire projectile
            const projectile: Projectile = {
              id: `proj-${Date.now()}-${Math.random()}`,
              x: tower.x * rect.width / 100,
              y: tower.y * rect.height / 100,
              targetX: bestTarget.x * rect.width / 100,
              targetY: bestTarget.y * rect.height / 100,
              damage: tower.damage,
              towerId: tower.id,
              enemyId: bestTarget.id,
              speed: 500,
              type: tower.type === 'splash' ? 'splash' : tower.type === 'freeze' ? 'freeze' : 'normal',
            };
            setProjectiles(prev => [...prev, projectile]);
            
            gameAudio.playLaser();
            
            return { ...tower, lastFire: now, target: bestTarget.id };
          }

          return { ...tower, target: null };
        });
        return updatedTowers;
      });

      // Update projectiles
      setProjectiles(prev => {
        const nextProjectiles: Projectile[] = [];
        
        for (const proj of prev) {
          const dx = proj.targetX - proj.x;
          const dy = proj.targetY - proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const moveDist = proj.speed * dt;
          
          if (moveDist >= dist) {
            // Hit target
            setEnemies(prevEnemies => prevEnemies.map(e => {
              if (e.id === proj.enemyId) {
                const newHp = Math.max(0, e.hp - proj.damage);
                if (newHp <= 0) {
                  createParticles(proj.targetX, proj.targetY, e.color, 15, 5);
                  gameAudio.playExplosion();
                  setGold(g => g + e.reward);
                  setScore(s => s + e.reward * 5);
                  addFloatText(`+${e.reward}`, proj.targetX / rect.width * 100, proj.targetY / rect.height * 100 - 5, '#fbbf24');
                  return null;
                }
                return { ...e, hp: newHp };
              }
              return e;
            }).filter((e): e is Enemy => e !== null));

            // Splash damage
            if (proj.type === 'splash') {
              setEnemies(prevEnemies => prevEnemies.map(e => {
                if (e.id !== proj.enemyId) {
                  const dx = (e.x * rect.width / 100) - proj.targetX;
                  const dy = (e.y * rect.height / 100) - proj.targetY;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < 80) {
                    const newHp = Math.max(0, e.hp - Math.round(proj.damage * 0.5));
                    if (newHp <= 0) {
                      createParticles(e.x * rect.width / 100, e.y * rect.height / 100, e.color, 10, 4);
                      gameAudio.playExplosion();
                      setGold(g => g + e.reward);
                      setScore(s => s + e.reward * 5);
                      return null;
                    }
                    return { ...e, hp: newHp };
                  }
                }
                return e;
              }).filter((e): e is Enemy => e !== null));
            }

            // Freeze effect
            if (proj.type === 'freeze') {
              setEnemies(prevEnemies => prevEnemies.map(e => {
                if (e.id !== proj.enemyId) {
                  const dx = (e.x * rect.width / 100) - proj.targetX;
                  const dy = (e.y * rect.height / 100) - proj.targetY;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < 70) {
                    return { ...e, speed: e.speed * 0.3 };
                  }
                }
                return e;
              }));
            }
          } else {
            const ratio = moveDist / dist;
            nextProjectiles.push({
              ...proj,
              x: proj.x + dx * ratio,
              y: proj.y + dy * ratio,
            });
          }
        }
        return nextProjectiles;
      });

      // Update particles
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.2,
        life: p.life - 0.02,
      })).filter(p => p.life > 0));

      // Update float texts
      setFloatTexts(prev => prev.map(f => ({
        ...f,
        y: f.y - 0.5,
      })));

      // Check wave completion
      if (enemies.length === 0 && waveEnemiesSpawnedRef.current >= waveEnemiesTotalRef.current) {
        setWave(w => {
          const nextWave = w + 1;
          waveEnemiesSpawnedRef.current = 0;
          waveEnemiesTotalRef.current = Math.min(5 + nextWave * 2, 25);
          gameAudio.playCombo(5);
          addFloatText(`তরঙ্গ ${nextWave} শুরু!`, 50, 15, '#3b82f6');
          return nextWave;
        });
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameOver, isPaused, wave, enemies, spawnEnemy, createParticles, addFloatText, score, gold]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.trim();

    // Find enemy matching input
    const targetEnemy = enemies.find(en => !en.id.startsWith('proj') && en.text.startsWith(clean));
    
    if (targetEnemy) {
      const matchedLen = clean.length;
      if (matchedLen === targetEnemy.text.length) {
        // Fully typed - deal bonus damage
        setEnemies(prev => prev.map(en => 
          en.id === targetEnemy.id 
            ? { ...en, hp: Math.max(0, en.hp - 50) }
            : en
        ).filter(en => en.hp > 0));
        
        if (targetEnemy.hp <= 50) {
          createParticles(
            targetEnemy.x * rect.width / 100, 
            targetEnemy.y * rect.height / 100, 
            targetEnemy.color, 
            20, 6
          );
          gameAudio.playExplosion();
          setGold(g => g + targetEnemy.reward * 2);
          setScore(s => s + targetEnemy.reward * 10);
          addFloatText(`বোনাস! +${targetEnemy.reward * 2}`, 50, 20, '#10b981');
        }
        
        gameAudio.playCombo(3);
        setInputValue('');
      } else {
        setInputValue(clean);
        gameAudio.playKeyClick();
      }
    } else if (clean.length > 0) {
      const anyMatch = enemies.some(en => en.text.startsWith(clean));
      if (!anyMatch) {
        gameAudio.playError();
      }
      setInputValue(raw);
    } else {
      setInputValue(raw);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      const clean = inputValue.trim();
      if (clean.length > 0 && !enemies.some(en => en.text === clean)) {
        gameAudio.playError();
      }
      setInputValue('');
      e.preventDefault();
    }
  };

  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check tower slots
    for (let i = 0; i < TOWER_SLOTS.length; i++) {
      const slot = TOWER_SLOTS[i];
      const dx = x - slot.x;
      const dy = y - slot.y;
      if (Math.sqrt(dx * dx + dy * dy) < 3) {
        const existingTower = towers.find(t => Math.abs(t.x - slot.x) < 2 && Math.abs(t.y - slot.y) < 2);
        if (existingTower) {
          setSelectedTowerSlot(i);
          // Show upgrade/sell options
        } else {
          setSelectedTowerSlot(i);
        }
        return;
      }
    }
    setSelectedTowerSlot(null);
    inputRef.current?.focus();
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
          <Badge variant="outline" className="text-xs font-semibold gap-1 bg-orange-500/10 text-orange-500 border-orange-500/30">
            <Castle className="h-3 w-3 text-orange-500" /> টাইপিং ডিফেন্স (Typing Defense)
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          {(['easy', 'medium', 'hard'] as GameDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); startGame(); }}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                difficulty === d ? "bg-orange-600 text-white font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
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

      {/* HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border rounded-xl shadow-xs">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg">
            <Gem className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-amber-500 font-mono">{toBengaliNumber(gold)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-lg">
            <Shield className="h-4 w-4 text-red-500" />
            <span className="font-bold text-red-500 font-mono">{toBengaliNumber(lives)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-lg">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="font-bold text-blue-500 font-mono">তরঙ্গ {toBengaliNumber(wave)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-lg">
            <Sword className="h-4 w-4 text-purple-500" />
            <span className="font-bold text-purple-500 font-mono">{toBengaliNumber(score)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">টাওয়ার:</span>
          <select
            value={selectedTowerType}
            onChange={(e) => setSelectedTowerType(e.target.value as keyof typeof TOWER_TYPES)}
            className="bg-slate-800 border-slate-700 text-white text-xs px-2 py-1 rounded"
          >
            {Object.entries(TOWER_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.name} (${config.cost})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Game Arena */}
        <div className="lg:col-span-3 relative">
          <div
            ref={arenaRef}
            onClick={handleArenaClick}
            className={cn(
              "relative w-full h-[70vh] min-h-[500px] max-h-[700px] rounded-2xl overflow-hidden border shadow-xl",
              "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white cursor-crosshair",
              lives <= 5 && "ring-2 ring-red-500/50",
              gameOver && "ring-2 ring-rose-500/50"
            )}
          >
            {/* Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              <path
                d={PATH_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ')}
                stroke="#374151"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8,4"
              />
              {/* Path glow */}
              <path
                d={PATH_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ')}
                stroke="#1f2937"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />
            </svg>

            {/* Castle at end */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center">
              <div className="w-16 h-12 bg-gradient-to-t from-stone-600 to-amber-700 rounded-t-lg shadow-[0_0_20px_#f59e0b] flex items-center justify-center border-t-2 border-amber-400">
                <Castle className="h-7 w-7 text-amber-300" />
              </div>
              <div className="w-20 h-3 bg-stone-800 rounded-b-lg border border-stone-600" />
              {/* Castle HP */}
              <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden border border-red-500/40">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${Math.max(0, lives / 20 * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-amber-300 font-mono mt-0.5">ক্যাসেল HP: {toBengaliNumber(lives)}/২০</span>
            </div>

            {/* Tower Slots */}
            {TOWER_SLOTS.map((slot, i) => {
              const tower = towers.find(t => Math.abs(t.x - slot.x) < 2 && Math.abs(t.y - slot.y) < 2);
              const isSelected = selectedTowerSlot === i;
              return (
                <div
                  key={i}
                  className="absolute transition-all duration-100"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)', zIndex: 5 }}
                >
                  {tower ? (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                      onClick={(e) => { e.stopPropagation(); setSelectedTowerSlot(i); }}
                    >
                      <div 
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center border-2 shadow-lg transition-all",
                          isSelected && "ring-2 ring-yellow-400 scale-110"
                        )}
                        style={{ 
                          backgroundColor: tower.color + 'CC',
                          borderColor: tower.color,
                          boxShadow: `0 0 15px ${tower.color}`,
                        }}
                      >
                        {TOWER_TYPES[tower.type as keyof typeof TOWER_TYPES].name === 'বেসিক টাওয়ার' && <Sword className="h-6 w-6 text-white" />}
                        {TOWER_TYPES[tower.type as keyof typeof TOWER_TYPES].name === 'স্নাইপার' && <Target className="h-6 w-6 text-white" />}
                        {TOWER_TYPES[tower.type as keyof typeof TOWER_TYPES].name === 'স্প্ল্যাশ' && <Sparkles className="h-6 w-6 text-white" />}
                        {TOWER_TYPES[tower.type as keyof typeof TOWER_TYPES].name === 'ফ্রিজ' && <Shield className="h-6 w-6 text-white" />}
                      </div>
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 px-1 rounded whitespace-nowrap">
                        Lv.{tower.level}
                      </span>
                    </motion.div>
                  ) : (
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center transition-all",
                        isSelected ? "border-primary bg-primary/10 scale-110" : "border-slate-700 hover:border-primary/50 hover:bg-slate-800/50"
                      )}
                      onClick={(e) => { e.stopPropagation(); buildTower(i); }}
                    >
                      <Plus className="h-5 w-5 text-slate-500" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Enemies */}
            {enemies.map((enemy) => (
              <motion.div
                key={enemy.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-100 z-10"
                style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
              >
                <div className="relative">
                  <div
                    className="rounded-lg flex items-center justify-center shadow-lg border-2"
                    style={{ 
                      width: ENEMY_TYPES[enemy.type].size, 
                      height: ENEMY_TYPES[enemy.type].size,
                      backgroundColor: enemy.color + 'CC',
                      borderColor: enemy.color,
                      boxShadow: `0 0 15px ${enemy.color}`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">{enemy.text.length > 8 ? enemy.text.slice(0, 6) + '..' : enemy.text}</span>
                  </div>
                  {/* HP Bar */}
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden border border-slate-700">
                    <div
                      className="h-full transition-all duration-100"
                      style={{ 
                        width: `${Math.max(0, enemy.hp / enemy.maxHp * 100)}%`,
                        backgroundColor: enemy.hp / enemy.maxHp > 0.5 ? '#10b981' : enemy.hp / enemy.maxHp > 0.25 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  {enemy.type === 'boss' && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                      BOSS
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Projectiles */}
            {projectiles.map((proj) => (
              <div
                key={proj.id}
                className="absolute w-2 h-2 rounded-full pointer-events-none z-5"
                style={{
                  left: proj.x,
                  top: proj.y,
                  backgroundColor: proj.type === 'freeze' ? '#06b6d4' : proj.type === 'splash' ? '#f59e0b' : '#fbbf24',
                  boxShadow: `0 0 8px ${proj.type === 'freeze' ? '#06b6d4' : proj.type === 'splash' ? '#f59e0b' : '#fbbf24'}`,
                }}
              />
            ))}

            {/* Particles */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                  opacity: p.life,
                }}
              />
            ))}

            {/* Float Texts */}
            {floatTexts.map((ft) => (
              <motion.div
                key={ft.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -30, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute text-sm font-bold pointer-events-none drop-shadow-md z-20"
                style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color, transform: 'translateX(-50%)' }}
              >
                {ft.text}
              </motion.div>
            ))}

            {/* Input Area */}
            <div className="absolute bottom-2 left-3 right-3 flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 z-20 shadow-md">
              <div className="relative w-full sm:w-80">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="শত্রু টাইপ করুন বোনাস ড্যামেজ পেতে..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={gameOver || isPaused}
                  className="w-full h-10 px-4 bg-slate-950/80 border-orange-600/60 text-white font-headline text-base rounded-lg focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:border-orange-400 placeholder:text-slate-500 text-center"
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
                    <Skull className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-headline text-rose-400">ক্যাসেল পতিত হয়েছে!</h2>
                    <p className="text-xs text-slate-400 mt-0.5">শত্রু দলে রক্ষাগার ভেদ করেছে।</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2">
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[10px] text-slate-400">স্কোর</p>
                      <p className="text-lg font-bold text-purple-500 font-mono">{toBengaliNumber(score)}</p>
                    </div>
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[10px] text-slate-400">তরঙ্গ</p>
                      <p className="text-lg font-bold text-blue-500 font-mono">{toBengaliNumber(wave)}</p>
                    </div>
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                      <p className="text-[10px] text-slate-400">সোনা</p>
                      <p className="text-lg font-bold text-amber-500 font-mono">{toBengaliNumber(gold)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={startGame} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold gap-1.5">
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
          {/* Tower Shop */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
              <Gem className="h-3.5 w-3.5" /> টাওয়ার শপ
            </h3>
            <div className="space-y-2">
              {Object.entries(TOWER_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTowerType(key as keyof typeof TOWER_TYPES)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all text-xs",
                    selectedTowerType === key
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-slate-700 hover:border-primary/50 hover:bg-slate-800/50"
                  )}
                  style={{ borderLeftColor: config.color, borderLeftWidth: selectedTowerType === key ? 3 : 1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold" style={{ color: config.color }}>{config.name}</span>
                    <span className="text-amber-500 font-mono">${config.cost}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                    <span>ড্যামেজ: {config.damage}</span>
                    <span>রেঞ্জ: {config.range}px</span>
                    <span>ফায়ার রেট: {config.fireRate}ms</span>
                    <span>আপগ্রেড: ${config.upgradeCost}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Selected Tower Actions */}
          {selectedTowerSlot !== null && (
            <Card className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-cyan-400">স্লট অ্যাকশন</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => buildTower(selectedTowerSlot)}
                  disabled={gold < TOWER_TYPES[selectedTowerType].cost}
                >
                  <Sword className="h-3 w-3" /> বিল্ড (${TOWER_TYPES[selectedTowerType].cost})
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-slate-400"
                  onClick={() => setSelectedTowerSlot(null)}
                >
                  বাতিল
                </Button>
              </div>
            </Card>
          )}

          {/* Tower Upgrade Panel */}
          {selectedTowerSlot !== null && towers.find(t => Math.abs(t.x - TOWER_SLOTS[selectedTowerSlot].x) < 2 && Math.abs(t.y - TOWER_SLOTS[selectedTowerSlot].y) < 2) && (
            <Card className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-emerald-400">টাওয়ার আপগ্রেড</h3>
              {(() => {
                const tower = towers.find(t => Math.abs(t.x - TOWER_SLOTS[selectedTowerSlot!].x) < 2 && Math.abs(t.y - TOWER_SLOTS[selectedTowerSlot!].y) < 2);
                if (!tower) return null;
                const config = TOWER_TYPES[tower.type];
                const upgradeCost = config.upgradeCost * tower.level;
                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>{config.name} Lv.{tower.level}</span>
                      <span className="font-bold">{upgradeCost > gold ? 'দরকার' : 'প্রস্তুত'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-slate-400">
                      <span>ড্যামেজ: {tower.damage} → {Math.round(tower.damage * 1.4)}</span>
                      <span>রেঞ্জ: {tower.range} → {Math.round(tower.range * 1.15)}</span>
                      <span>ফায়ার রেট: {tower.fireRate}ms → {Math.max(300, Math.round(tower.fireRate * 0.85))}ms</span>
                      <span>ক τέλος: ${upgradeCost}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => upgradeTower(tower.id)}
                        disabled={gold < upgradeCost}
                      >
                        <TrendingUp className="h-3 w-3" /> আপগ্রেড
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs text-rose-400 border-rose-400"
                        onClick={() => sellTower(tower.id)}
                      >
                        <RotateCcw className="h-3 w-3" /> বিক্রি (${Math.round((config.cost + config.upgradeCost * (tower.level - 1)) * 0.7)})
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </Card>
          )}

          {/* Wave Info */}
          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-blue-400">তরঙ্গ তথ্য</h3>
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between"><span>বর্তমান तरঙ্গ</span><span className="font-bold text-blue-400">{toBengaliNumber(wave)}</span></div>
              <div className="flex justify-between"><span>স্প seguinte</span><span className="font-bold text-slate-400">{toBengaliNumber(waveEnemiesSpawnedRef.current)}/{toBengaliNumber(waveEnemiesTotalRef.current)}</span></div>
              <div className="flex justify-between"><span>টাওয়ার সংখ্যা</span><span className="font-bold text-amber-400">{toBengaliNumber(towers.length)}</span></div>
              <div className="flex justify-between"><span>শত্রু বাঁচে</span><span className="font-bold text-red-400">{toBengaliNumber(enemies.length)}</span></div>
            </div>
          </Card>

          {/* Enemy Types Legend */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-rose-400 mb-3">শত্রুর প্রকার</h3>
            <div className="space-y-2 text-xs">
              {Object.entries(ENEMY_TYPES).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 p-1.5 bg-slate-800/50 rounded">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: config.color + 'CC' }}>
                    {key === 'boss' && <Skull className="h-3.5 w-3.5 text-white" />}
                    {key === 'tank' && <Shield className="h-3.5 w-3.5 text-white" />}
                    {key === 'fast' && <Zap className="h-3.5 w-3.5 text-white" />}
                    {key === 'normal' && <Sword className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium capitalize">{key === 'normal' ? 'সাধারণ' : key === 'fast' ? 'দ্রুত' : key === 'tank' ? 'ট্যাঙ্ক' : 'বস'}</div>
                    <div className="text-[10px] text-slate-400">HP: {config.hp} | গতি: {config.speed} | পুরস্কার: ${config.reward}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Missing Plus icon import
import { Plus } from 'lucide-react';