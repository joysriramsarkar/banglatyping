import { useState, useEffect, useCallback, useRef } from 'react';
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

export function useFallingWordsGame() {
    const [activeWords, setActiveWords] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [gameOver, setGameOver] = useState(false);
    const [level, setLevel] = useState(1);
    const [totalWordsTyped, setTotalWordsTyped] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const gameInterval = useRef<NodeJS.Timeout | null>(null);

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

    return {
        activeWords,
        inputValue,
        score,
        lives,
        gameOver,
        level,
        totalWordsTyped,
        isPaused,
        startGame,
        pauseGame,
        resumeGame,
        handleWordMiss,
        handleInputChange
    };
}
