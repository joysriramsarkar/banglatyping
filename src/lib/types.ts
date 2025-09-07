export type KeyboardLayout = "Avro Phonetic" | "Bijoy Classic" | "BanglaWord";

export interface Lesson {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  text?: string;
  drills?: Drill[];
  row?: 'home-row' | 'top-row' | 'bottom-row' | 'kar-row';
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
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
