// Dynamic custom drill generator based on weak characters
import { supabase } from './db';
import { generateDrills } from './lessons';
import type { Drill, CustomDrill, WeakCharacterView } from './types';

/**
 * Generate a custom drill focused on user's weak characters
 */
export async function generateCustomDrill(
  userId: string,
  weakCharacters: WeakCharacterView[],
  drillCount: number = 100
): Promise<CustomDrill | null> {
  try {
    if (weakCharacters.length === 0) {
      console.warn('No weak characters found for custom drill generation');
      return null;
    }

    // Extract characters from weak character data
    const characterList = weakCharacters.map(w => w.character);
    
    // Focus on the weakest characters - weight stronger emphasis on very weak chars
    const focusCharacters: Record<string, number> = {};
    weakCharacters.forEach(w => {
      focusCharacters[w.character] = w.accuracy_rate;
    });

    // Generate drills using existing generateDrills function
    // This maintains consistency with how regular drills are created
    const drills = generateDrills(characterList, drillCount);

    // Store the custom drill in database
    const customDrill = {
      user_id: userId,
      name: `Custom Drill - Weak Characters (${new Date().toLocaleDateString()})`,
      characters: characterList.join(','),
      drill_data: drills,
      focus_characters: focusCharacters,
      generated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('custom_drills')
      .insert(customDrill)
      .select()
      .single();

    if (error) {
      console.error('Error creating custom drill:', error);
      return null;
    }

    return data as CustomDrill;
  } catch (err) {
    console.error('Exception generating custom drill:', err);
    return null;
  }
}

/**
 * Get existing custom drills for a user
 */
export async function getUserCustomDrills(
  userId: string,
  limit: number = 10
): Promise<CustomDrill[]> {
  try {
    const { data, error } = await supabase
      .from('custom_drills')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching custom drills:', error);
      return [];
    }

    return (data || []) as CustomDrill[];
  } catch (err) {
    console.error('Exception fetching custom drills:', err);
    return [];
  }
}

/**
 * Get a specific custom drill by ID
 */
export async function getCustomDrill(drillId: string): Promise<CustomDrill | null> {
  try {
    const { data, error } = await supabase
      .from('custom_drills')
      .select('*')
      .eq('id', drillId)
      .single();

    if (error) {
      console.error('Error fetching custom drill:', error);
      return null;
    }

    return data as CustomDrill;
  } catch (err) {
    console.error('Exception fetching custom drill:', err);
    return null;
  }
}

/**
 * Update custom drill usage statistics
 */
export async function updateCustomDrillUsage(
  drillId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('custom_drills')
      .update({
        usage_count: supabase.rpc('increment_usage_count', { id: drillId }),
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', drillId);

    if (error) {
      // Fallback if RPC doesn't exist, use increment directly
      const { data: current } = await supabase
        .from('custom_drills')
        .select('usage_count')
        .eq('id', drillId)
        .single();

      if (current) {
        const { error: updateError } = await supabase
          .from('custom_drills')
          .update({
            usage_count: (current.usage_count || 0) + 1,
            last_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', drillId);

        if (updateError) {
          console.error('Error updating drill usage:', updateError);
          return false;
        }
      }
    }

    return true;
  } catch (err) {
    console.error('Exception updating drill usage:', err);
    return false;
  }
}

/**
 * Delete a custom drill
 */
export async function deleteCustomDrill(drillId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('custom_drills')
      .delete()
      .eq('id', drillId);

    if (error) {
      console.error('Error deleting custom drill:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception deleting custom drill:', err);
    return false;
  }
}

/**
 * Create a custom drill session immediately
 * This is the main entry point for generating custom drills based on weaknesses
 */
export async function createWeakCharacterDrill(
  userId: string,
  threshold: number = 85, // Only include characters with accuracy below this
  minCharacters: number = 5,
  maxCharacters: number = 20,
  drillCount: number = 100
): Promise<CustomDrill | null> {
  try {
    // Fetch weak characters from database view
    let { data: weakChars, error } = await supabase
      .from('user_weak_characters')
      .select('*')
      .eq('user_id', userId)
      .lt('accuracy_rate', threshold)
      .order('accuracy_rate', { ascending: true })
      .limit(maxCharacters);

    if (error) {
      console.error('Error fetching weak characters:', error);
      return null;
    }

    const characters = (weakChars || []) as WeakCharacterView[];

    // If no weak characters found, return null
    if (characters.length < minCharacters) {
      return null;
    }

    // Generate custom drill
    return await generateCustomDrill(userId, characters, drillCount);
  } catch (err) {
    console.error('Exception creating weak character drill:', err);
    return null;
  }
}

/**
 * Get recommendations for the user based on their weak areas
 */
export async function getDrillRecommendations(userId: string): Promise<{
  shouldCreateCustomDrill: boolean;
  weakCharacterCount: number;
  avgWeakCharAccuracy: number;
}> {
  try {
    const { data: stats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: weakChars } = await supabase
      .from('user_weak_characters')
      .select('*')
      .eq('user_id', userId)
      .lt('accuracy_rate', 85);

    const weakCharacterData = (weakChars || []) as WeakCharacterView[];
    
    const recommendations = {
      shouldCreateCustomDrill: weakCharacterData.length >= 5,
      weakCharacterCount: weakCharacterData.length,
      avgWeakCharAccuracy: 
        weakCharacterData.length > 0
          ? weakCharacterData.reduce((sum, w) => sum + w.accuracy_rate, 0) / weakCharacterData.length
          : 100,
    };

    return recommendations;
  } catch (err) {
    console.error('Exception getting recommendations:', err);
    return {
      shouldCreateCustomDrill: false,
      weakCharacterCount: 0,
      avgWeakCharAccuracy: 100,
    };
  }
}
