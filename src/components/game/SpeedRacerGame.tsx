"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Trophy, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Flame, 
  Gauge, 
  Timer, 
  Car,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RACING_SENTENCES } from '@/lib/game/game-words';
import { gameAudio } from '@/lib/game/game-audio';
import { recordRacerGameResult, getArcadeStats } from '@/lib/game/game-storage';
import { toBengaliNumber } from '@/lib/utils';
import { normalizeBengaliString } from '@/lib/bengali-grapheme';

interface RacerCar {
  name: string;
  color: string;
  lane: number;
  progressPercent: number; // 0% to 100%
  baseWpm: number;
  isPlayer?: boolean;
}

export default function SpeedRacerGame({ onBackToHub }: { onBackToHub?: () => void }) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [isNitro, setIsNitro] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [playerRank, setPlayerRank] = useState(1);
  const [soundOn, setSoundOn] = useState(true);

  const [cars, setCars] = useState<RacerCar[]>([
    { name: 'আপনি (প্লেয়ার)', color: '#38bdf8', lane: 0, progressPercent: 0, baseWpm: 0, isPlayer: true },
    { name: 'বিদ্যুৎ গতি', color: '#f59e0b', lane: 1, progressPercent: 0, baseWpm: 28 },
    { name: 'ঝড়ো তুফান', color: '#ec4899', lane: 2, progressPercent: 0, baseWpm: 34 },
    { name: 'অগ্নি বাণ', color: '#10b981', lane: 3, progressPercent: 0, baseWpm: 24 },
  ]);

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSentence = RACING_SENTENCES[sentenceIndex] || RACING_SENTENCES[0];
  const targetText = React.useMemo(() => normalizeBengaliString(currentSentence.text), [currentSentence.text]);

  useEffect(() => {
    setSoundOn(gameAudio.isEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    gameAudio.setEnabled(next);
  };

  const startRace = useCallback(() => {
    setTypedInput('');
    setStartTime(null);
    setEndTime(null);
    setCurrentWpm(0);
    setIsNitro(false);
    setRaceFinished(false);
    setPlayerRank(1);

    setCars([
      { name: 'আপনি (প্লেয়ার)', color: '#38bdf8', lane: 0, progressPercent: 0, baseWpm: 0, isPlayer: true },
      { name: 'বিদ্যুৎ গতি', color: '#f59e0b', lane: 1, progressPercent: 0, baseWpm: 28 },
      { name: 'ঝড়ো তুফান', color: '#ec4899', lane: 2, progressPercent: 0, baseWpm: 34 },
      { name: 'অগ্নি বাণ', color: '#10b981', lane: 3, progressPercent: 0, baseWpm: 24 },
    ]);

    hiddenInputRef.current?.focus();
  }, []);

  useEffect(() => {
    startRace();
    return () => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    };
  }, [startRace, sentenceIndex]);

  // AI Cars progression ticker
  useEffect(() => {
    if (!startTime || raceFinished) return;

    raceIntervalRef.current = setInterval(() => {
      const now = performance.now();
      const elapsedMinutes = (now - startTime) / 60000;

      setCars((prev) => {
        const next = prev.map((car) => {
          if (car.isPlayer) return car;
          const targetChars = targetText.length;
          const simulatedChars = car.baseWpm * 4 * elapsedMinutes;
          const progress = Math.min(100, (simulatedChars / targetChars) * 100);
          return { ...car, progressPercent: progress };
        });

        // Determine real-time rank of player
        const player = next.find((c) => c.isPlayer);
        if (player) {
          const sorted = [...next].sort((a, b) => b.progressPercent - a.progressPercent);
          const rank = sorted.findIndex((c) => c.isPlayer) + 1;
          setPlayerRank(rank);
        }

        return next;
      });
    }, 150);

    return () => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    };
  }, [startTime, raceFinished, targetText.length]);

  // Handle typing in race
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (raceFinished) return;

    const val = normalizeBengaliString(e.target.value);
    const now = performance.now();

    if (!startTime) {
      setStartTime(now);
    }

    // Only allow typing matching prefix of target
    if (targetText.startsWith(val)) {
      setTypedInput(val);
      gameAudio.playKeyClick();

      // Compute live WPM
      const start = startTime || now;
      const elapsedMin = Math.max(0.01, (now - start) / 60000);
      const graphemes = val.length;
      const wpm = Math.round((graphemes / 4) / elapsedMin);
      setCurrentWpm(wpm);

      // Nitro activation at 35+ WPM
      if (wpm >= 35 && !isNitro) {
        setIsNitro(true);
        gameAudio.playNitro();
      } else if (wpm < 35 && isNitro) {
        setIsNitro(false);
      }

      // Update player car position
      const progress = (val.length / targetText.length) * 100;
      setCars((prev) =>
        prev.map((c) => (c.isPlayer ? { ...c, progressPercent: progress, baseWpm: wpm } : c))
      );

      // Check Race Finish
      if (val === targetText) {
        const finishTime = now;
        setEndTime(finishTime);
        setRaceFinished(true);
        gameAudio.playCombo(10);

        const totalElapsedMin = (finishTime - (startTime || now)) / 60000;
        const finalWpm = Math.round((val.length / 4) / totalElapsedMin);

        // Check final rank
        const playerWon = playerRank === 1;
        recordRacerGameResult(finalWpm, playerWon);
      }
    } else {
      gameAudio.playError();
    }
  };

  const nextSentence = () => {
    setSentenceIndex((prev) => (prev + 1) % RACING_SENTENCES.length);
  };

  const stats = getArcadeStats();

  return (
    <div
      onClick={() => hiddenInputRef.current?.focus()}
      className="w-full max-w-6xl mx-auto space-y-3 select-none"
    >
      {/* Hidden input for keystroke capture */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={typedInput}
        onChange={handleInputChange}
        className="absolute opacity-0 pointer-events-none"
        autoFocus
      />

      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-card border rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToHub && (
            <Button onClick={onBackToHub} variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> আর্কেড মেন্যু
            </Button>
          )}
          <Badge variant="outline" className="text-xs font-semibold gap-1 bg-amber-500/10 text-amber-500 border-amber-500/30">
            <Car className="h-3.5 w-3.5 text-amber-500" /> টাইপ দৌড় (Speed Racer)
          </Badge>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <Button onClick={startRace} variant="outline" size="sm" className="h-8 w-8 p-0" title="নতুন রেস">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button onClick={toggleSound} variant="outline" size="sm" className="h-8 w-8 p-0" title="সাউন্ড টগল">
            {soundOn ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* 4-Lane Racing Track Arena */}
      <div className="relative w-full h-[420px] min-h-[400px] rounded-2xl overflow-hidden border shadow-xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-700/60 p-4 flex flex-col justify-between">
        {/* Track finish line */}
        <div className="absolute top-0 bottom-0 right-10 w-5 bg-[repeating-linear-gradient(45deg,#fff,#fff_8px,#000_8px,#000_16px)] opacity-75 z-10 shadow-lg" />
        <div className="absolute top-2.5 right-14 text-[10px] text-yellow-400 font-mono font-bold tracking-widest uppercase bg-slate-950/80 px-2 py-0.5 rounded border border-yellow-500/30">
          🏁 ফিনিশ লাইন
        </div>

        {/* 4 Track Lanes */}
        {cars.map((car, idx) => (
          <div key={idx} className="relative w-full h-20 bg-slate-900/90 rounded-xl border border-slate-800/90 flex items-center px-4 shadow-inner">
            {/* Lane Divider Stripes */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-700/50 pointer-events-none" />

            {/* Racer Name & Rank Badge */}
            <div className="absolute left-3 z-10 flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-md border border-slate-800 text-xs font-bold shadow-sm">
              <span style={{ color: car.color }}>{car.name}</span>
              {car.isPlayer && (
                <span className="text-[11px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
                  {toBengaliNumber(currentWpm)} WPM
                </span>
              )}
            </div>

            {/* Car Object */}
            <div
              className="absolute transition-all duration-150 flex items-center z-20"
              style={{
                left: `calc(12% + ${car.progressPercent * 0.78}%)`,
              }}
            >
              {/* Nitro flame trail behind player */}
              {car.isPlayer && isNitro && (
                <div className="mr-1.5 flex items-center text-cyan-400 animate-pulse">
                  <Flame className="h-6 w-6 fill-cyan-400 rotate-90" />
                </div>
              )}

              {/* Car Icon */}
              <div
                className="w-12 h-8 rounded-xl flex items-center justify-center shadow-lg border transition-transform"
                style={{
                  backgroundColor: car.color,
                  borderColor: '#ffffff60',
                  boxShadow: car.isPlayer && isNitro ? '0 0 20px #38bdf8' : `0 0 10px ${car.color}`,
                }}
              >
                <Car className="h-5 w-5 text-slate-950" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Target Sentence Display Card */}
      <div className="p-4 sm:p-5 bg-card border rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            রেস টেক্সট ({toBengaliNumber(sentenceIndex + 1)}/{toBengaliNumber(RACING_SENTENCES.length)})
          </span>
          {currentSentence.author && (
            <Badge variant="secondary" className="text-[11px]">
              {currentSentence.author}
            </Badge>
          )}
        </div>

        {/* Live typing target text display */}
        <div className="p-4 rounded-xl bg-secondary/30 border text-lg sm:text-xl font-headline tracking-wide leading-relaxed">
          <span className="text-emerald-500 font-bold">{typedInput}</span>
          <span className="text-foreground/90">{targetText.slice(typedInput.length)}</span>
        </div>

        {/* Speedometer & Race HUD Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t">
          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-primary" />
              <span className="font-semibold text-muted-foreground">গতি:</span>
              <span className="text-base font-bold text-primary font-mono">{toBengaliNumber(currentWpm)} WPM</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-muted-foreground">অবস্থান:</span>
              <span className="text-base font-bold text-foreground font-mono">
                {playerRank === 1 ? '১ম 🥇' : playerRank === 2 ? '২য় 🥈' : playerRank === 3 ? '৩য় 🥉' : '৪র্থ'}
              </span>
            </div>

            {isNitro && (
              <Badge className="bg-cyan-500/20 text-cyan-500 border-cyan-500/40 text-xs gap-1 font-bold animate-pulse">
                <Flame className="h-3 w-3 fill-cyan-400" /> নাইট্রো সক্রিয়!
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            কীবোর্ডে বাংলা টাইপ করুন, গতি সরাসরি গাড়িকে ত্বরান্বিত করবে!
          </p>
        </div>
      </div>

      {/* Race Finished Modal */}
      {raceFinished && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full p-6 bg-card border rounded-2xl text-center space-y-4 shadow-2xl"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500">
              <Trophy className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-headline">
                {playerRank === 1 ? 'অভিনন্দন! আপনি ১ম হয়েছেন 🏆' : `রেস সম্পন্ন! আপনার অবস্থান: ${toBengaliNumber(playerRank)}`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {playerRank === 1 ? 'চমৎকার গতি ও নির্ভুলতায় আপনি জয়ী হয়েছেন!' : 'পরের রেসে গতি আরও বাড়িয়ে ১ম হওয়ার চেষ্টা করুন!'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="p-3 bg-secondary rounded-xl border">
                <p className="text-[11px] text-muted-foreground">আপনার গতি</p>
                <p className="text-xl font-bold text-primary font-mono">{toBengaliNumber(currentWpm)} WPM</p>
              </div>
              <div className="p-3 bg-secondary rounded-xl border">
                <p className="text-[11px] text-muted-foreground">সর্বোচ্চ গতি রেকর্ড</p>
                <p className="text-xl font-bold text-foreground font-mono">{toBengaliNumber(stats.racer.bestWpm)} WPM</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={nextSentence} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-1.5">
                পরবর্তী রেস <CheckCircle2 className="h-4 w-4" />
              </Button>
              {onBackToHub && (
                <Button onClick={onBackToHub} variant="outline">
                  আর্কেড মেন্যু
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
