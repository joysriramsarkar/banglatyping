

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, Pause, Play, Home, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "./test-results";
import { practiceParagraphs } from "@/lib/lessons";
import { Input } from "./ui/input";
import { useRouter } from 'next/navigation';
import type { Drill } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface TypingPracticeProps {
  textToType: string;
  timeLimit?: number; // in minutes
  lessonId?: string;
}

const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const StatDisplay = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) => (
  <div className="flex items-center gap-2 text-lg">
    <Icon className="h-5 w-5 text-primary" />
    <span className="font-semibold">{toBengaliNumber(value)}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

const VisualTypingDrill = ({ drills }: { drills: Drill[] }) => {
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');
    const totalDrills = drills.length;
    const progress = (currentDrillIndex / totalDrills) * 100;
    const router = useRouter();

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        const modifierKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'Enter', 'Dead'];
        if (modifierKeys.includes(event.key) || status !== 'pending' || currentDrillIndex >= totalDrills) {
            if (event.key !== 'Shift') event.preventDefault();
            return;
        }
        event.preventDefault();
    
        const currentDrill = drills[currentDrillIndex];
        
        let keyIsCorrect = false;
        if (currentDrill.shift) {
            // For shift keys, we can check the event.key directly as it gives the produced character
            keyIsCorrect = event.key === currentDrill.prompt;
        } else {
            // For non-shift keys, event.key gives the character, e.g., 'k'
            // We compare it with the drill's base key
            keyIsCorrect = event.key.toLowerCase() === currentDrill.key.toLowerCase() && !event.shiftKey;
        }
        
        // Special case for space
        if (currentDrill.key === ' ' && event.code === 'Space') {
            keyIsCorrect = true;
        }
    
        if (keyIsCorrect) {
            setStatus('correct');
            setTimeout(() => {
                setStatus('pending');
                setCurrentDrillIndex(prev => prev + 1);
            }, 300);
        } else {
            setStatus('incorrect');
            setTimeout(() => {
                setStatus('pending');
            }, 500);
        }
    }, [currentDrillIndex, drills, status, totalDrills]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    if (currentDrillIndex >= totalDrills) {
        return (
            <Card className="text-center p-8">
                <CardHeader>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl">অনুশীলন সম্পন্ন!</CardTitle>
                    <CardDescription>খুব ভালো করেছেন!</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button onClick={() => setCurrentDrillIndex(0)}>আবার চেষ্টা করুন</Button>
                    <Button onClick={() => router.push('/dashboard/lessons')} variant="outline">পাঠক্রমে ফিরে যান</Button>
                </CardContent>
            </Card>
        )
    }

    const currentDrill = drills[currentDrillIndex];

    return (
        <div className="p-4 md:p-8 rounded-lg bg-secondary/30 border max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/3 space-y-8">
                    {/* Prompt Display */}
                    <div className="flex items-center justify-center gap-2 bg-background p-4 rounded-lg min-h-[80px]">
                        {drills.slice(currentDrillIndex, Math.min(currentDrillIndex + 8, totalDrills)).map((drill, index) => {
                            const isCurrent = index === 0;
                            let boxClass = "bg-secondary";
                            if (isCurrent && status === 'correct') boxClass = "bg-green-100 border-green-500";
                            if (isCurrent && status === 'incorrect') boxClass = "bg-red-100 border-red-500";
                            
                            return (
                                <div key={index} className={cn("flex items-center justify-center h-16 w-16 rounded-md border text-2xl font-bold", boxClass, isCurrent && "ring-2 ring-primary")}>
                                   {drill.prompt === ' ' ? '-' : drill.prompt}
                                </div>
                            )
                        })}
                    </div>
                    
                    {/* Virtual Keyboard */}
                    <VirtualKeyboard highlightKey={currentDrill.key} needsShift={!!currentDrill.shift} />
                    
                    {/* Hand Guide */}
                    <HandGuide highlightKey={currentDrill.key} />

                </div>
                <div className="w-full md:w-1/3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>অগ্রগতি</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold text-primary">{toBengaliNumber(Math.round(progress))}%</div>
                                <Progress value={progress} className="w-full" />
                            </div>
                        </CardContent>
                    </Card>
                     <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => router.push('/dashboard/lessons')}>বাতিল</Button>
                        <Button onClick={() => setCurrentDrillIndex(p => Math.min(p + 1, totalDrills))}>পরবর্তী</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const keyboardLayout: Record<string, {key: string, bn: string, bnShift?: string}[]> = {
    top: [
        {key: 'q', bn: 'ক্ষ', bnShift: 'ঁ'}, {key: 'w', bn: 'ঙ', bnShift: 'ঃ'}, {key: 'e', bn: 'ে', bnShift: 'ৈ'}, {key: 'r', bn: 'র', bnShift: 'ড়'}, {key: 't', bn: 'ট', bnShift: 'ঠ'}, 
        {key: 'y', bn: 'য', bnShift: 'য়'}, {key: 'u', bn: 'ু', bnShift: 'ূ'}, {key: 'i', bn: 'ি', bnShift: 'ী'}, {key: 'o', bn: 'ো', bnShift: 'ৌ'}, {key: 'p', bn: 'প', bnShift: 'ঢ়'}
    ],
    home: [
        {key: 'a', bn: 'া', bnShift: 'অ'}, {key: 's', bn: 'স', bnShift: 'শ'}, {key: 'd', bn: 'ড', bnShift: 'ঢ'}, {key: 'f', bn: 'ফ', bnShift: 'ৎ'}, {key: 'g', bn: 'গ', bnShift: 'ঘ'},
        {key: 'h', bn: '্', bnShift: 'হ'}, {key: 'j', bn: 'জ', bnShift: 'ঝ'}, {key: 'k', bn: 'ক', bnShift: 'খ'}, {key: 'l', bn: 'ল', bnShift: 'ষ'}
    ],
    bottom: [
        {key: 'z', bn: '্য', bnShift: 'ং'}, {key: 'x', bn: 'ত', bnShift: 'থ'}, {key: 'c', bn: 'চ', bnShift: 'ছ'}, {key: 'v', bn: 'দ', bnShift: 'ধ'}, {key: 'b', bn: 'ব', bnShift: 'ভ'},
        {key: 'n', bn: 'ন', bnShift: 'ণ'}, {key: 'm', bn: 'ম'}, {key: '\\', bn: 'ৃ', bnShift: 'ঞ'},
    ],
    space: [{key: ' ', bn: '-'}],
};

