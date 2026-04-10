import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Test with service key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const { data: adminData, error: adminError } = await supabaseAdmin
  .from('lessons')
  .select('count')
  .single();

// Test with anon key
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data: anonData, error: anonError } = await supabaseAnon
  .from('lessons')
  .select('id')
  .limit(1);

console.log('Admin key result:', adminData?.count || 0);
console.log('Anon key result:', anonData?.length || 0, anonError?.message || '');

process.exit(0);
