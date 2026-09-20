// User progress tracking service
import { createRequestClient } from './db';
import type { UserProgress, CharacterError, WeakCharacterView, UserStatistics, ErredCharacter } from './types';

export const DEFAULT_PRACTICE_LESSON_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Save a typing session to the database
 * @param accessToken The caller's Supabase access token, so RLS applies
 */
export async function saveTypingSession(
  userId: string,
  lessonId: string | null,
  wpm: number,
  accuracy: number,
  errors: number,
  timeElapsed: number,
  erredCharacters: ErredCharacter[],
  accessToken?: string | null
): Promise<UserProgress | null> {
  try {
    const db = createRequestClient(accessToken);
    // Format erred characters for storage
    const formattedErrors = (erredCharacters || []).map(item => ({
      char: item.char,
      count: item.count
    }));

    // Target lesson ID: if none provided, use the universal practice lesson UUID
    const targetLessonId = lessonId || DEFAULT_PRACTICE_LESSON_ID;

    const { data, error } = await (db as any)
      .from('user_progress')
      .insert({
        user_id: userId,
        lesson_id: targetLessonId,
        wpm,
        accuracy,
        errors,
        time_elapsed: timeElapsed,
        erred_characters: formattedErrors,
      })
      .select()
      .single();

    if (error) {
      // If error was a foreign key or null constraint on lesson_id, retry with DEFAULT_PRACTICE_LESSON_ID
      if ((error.code === '23502' || error.code === '23503') && targetLessonId !== DEFAULT_PRACTICE_LESSON_ID) {
        console.warn(`Foreign key/not-null error with lesson_id (${targetLessonId}). Retrying with default practice lesson...`);
        const { data: retryData, error: retryError } = await (db as any)
          .from('user_progress')
          .insert({
            user_id: userId,
            lesson_id: DEFAULT_PRACTICE_LESSON_ID,
            wpm,
            accuracy,
            errors,
            time_elapsed: timeElapsed,
            erred_characters: formattedErrors,
          })
          .select()
          .single();

        if (retryError) {
          console.error('Error saving typing session on fallback retry:', retryError);
          return null;
        }
        return retryData as UserProgress;
      }

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
 * @param userId Supabase auth user id
 * @param threshold Accuracy threshold (0-100). Only returns chars below this
 * @param accessToken The caller's Supabase access token, so RLS applies
 * @returns Array of weak characters sorted by accuracy
 */
export async function getUserWeakCharacters(
  userId: string,
  threshold: number = 95,
  accessToken?: string | null
): Promise<WeakCharacterView[]> {
  try {
    const db = createRequestClient(accessToken);
    const { data, error } = await db
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
export async function getUserStatistics(
  userId: string,
  accessToken?: string | null
): Promise<UserStatistics | null> {
  try {
    const db = createRequestClient(accessToken);
    const { data, error } = await db
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
  character: string,
  accessToken?: string | null
): Promise<CharacterError | null> {
  try {
    const db = createRequestClient(accessToken);
    const { data, error } = await db
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
  lessonId: string,
  accessToken?: string | null
): Promise<UserProgress[] | null> {
  try {
    const db = createRequestClient(accessToken);
    const { data, error } = await db
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
  offset: number = 0,
  accessToken?: string | null
): Promise<{ data: UserProgress[] | null; total: number }> {
  try {
    const db = createRequestClient(accessToken);
    // Get total count
    const { count, error: countError } = await db
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting progress:', countError);
      return { data: null, total: 0 };
    }

    // Get paginated data
    const { data, error } = await db
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
  wpm: number,
  accessToken?: string | null
): Promise<boolean> {
  try {
    const db = createRequestClient(accessToken);
    const { error } = await (db as any)
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
export async function analyzeUserErrors(userId: string, accessToken?: string | null) {
  try {
    const errors = await getUserWeakCharacters(userId, 95, accessToken);
    
    const veryWeak: WeakCharacterView[] = [];
    const weak: WeakCharacterView[] = [];
    let sumAccuracy = 0;

    for (let i = 0; i < errors.length; i++) {
      const e = errors[i];
      if (e.strength_level === 'Very Weak') {
        veryWeak.push(e);
      } else if (e.strength_level === 'Weak') {
        weak.push(e);
      }
      sumAccuracy += e.accuracy_rate;
    }

    const analysis = {
      totalWeakChars: errors.length,
      veryWeak,
      weak,
      avgAccuracyWeakChars: 
        errors.length > 0 
          ? Math.round((sumAccuracy / errors.length) * 100) / 100
          : 100,
      focusAreas: errors.slice(0, 5).map(e => ({ char: e.character, accuracy: e.accuracy_rate })),
    };

    return analysis;
  } catch (err) {
    console.error('Exception analyzing user errors:', err);
    return null;
  }
}