const keyToFingerMap: Record<string, { hand: 'left' | 'right', finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb' }> = {
    'q': { hand: 'left', finger: 'pinky' }, 'a': { hand: 'left', finger: 'pinky' }, 'z': { hand: 'left', finger: 'pinky' },
    'w': { hand: 'left', finger: 'ring' }, 's': { hand: 'left', finger: 'ring' }, 'x': { hand: 'left', finger: 'ring' },
    'e': { hand: 'left', finger: 'middle' }, 'd': { hand: 'left', finger: 'middle' }, 'c': { hand: 'left', finger: 'middle' },
    'r': { hand: 'left', finger: 'index' }, 'f': { hand: 'left', finger: 'index' }, 'v': { hand: 'left', finger: 'index' },
    't': { hand: 'left', finger: 'index' }, 'g': { hand: 'left', finger: 'index' }, 'b': { hand: 'left', finger: 'index' },
    'y': { hand: 'right', finger: 'index' }, 'h': { hand: 'right', finger: 'index' }, 'n': { hand: 'right', finger: 'index' },
    'u': { hand: 'right', finger: 'index' }, 'j': { hand: 'right', finger: 'index' }, 'm': { hand: 'right', finger: 'index' },
    'i': { hand: 'right', finger: 'middle' }, 'k': { hand: 'right', finger: 'middle' },
    'o': { hand: 'right', finger: 'ring' }, 'l': { hand: 'right', finger: 'ring' },
    'p': { hand: 'right', finger: 'pinky' }, '\\': { hand: 'right', finger: 'pinky' },
    ' ': { hand: 'left', finger: 'thumb' }, // or right thumb
};


const VirtualKeyboard = ({ highlightKey, needsShift }: { highlightKey: string, needsShift: boolean }) => (
    <div className="p-4 bg-background rounded-lg shadow-inner space-y-2">
        {Object.values(keyboardLayout).map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
                {row.map(keyData => {
                    const isHighlighted = highlightKey.toLowerCase() === keyData.key.toLowerCase();
                    return (
                        <div
                            key={keyData.key}
                            className={cn(
                                "flex flex-col items-center justify-center h-16 rounded-md bg-secondary border border-b-4",
                                keyData.key === ' ' ? 'w-64' : 'w-16',
                                isHighlighted && 'bg-primary/20 border-primary text-primary'
                            )}
                        >
                            <span className={cn(
                                "text-sm",
                                (isHighlighted && needsShift) && "font-bold text-lg text-primary"
                            )}>
                                {keyData.bnShift}
                            </span>
                            <span className={cn(
                                "text-lg font-bold",
                                (isHighlighted && !needsShift) && "text-primary text-2xl"
                            )}>
                                {keyData.bn}
                            </span>
                        </div>
                    );
                })}
            </div>
        ))}
    </div>
);

