import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const sql1 = `
  ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
`;

const sql2 = `
  DROP POLICY IF EXISTS "Allow public read access on lessons" ON lessons;
  CREATE POLICY "Allow public read access on lessons" ON lessons
    FOR SELECT
    USING (true);
`;

const sql3 = `
  ALTER TABLE lesson_drills ENABLE ROW LEVEL SECURITY;
`;

const sql4 = `
  DROP POLICY IF EXISTS "Allow public read access on lesson_drills" ON lesson_drills;
  CREATE POLICY "Allow public read access on lesson_drills" ON lesson_drills
    FOR SELECT
    USING (true);
`;

try {
  await supabaseAdmin.rpc('exec', { sql: sql1 }).catch(e => console.log('Enable RLS on lessons:', e.message));
  await supabaseAdmin.rpc('exec', { sql: sql2 }).catch(e => console.log('Policy on lessons:', e.message));
  
  // Try using admin API if rpc doesn't work
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'apikey': process.env.SUPABASE_SERVICE_KEY,
    }
  });

  console.log('Attempting to set RLS policies via Supabase SQL...');
  
  // Use Supabase SQL Editor endpoint
  const sqlResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/pg_net`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql1 })
  }).catch(() => null);

  console.log('Please enable RLS manually in Supabase Dashboard > Authentication > Policies');

} catch (err) {
  console.error('Error:', err.message);
}

process.exit(0);
