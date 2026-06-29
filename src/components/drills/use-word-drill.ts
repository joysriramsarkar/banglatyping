import { useEffect, useRef, useCallback, useReducer } from "react";
import { useTimer } from "@/hooks/use-timer";
import type { Drill, ErredCharacter } from "@/lib/types";
import { generateDrills as generateDrillsFromLib } from "@/lib/lessons";

interface DrillState {
    drills: Drill[];
    currentDrillIndex: number;
    currentCharIndex: number;
    userInput: string;
    erredCharacters: Map<string, number>;
    isError: boolean;
    isFinished: boolean;
    wpm: number;
    accuracy: number;
    totalCharsTyped: number;
    totalErrors: number;
    wpmHistory: { time: number, wpm: number }[];
}

type DrillAction =
    | { type: 'SET_DRILLS'; payload: Drill[] }
    | { type: 'TYPE_SPACE'; payload: { nextDrillIndex: number, currentWord: string } }
    | { type: 'TYPE_BACKSPACE' }
    | { type: 'TYPE_CHAR'; payload: { char: string, currentWord: string } }
    | { type: 'ADD_WPM_HISTORY' }
    | { type: 'FINISH'; payload: { time: number } }
    | { type: 'RESET'; payload: Drill[] };

function drillReducer(state: DrillState, action: DrillAction): DrillState {
    switch (action.type) {
        case 'SET_DRILLS':
            return { ...state, drills: action.payload };
        case 'TYPE_SPACE': {
            const { nextDrillIndex, currentWord } = action.payload;
            if (state.userInput.trim() === currentWord) {
                return {
                    ...state,
                    totalCharsTyped: state.totalCharsTyped + 1,
                    currentDrillIndex: nextDrillIndex,
                    currentCharIndex: 0,
                    userInput: '',
                    isError: false,
                };
            } else {
                return {
                    ...state,
                    totalErrors: state.totalErrors + 1,
                    isError: true,
                };
            }
        }
        case 'TYPE_BACKSPACE':
            return {
                ...state,
                userInput: state.userInput.slice(0, -1),
                currentCharIndex: Math.max(0, state.currentCharIndex - 1),
                isError: false,
            };
        case 'TYPE_CHAR': {
            const { char, currentWord } = action.payload;
            const newTotalChars = state.totalCharsTyped + 1;
            const newUserInput = state.userInput + char;
            const expectedSubstring = currentWord.substring(0, newUserInput.length);

            if (newUserInput === expectedSubstring) {
                return {
                    ...state,
                    totalCharsTyped: newTotalChars,
                    currentCharIndex: state.currentCharIndex + 1,
                    userInput: newUserInput,
                    isError: false,
                };
            } else {
                const expectedChar = currentWord[state.currentCharIndex];
                const newErredChars = new Map(state.erredCharacters);
                newErredChars.set(expectedChar, (newErredChars.get(expectedChar) || 0) + 1);

                return {
                    ...state,
                    totalCharsTyped: newTotalChars,
                    totalErrors: state.totalErrors + 1,
                    userInput: newUserInput,
                    erredCharacters: newErredChars,
                    isError: true,
                };
            }
        }
        case 'ADD_WPM_HISTORY': {
            const latestTime = state.wpmHistory.length > 0 ? state.wpmHistory[state.wpmHistory.length - 1].time : 0;
            const newTime = latestTime + 30;
            const currentWpm = newTime > 0 ? Math.round(((state.totalCharsTyped / 5) / (newTime / 60))) : 0;
            return {
                ...state,
                wpmHistory: [...state.wpmHistory, { time: newTime, wpm: currentWpm }]
            };
        }
        case 'FINISH': {
            const time = action.payload.time;
            const correctChars = state.totalCharsTyped - state.totalErrors;
            const finalAccuracy = state.totalCharsTyped > 0 ? (correctChars / state.totalCharsTyped) * 100 : 100;
            const finalWpm = time > 0 ? ((state.totalCharsTyped / 5) / (time / 60)) : 0;

            return {
                ...state,
                isFinished: true,
                accuracy: Math.round(finalAccuracy),
                wpm: Math.round(finalWpm),
            };
        }
        case 'RESET':
            return {
                drills: action.payload,
                currentDrillIndex: 0,
                currentCharIndex: 0,
                userInput: '',
                erredCharacters: new Map<string, number>(),
                isError: false,
                isFinished: false,
                wpm: 0,
                accuracy: 100,
                totalCharsTyped: 0,
                totalErrors: 0,
                wpmHistory: [],
            };
        default:
            return state;
    }
}

