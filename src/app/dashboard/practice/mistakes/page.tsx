"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Zap,
  Target,
  CheckCircle2,
  ArrowRight,
  Award,
  Play,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWeakCharacters } from "@/hooks/use-lessons";
import {
  generateRecommendations,
  generateDrillContent,
  type DrillContent,
} from "@/lib/learning/recommender";
import type { WeakCharacterView } from "@/lib/types";
import { SimplifiedKeyboard } from "@/components/common/VirtualKeyboard";
import { cn, toBengaliNumber } from "@/lib/utils";
import DifficultyFeedback from "@/components/typing/DifficultyFeedback";
import { useToast } from "@/hooks/use-toast";
import { findKeyInfoForChar, getKeyboardLayoutConfig } from "@/lib/keyboard-layouts";
import {
  normalizeBengaliString,
  composeBengaliKeystroke,
  isValidBengaliTypingPrefix,
  getNextExpectedKeyChar,
  bengaliSegmenter,
  getBengaliGraphemeClip,
  getUpcomingIndependentVowel,
} from "@/lib/bengali-grapheme";
import { apiFetch } from "@/lib/api-client";

// Default fallback weak characters for new/guest users to try immediately
const FALLBACK_WEAK_CHARS: WeakCharacterView[] = [
  { user_id: "demo", character: "ক্ষ", accuracy_rate: 64, error_count: 8, total_attempts: 22, strength_level: "Weak" },
  { user_id: "demo", character: "জ্ঞ", accuracy_rate: 68, error_count: 6, total_attempts: 19, strength_level: "Weak" },
  { user_id: "demo", character: "ৌ", accuracy_rate: 75, error_count: 5, total_attempts: 20, strength_level: "Weak" },
  { user_id: "demo", character: "ত্র", accuracy_rate: 79, error_count: 4, total_attempts: 19, strength_level: "Weak" },
  { user_id: "demo", character: "শ্র", accuracy_rate: 82, error_count: 3, total_attempts: 17, strength_level: "Weak" },
  { user_id: "demo", character: "হ্ম", accuracy_rate: 71, error_count: 5, total_attempts: 17, strength_level: "Weak" },
];

