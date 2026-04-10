// Supabase authentication - replaces Firebase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not fully configured');
}

// Supabase client for authentication
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export for backward compatibility with existing code
export { supabase as auth, supabase as db };
