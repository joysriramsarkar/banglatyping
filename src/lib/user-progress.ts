// User progress tracking service
import { supabase } from './db';
import type { UserProgress, CharacterError, WeakCharacterView, UserStatistics, ErredCharacter } from './types';

/**
 * Save a typing session to the database
 */
export async function saveTypingSession(
  userId: string,
  lessonId: string | null,
  wpm: number,
  accuracy: number,
  errors: number,
  timeElapsed: number,
  erredCharacters: ErredCharacter[]
): Promise<UserProgress | null> {
  try {
    // Format erred characters for storage
    const formattedErrors = erredCharacters.map(item => ({
      char: item.char,
      count: item.count
    }));

    const { data, error } = await (supabase as any)
      .from('user_progress')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        wpm,
        accuracy,
        errors,
        time_elapsed: timeElapsed,
        erred_characters: formattedErrors,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving typing session:', error);
      return null;
    }

    return data as UserProgress;
  } catch (err) {
    console.error('Exception saving typing session:', err);
    return null;
  }
}

/**
 * Get user's weak characters (characters with low accuracy)
 * @param userId Firebase UID
 * @param threshold Accuracy threshold (0-100). Only returns chars below this
 * @returns Array of weak characters sorted by accuracy
 */
export async function getUserWeakCharacters(
  userId: string,
  threshold: number = 95
): Promise<WeakCharacterView[]> {
  try {
    const { data, error } = await supabase
      .from('user_weak_characters')
      .select('*')
      .eq('user_id', userId)
      .lt('accuracy_rate', threshold)
      .order('accuracy_rate', { ascending: true })
      .limit(30); // Return top 30 weakest characters

    if (error) {
      console.error('Error fetching weak characters:', error);
      return [];
    }

    return (data || []) as WeakCharacterView[];
  } catch (err) {
    console.error('Exception fetching weak characters:', err);
    return [];
  }
}

/**
 * Get user's overall statistics
 */
export async function getUserStatistics(userId: string): Promise<UserStatistics | null> {
  try {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return default statistics
        return {
          user_id: userId,
          lessons_practiced: 0,
          average_accuracy: 0,
          average_wpm: 0,
          best_wpm: 0,
          best_accuracy: 0,
          total_sessions: 0,
        };
      }
      console.error('Error fetching user statistics:', error);
      return null;
    }

    return data as UserStatistics;
  } catch (err) {
    console.error('Exception fetching user statistics:', err);
    return null;
  }
}

/**
 * Get character-specific error details for a user
 */
export async function getCharacterError(
  userId: string,
  character: string
): Promise<CharacterError | null> {
  try {
    const { data, error } = await supabase
      .from('character_errors')
      .select('*')
      .eq('user_id', userId)
      .eq('character', character)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching character error:', error);
      return null;
    }

    return data as CharacterError;
  } catch (err) {
    console.error('Exception fetching character error:', err);
    return null;
  }
}

/**
 * Get user's progress for a specific lesson
 */
export async function getUserLessonProgress(
  userId: string,
  lessonId: string
): Promise<UserProgress[] | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .order('session_timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }

    return data as UserProgress[];
  } catch (err) {
    console.error('Exception fetching lesson progress:', err);
    return null;
  }
}

/**
 * Get all user progress (paginated)
 */
export async function getUserProgressHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: UserProgress[] | null; total: number }> {
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting progress:', countError);
      return { data: null, total: 0 };
    }

    // Get paginated data
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('session_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching progress history:', error);
      return { data: null, total: 0 };
    }

    return { data: data as UserProgress[], total: count || 0 };
  } catch (err) {
    console.error('Exception fetching progress history:', err);
    return { data: null, total: 0 };
  }
}

/**
 * Mark lesson as completed
 */
export async function updateLessonCompletion(
  userId: string,
  lessonId: string,
  accuracy: number,
  wpm: number
): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from('user_lesson_completion')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          times_completed: 1,
          best_accuracy: accuracy,
          best_wpm: wpm,
          last_completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      );

    if (error) {
      console.error('Error updating lesson completion:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception updating lesson completion:', err);
    return false;
  }
}

/**
 * Analyze user's typing errors and identify patterns
 */
export async function analyzeUserErrors(userId: string) {
  try {
    const errors = await getUserWeakCharacters(userId);
    
    const analysis = {
      totalWeakChars: errors.length,
      veryWeak: errors.filter(e => e.strength_level === 'Very Weak'),
      weak: errors.filter(e => e.strength_level === 'Weak'),
      avgAccuracyWeakChars: 
        errors.length > 0 
          ? Math.round((errors.reduce((sum, e) => sum + e.accuracy_rate, 0) / errors.length) * 100) / 100
          : 100,
      focusAreas: errors.slice(0, 5).map(e => ({ char: e.character, accuracy: e.accuracy_rate })),
    };

    return analysis;
  } catch (err) {
    console.error('Exception analyzing user errors:', err);
    return null;
  }
}
