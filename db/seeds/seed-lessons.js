// Script to seed the database with existing lesson data
// Run with: node db/seeds/seed-lessons.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { lessons } = require('../../src/lib/lessons');

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
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];

      // Prepare lesson data for database
      const lessonData = {
        id: lesson.id,
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

      console.log(`✓ Inserted lesson: ${lesson.title}`);

      // Insert drills if they exist
      if (lesson.drills && lesson.drills.length > 0) {
        const drillsData = lesson.drills.map((drill, idx) => ({
          lesson_id: lesson.id,
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
