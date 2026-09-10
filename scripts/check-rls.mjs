import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Test with service key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const { count: adminCount, error: adminError } = await supabaseAdmin
  .from('lessons')
  .select('*', { count: 'exact', head: true });

// Test with anon key
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: anonData, error: anonError } = await supabaseAnon
  .from('lessons')
  .select('id')
  .limit(1);

console.log('Service key can read lessons:', adminCount ?? 0, adminError?.message || '');
console.log('Anon key can read lessons:  ', anonData?.length || 0, anonError?.message || '');
console.log('');
console.log('With RLS enabled the anon key should still read lessons (public read),');
console.log('but must NOT be able to read another user\'s user_progress rows.');

process.exit(0);
