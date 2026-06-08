// Lesson service - fetch lessons from database
import { supabase } from './db';
import type { Lesson, LessonDrill } from './db';

/**
 * Get all lessons from database
 */
export async function getAllLessons(): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }

    return (data || []) as Lesson[];
  } catch (err) {
    console.error('Exception fetching lessons:', err);
    return [];
  }
}

/**
 * Get a specific lesson by ID with all its drills
 */
export async function getLessonWithDrills(lessonId: string): Promise<(Lesson & { drills?: LessonDrill[] }) | null> {
  try {
    // Get lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError) {
      console.error('Error fetching lesson:', lessonError);
      return null;
    }

    // Get drills for this lesson
    const { data: drills, error: drillsError } = await supabase
      .from('lesson_drills')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('drill_order', { ascending: true });

    if (drillsError) {
      console.error('Error fetching drills:', drillsError);
    }

    return {
      ...(lesson as Lesson),
      drills: (drills || []) as LessonDrill[],
    };
  } catch (err) {
    console.error('Exception fetching lesson with drills:', err);
    return null;
  }
}

/**
 * Get lessons filtered by level
 */
export async function getLessonsByLevel(
  level: 'Beginner' | 'Intermediate' | 'Advanced'
): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('level', level)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching lessons by level:', error);
      return [];
    }

    return (data || []) as Lesson[];
  } catch (err) {
    console.error('Exception fetching lessons by level:', err);
    return [];
  }
}

/**
 * Get lessons filtered by category
 */
export async function getLessonsByCategory(category: string): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching lessons by category:', error);
      return [];
    }

    return (data || []) as Lesson[];
  } catch (err) {
    console.error('Exception fetching lessons by category:', err);
    return [];
  }
}

/**
 * Get word drill lessons
 */
export async function getWordDrills(): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('is_word_drill', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching word drills:', error);
      return [];
    }

    return (data || []) as Lesson[];
  } catch (err) {
    console.error('Exception fetching word drills:', err);
    return [];
  }
}

/**
 * Get paragraph lessons
 */
export async function getParagraphLessons(): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('is_paragraph', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching paragraph lessons:', error);
      return [];
    }

    return (data || []) as Lesson[];
  } catch (err) {
    console.error('Exception fetching paragraph lessons:', err);
    return [];
  }
}

/**
 * Get lessons by row (home-row, top-row, bottom-row)
 */
export async function getLessonsByRow(row: 'home-row' | 'top-row' | 'bottom-row'): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('category', row)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching lessons by row:', error);
      return [];
    }

    return (data || []) as Lesson[];
  } catch (err) {
    console.error('Exception fetching lessons by row:', err);
    return [];
  }
}

/**
 * Search lessons by title
 */
export async function searchLessons(query: string): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error searching lessons:', error);
      return [];
    }

    return (data || []) as Lesson[];
  } catch (err) {
    console.error('Exception searching lessons:', err);
    return [];
  }
}

/**
 * Get lesson drills for a specific lesson
 */
export async function getLessonDrills(lessonId: string): Promise<LessonDrill[]> {
  try {
    const { data, error } = await supabase
      .from('lesson_drills')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('drill_order', { ascending: true });

    if (error) {
      console.error('Error fetching drills:', error);
      return [];
    }

    return (data || []) as LessonDrill[];
  } catch (err) {
    console.error('Exception fetching drills:', err);
    return [];
  }
}