const HandGuide = ({ highlightKey }: { highlightKey: string }) => {
    const fingerInfo = keyToFingerMap[highlightKey.toLowerCase()];

    const getFingerHighlightStyle = (hand: 'left' | 'right', finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'): React.CSSProperties => {
        if (fingerInfo && fingerInfo.hand === hand && fingerInfo.finger === finger) {
            return { filter: 'drop-shadow(0 0 12px hsl(var(--primary)))', transform: 'scale(1.1)' };
        }
        return {};
    };

    return (
        <div className="flex justify-center items-end gap-8 h-48">
             <div className="relative">
                <Image src="https://picsum.photos/200/150" width={200} height={150} alt="Left Hand" data-ai-hint="left hand" style={{transform: "scaleX(-1)"}} />
                <div className="absolute top-0 left-0 w-full h-full">
                    {/* Pinky */}
                    <div style={getFingerHighlightStyle('left', 'pinky')} className="absolute top-[35px] left-[25px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Ring */}
                    <div style={getFingerHighlightStyle('left', 'ring')} className="absolute top-[15px] left-[55px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Middle */}
                    <div style={getFingerHighlightStyle('left', 'middle')} className="absolute top-[5px] left-[85px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Index */}
                    <div style={getFingerHighlightStyle('left', 'index')} className="absolute top-[15px] left-[115px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Thumb */}
                    <div style={getFingerHighlightStyle('left', 'thumb')} className="absolute top-[80px] left-[140px] w-6 h-6 bg-primary/50 rounded-full transition-all"></div>
                </div>
            </div>
            <div className="relative">
                <Image src="https://picsum.photos/200/150" width={200} height={150} alt="Right Hand" data-ai-hint="right hand" />
                 <div className="absolute top-0 left-0 w-full h-full">
                    {/* Index */}
                    <div style={getFingerHighlightStyle('right', 'index')} className="absolute top-[15px] left-[30px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Middle */}
                    <div style={getFingerHighlightStyle('right', 'middle')} className="absolute top-[5px] left-[60px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Ring */}
                    <div style={getFingerHighlightStyle('right', 'ring')} className="absolute top-[15px] left-[90px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Pinky */}
                    <div style={getFingerHighlightStyle('right', 'pinky')} className="absolute top-[35px] left-[118px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                     {/* Thumb */}
                    <div style={getFingerHighlightStyle('right', 'thumb')} className="absolute top-[80px] left-[5px] w-6 h-6 bg-primary/50 rounded-full transition-all"></div>
                </div>
            </div>
        </div>
    );
};


