export type KeyboardLayout = "Avro Phonetic" | "Bijoy Classic" | "BanglaWord";

export interface Lesson {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  text?: string;
  drills?: Drill[];
  row?: 'home-row' | 'top-row' | 'bottom-row';
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
}

export interface Drill {
  prompt: string; // The character(s) the user needs to type
  key: string; // The key on the keyboard to press
  shift?: boolean;
}
