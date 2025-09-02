export type KeyboardLayout = "Avro Phonetic" | "Bijoy Classic" | "BanglaWord";

export interface Lesson {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  text: string;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
}
