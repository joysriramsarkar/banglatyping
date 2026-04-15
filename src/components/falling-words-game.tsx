
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Home, RefreshCw, Pause, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { practiceParagraphs } from '@/lib/lessons';

// Extract unique words from practice paragraphs
const getWordsFromParagraphs = (): string[] => {
  const allWords = new Set<string>();
  
  practiceParagraphs.forEach(paragraph => {
    const words = paragraph.split(/\s+/).filter(word => word.length > 0);
    words.forEach(word => {
      // Clean word and add if it's Bengali and reasonable length
      const cleanWord = word.replace(/[।,!?;:।"''()।]/g, '').trim();
      if (cleanWord.length >= 2 && cleanWord.length <= 15 && /[\u0980-\u09FF]/.test(cleanWord)) {
        allWords.add(cleanWord);
      }
    });
  });
  
  return Array.from(allWords);
};

const wordsList = getWordsFromParagraphs();

const Word = ({ word, onComplete, speed, isPaused }: { word: string, onComplete: (w: string) => void, speed: number, isPaused: boolean }) => {
  const duration = Math.max(3, 16 - speed); // As speed increases, duration decreases
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  if (!isClient) return null; // Avoid hydration mismatch

  // Color based on word length
  const getWordColor = (wordLength: number) => {
    if (wordLength <= 3) return "text-green-600";
    if (wordLength <= 6) return "text-blue-600";
    if (wordLength <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <motion.div
      initial={{ y: -50, x: Math.random() * (windowSize.width > 400 ? windowSize.width - 200 : 300) }}
      animate={{ y: isPaused ? -50 : windowSize.height - 150 }}
      transition={{ duration: isPaused ? 0 : duration, ease: "linear" }}
      onAnimationComplete={() => !isPaused && onComplete(word)}
      className={cn(
        "absolute px-4 py-2 bg-card border rounded-full text-lg font-mono shadow-lg",
        getWordColor(word.length)
      )}
    >
      {word}
    </motion.div>
  );
};


export default function FallingWordsGame() {
    const [activeWords, setActiveWords] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [gameOver, setGameOver] = useState(false);
    const [level, setLevel] = useState(1);
    const [totalWordsTyped, setTotalWordsTyped] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const gameInterval = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    const playSound = useCallback((type: 'click' | 'error' | 'success' | 'levelup') => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            const configs = {
                click:   { freq: 800,  type: 'sine'     as OscillatorType, duration: 0.05, vol: 0.2 },
                error:   { freq: 200,  type: 'sawtooth' as OscillatorType, duration: 0.2,  vol: 0.3 },
                success: { freq: 600,  type: 'sine'     as OscillatorType, duration: 0.15, vol: 0.3 },
                levelup: { freq: 1000, type: 'sine'     as OscillatorType, duration: 0.4,  vol: 0.4 },
            };
            const c = configs[type];
            o.type = c.type;
            o.frequency.setValueAtTime(c.freq, ctx.currentTime);
            if (type === 'levelup') o.frequency.linearRampToValueAtTime(1400, ctx.currentTime + c.duration);
            g.gain.setValueAtTime(c.vol, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.duration);
            o.start(ctx.currentTime);
            o.stop(ctx.currentTime + c.duration);
        } catch (e) { /* ignore */ }
    }, []);

    const pauseGame = useCallback(() => {
        setIsPaused(true);
        if (gameInterval.current) clearInterval(gameInterval.current);
    }, []);

    const resumeGame = useCallback(() => {
        setIsPaused(false);
        const maxWords = Math.min(5 + level, 15);
        const intervalTime = Math.max(1500 - (level * 100), 800);
        gameInterval.current = setInterval(() => {
            setActiveWords(prev => {
                if(prev.length < maxWords) {
                    const newWord = wordsList[Math.floor(Math.random() * wordsList.length)];
                    return [...prev, newWord + Math.random()];
                }
                return prev;
            });
        }, intervalTime);
    }, [level]);

    const startGame = useCallback(() => {
        setActiveWords([]);
        setScore(0);
        setLives(5);
        setGameOver(false);
        setInputValue('');
        setLevel(1);
        setTotalWordsTyped(0);
        setIsPaused(false);

        if (gameInterval.current) clearInterval(gameInterval.current);
        
        // Start with level 1 parameters
        const maxWords = 5;
        const intervalTime = 1500;
        
        gameInterval.current = setInterval(() => {
            setActiveWords(prev => {
                if(prev.length < maxWords) {
                    const newWord = wordsList[Math.floor(Math.random() * wordsList.length)];
                    return [...prev, newWord + Math.random()]; // Add random number to make key unique
                }
                return prev;
            });
        }, intervalTime);
    }, []);

    const handleWordMiss = useCallback((word: string) => {
        setActiveWords(prev => prev.filter(w => w !== word));
        if(!gameOver) {
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                    playSound('error');
                    if(gameInterval.current) clearInterval(gameInterval.current);
                } else {
                    playSound('error');
                }

                // Visual feedback for life lost
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(200);
                }

                return newLives;
            });
        }
    }, [gameOver, playSound]);

    useEffect(() => {
        startGame();
        return () => {
            if (gameInterval.current) clearInterval(gameInterval.current);
        };
    }, [startGame]);

    // Level up logic
    useEffect(() => {
        if (score > 0 && score % 100 === 0) { // Level up every 100 points
            setLevel(prev => prev + 1);
            playSound('levelup');
            // Restart game with new level parameters
            if (gameInterval.current) clearInterval(gameInterval.current);
            const maxWords = Math.min(5 + (level + 1), 15);
            const intervalTime = Math.max(1500 - ((level + 1) * 100), 800);
            gameInterval.current = setInterval(() => {
                setActiveWords(prev => {
                    if(prev.length < maxWords) {
                        const newWord = wordsList[Math.floor(Math.random() * wordsList.length)];
                        return [...prev, newWord + Math.random()];
                    }
                    return prev;
                });
            }, intervalTime);
        }
    }, [score, level, playSound]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const typedValue = e.target.value;
        if (typedValue.endsWith(' ')) {
            const typedWord = typedValue.trim();
            const matchedActiveWord = activeWords.find(aw => aw.replace(/[0-9.]/g, '') === typedWord);

            if (matchedActiveWord) {
                setScore(prev => prev + typedWord.length);
                setActiveWords(prev => prev.filter(aw => aw !== matchedActiveWord));
                setTotalWordsTyped(prev => prev + 1);
                playSound('success');
            } else {
                playSound('error');
            }
            setInputValue('');
        } else {
            setInputValue(typedValue);
            playSound('click');
        }
    };
    
    if (gameOver) {
        return (
            <Card className="text-center p-8 max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-destructive">গেম ওভার!</h2>
                <p className="text-xl mt-2">আপনার স্কোর: {score}</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <Button onClick={startGame} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        আবার খেলুন
                    </Button>
                    <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                        <Home className="mr-2 h-4 w-4" />
                        হোমে ফিরে যান
                    </Button>
                </div>
            </Card>
        );
    }
    
    return (
        <div className={cn("relative w-full h-[70vh] rounded-lg overflow-hidden border transition-colors duration-500", lives <= 2 ? "bg-red-50" : "bg-secondary/30")}>
            <AnimatePresence>
                {activeWords.map((word) => (
                    <Word key={word} word={word.replace(/[0-9.]/g, '')} onComplete={handleWordMiss} speed={level} isPaused={isPaused} />
                ))}
            </AnimatePresence>

            <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-10">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1">
                        <p>স্কোর: <span className="font-bold">{score}</span></p>
                        <p>লাইফ: <span className="font-bold">{'❤️'.repeat(lives)}</span></p>
                        <p>লেভেল: <span className="font-bold">{level}</span></p>
                        <p>শব্দ: <span className="font-bold">{totalWordsTyped}</span></p>
                        <Button 
                            onClick={isPaused ? resumeGame : pauseGame} 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-2"
                        >
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Input
                        type="text"
                        placeholder="শব্দ টাইপ করুন..."
                        value={inputValue}
                        onChange={handleInputChange}
                        className="w-36 sm:w-48 font-mono"
                        autoFocus
                    />
                </CardContent>
            </Card>
        </div>
    );
}
