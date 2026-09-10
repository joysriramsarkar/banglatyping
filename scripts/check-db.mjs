import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const { data, error } = await supabase.from('lessons').select('*');

if (error) {
  console.error('Error:', error);
} else {
  console.log(`Total lessons: ${data.length}`);
  if (data.length > 0) {
    console.log('Sample:', JSON.stringify(data[0], null, 2));
  }
}

process.exit(0);
