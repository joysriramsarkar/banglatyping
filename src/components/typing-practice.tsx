"use client";

import * as React from "react";
import { useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { useTypingPractice } from "@/hooks/use-typing-practice";
import { Zap, Target, Timer, XCircle, Pause, Play, Home } from "lucide-react";
import { cn, toBengaliNumber } from "@/lib/utils";
import TestResults from "./test-results";
import { practiceParagraphs } from "@/lib/lessons";
import { useRouter } from 'next/navigation';
import type { Drill } from "@/lib/types";
import VirtualizedWordDisplay from "@/components/VirtualizedWordDisplay";

// Import Refactored Components
import { WordDrill } from "./drills/WordDrill";
import { VisualTypingDrill } from "./drills/VisualTypingDrill";

interface TypingPracticeProps {
  textToType: string;
  timeLimit?: number; // in minutes
  lessonId?: string;
  onRestart?: () => void;
  isPracticeDrill?: boolean;
  accuracyGoal?: number;
}

const StatDisplay = ({ icon: Icon, value, label }: { icon: React.ElementType; value: string | number; label: string }) => (
  <div className="flex items-center gap-2 text-lg">
    <Icon className="h-5 w-5 text-primary" />
    <span className="font-semibold">{toBengaliNumber(value)}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

// Exports for backward compatibility
export { WordDrill, VisualTypingDrill };

export default function TypingPractice({
  textToType: initialText,
  timeLimit,
  lessonId,
  onRestart: customOnRestart,
  isPracticeDrill = false,
  accuracyGoal = 95,
}: TypingPracticeProps) {
  // Use the centralized typing state management hook
  const { state, handleBackspace, handleSpace, navigate, calculateStats, finish, reset, getCurrentInput, getCurrentWord, getWordClass, isError, inputChar, setCurrentInput, getVisibleWords } = useTypingPractice({
    initialText,
    isPracticeDrill,
  });

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statsDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const maxTime = isPracticeDrill ? 360 : (timeLimit ? timeLimit * 60 : 0);
  const { time, isActive, isPaused, start, pause, resume, reset: resetTimer } = useTimer();

  const timeLeft = maxTime > 0 ? maxTime - time : time;

  // Memoize reset function to prevent unnecessary re-renders
  const resetTest = useCallback(
    (isNewTest = true) => {
      if (customOnRestart) {
        customOnRestart();
        return;
      }
      resetTimer();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (isNewTest && timeLimit) {
        const randomParagraph = practiceParagraphs[Math.floor(Math.random() * practiceParagraphs.length)];
        reset(randomParagraph.normalize('NFC'));
      } else {
        reset(initialText.normalize('NFC'));
      }
      hiddenInputRef.current?.focus();
    },
    [resetTimer, reset, initialText, timeLimit, customOnRestart]
  );

  const finishSession = useCallback(() => {
    if (state.isFinished) return;
    finish();
    calculateStats(time);
    pause();
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, [state.isFinished, finish, calculateStats, time, pause]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      if (isActive && !isPaused) {
        pause();
      }
    }, 4000);
  }, [isActive, isPaused, pause]);

  // Debounced stats calculation to prevent excessive updates on every keystroke
  const debouncedCalculateStats = useCallback(() => {
    if (statsDebounceRef.current) {
      clearTimeout(statsDebounceRef.current);
    }
    statsDebounceRef.current = setTimeout(() => {
      if (!state.isFinished && isActive) {
        calculateStats(time);
      }
    }, 100); // Update stats every 100ms max
  }, [calculateStats, time, isActive, state.isFinished]);

  // Real-time stats update - debounced to prevent excessive updates
  useEffect(() => {
    if (!isActive || state.isFinished) return;
    debouncedCalculateStats();
  }, [state.charInputPerWord, state.currentWordIndex, time, isActive, state.isFinished, debouncedCalculateStats]);

  // Global keydown event handler for raw keystroke capture
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state.isFinished) return;

      // Start timer if not active
      if (!isActive && !isPaused) start();
      if (isPaused && isActive) {
        resume();
      }

      resetInactivityTimer();

      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;

      // Handle Backspace
      if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace(ctrl);
        return;
      }

      // Handle Space
      if (key === ' ') {
        e.preventDefault();
        handleSpace();
        return;
      }

      // Handle Arrow Keys for word navigation
      if (key === 'ArrowRight') {
        e.preventDefault();
        navigate(1);
        return;
      }

      if (key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
        return;
      }

      // Regular character input — handled by hidden input onChange for IME/Bengali support
    },
    [state.isFinished, isActive, isPaused, start, resume, resetInactivityTimer, handleBackspace, handleSpace, navigate]
  );

  // Set up global keydown listener
  useEffect(() => {
    hiddenInputRef.current?.focus();

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (statsDebounceRef.current) {
        clearTimeout(statsDebounceRef.current);
      }
    };
  }, [handleGlobalKeyDown]);

  useEffect(() => {
    if (isPaused && inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, [isPaused]);

  // Monitor last word completion
  useEffect(() => {
    if (state.isFinished || isPracticeDrill) return;

    const isLastWord = state.currentWordIndex === state.words.length - 1 && state.words.length > 0;
    if (!isLastWord) return;

    const currentInput = getCurrentInput();
    const expectedWord = getCurrentWord();

    // Auto-finish when last word is completely typed
    if (currentInput === expectedWord && expectedWord.length > 0) {
      const timer = setTimeout(() => {
        finishSession();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [state.currentWordIndex, state.charInputPerWord, state.words, state.isFinished, isPracticeDrill, finishSession, getCurrentInput, getCurrentWord]);

  // Monitor test finish conditions
  useEffect(() => {
    if (!isActive || state.isFinished) return;

    const isTimeUp = maxTime > 0 && time >= maxTime;

    let isGoalMet = false;
    if (isPracticeDrill) {
      isGoalMet = time >= 240 && state.wpm >= 25 && state.accuracy >= (accuracyGoal || 95);
    }

    if (isTimeUp || isGoalMet) {
      finishSession();
    }
  }, [time, isActive, maxTime, finishSession, isPracticeDrill, state.wpm, state.accuracy, accuracyGoal, state.isFinished]);

  // Memoize preview content to prevent unnecessary recalculations
  const previewContent = useMemo(() => {
    const currentWord = getCurrentWord();
    const normalizedInput = getCurrentInput();

    if (!currentWord && !normalizedInput) return null;

    let correctPart = '';
    let incorrectPart = '';
    let remainingPart = '';

    let i = 0;
    while (i < normalizedInput.length && i < currentWord.length) {
      if (normalizedInput[i] === currentWord[i]) {
        i++;
      } else {
        break;
      }
    }

    correctPart = currentWord.substring(0, i);

    if (i < normalizedInput.length) {
      // Mistake found
      incorrectPart = currentWord.substring(i, normalizedInput.length);
      remainingPart = currentWord.substring(normalizedInput.length);
    } else {
      remainingPart = currentWord.substring(i);
    }

    return (
      <>
        <span className="text-green-500">{correctPart}</span>
        <span className="bg-red-500/20 text-red-500 underline">{incorrectPart}</span>
        <span className="text-muted-foreground opacity-50">{remainingPart}</span>
      </>
    );
  }, [getCurrentInput, getCurrentWord]);

  const normalizedInput = getCurrentInput();
  const isInputError = isError();

  if (state.isFinished) {
    return (
      <TestResults
        stats={{ wpm: state.wpm, accuracy: state.accuracy, errors: state.totalErrors, timeElapsed: time }}
        onRestart={() => resetTest(!timeLimit)}
        lessonId={lessonId}
        isDrill={isPracticeDrill}
        accuracyGoal={accuracyGoal}
      />
    );
  }

  const textDisplayFontSize = 'text-3xl';

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Hidden input for capturing keystrokes */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="absolute -left-full"
        value={normalizedInput}
        onChange={(e) => {
          if (!isActive && !isPaused) start();
          if (isPaused && isActive) resume();
          resetInactivityTimer();
          setCurrentInput(e.target.value);
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Stats Display Card */}
      <Card className="w-full">
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4">
          <StatDisplay icon={Zap} value={state.wpm} label="WPM" />
          <StatDisplay icon={Target} value={`${state.accuracy}%`} label="নির্ভুলতা" />
          <StatDisplay
            icon={Timer}
            value={
              maxTime > 0
                ? toBengaliNumber(new Date(timeLeft * 1000).toISOString().substr(14, 5))
                : toBengaliNumber(new Date(time * 1000).toISOString().substr(14, 5))
            }
            label={maxTime > 0 ? "বাকি" : "সময়"}
          />
          <StatDisplay icon={XCircle} value={state.totalErrors} label="ভুল শব্দ" />
        </CardContent>
      </Card>

      {/* Text Display Card - Now with Virtualization */}
      <Card className="w-full">
        <VirtualizedWordDisplay 
          visibleWords={getVisibleWords(2)}
          currentWordIndex={state.currentWordIndex}
          totalWords={state.words.length}
          getWordClass={getWordClass}
          textDisplayFontSize="text-3xl"
        />
      </Card>

      {/* Input Preview and Input Display */}
      <div className="w-full h-24 flex flex-col items-center justify-center">
        <div
          className={cn(
            "font-hind p-2 flex items-center justify-center min-h-[3rem] w-full",
            textDisplayFontSize
          )}
        >
          {previewContent}
        </div>
        <div
          className={cn(
            "w-full text-center font-hind p-6 border border-t-0 rounded-t-none bg-background min-h-[3rem] flex items-center justify-center",
            isInputError ? "border-red-500" : "border-green-500",
            textDisplayFontSize
          )}
        >
          {normalizedInput}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1 text-center">
        <p>শব্দটি সম্পূর্ণ করতে <kbd className="px-2 py-1 bg-muted rounded border">Space</kbd> চাপুন</p>
        <p>আগের শব্দে ফিরতে <kbd className="px-2 py-1 bg-muted rounded border">←</kbd> বা ভুল সংশোধন করতে <kbd className="px-2 py-1 bg-muted rounded border">Backspace</kbd> ব্যবহার করুন</p>
        <p>পুরো শব্দ মোছার জন্য <kbd className="px-2 py-1 bg-muted rounded border">Ctrl+Backspace</kbd> চাপুন</p>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-4">
        <Button onClick={() => router.push('/dashboard/lessons')} variant="outline" size="icon" title="পাঠক্রমে ফিরে যান">
          <Home className="h-5 w-5" />
        </Button>
        <Button onClick={isPaused ? resume : pause} variant="outline" size="icon" disabled={!isActive} title={isPaused ? "চালিয়ে যান" : "থামুন"}>
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
