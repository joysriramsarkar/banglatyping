
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useSound from 'use-sound';
import { cn } from '@/lib/utils';

const wordsList = [
    "বাংলা", "ভাষা", "জয়", "পতাকা", "নদী", "ফুল", "ফল", "মাছ", "গান", "কবিতা", "স্বাধীনতা",
    "সূর্য", "চন্দ্র", "তারা", "আকাশ", "বাতাস", "জল", "আগুন", "মাটি", "পাখি", "সবুজ",
    "মানুষ", "জীবন", "মরণ", "সময়", "কাজ", "খেলা", "হাসি", "কান্না", "ভালোবাসা", "বন্ধু"
];

const Word = ({ word, onComplete, speed }: { word: string, onComplete: (w: string) => void, speed: number }) => {
  const duration = Math.max(3, 16 - speed); // As speed increases, duration decreases
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <motion.div
      initial={{ y: -50, x: Math.random() * (windowSize.width > 400 ? windowSize.width - 200 : 300) }}
      animate={{ y: windowSize.height - 150 }}
      transition={{ duration, ease: "linear" }}
      onAnimationComplete={() => onComplete(word)}
      className="absolute px-4 py-2 bg-card border rounded-full text-lg font-mono shadow-lg"
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
    const gameInterval = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Sound hooks - using use-sound but wrapping usage to avoid crash if file missing
    const [playKeystroke] = useSound('/sounds/click.mp3', { volume: 0.5, interrupt: true });
    const [playError] = useSound('/sounds/error.mp3', { volume: 0.5, interrupt: true });
    const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.5, interrupt: true });
    const [playLevelUp] = useSound('/sounds/levelup.mp3', { volume: 0.5, interrupt: true });

    // Safety wrapper
    const playSound = (soundFn: () => void) => {
        try {
            soundFn();
        } catch (e) {
            // Ignore sound errors
        }
    };

    const startGame = useCallback(() => {
        setActiveWords([]);
        setScore(0);
        setLives(5);
        setGameOver(false);
        setInputValue('');
        setLevel(1);

        if (gameInterval.current) clearInterval(gameInterval.current);
        gameInterval.current = setInterval(() => {
            setActiveWords(prev => {
                if(prev.length < 10) {
                    const newWord = wordsList[Math.floor(Math.random() * wordsList.length)];
                    return [...prev, newWord + Math.random()]; // Add random number to make key unique
                }
                return prev;
            });
        }, 2500);
    }, []);

    const handleWordMiss = useCallback((word: string) => {
        setActiveWords(prev => prev.filter(w => w !== word));
        if(!gameOver) {
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                    playSound(playError); // Play error sound on game over
                    if(gameInterval.current) clearInterval(gameInterval.current);
                } else {
                    playSound(playError); // Play error sound on life lost
                }

                // Visual feedback for life lost
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(200);
                }

                return newLives;
            });
        }
    }, [gameOver, playError]);

    useEffect(() => {
        startGame();
        return () => {
            if (gameInterval.current) clearInterval(gameInterval.current);
        };
    }, [startGame]);

    // Level up logic
    useEffect(() => {
        if (score > 0 && score % 50 === 0) {
            setLevel(prev => prev + 1);
            playSound(playLevelUp);
            // Increase difficulty by speeding up word generation
             if (gameInterval.current) clearInterval(gameInterval.current);
             const newInterval = Math.max(1000, 2500 - (level * 200));
             gameInterval.current = setInterval(() => {
                setActiveWords(prev => {
                    if(prev.length < 10) {
                        const newWord = wordsList[Math.floor(Math.random() * wordsList.length)];
                        return [...prev, newWord + Math.random()];
                    }
                    return prev;
                });
            }, newInterval);
        }
    }, [score, level, playLevelUp]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const typedValue = e.target.value;
        if (typedValue.endsWith(' ')) {
            const typedWord = typedValue.trim();
            const matchedActiveWord = activeWords.find(aw => aw.replace(/[0-9.]/g, '') === typedWord);

            if (matchedActiveWord) {
                setScore(prev => prev + typedWord.length);
                setActiveWords(prev => prev.filter(aw => aw !== matchedActiveWord));
                playSound(playSuccess);
            } else {
                playSound(playError); // Missed word
            }
            setInputValue('');
        } else {
            setInputValue(typedValue);
            playSound(playKeystroke);
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
                    <Word key={word} word={word.replace(/[0-9.]/g, '')} onComplete={handleWordMiss} speed={level} />
                ))}
            </AnimatePresence>

            <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-10">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1">
                        <p>স্কোর: <span className="font-bold">{score}</span></p>
                        <p>লাইফ: <span className="font-bold">{'❤️'.repeat(lives)}</span></p>
                        <p>লেভেল: <span className="font-bold">{level}</span></p>
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
