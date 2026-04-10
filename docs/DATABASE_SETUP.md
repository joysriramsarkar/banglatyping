# Supabase Configuration for Banglatyping

## Environment Variables
Add these to your `.env.local` file:

```
# Supabase Public API Key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Service Role Key (for server-side admin operations)
SUPABASE_SERVICE_KEY=your_service_key_here
```

## Setup Steps

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy the API URL and keys from Project Settings → API

### 2. Create Database Tables
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL script from `db/migrations/001_initial_schema.sql`
3. This will create all required tables, views, and functions

### 3. Configure RLS (Row Level Security)
For production, you should enable RLS for security:

```sql
-- Enable RLS on lessons table (public read)
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON lessons FOR SELECT USING (true);

-- Enable RLS on user_progress (users can only see their own progress)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own progress" ON user_progress 
  FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Similar policies for other user-specific tables...
```

### 4. Seed Database with Lessons (Optional)
Use the included seeding scripts in `db/seeds/` to populate initial lesson data.

## API Endpoints

### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/[id]` - Get specific lesson with drills

### User Progress
- `POST /api/user-progress` - Save typing session
- `GET /api/user-statistics/[userId]` - Get user statistics
- `GET /api/weak-characters/[userId]` - Get user's weak characters

### Custom Drills
- `GET /api/custom-drills` - Get user's custom drills
- `POST /api/custom-drills` - Generate new custom drill
- `PATCH /api/custom-drills` - Update drill usage
- `DELETE /api/custom-drills` - Delete custom drill

## Frontend Integration

Use the provided React hooks in `src/hooks/use-lessons.ts`:

```typescript
// Fetch all lessons
const { lessons, loading } = useLessons();

// Fetch specific lesson
const { lesson, loading } = useLesson(lessonId);

// Get user statistics
const { stats, loading } = useUserStatistics(userId);

// Get weak characters
const { weakChars, loading } = useWeakCharacters(userId);

// Get custom drills
const { drills, generateCustomDrill } = useCustomDrills(userId);

// Save progress
const { saveProgress } = useSaveProgress();
```

## Features

### User Progress Tracking
- Saves WPM, accuracy, and errors per session
- Tracks erred characters for pattern analysis
- Updates user statistics automatically

### Weak Character Detection
- Identifies characters with low accuracy
- Groups by strength level (Very Weak, Weak, Good, Strong)
- Updated automatically after each session

### Dynamic Custom Drills
- Generates drills focused on user's weak characters
- Weight-based on accuracy (emphasis on weakest areas)
- Can be used immediately or saved for later

### Lesson Completion Tracking
- Records best accuracy and WPM per lesson
- Tracks completion count
- Helps identify progress over time

## Data Storage

- **Lessons**: Stored once in database, fetched on demand
- **User Progress**: Timestamped sessions with detailed stats
- **Character Errors**: Aggregated accuracy data per character
- **Custom Drills**: Generated and cached for reuse

## Performance Optimization

- Indexes on frequently queried fields (user_id, lesson_id, accuracy_rate)
- Views for common queries (user_weak_characters, user_statistics)
- Pagination support for large datasets
- Efficient trigger-based error aggregation
