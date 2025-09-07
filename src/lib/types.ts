

export type KeyboardLayout = "Avro Phonetic" | "Bijoy Classic" | "BanglaWord";

export interface Lesson {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  text?: string;
  drills?: Drill[];
  row?: 'home-row' | 'top-row' | 'bottom-row' | 'kar-row';
}

export interface ErredCharacter {
    char: string;
    count: number;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  erredCharacters?: ErredCharacter[];
}

export interface SingleDrill {
    display: string;
    key: string;
    shift: boolean;
}

export interface Drill {
  prompt: string; // The character(s) the user needs to type
  steps: SingleDrill[];
}

export type RowDrillCategory = {
    id: 'home-row' | 'top-row' | 'bottom-row' | 'kar-row';
    name: string;
    description: string;
}

export interface TestSummary {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  lessonId: string;
  timestamp: any; // Firestore ServerTimestamp
  erredCharacters: ErredCharacter[];
}

export interface UserTypingStats {
  averageWpm: number;
  averageAccuracy: number;
  lessonsCompleted: number;
  testsTaken: number;
  highestWpm: number;
}

    