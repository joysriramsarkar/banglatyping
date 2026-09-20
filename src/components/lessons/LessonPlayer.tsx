"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Award,
  Sparkles,
  Zap,
  Target,
  Hand,
  ChevronLeft,
  XCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, toBengaliNumber } from "@/lib/utils";
import type { CurriculumLesson } from "@/lib/curriculum/types";
import { recordLessonCompletion, getStoredCurriculumState } from "@/lib/curriculum/engine";
import { getNextCurriculumLesson } from "@/lib/curriculum/curriculum-data";
import { SimplifiedKeyboard } from "@/components/common/VirtualKeyboard";
import { findKeyInfoForChar, getKeyboardLayoutConfig } from "@/lib/keyboard-layouts";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useTypingSound } from "@/hooks/use-typing-sound";
import {
  normalizeBengaliString,
  composeBengaliKeystroke,
  isValidBengaliTypingPrefix,
  getNextExpectedKeyChar,
  bengaliSegmenter,
  buildGraphemeRenderModel,
  getUpcomingIndependentVowel,
  ensureSpacedDrillItems,
} from "@/lib/bengali-grapheme";
import { GraphemeDisplay } from "@/components/lessons/GraphemeDisplay";

interface LessonPlayerProps {
  lesson: CurriculumLesson;
  onComplete?: () => void;
}

// Home row hand & finger guide definition for Level 0 / Orientation
const HOME_ROW_FINGER_MAP = [
  { hand: "বাম হাত", finger: "কনিষ্ঠা (Pinky)", key: "A", bn: "া", bnShift: "অ" },
  { hand: "বাম হাত", finger: "অনামিকা (Ring)", key: "S", bn: "স", bnShift: "শ" },
  { hand: "বাম হাত", finger: "মধ্যমা (Middle)", key: "D", bn: "ড", bnShift: "ঢ" },
  { hand: "বাম হাত", finger: "তর্জনী (Index)", key: "F", bn: "ফ", bnShift: "ৎ" },
  { hand: "উভয় হাত", finger: "বৃদ্ধাঙ্গুল (Thumbs)", key: "Space", bn: "স্পেস", bnShift: "" },
  { hand: "ডান হাত", finger: "তর্জনী (Index)", key: "J", bn: "জ", bnShift: "ঝ" },
  { hand: "ডান হাত", finger: "মধ্যমা (Middle)", key: "K", bn: "ক", bnShift: "খ" },
  { hand: "ডান হাত", finger: "অনামিকা (Ring)", key: "L", bn: "ল", bnShift: "ষ" },
  { hand: "ডান হাত", finger: "কনিষ্ঠা (Pinky)", key: ";", bn: ";", bnShift: ":" },
];