export default function TypingPractice({ textToType: initialText, timeLimit, lessonId }: TypingPracticeProps) {
  const [textToType, setTextToType] = useState(initialText?.normalize('NFC') || '');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>([]);
  
  const [totalErrors, setTotalErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const totalTime = timeLimit ? timeLimit * 60 : 0;
  const { time, isActive, isPaused, start, pause, resume, reset } = useTimer();

  const timeLeft = totalTime > 0 ? totalTime - time : time;

  useEffect(() => {
    const newWords = textToType.split(' ').filter(w => w);
    setWords(newWords);
  }, [textToType]);


  const calculateStats = useCallback(() => {
    if (time > 0) {
      const typedCharsCount = typedWords.join(' ').length;
      // Using the standard WPM calculation (5 chars = 1 word)
      const grossWpm = (typedCharsCount / 5) / (time / 60);
      setWpm(Math.round(grossWpm > 0 ? grossWpm : 0));
    }
    
    const correctWords = typedWords.filter((word, index) => word.normalize('NFC') === words[index]?.normalize('NFC'));
    const newAccuracy = typedWords.length > 0 ? (correctWords.length / typedWords.length) * 100 : 100;
    setAccuracy(Math.round(newAccuracy > 0 ? newAccuracy : 0));

  }, [time, typedWords, words]);
  

  const resetTest = useCallback((isNewTest = true) => {
    reset();
    setCurrentInput("");
    setWpm(0);
    setAccuracy(100);
    setTotalErrors(0);
    setIsFinished(false);
    if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
    }
    if (isNewTest && timeLimit) {
        const randomParagraph = practiceParagraphs[Math.floor(Math.random() * practiceParagraphs.length)];
        setTextToType(randomParagraph.normalize('NFC'));
    } else {
        setTextToType(initialText.normalize('NFC'));
    }
    setCurrentWordIndex(0);
    setTypedWords([]);
    inputRef.current?.focus();
  }, [reset, initialText, timeLimit]);
  
  const finishSession = useCallback(() => {
    if(isFinished) return;
    setIsFinished(true);
    pause();
    calculateStats();
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, [isFinished, pause, calculateStats]);

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.normalize('NFC');

    if (isFinished) return;
    if (!isActive && !isPaused) start();

    if (isPaused && isActive) {
        resume();
    }
    
    if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
        if(isActive && !isPaused) {
            pause();
        }
    }, 4000);

    if (value.endsWith(' ')) {
        if(currentInput.trim() === '') {
            setCurrentInput('');
            return;
        };

        const typedWord = currentInput.trim().normalize('NFC');
        const newTypedWords = [...typedWords, typedWord];
        setTypedWords(newTypedWords);

        if(typedWord !== words[currentWordIndex].normalize('NFC')) {
            setTotalErrors(prev => prev + 1);
        }

        setCurrentWordIndex(prev => prev + 1);
        setCurrentInput("");
    } else {
        setCurrentInput(value);
    }
  };
  
  useEffect(() => {
    inputRef.current?.focus();
    return () => {
        if(inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
        }
    }
  }, []);

  useEffect(() => {
    const isTestFinished = currentWordIndex === words.length && words.length > 0;
    if (isActive && !isPaused) {
      calculateStats();
      
      const isTimeUp = timeLimit && time >= timeLimit * 60;
      
      if (isTestFinished || isTimeUp) {
        finishSession();
      }
    } else if (isTestFinished) {
        finishSession();
    }
  }, [time, isActive, isPaused, timeLimit, calculateStats, finishSession, currentWordIndex, words.length]);


  useEffect(() => {
      if(isPaused && inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
      }
  }, [isPaused])


  const getWordClass = (wordIdx: number) => {
    if (wordIdx > currentWordIndex) return "text-muted-foreground";
    if (wordIdx < currentWordIndex) {
        return typedWords[wordIdx]?.normalize('NFC') === words[wordIdx]?.normalize('NFC') ? "text-green-500" : "text-red-500 line-through";
    }
    return "text-primary bg-yellow-100 dark:bg-yellow-800/50 rounded px-1";
  }

  const currentWord = words[currentWordIndex]?.normalize('NFC') || '';
  const normalizedInput = currentInput.normalize('NFC');
  
    const getPreviewContent = () => {
        if (!currentWord && !normalizedInput) return null;

        let correctPart = '';
        let incorrectPart = '';
        let remainingPart = currentWord;
        
        let i = 0;
        while (i < normalizedInput.length && i < currentWord.length) {
            if (normalizedInput[i] === currentWord[i]) {
                i++;
            } else {
                break;
            }
        }
        
        correctPart = currentWord.substring(0, i);
        if (i < normalizedInput.length) { // There is a mistake
            incorrectPart = normalizedInput.substring(i);
            remainingPart = currentWord.substring(i);
        } else { // No mistake yet
            remainingPart = currentWord.substring(i);
        }


        return (
            <>
            <span className="text-green-500">{correctPart}</span>
            <span className="text-red-500 underline bg-red-500/20">{incorrectPart}</span>
            <span className="text-muted-foreground opacity-50">{remainingPart}</span>
            </>
        );
    };


  const isError = normalizedInput.length > 0 && !currentWord.startsWith(normalizedInput);

  if(isFinished) {
    return <TestResults stats={{ wpm: wpm, accuracy: accuracy, errors: totalErrors, timeElapsed: time }} onRestart={() => resetTest(!timeLimit)} lessonId={lessonId} />;
  }

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4">
          <StatDisplay icon={Zap} value={wpm} label="WPM" />
          <StatDisplay icon={Target} value={`${accuracy}%`} label="Accuracy" />
          <StatDisplay icon={Timer} value={timeLimit ? new Date((totalTime - time) * 1000).toISOString().substr(14, 5) : new Date(time * 1000).toISOString().substr(14, 5)} label={timeLimit ? "বাকি" : "সময়"} />
          <StatDisplay icon={XCircle} value={totalErrors} label="ভুল শব্দ" />
        </CardContent>
      </Card>

      <Card className="w-full p-6 text-2xl tracking-wider font-mono leading-relaxed relative select-none">
          <p>
            {words.map((word, index) => (
                <span key={index} className={cn("transition-colors", getWordClass(index))}>
                    {word.normalize('NFC')}{' '}
                </span>
            ))}
          </p>
      </Card>

       <div className="w-full h-24 flex flex-col items-center justify-center">
        <div className={cn(
          "text-2xl font-mono p-2 flex items-center justify-center min-h-[3rem] w-full",
        )}>
          {getPreviewContent()}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleUserInputChange}
          className={cn(
            "w-full text-center text-2xl font-mono p-6 border-t-0 rounded-t-none",
             isError ? "border-red-500 focus-visible:ring-red-500" : "border-green-500 focus-visible:ring-green-500"
          )}
          disabled={isFinished}
          onPaste={(e) => e.preventDefault()}
          lang="bn"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button onClick={() => router.push('/dashboard/lessons')} variant="outline" size="icon" title="পাঠক্রমে ফিরে যান">
          <Home className="h-5 w-5" />
        </Button>
        <Button onClick={isPaused ? resume : pause} variant="outline" size="icon" disabled={!isActive} title={isPaused ? "চালিয়ে যান" : "থামুন"}>
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
export { VisualTypingDrill };

    

    

    




