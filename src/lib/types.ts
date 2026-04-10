

export type KeyboardLayout = "Avro Phonetic" | "Bijoy Classic" | "BanglaWord";

export interface Lesson {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  text?: string;
  drills?: Drill[];
  row?: 'home-row' | 'top-row' | 'bottom-row' | 'kar-row';
  isWordDrill?: boolean;
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
    keyCode: string; // Physical keyboard code like 'KeyQ', 'KeyW'
    shift: boolean;
    fingerPosition?: number; // 1-5 left hand, 6-10 right hand
    fingerName?: string; // 'Pinky', 'Ring', 'Middle', 'Index', 'Thumb'
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

    