export default function LessonPlayer({ lesson, onComplete }: LessonPlayerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { playClick, playError, playSuccess } = useTypingSound();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionPassed, setSectionPassed] = useState(false);
  const [sectionFailed, setSectionFailed] = useState(false);
  const [lessonFinished, setLessonFinished] = useState(false);

  // Next curriculum lesson resolution
  const nextLesson = useMemo(() => getNextCurriculumLesson(lesson.id), [lesson.id]);

  // Pre-fetch next lesson immediately for zero-lag instant navigation
  useEffect(() => {
    if (nextLesson) {
      router.prefetch(`/dashboard/practice/${nextLesson.id}`);
    } else {
      router.prefetch("/dashboard/lessons");
    }
  }, [nextLesson, router]);

  const goToNextLesson = useCallback(() => {
    if (nextLesson) {
      router.push(`/dashboard/practice/${nextLesson.id}`);
    } else {
      router.push("/dashboard/lessons");
    }
  }, [nextLesson, router]);

  // Global Enter key handler when lesson is finished (with 400ms cooldown to prevent accidental key-repeat auto-skip)
  useEffect(() => {
    if (!lessonFinished) return;

    let canPressEnter = false;
    const timer = setTimeout(() => {
      canPressEnter = true;
    }, 400);

    const handleFinishedKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canPressEnter) {
        e.preventDefault();
        goToNextLesson();
      }
    };

    window.addEventListener("keydown", handleFinishedKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleFinishedKeyDown);
    };
  }, [lessonFinished, goToNextLesson]);

  // Typing practice state for active interactive sections
  const [drillIndex, setDrillIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [lastWrongChar, setLastWrongChar] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [sectionResultStats, setSectionResultStats] = useState<{
    gpm: number;
    wpm: number;
    spm: number;
    accuracy: number;
  } | null>(null);

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const lastKeyHandledTimeRef = useRef<number>(0);
  const currentSection = lesson.sections[currentSectionIndex];

  // Live timer ticker to update speed continuously during active typing
  useEffect(() => {
    if (!startTime || endTime || sectionPassed || sectionFailed) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(interval);
  }, [startTime, endTime, sectionPassed, sectionFailed]);

  // List of items to type in this section (with regular spacebar practice interspersed)
  const sectionItems = useMemo(() => {
    if (!currentSection) return [];
    if (currentSection.items && currentSection.items.length > 0) {
      return ensureSpacedDrillItems(currentSection.items);
    }
    return [];
  }, [currentSection]);

  const currentTarget = sectionItems[drillIndex] || "";

  // Check if current drill/section contains full sentences (or phrases with spaces/dari)
  const isSentenceDrill = useMemo(() => {
    return (
      currentSection?.id?.includes("sentence") ||
      currentSection?.title?.includes("বাক্য") ||
      currentTarget.trim().includes(" ") ||
      currentTarget.includes("।") ||
      sectionItems.some((it) => it.trim().includes(" ") || it.includes("।"))
    );
  }, [currentSection, currentTarget, sectionItems]);

  const sentenceFontSize = useMemo(() => {
    if (currentTarget.length > 25) return "text-2xl sm:text-3xl md:text-4xl lg:text-5xl";
    if (currentTarget.length > 14) return "text-3xl sm:text-4xl md:text-5xl lg:text-6xl";
    return "text-4xl sm:text-5xl md:text-6xl lg:text-7xl";
  }, [currentTarget]);

  // Compute next character needed from current target
  const nextCharToType = useMemo(() => {
    return getNextExpectedKeyChar(currentInput, currentTarget, true);
  }, [currentTarget, currentInput]);

  const upcomingVowel = useMemo(() => {
    return getUpcomingIndependentVowel(currentInput, currentTarget);
  }, [currentTarget, currentInput]);

  // Resolve keyboard key position and finger guidance
  const resolvedKeyInfo = useMemo(() => {
    return findKeyInfoForChar(nextCharToType, undefined, upcomingVowel?.processLabel);
  }, [nextCharToType, upcomingVowel]);

  // Focus input helper
  const focusHiddenInput = useCallback(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, []);

  // Reset section state when moving to a section
  const initSection = useCallback((index: number) => {
    setCurrentSectionIndex(index);
    setDrillIndex(0);
    setCurrentInput("");
    setTotalAttempts(0);
    setErrorsCount(0);
    setLastWrongChar(null);
    setStartTime(null);
    setEndTime(null);
    setNow(Date.now());
    setSectionResultStats(null);
    setSectionPassed(false);
    setSectionFailed(false);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
    }
    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = "";
        hiddenInputRef.current.focus();
      }
    }, 30);
  }, []);

  // Calculate live stats
  const accuracy = useMemo(() => {
    if (totalAttempts === 0) return 100;
    const correct = Math.max(0, totalAttempts - errorsCount);
    return Math.round((correct / totalAttempts) * 100);
  }, [totalAttempts, errorsCount]);

  const timeElapsedSec = useMemo(() => {
    if (!startTime) return 0;
    const end = endTime || now;
    return Math.max(1, Math.round((end - startTime) / 1000));
  }, [startTime, endTime, now]);

  // Total graphemes typed so far in this section (completed items + current input)
  // Clean grapheme counting without phantom spaces
  const totalCompletedGraphemes = useMemo(() => {
    let count = 0;
    for (let i = 0; i < drillIndex && i < sectionItems.length; i++) {
      count += bengaliSegmenter.segmentString(sectionItems[i]).length;
    }
    if (currentInput) {
      count += bengaliSegmenter.segmentString(currentInput).length;
    }
    return count;
  }, [drillIndex, sectionItems, currentInput]);

  // GPM = Graphemes Per Minute (Bengali-accurate metric)
  const gpm = useMemo(() => {
    if (timeElapsedSec <= 0 || totalCompletedGraphemes <= 0) return 0;
    // Damping for the initial 2 seconds to avoid extreme instant spikes
    if (timeElapsedSec < 2) {
      return Math.min(60, Math.round(totalCompletedGraphemes * 30));
    }
    return Math.round(totalCompletedGraphemes / (timeElapsedSec / 60));
  }, [totalCompletedGraphemes, timeElapsedSec]);

  // WPM approximation for display (1 Bengali word ≈ 4 graphemes on average)
  const wpm = useMemo(() => {
    if (gpm <= 0) return 0;
    return Math.max(1, Math.round(gpm / 4));
  }, [gpm]);

  // SPM = Strokes (correct keystrokes) Per Minute — stroke meter methodology
  // Counts only useful keystrokes (errors excluded) to match stroke meter's eventCount logic
  const spm = useMemo(() => {
    if (timeElapsedSec <= 0 || totalAttempts <= 0) return 0;
    const correctStrokes = Math.max(0, totalAttempts - errorsCount);
    if (correctStrokes <= 0) return 0;
    if (timeElapsedSec < 2) {
      return Math.min(120, Math.round(correctStrokes * 30));
    }
    return Math.round(correctStrokes / (timeElapsedSec / 60));
  }, [totalAttempts, errorsCount, timeElapsedSec]);

  // Authoritative display metrics: uses frozen snapshot once section passes/fails
  const displayGpm = sectionResultStats ? sectionResultStats.gpm : gpm;
  const displayWpm = sectionResultStats ? sectionResultStats.wpm : wpm;
  const displaySpm = sectionResultStats ? sectionResultStats.spm : spm;
  const displayAccuracy = sectionResultStats ? sectionResultStats.accuracy : accuracy;

  // Focus input automatically
  useEffect(() => {
    if (currentSection?.type !== "explanation" && currentSection?.type !== "demonstration") {
      focusHiddenInput();
    }
  }, [currentSectionIndex, currentSection?.type, sectionPassed, sectionFailed, focusHiddenInput]);

  // Advance to next section or finish lesson
  const advanceSection = useCallback(async () => {
    if (currentSectionIndex < lesson.sections.length - 1) {
      initSection(currentSectionIndex + 1);
    } else {
      // Lesson completely finished!
      setLessonFinished(true);
      playSuccess();

      const state = getStoredCurriculumState();
      recordLessonCompletion(state, lesson.id, displayAccuracy, displayWpm, displayGpm);

      // Save to Supabase if authenticated
      if (user) {
        try {
          await apiFetch("/api/user-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              lessonId: lesson.id,
              wpm: displayWpm,
              accuracy: displayAccuracy,
              errors: errorsCount,
              timeElapsed: timeElapsedSec,
              erredCharacters: [],
            }),
          });
        } catch (err) {
          console.error("Failed to sync progress:", err);
        }
      }

      onComplete?.();
    }
  }, [
    currentSectionIndex,
    lesson.sections.length,
    lesson.id,
    initSection,
    displayAccuracy,
    displayWpm,
    displayGpm,
    errorsCount,
    timeElapsedSec,
    user,
    playSuccess,
    onComplete,
  ]);

  // Global Enter key handler when a section passes or fails
  useEffect(() => {
    if (lessonFinished) return;
    if (!sectionPassed && !sectionFailed) return;

    const handleSectionEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (sectionPassed) {
          advanceSection();
        } else if (sectionFailed) {
          initSection(currentSectionIndex);
        }
      }
    };

    window.addEventListener("keydown", handleSectionEnter);
    return () => window.removeEventListener("keydown", handleSectionEnter);
  }, [lessonFinished, sectionPassed, sectionFailed, advanceSection, initSection, currentSectionIndex]);

  // Handle typing input
  const handleCharInput = useCallback(
    (char: string) => {
      if (lessonFinished) return;

      // If already passed and user presses enter/space, advance
      if (sectionPassed) {
        advanceSection();
        return;
      }

      // If failed and user presses key, restart
      if (sectionFailed) {
        initSection(currentSectionIndex);
        return;
      }

      if (!startTime) {
        setStartTime(Date.now());
      }

      setTotalAttempts((prev) => prev + 1);

      const target = currentTarget;
      const newInput = composeBengaliKeystroke(currentInput, char);
      const isPrefixValid = isValidBengaliTypingPrefix(newInput, target);

      if (isPrefixValid) {
        // Correct input so far
        playClick();
        setLastWrongChar(null);
        setCurrentInput(newInput);

        const normNewInput = normalizeBengaliString(newInput);
        const normTarget = normalizeBengaliString(target);

        if (normNewInput === normTarget) {
          // Completed current item
          if (drillIndex < sectionItems.length - 1) {
            setDrillIndex((prev) => prev + 1);
            setCurrentInput("");
          } else {
            // Finished all items in current section
            const finalEndTime = Date.now();
            setEndTime(finalEndTime);
            const totalDurationSec = Math.max(1, Math.round((finalEndTime - (startTime || finalEndTime)) / 1000));

            // Cleanly sum actual graphemes of all items in this section
            let finalGraphemes = 0;
            for (let i = 0; i < sectionItems.length; i++) {
              finalGraphemes += bengaliSegmenter.segmentString(sectionItems[i]).length;
            }
            const finalGpm = Math.round(finalGraphemes / (totalDurationSec / 60));
            const finalWpm = Math.max(1, Math.round(finalGpm / 4));

            const requiredAcc = currentSection?.requiredAccuracy || 90;
            const finalAttempts = totalAttempts + 1;
            const correctCount = Math.max(0, finalAttempts - errorsCount);
            const currentAcc = Math.round((correctCount / finalAttempts) * 100);

            // SPM: correct strokes per minute (stroke meter methodology)
            const finalSpm = Math.round(correctCount / (totalDurationSec / 60));

            setSectionResultStats({
              gpm: finalGpm,
              wpm: finalWpm,
              spm: finalSpm,
              accuracy: currentAcc,
            });

            if (currentAcc >= requiredAcc) {
              setSectionPassed(true);
              setSectionFailed(false);
              playSuccess();
              toast({
                title: "চমৎকার!",
                description: `ধাপটি সফলভাবে সম্পন্ন হয়েছে (${toBengaliNumber(currentAcc)}% নির্ভুলতা • ${toBengaliNumber(finalGpm)} GPM)।`,
              });
            } else {
              setSectionFailed(true);
              setSectionPassed(false);
              playError();
              toast({
                variant: "destructive",
                title: "পুনরায় চেষ্টা করুন",
                description: `এই ধাপে উত্তীর্ণ হতে সর্বনিম্ন ${toBengaliNumber(requiredAcc)}% নির্ভুলতা প্রয়োজন (অর্জিত: ${toBengaliNumber(currentAcc)}%)।`,
              });
            }
          }
        }
      } else {
        // Error
        playError();
        setLastWrongChar(char);
        setErrorsCount((prev) => prev + 1);
      }
    },
    [
      lessonFinished,
      sectionPassed,
      sectionFailed,
      startTime,
      currentTarget,
      currentInput,
      drillIndex,
      sectionItems.length,
      currentSection,
      totalAttempts,
      errorsCount,
      currentSectionIndex,
      advanceSection,
      initSection,
      playClick,
      playError,
      playSuccess,
      toast,
    ]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Shortcuts for advancing or resetting
      if (e.key === "Enter") {
        e.preventDefault();
        if (sectionPassed) {
          advanceSection();
          return;
        }
        if (sectionFailed) {
          initSection(currentSectionIndex);
          return;
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        initSection(currentSectionIndex);
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setLastWrongChar(null);
        setCurrentInput((prev) => {
          if (!prev) return prev;
          // Step-by-step character / modifier deletion (e.g. বাংলা -> বাংল -> বাং -> বা -> ব)
          return Array.from(prev).slice(0, -1).join('');
        });
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        handleCharInput(" ");
        return;
      }

      // Hasanta (্) / Reph handling:
      // When the current target character is explicitly Hasanta ('্') (e.g. for Reph or Conjuncts),
      // intercept 'H' key (KeyH / Dead key / '্').
      // When the target is a vowel (like 'আ' = 'h+a'), do NOT intercept 'Dead', allowing OS to compose 'আ'.
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

      // Modifier / IME process keys to ignore (including unintercepted Dead keys)
      const skipKeys = [
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "CapsLock",
        "Tab",
        "Dead",
        "Process",
        "Unidentified",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ];
      if (skipKeys.includes(e.key)) {
        return;
      }

      // Fallback: If user types with English physical keyboard layout (QWERTY),
      // map physical key from BanglaWord layout
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
    },
    [handleCharInput, sectionPassed, sectionFailed, advanceSection, initSection, currentSectionIndex, nextCharToType]
  );

  // Handle IME and direct text input
  const onInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const inputEl = e.currentTarget;
      const val = inputEl.value;
      const now = performance.now();
      // If a keydown event was handled in the last 150ms, discard duplicate input event generated by OS dead-key flush
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
    },
    [handleCharInput]
  );

  // Progress percentage across sections
  const lessonProgressPercent = Math.round(
    ((currentSectionIndex + (sectionPassed ? 1 : 0)) / lesson.sections.length) * 100
  );

  if (lessonFinished) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-6 sm:p-8 text-center space-y-5 shadow-lg border">
        <div className="mx-auto w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline">অভিনন্দন! পাঠ সম্পন্ন হয়েছে 🎉</h2>
          <p className="text-muted-foreground text-sm mt-1">{lesson.title} সফলভাবে আয়ত্ত করেছেন।</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl mx-auto">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-[11px] text-muted-foreground font-semibold">গতি (GPM)</p>
            <p className="text-xl font-bold text-primary">{toBengaliNumber(displayGpm)}</p>
          </div>
          <div className="p-3 bg-secondary rounded-xl">
            <p className="text-[11px] text-muted-foreground font-semibold">WPM (আনুমানিক)</p>
            <p className="text-xl font-bold text-foreground">{toBengaliNumber(displayWpm)}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <p className="text-[11px] text-muted-foreground font-semibold">স্ট্রোক (SPM)</p>
            <p className="text-xl font-bold text-amber-500 dark:text-amber-400">{toBengaliNumber(displaySpm)}</p>
          </div>
          <div className="p-3 bg-secondary rounded-xl">
            <p className="text-[11px] text-muted-foreground font-semibold">নির্ভুলতা</p>
            <p className="text-xl font-bold text-primary">{toBengaliNumber(displayAccuracy)}%</p>
          </div>
          <div className="p-3 bg-secondary rounded-xl col-span-2 sm:col-span-1">
            <p className="text-[11px] text-muted-foreground font-semibold">সময়কাল</p>
            <p className="text-xl font-bold text-primary">{toBengaliNumber(timeElapsedSec)}s</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <Button
            onClick={() => initSection(0)}
            onMouseDown={(e) => e.preventDefault()}
            variant="outline"
            className="w-full sm:w-auto gap-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> পুনরায় পাঠটি করুন
          </Button>

          {nextLesson ? (
            <Button
              asChild
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 text-xs shadow-md ring-2 ring-primary/30"
            >
              <Link href={`/dashboard/practice/${nextLesson.id}`} prefetch={true}>
                পরবর্তী লেসন ({nextLesson.title.split(':')[0]})
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-primary-foreground/20 rounded">
                  Enter ↵
                </kbd>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="w-full sm:w-auto bg-primary text-primary-foreground font-bold gap-2 text-xs shadow-md"
            >
              <Link href="/dashboard/lessons" prefetch={true}>
                পাঠ্যতালিকায় ফিরে যান
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-primary-foreground/20 rounded">
                  Enter ↵
                </kbd>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="ghost"
            className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard/lessons" prefetch={true}>
              পাঠ্যতালিকা
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div
      className="w-full max-w-6xl 2xl:max-w-7xl mx-auto space-y-3 sm:space-y-4"
      onClick={focusHiddenInput}
    >
      {/* Hidden input for keystroke capture */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        onKeyDown={onKeyDown}
        onInput={onInput}
        onCompositionEnd={onInput}
        onBlur={() => {
          if (
            currentSection?.type !== "explanation" &&
            currentSection?.type !== "demonstration"
          ) {
            focusHiddenInput();
          }
        }}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Top Navigation Bar: Breadcrumb + Steps Navigation + Reset */}
      <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl bg-card border shadow-xs">
        <Link
          href="/dashboard/lessons"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-muted shrink-0"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> পাঠ্যতালিকা
        </Link>

        {/* Section Steps Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
          {lesson.sections.map((sec, idx) => {
            const isActive = currentSectionIndex === idx;
            const isPassed = idx < currentSectionIndex || (idx === currentSectionIndex && sectionPassed);

            return (
              <button
                key={sec.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  initSection(idx);
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                    : isPassed
                    ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30 hover:bg-green-500/20"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {isPassed ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px]">
                    {toBengaliNumber(idx + 1)}
                  </span>
                )}
                <span className="hidden sm:inline">{sec.title}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              initSection(currentSectionIndex);
            }}
            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
            title="এই ধাপটি প্রথম থেকে শুরু করুন"
          >
            <RotateCcw className="h-3 w-3 mr-1" /> রিসেট
          </Button>
        </div>
      </div>

      {/* Lesson Compact Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold font-headline text-foreground">{lesson.title}</h1>
          <Badge variant="outline" className="text-[11px] font-medium hidden sm:inline-flex">
            লেভেল {toBengaliNumber(lesson.level)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            ধাপ {toBengaliNumber(currentSectionIndex + 1)}/{toBengaliNumber(lesson.sections.length)}
          </span>
          <div className="w-20 sm:w-28">
            <Progress value={lessonProgressPercent} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Main Section Content Card */}
      <Card className="border shadow-xs bg-card">
        <CardHeader className="py-2.5 px-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-primary font-semibold text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{currentSection?.title}</span>
            </div>
            {currentSection?.requiredAccuracy && (
              <Badge variant="secondary" className="text-[10px] font-mono py-0">
                লক্ষ্য: {toBengaliNumber(currentSection.requiredAccuracy)}% নির্ভুলতা
              </Badge>
            )}
          </div>
          {currentSection?.instruction && (
            <CardDescription className="text-xs text-foreground/80 font-normal mt-0.5">
              {currentSection.instruction}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="p-3 sm:p-4 space-y-3">
          {/* EXPLANATION SECTION */}
          {currentSection?.type === "explanation" && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                <p className="text-sm leading-relaxed text-foreground">{currentSection.explanationText}</p>
              </div>

              {/* Home Row Hand & Finger Position Map */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Hand className="h-3.5 w-3.5 text-primary" />
                  <span>হোম রো হাতের অবস্থান ও আঙুল মানচিত্র (Home Row Finger Map):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {HOME_ROW_FINGER_MAP.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-secondary/40 border rounded-lg text-center space-y-0.5"
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground block">
                        {f.hand} • {f.finger}
                      </span>
                      <div className="flex items-center justify-center gap-1 pt-0.5">
                        <span className="font-mono font-bold text-xs bg-background px-1.5 py-0.5 rounded border">
                          [{f.key}]
                        </span>
                        <span className="text-sm font-bold text-primary font-headline">
                          {f.bn}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Virtual Keyboard Preview */}
              <SimplifiedKeyboard showFingerGuide={false} />

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    advanceSection();
                  }}
                  className="bg-primary text-primary-foreground font-bold gap-1.5 px-5 text-xs"
                >
                  পরবর্তী ধাপে যান <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* DEMONSTRATION SECTION */}
          {currentSection?.type === "demonstration" && currentSection.demonstration && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-secondary/40 rounded-xl">
                <p className="text-xs text-muted-foreground">{currentSection.demonstration.description}</p>
                <p className="text-4xl sm:text-5xl font-bold text-primary my-2">{currentSection.demonstration.target}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {currentSection.demonstration.steps.map((step, idx) => (
                  <div key={idx} className="p-2.5 border rounded-lg bg-card text-center space-y-0.5">
                    <span className="text-[11px] text-muted-foreground">ধাপ {toBengaliNumber(idx + 1)}</span>
                    <p className="text-lg font-bold text-primary">{step.label}</p>
                    {step.finger && <p className="text-[11px] text-muted-foreground">{step.finger}</p>}
                  </div>
                ))}
              </div>

              {/* Show highlighted key for demo */}
              <SimplifiedKeyboard
                highlightKeyCode={findKeyInfoForChar(currentSection.demonstration.target[0])?.keyCode}
                needsShift={!!findKeyInfoForChar(currentSection.demonstration.target[0])?.needsShift}
                resolvedKeyInfo={findKeyInfoForChar(currentSection.demonstration.target[0])}
              />

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    advanceSection();
                  }}
                  className="bg-primary text-primary-foreground font-bold gap-1.5 px-5 text-xs"
                >
                  অনুশীলন শুরু করুন <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* INTERACTIVE TYPING SECTIONS (Guided / Isolated / Pattern / Word / Mastery) */}
          {currentSection?.type !== "explanation" && currentSection?.type !== "demonstration" && (
            <div className="space-y-4">
              {/* Target Character / Word Display Box - Prominent, Large, High Contrast */}
              <div
                className={cn(
                  "py-6 px-6 sm:px-10 rounded-2xl border-2 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[170px] text-center transition-all duration-200 shadow-sm",
                  lastWrongChar
                    ? "bg-red-500/10 border-red-500/50 ring-4 ring-red-500/20"
                    : sectionPassed
                    ? "bg-green-500/10 border-green-500/50 ring-4 ring-green-500/20"
                    : "bg-secondary/25 border-primary/20 hover:border-primary/40"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2 bg-background/60">
                    {isSentenceDrill ? "বাক্য" : "অক্ষর"} {toBengaliNumber(drillIndex + 1)} / {toBengaliNumber(sectionItems.length)}
                  </Badge>
                  {resolvedKeyInfo?.bengaliFingerLabel && (
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-xs py-0.5 px-2">
                      আঙুল: {resolvedKeyInfo.bengaliFingerLabel}
                    </Badge>
                  )}
                </div>

                {/* Target String Stream Display: Active Set + Upcoming Sets (Upcoming hidden for sentences) */}
                <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap my-2 max-w-full overflow-hidden">
                  {/* Previous Completed Item (if any - hidden for sentence drills) */}
                  {!isSentenceDrill && drillIndex > 0 && (
                    <span className="hidden md:inline-flex items-center px-3 py-1 rounded-xl text-lg sm:text-xl text-muted-foreground/35 bg-muted/20 border border-border/30 select-none">
                      {sectionItems[drillIndex - 1] === " " ? "␣ স্পেস" : sectionItems[drillIndex - 1]}
                    </span>
                  )}

                  {/* Current Active Item with live grapheme cluster-aware progress coloring */}
                  <div className={cn(
                    "relative inline-flex items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/60 shadow-md ring-2 ring-primary/20",
                    isSentenceDrill
                      ? "px-6 py-4 sm:px-10 sm:py-5 max-w-full"
                      : "px-5 py-2.5 sm:px-8 sm:py-3.5"
                  )}>
                    {currentTarget === " " ? (
                      <div className="flex items-center gap-2 py-1">
                        <span className="font-mono text-3xl sm:text-4xl text-primary font-bold">␣</span>
                        <span className="text-2xl sm:text-3xl md:text-4xl font-black font-headline text-primary">স্পেস (Space)</span>
                      </div>
                    ) : (
                      <span className={cn(
                        "relative inline-flex items-center justify-center font-black font-headline tracking-wide leading-none select-none whitespace-pre",
                        isSentenceDrill ? sentenceFontSize : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                      )}>
                        {(() => {
                          const normTarget = normalizeBengaliString(currentTarget);
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
                                  key={`cluster-${cIdx}`}
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
                                    key={`cluster-${cIdx}`}
                                    className="text-green-600 dark:text-green-400 font-black"
                                  >
                                    {cluster}
                                  </span>
                                );
                              }
                            }

                            // 2. Intra-cluster partial progress (e.g. 'ড' in 'ডা', or 'ক' in 'ক্ষ')
                            // পরিকল্পনা.md §৬–৯: clipPath বাদ দিয়ে semantic-parts ভিত্তিক GraphemeDisplay
                            if (cIdx === inputClusters.length - 1 && inputClusters.length > 0) {
                              const typedCluster = normalizeBengaliString(inputClusters[cIdx]);
                              if (normCluster.startsWith(typedCluster) && typedCluster !== normCluster) {
                                const renderModel = buildGraphemeRenderModel(normCluster, typedCluster);
                                return (
                                  <GraphemeDisplay
                                    key={`cluster-${cIdx}`}
                                    model={renderModel}
                                  />
                                );
                              }
                            }

                            // 3. Untyped cluster -> crisp foreground for current target cluster, neutral muted for upcoming
                            const isNextActive = cIdx === inputClusters.length;
                            return (
                              <span
                                key={`cluster-${cIdx}`}
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
                      </span>
                    )}
                  </div>

                  {/* Upcoming Sets (next 3 to 4 items) - Hidden for sentence drills */}
                  {!isSentenceDrill && sectionItems.slice(drillIndex + 1, drillIndex + 5).map((item, idx) => (
                    <span
                      key={`upcoming-${drillIndex}-${idx}`}
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-xl text-xl sm:text-2xl md:text-3xl font-semibold select-none transition-all",
                        idx === 0
                          ? "bg-secondary/80 text-foreground/80 border border-border/60"
                          : "bg-muted/30 text-muted-foreground/50 border border-transparent"
                      )}
                    >
                      {item === " " ? "␣" : item}
                    </span>
                  ))}

                  {/* Remaining items count indicator - Hidden for sentence drills */}
                  {!isSentenceDrill && drillIndex + 5 < sectionItems.length && (
                    <span className="text-sm text-muted-foreground/40 font-mono self-center">
                      +{toBengaliNumber(sectionItems.length - (drillIndex + 5))}
                    </span>
                  )}
                </div>

                {/* Live Input Progress Display */}
                {currentInput.length > 0 && (
                  <div className="text-sm font-mono text-muted-foreground min-h-[1.5rem] flex items-center gap-2 mt-2">
                    <span className="text-muted-foreground/70">টাইপ করেছেন:</span>
                    <span className="text-green-600 dark:text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 text-base whitespace-pre">
                      {currentInput}
                    </span>
                  </div>
                )}

                {lastWrongChar && (
                  <p className="text-xs sm:text-sm text-red-500 font-semibold mt-1">
                    ভুল হয়েছে! &quot;{lastWrongChar}&quot; চাপার বদলে সঠিক কী চাপুন।
                  </p>
                )}
              </div>

              {/* FAILED BANNER WITH RETRY ACTION */}
              {sectionFailed && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-red-900 dark:text-red-200 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">ধাপটি উত্তীর্ণ হতে পারেনি</p>
                      <p className="text-xs text-foreground/80 font-medium mt-0.5">
                        অর্জিত নির্ভুলতা <span className="font-bold text-red-600 dark:text-red-400">{toBengaliNumber(displayAccuracy)}%</span> (প্রয়োজন {toBengaliNumber(currentSection?.requiredAccuracy || 90)}%) • গতি <span className="font-bold text-foreground">{toBengaliNumber(displayGpm)} GPM</span> <span className="text-muted-foreground font-normal">({toBengaliNumber(displayWpm)} WPM • {toBengaliNumber(displaySpm)} SPM)</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      initSection(currentSectionIndex);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm gap-1.5 shrink-0 h-8"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> পুনরায় চেষ্টা করুন (Enter চাপুন)
                  </Button>
                </div>
              )}

              {/* PASSED BANNER WITH NEXT ACTION */}
              {sectionPassed && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-green-900 dark:text-green-200 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">ধাপটি সফলভাবে সম্পন্ন হয়েছে 🎉</p>
                      <p className="text-xs text-foreground/80 font-medium mt-0.5">
                        অর্জিত নির্ভুলতা <span className="font-bold text-green-600 dark:text-green-400">{toBengaliNumber(displayAccuracy)}%</span> • গতি <span className="font-bold text-primary">{toBengaliNumber(displayGpm)} GPM</span> <span className="text-muted-foreground font-normal">({toBengaliNumber(displayWpm)} WPM • {toBengaliNumber(displaySpm)} SPM)</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      advanceSection();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold gap-1.5 shrink-0 px-5 text-xs sm:text-sm shadow-xs h-8"
                  >
                    পরবর্তী ধাপে যান <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Live Virtual Keyboard with active target key */}
              <SimplifiedKeyboard
                highlightKeyCode={resolvedKeyInfo?.keyCode}
                needsShift={!!resolvedKeyInfo?.needsShift}
                resolvedKeyInfo={resolvedKeyInfo}
                showFingerGuide={true}
              />

              {/* Status footer bar */}
              <div className="flex items-center justify-between py-2.5 px-4 bg-muted/40 rounded-xl text-xs sm:text-sm font-semibold border border-border/40">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-primary font-bold">
                    <Zap className="h-4 w-4" /> {toBengaliNumber(displayGpm)} GPM
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground text-xs font-normal">
                    ({toBengaliNumber(displayWpm)} WPM)
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-semibold">
                    {toBengaliNumber(displaySpm)} SPM
                  </span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Target className="h-4 w-4 text-green-500" /> {toBengaliNumber(displayAccuracy)}% নির্ভুলতা
                  </span>
                  {errorsCount > 0 && (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-mono">
                      ({toBengaliNumber(errorsCount)}টি ভুল)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {sectionPassed ? (
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        advanceSection();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold gap-1.5 shadow-xs text-xs sm:text-sm h-8"
                    >
                      পরবর্তী ধাপ <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        initSection(currentSectionIndex);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 h-8 px-2.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> প্রথম থেকে শুরু করুন
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
