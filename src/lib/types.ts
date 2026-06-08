

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

export interface TestResult {
  wpm: number;
  accuracy: number;
  lesson_id: string;
  created_at: string;
}

export interface TestSummary {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  lessonId: string;
  timestamp?: string;
  erredCharacters: ErredCharacter[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string | null;
  wpm: number;
  accuracy: number;
  errors: number;
  time_elapsed: number;
  erred_characters: ErredCharacter[];
  session_timestamp: string;
  created_at: string;
}

export interface CharacterError {
  id: string;
  user_id: string;
  character: string;
  error_count: number;
  total_attempts: number;
  accuracy_rate: number;
  last_error_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WeakCharacterView {
  user_id: string;
  character: string;
  accuracy_rate: number;
  error_count: number;
  total_attempts: number;
  strength_level: 'Strong' | 'Good' | 'Weak' | 'Very Weak';
}

export interface UserStatistics {
  user_id: string;
  lessons_practiced: number;
  average_accuracy: number;
  average_wpm: number;
  best_wpm: number;
  best_accuracy: number;
  total_sessions: number;
}

export interface CustomDrill {
  id: string;
  user_id: string;
  name?: string;
  characters: string;
  drill_data: Drill[];
  focus_characters: Record<string, number>;
  generated_at: string;
  last_used_at?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserTypingStats {
  averageWpm: number;
  averageAccuracy: number;
  lessonsCompleted: number;
  testsTaken: number;
  highestWpm: number;
}

    