export default function MistakesPracticePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { weakChars: apiWeakChars } = useWeakCharacters(user?.id || null, 90);

  const weakCharacters: WeakCharacterView[] = useMemo(() => {
    if (apiWeakChars && apiWeakChars.length > 0) {
      return apiWeakChars;
    }
    return FALLBACK_WEAK_CHARS;
  }, [apiWeakChars]);

  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [activeDrill, setActiveDrill] = useState<DrillContent | null>(null);

  // Drill player state
  const [itemIndex, setItemIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isDrillFinished, setIsDrillFinished] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const lastKeyHandledTimeRef = useRef<number>(0);

  // Select all weak characters by default when loaded
  useEffect(() => {
    if (weakCharacters.length > 0 && selectedChars.length === 0) {
      setSelectedChars(weakCharacters.map((w) => w.character));
    }
  }, [weakCharacters, selectedChars.length]);

  const toggleCharSelection = (char: string) => {
    setSelectedChars((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char]
    );
  };

  const startTargetedDrill = () => {
    const chosenWeak = weakCharacters.filter((w) => selectedChars.includes(w.character));
    const recommendations = generateRecommendations(chosenWeak);
    const content = generateDrillContent(recommendations);

    setActiveDrill(content);
    setItemIndex(0);
    setCurrentInput("");
    setTotalKeystrokes(0);
    setErrorCount(0);
    setStartTime(null);
    setEndTime(null);
    setIsDrillFinished(false);

    setTimeout(() => hiddenInputRef.current?.focus(), 100);
  };

  const currentDrillItem = activeDrill?.items[itemIndex];
  const targetText = currentDrillItem?.text || "";

  // Compute next character needed from current target
  const nextCharToType = useMemo(() => {
    return getNextExpectedKeyChar(currentInput, targetText, true);
  }, [targetText, currentInput]);

  const upcomingVowel = useMemo(() => {
    return getUpcomingIndependentVowel(currentInput, targetText);
  }, [targetText, currentInput]);

  // Resolve keyboard key position and finger guidance
  const resolvedKeyInfo = useMemo(() => {
    return findKeyInfoForChar(nextCharToType, undefined, upcomingVowel?.processLabel);
  }, [nextCharToType, upcomingVowel]);

  // Live stats calculation
  const accuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100;
    const correct = Math.max(0, totalKeystrokes - errorCount);
    return Math.round((correct / totalKeystrokes) * 100);
  }, [totalKeystrokes, errorCount]);

  const timeElapsedSec = useMemo(() => {
    if (!startTime) return 0;
    const end = endTime || Date.now();
    return Math.max(1, Math.round((end - startTime) / 1000));
  }, [startTime, endTime]);

  const wpm = useMemo(() => {
    if (timeElapsedSec <= 0 || totalKeystrokes <= 0) return 0;
    return Math.round((totalKeystrokes / 5) / (timeElapsedSec / 60));
  }, [totalKeystrokes, timeElapsedSec]);

  // Handle keystroke in drill
  const handleCharInput = useCallback(
    (char: string) => {
      if (isDrillFinished || !activeDrill) return;

      if (!startTime) {
        setStartTime(Date.now());
      }

      setTotalKeystrokes((prev) => prev + 1);
      const nextInput = composeBengaliKeystroke(currentInput, char);
      const isPrefixValid = isValidBengaliTypingPrefix(nextInput, targetText);

      if (isPrefixValid) {
        setCurrentInput(nextInput);
        const normNextInput = normalizeBengaliString(nextInput);
        const normTarget = normalizeBengaliString(targetText);

        if (normNextInput === normTarget) {
          if (itemIndex < activeDrill.items.length - 1) {
            setItemIndex((prev) => prev + 1);
            setCurrentInput("");
          } else {
            const finalEndTime = Date.now();
            setEndTime(finalEndTime);
            setIsDrillFinished(true);

            // Persist drill results to user_progress
            if (user) {
              const timeSec = Math.max(1, Math.round((finalEndTime - (startTime || finalEndTime)) / 1000));
              apiFetch("/api/user-progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: user.id,
                  lessonId: "weakness-practice",
                  wpm,
                  accuracy,
                  errors: errorCount,
                  timeElapsed: timeSec,
                  erredCharacters: [],
                }),
              }).catch((err) => console.error("Failed to save weakness practice progress:", err));
            }

            toast({
              title: "অভিনন্দন! দুর্বলতা অনুশীলন সম্পন্ন 🎉",
              description: `আপনার অর্জিত নির্ভুলতা ${toBengaliNumber(accuracy)}%।`,
            });
          }
        }
      } else {
        setErrorCount((prev) => prev + 1);
      }
    },
    [isDrillFinished, activeDrill, startTime, currentInput, targetText, itemIndex, accuracy, errorCount, wpm, user, toast]
  );

  // Focus input automatically
  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, [activeDrill, itemIndex, isDrillFinished]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setCurrentInput((prev) => {
        if (!prev) return prev;
        return Array.from(prev).slice(0, -1).join("");
      });
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      lastKeyHandledTimeRef.current = performance.now();
      handleCharInput(" ");
      return;
    }

    const isExpectingHasanta = nextCharToType === "্";
    const isHasantaKey =
      e.key === "্" ||
      (e.code === "KeyH" && !e.shiftKey) ||
      (e.key === "Dead" && e.code === "KeyH");

    if (isExpectingHasanta && isHasantaKey) {
      e.preventDefault();
      lastKeyHandledTimeRef.current = performance.now();
      handleCharInput("্");
      return;
    }

    // Check if e.key is a Bengali character or punctuation
    const isBengaliChar =
      (e.key.length === 1 && e.key >= "\u0980" && e.key <= "\u09FF") ||
      e.key === "।" ||
      e.key === "\u200C" ||
      e.key === "\u200D";

    if (isBengaliChar) {
      e.preventDefault();
      lastKeyHandledTimeRef.current = performance.now();
      handleCharInput(e.key);
      return;
    }

    // Modifier / IME keys are ignored
    const skipKeys = [
      "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Dead", "Process",
      "Unidentified", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End", "PageUp", "PageDown"
    ];
    if (skipKeys.includes(e.key)) {
      return;
    }

    // Physical keyboard (QWERTY) fallback using BanglaWord layout
    const layout = getKeyboardLayoutConfig("banglaword");
    const allKeys = [...layout.top, ...layout.home, ...layout.bottom];
    const keyEntry = allKeys.find((k) => k.keyCode === e.code);
    if (keyEntry) {
      e.preventDefault();
      const mappedChar = e.shiftKey ? (keyEntry.bnShift ?? keyEntry.bn) : keyEntry.bn;
      if (mappedChar && mappedChar !== "Shift") {
        lastKeyHandledTimeRef.current = performance.now();
        handleCharInput(mappedChar);
      }
    }
  };

  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const val = inputEl.value;
    const now = performance.now();
    if (now - lastKeyHandledTimeRef.current < 150) {
      inputEl.value = "";
      return;
    }
    if (val) {
      for (const char of val) {
        if ((char >= "\u0980" && char <= "\u09FF") || char === " " || char === "।") {
          handleCharInput(char);
        }
      }
      inputEl.value = "";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hidden input for keystrokes */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        onKeyDown={onKeyDown}
        onInput={onInput}
        onCompositionEnd={onInput}
        onBlur={() => {
          if (activeDrill && !isDrillFinished) {
            hiddenInputRef.current?.focus();
          }
        }}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 via-amber-500/5 to-background border p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> অ্যাডাপটিভ লার্নিং হাব (#24)
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-foreground">
              ভুল সংশোধন ও দুর্বলতা দূরীকরণ
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              আপনার যে অক্ষর বা যুক্তাক্ষরে সবচেয়ে বেশি ভুল হয়, সিস্টেম স্বয়ংক্রিয়ভাবে সেগুলোকে শনাক্ত করে কাস্টম ড্রিল তৈরি করে।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              onClick={startTargetedDrill}
              disabled={selectedChars.length === 0}
              className="bg-primary text-primary-foreground gap-2 font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Play className="h-4 w-4" /> নির্বাচিত {toBengaliNumber(selectedChars.length)}টি প্র্যাকটিস করুন
            </Button>
          </div>
        </div>
      </div>

      {/* ACTIVE DRILL RUNNER */}
      {activeDrill && !isDrillFinished && (
        <Card className="border-2 border-primary/50 shadow-lg bg-card animate-in fade-in zoom-in-95 duration-300">
          <CardHeader className="bg-primary/5 border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                  {activeDrill.title}
                </span>
                <CardTitle className="text-lg font-bold font-headline mt-1">
                  {activeDrill.description}
                </CardTitle>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground font-medium">
                  অগ্রগতি: {toBengaliNumber(itemIndex + 1)} / {toBengaliNumber(activeDrill.items.length)}
                </span>
                <div className="w-28 mt-1">
                  <Progress
                    value={((itemIndex + 1) / activeDrill.items.length) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6" onClick={() => hiddenInputRef.current?.focus()}>
            {/* Target Display Box with progressive in-place coloring */}
            <div className="p-8 bg-secondary/30 rounded-2xl border flex flex-col items-center justify-center min-h-[160px] text-center">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                ধরন: {currentDrillItem?.category}
              </span>
              <div className="text-6xl sm:text-7xl font-extrabold font-headline tracking-wide leading-none select-none whitespace-pre">
                {(() => {
                  const normTarget = normalizeBengaliString(targetText);
                  const normInput = normalizeBengaliString(currentInput);
                  const targetClusters = bengaliSegmenter.segmentString(normTarget);
                  const inputClusters = bengaliSegmenter.segmentString(normInput);

                  return targetClusters.map((cluster, cIdx) => {
                    const normCluster = normalizeBengaliString(cluster);

                    // Inter-word space character: preserve full proportional space width in flex container
                    if (cluster === ' ' || cluster === '\u00A0' || !cluster.trim()) {
                      const isTyped = cIdx < inputClusters.length && normalizeBengaliString(inputClusters[cIdx]) === normCluster;
                      const isNextSpace = cIdx === inputClusters.length;
                      return (
                        <span
                          key={`m-cluster-${cIdx}`}
                          className={cn(
                            "inline-block select-none shrink-0",
                            isTyped
                              ? "text-green-600 dark:text-green-400"
                              : isNextSpace
                              ? "text-foreground/70"
                              : "text-muted-foreground/35 dark:text-muted-foreground/45"
                          )}
                          style={{ width: '0.35em' }}
                          aria-hidden="true"
                        >
                          {'\u00A0'}
                        </span>
                      );
                    }

                    // 1. Fully typed matching cluster -> pure green
                    if (cIdx < inputClusters.length) {
                      const typedCluster = normalizeBengaliString(inputClusters[cIdx]);
                      if (typedCluster === normCluster) {
                        return (
                          <span
                            key={`m-cluster-${cIdx}`}
                            className="text-green-600 dark:text-green-400 font-black"
                          >
                            {cluster}
                          </span>
                        );
                      }
                    }

                    // 2. Intra-cluster partial progress (e.g. 'ক' in 'ক্ষ')
                    if (cIdx === inputClusters.length - 1 && inputClusters.length > 0) {
                      const typedCluster = normalizeBengaliString(inputClusters[cIdx]);
                      if (normCluster.startsWith(typedCluster) && typedCluster.length < normCluster.length) {
                        const currentStep = typedCluster.length;
                        const totalSteps = normCluster.length;
                        return (
                          <span
                            key={`m-cluster-${cIdx}`}
                            className="relative inline-flex items-center justify-center leading-none"
                          >
                            <span className="text-muted-foreground/35 dark:text-muted-foreground/45 select-none leading-none">
                              {cluster}
                            </span>
                            <span
                              className="absolute inset-0 flex items-center justify-center text-green-600 dark:text-green-400 font-black select-none pointer-events-none leading-none transition-all duration-150"
                              style={{
                                clipPath: getBengaliGraphemeClip(normCluster, currentStep, totalSteps),
                              }}
                              aria-hidden="true"
                            >
                              {cluster}
                            </span>
                          </span>
                        );
                      }
                    }

                    // 3. Untyped cluster -> crisp foreground for current target cluster, neutral muted for upcoming
                    const isNextActive = cIdx === inputClusters.length;
                    return (
                      <span
                        key={`m-cluster-${cIdx}`}
                        className={cn(
                          isNextActive
                            ? "text-foreground font-black"
                            : "text-muted-foreground/40 dark:text-muted-foreground/45"
                        )}
                      >
                        {cluster}
                      </span>
                    );
                  });
                })()}
              </div>
              {currentInput.length > 0 && (
                <div className="mt-4 text-sm font-mono text-muted-foreground flex items-center gap-2">
                  <span className="text-muted-foreground/70">টাইপ করেছেন:</span>
                  <span className="text-green-600 dark:text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 text-base whitespace-pre">
                    {currentInput}
                  </span>
                </div>
              )}
            </div>

            {/* Live Virtual Keyboard with active target key */}
            <SimplifiedKeyboard
              highlightKeyCode={resolvedKeyInfo?.keyCode}
              needsShift={!!resolvedKeyInfo?.needsShift}
              resolvedKeyInfo={resolvedKeyInfo}
              showFingerGuide={true}
            />

            {/* Status Footer */}
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl text-sm font-semibold">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-primary">
                  <Zap className="h-4 w-4" /> {toBengaliNumber(wpm)} WPM
                </span>
                <span className="flex items-center gap-1.5 text-foreground">
                  <Target className="h-4 w-4 text-green-500" /> {toBengaliNumber(accuracy)}% নির্ভুলতা
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setItemIndex(0);
                  setCurrentInput("");
                  setTotalKeystrokes(0);
                  setErrorCount(0);
                  setStartTime(null);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" /> রিসেট
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DRILL COMPLETION CELEBRATION */}
      {activeDrill && isDrillFinished && (
        <Card className="border-2 border-green-500/50 p-8 text-center space-y-6 bg-card shadow-lg animate-in zoom-in-95">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
            <Award className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-headline">চমৎকার কাজ! দুর্বলতা অনুশীলন সফল 🎉</h2>
            <p className="text-muted-foreground mt-2">
              আপনি সফলভাবে ভুলগুলো সংশোধন ও আয়ত্ত করেছেন।
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="p-4 bg-secondary/50 rounded-xl">
              <p className="text-xs text-muted-foreground">গতি (WPM)</p>
              <p className="text-2xl font-bold text-primary">{toBengaliNumber(wpm)}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl">
              <p className="text-xs text-muted-foreground">নির্ভুলতা</p>
              <p className="text-2xl font-bold text-primary">{toBengaliNumber(accuracy)}%</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-xl">
              <p className="text-xs text-muted-foreground">সময়</p>
              <p className="text-2xl font-bold text-primary">{toBengaliNumber(timeElapsedSec)}s</p>
            </div>
          </div>

          {/* Difficulty Feedback Survey */}
          <div className="max-w-md mx-auto pt-2">
            <DifficultyFeedback onFeedback={(rating) => console.log("Difficulty rating:", rating)} />
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={startTargetedDrill} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> পুনরায় ড্রিল করুন
            </Button>
            <Button onClick={() => setActiveDrill(null)} className="bg-primary text-primary-foreground gap-2">
              নতুন অক্ষর নির্বাচন করুন <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* WEAK CHARACTERS SELECTOR GRID */}
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold font-headline">
                চিহ্নিত দুর্বল অক্ষর ও যুক্তাক্ষর তালিকা
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                যেসব অক্ষরে আপনার নির্ভুলতা কম সেগুলোকে টিক দিয়ে একক বা যৌথ ড্রিল শুরু করুন।
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedChars(weakCharacters.map((w) => w.character))}
              >
                সব নির্বাচন
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedChars([])}
              >
                বাতিল
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {weakCharacters.map((item) => {
              const isSelected = selectedChars.includes(item.character);
              const isVeryWeak = item.accuracy_rate < 70;

              return (
                <div
                  key={item.character}
                  onClick={() => toggleCharSelection(item.character)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all select-none flex items-center justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-background border flex items-center justify-center font-bold text-2xl text-foreground font-headline shadow-xs">
                      {item.character}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          নির্ভুলতা: {toBengaliNumber(item.accuracy_rate)}%
                        </span>
                        {isVeryWeak && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            গুরুতর
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ভুল হয়েছে {toBengaliNumber(item.error_count)} বার ({toBengaliNumber(item.total_attempts)} বারের মধ্যে)
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
