// Hook for managing lessons from database
import { useState, useEffect } from 'react';
import type { Lesson, Drill } from '@/lib/types';

interface UseLessonsOptions {
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export function useLessons(options?: UseLessonsOptions) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/lessons', window.location.origin);
        
        if (options?.category) {
          url.searchParams.append('category', options.category);
        }
        if (options?.level) {
          url.searchParams.append('level', options.level);
        }

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`Failed to fetch lessons: ${response.statusText}`);
        }

        const data = await response.json();
        setLessons(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [options?.category, options?.level]);

  return { lessons, loading, error };
}

interface LessonWithDrills extends Lesson {
  drills?: Drill[];
}

export function useLesson(lessonId: string | null) {
  const [lesson, setLesson] = useState<LessonWithDrills | null>(null);
  const [loading, setLoading] = useState(!!lessonId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) {
      setLesson(null);
      setLoading(false);
      return;
    }

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/lessons/${lessonId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Lesson not found');
          }
          throw new Error(`Failed to fetch lesson: ${response.statusText}`);
        }

        const data = await response.json();
        setLesson(data.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lesson');
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  return { lesson, loading, error };
}

interface UserStatistics {
  user_id: string;
  lessons_practiced: number;
  average_accuracy: number;
  average_wpm: number;
  best_wpm: number;
  best_accuracy: number;
  total_sessions: number;
}

export function useUserStatistics(userId: string | null) {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user-statistics/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch statistics: ${response.statusText}`);
        }

        const data = await response.json();
        setStats(data.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading, error };
}

interface WeakCharacter {
  user_id: string;
  character: string;
  accuracy_rate: number;
  error_count: number;
  total_attempts: number;
  strength_level: 'Strong' | 'Good' | 'Weak' | 'Very Weak';
}

export function useWeakCharacters(userId: string | null, threshold: number = 95) {
  const [weakChars, setWeakChars] = useState<WeakCharacter[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setWeakChars([]);
      setLoading(false);
      return;
    }

    const fetchWeakChars = async () => {
      try {
        setLoading(true);
        const url = `/api/weak-characters/${userId}?threshold=${threshold}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch weak characters: ${response.statusText}`);
        }

        const data = await response.json();
        setWeakChars(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weak characters');
        setWeakChars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeakChars();
  }, [userId, threshold]);

  return { weakChars, loading, error };
}

interface CustomDrill {
  id: string;
  user_id: string;
  name?: string;
  characters: string;
  drill_data: Drill[];
  focus_characters: Record<string, number>;
  generated_at: string;
  last_used_at?: string;
  usage_count: number;
}

export function useCustomDrills(userId: string | null) {
  const [drills, setDrills] = useState<CustomDrill[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomDrills = async () => {
    if (!userId) {
      setDrills([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = `/api/custom-drills?userId=${userId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch custom drills: ${response.statusText}`);
      }

      const data = await response.json();
      setDrills(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch custom drills');
      setDrills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomDrills();
  }, [userId]);

  const generateCustomDrill = async (threshold?: number) => {
    if (!userId) return null;

    try {
      const response = await fetch('/api/custom-drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          threshold: threshold || 85,
          minCharacters: 5,
          maxCharacters: 20,
          drillCount: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create custom drill: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setDrills(prev => [data.data, ...prev]);
        return data.data;
      }
      throw new Error(data.error || 'Failed to create custom drill');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create custom drill';
      setError(msg);
      return null;
    }
  };

  return { drills, loading, error, generateCustomDrill, refetch: fetchCustomDrills };
}

// Hook for saving progress
export function useSaveProgress() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProgress = async (
    userId: string,
    lessonId: string,
    wpm: number,
    accuracy: number,
    errors: number,
    timeElapsed: number,
    erredCharacters: Array<{ char: string; count: number }>
  ) => {
    try {
      setSaving(true);
      const response = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId,
          wpm,
          accuracy,
          errors,
          timeElapsed,
          erredCharacters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save progress: ${response.statusText}`);
      }

      const data = await response.json();
      setError(null);
      return data.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save progress';
      setError(msg);
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { saveProgress, saving, error };
}