export const useWordDrill = (initialDrills: Drill[], accuracyGoal: number) => {
    const initialState: DrillState = {
        drills: initialDrills,
        currentDrillIndex: 0,
        currentCharIndex: 0,
        userInput: '',
        erredCharacters: new Map<string, number>(),
        isError: false,
        isFinished: false,
        wpm: 0,
        accuracy: 100,
        totalCharsTyped: 0,
        totalErrors: 0,
        wpmHistory: [],
    };

    const [state, dispatch] = useReducer(drillReducer, initialState);

    const {
        drills,
        currentDrillIndex,
        currentCharIndex,
        userInput,
        erredCharacters,
        isError,
        isFinished,
        wpm,
        accuracy,
        totalCharsTyped,
        totalErrors,
        wpmHistory,
    } = state;

    const maxTime = 360; // 6 minutes
    const { time, isActive, isPaused, start, pause, resume, reset: resetTimer } = useTimer();
    const timeLeft = maxTime - time;

    const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const currentDrill = drills[currentDrillIndex];
    const currentWord = currentDrill?.prompt || "";

    const finishDrill = useCallback(() => {
        if (isFinished) return;
        pause();
        if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

        dispatch({ type: "FINISH", payload: { time } });
    }, [isFinished, pause, time]);

    const startDrill = useCallback(() => {
        start();
        wpmIntervalRef.current = setInterval(() => {
            dispatch({ type: "ADD_WPM_HISTORY" });
        }, 30000);
    }, [start]);

    useEffect(() => {
        return () => {
            if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isActive || isPaused || isFinished) return;

        const currentWpm = time > 0 ? Math.round(((totalCharsTyped / 5) / (time / 60))) : 0;
        const correctChars = totalCharsTyped - totalErrors;
        const currentAccuracy = totalCharsTyped > 0 ? (correctChars / totalCharsTyped) * 100 : 100;

        if (time >= 240 && currentWpm >= 25 && currentAccuracy >= accuracyGoal) {
            finishDrill();
        }

        if (time >= maxTime) {
            finishDrill();
        }
    }, [time, isActive, isPaused, isFinished, totalCharsTyped, totalErrors, accuracyGoal, finishDrill]);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            if (isActive && !isPaused) {
                pause();
            }
        }, 4000);
    }, [isActive, isPaused, pause]);

    const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (isFinished) return;

        if (!isActive) startDrill();
        else if (isPaused) resume();

        resetInactivityTimer();

        const typedChar = event.key;

        if (typedChar === " ") {
            event.preventDefault();
            let nextDrillIndex = currentDrillIndex + 1;
            if (nextDrillIndex >= drills.length) nextDrillIndex = 0; // Loop
            dispatch({ type: "TYPE_SPACE", payload: { nextDrillIndex, currentWord } });
        } else if (typedChar === "Backspace") {
            dispatch({ type: "TYPE_BACKSPACE" });
        } else if (typedChar.length === 1) { // handle normal characters
            dispatch({ type: "TYPE_CHAR", payload: { char: typedChar, currentWord } });
        }
    }, [isFinished, isActive, isPaused, startDrill, resume, resetInactivityTimer, currentWord, currentDrillIndex, drills.length]);

    const resetDrill = useCallback(() => {
        resetTimer();
        dispatch({ type: "RESET", payload: initialDrills });
    }, [initialDrills, resetTimer]);

    const startCustomDrill = () => {
        const erredChars = Array.from(erredCharacters.keys());
        if (erredChars.length > 0) {
            const customDrills = generateDrillsFromLib(erredChars, 150);
            dispatch({ type: "SET_DRILLS", payload: customDrills });
            resetTimer();
            dispatch({ type: "RESET", payload: customDrills });
        }
    };

    return {
        drills,
        currentDrillIndex,
        currentCharIndex,
        userInput,
        isError,
        isFinished,
        wpm,
        accuracy,
        totalErrors,
        time,
        wpmHistory,
        timeLeft,
        totalCharsTyped,
        erredCharacters,
        handleKeyPress,
        resetDrill,
        startCustomDrill,
        currentDrill,
    };
};
