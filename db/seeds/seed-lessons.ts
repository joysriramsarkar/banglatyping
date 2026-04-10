// Script to seed the database with existing lesson data
// Run with: npx ts-node db/seeds/seed-lessons.ts

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env.local in project root
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedLessons() {
  console.log('Starting to seed lessons...');

  try {
    // Dynamic import to handle TypeScript modules
    const { lessons } = await import('../../src/lib/lessons');
    
    // Map to track lesson IDs for drill insertion
    const lessonIdMap: Record<string, string> = {};

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const newUuid = uuidv4(); // Generate a new UUID

      // Prepare lesson data for database
      const lessonData = {
        id: newUuid,
        title: lesson.title,
        level: lesson.level,
        category: lesson.row || (lesson.isWordDrill ? 'word-drill' : null),
        description: `${lesson.level} - ${lesson.title}`,
        is_word_drill: lesson.isWordDrill || false,
        is_paragraph: !!lesson.text && !lesson.isWordDrill && !lesson.drills,
        content_type: lesson.drills ? 'drills' : 'text',
        sort_order: i,
      };

      // Insert lesson
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert([lessonData], { onConflict: 'id' });

      if (lessonError) {
        console.error(`Error inserting lesson ${lesson.id}:`, lessonError.message);
        continue;
      }

      // Store the mapping
      lessonIdMap[lesson.id] = newUuid;

      console.log(`✓ Inserted lesson: ${lesson.title}`);

      // Insert drills if they exist
      if (lesson.drills && lesson.drills.length > 0) {
        const drillsData = lesson.drills.map((drill: any, idx: number) => ({
          lesson_id: newUuid, // Use the generated UUID
          prompt: drill.prompt,
          steps: drill.steps,
          drill_order: idx,
        }));

        const { error: drillsError } = await supabase
          .from('lesson_drills')
          .insert(drillsData);

        if (drillsError) {
          console.error(`Error inserting drills for ${lesson.id}:`, drillsError.message);
        } else {
          console.log(`  ├─ Added ${drillsData.length} drills`);
        }
      }
    }

    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed
seedLessons();
