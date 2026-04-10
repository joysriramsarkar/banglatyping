# Lesson Database Refactoring - Complete Implementation Guide

**বাংলা সংস্করণ**: এই গাইড হার্ডকোড করা লেসন ডেটা থেকে ডেটাবেস-চালিত আর্কিটেকচারে রূপান্তরের সম্পূর্ণ প্রক্রিয়া ব্যাখ্যা করে।

---

## 📋 Overview

### বর্তমান সমস্যা (Current Problem)
- ✗ সমস্ত লেসন ডেটা `lessons.ts` তে হার্ডকোড করা
- ✗ নতুন লেসন যোগ করতে কোড এডিট প্রয়োজন
- ✗ ব্যবহারকারীর অগ্রগতি সংরক্ষণ করা হয় না
- ✗ গতিশীল ড্রিল তৈরি করা সম্ভব নয়

### প্রস্তাবিত সমাধান (Proposed Solution)
- ✓ Supabase (PostgreSQL) database
- ✓ REST API endpoints for lessons & progress
- ✓ User accuracy tracking per character
- ✓ Weak character identification
- ✓ Dynamic custom drill generation

---

## 🏗️ Architecture

### Database Schema
```
lessons
├─ id, title, level, category
├─ is_word_drill, is_paragraph
└─ content_type

lesson_drills
├─ lesson_id (FK)
├─ prompt, steps (JSON)
└─ drill_order

user_progress
├─ user_id (Firebase UID)
├─ lesson_id (FK)
├─ wpm, accuracy, errors
├─ erred_characters (JSON array)
└─ session_timestamp

character_errors (aggregated)
├─ user_id
├─ character
├─ error_count, total_attempts
├─ accuracy_rate
└─ last_error_at

custom_drills
├─ user_id
├─ characters, drill_data (JSON)
├─ focus_characters (JSON)
└─ generated_at
```

### API Routes
```
GET  /api/lessons                    # All lessons
GET  /api/lessons/[id]              # Specific lesson + drills
POST /api/user-progress             # Save session
GET  /api/weak-characters/[userId]  # Weak characters
POST /api/custom-drills             # Generate custom drill
GET  /api/user-statistics/[userId]  # User stats
```

### Frontend Hooks
```typescript
useLessons()                    // Fetch lessons
useLesson(lessonId)             // Fetch specific lesson
useUserStatistics(userId)       // Fetch stats
useWeakCharacters(userId)       // Fetch weak chars
useCustomDrills(userId)         // Fetch/generate drills
useSaveProgress()               // Save session
```

---

## 🚀 Implementation Steps

### Step 1: Database Setup

```bash
# 1. Create Supabase project
#    → Go to supabase.com, create new project
#    → Note the API URL and keys

# 2. Add environment variables to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key

# 3. Run migrations
#    → Copy SQL from db/migrations/001_initial_schema.sql
#    → Paste into Supabase SQL Editor and execute
```

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 3: Seed Initial Lesson Data

```bash
# This imports all hardcoded lessons from lessons.ts into Supabase
npx ts-node db/seeds/seed-lessons.ts
```

### Step 4: Update Frontend Components

#### Example: Dashboard Lessons Page

**Before (using hardcoded data):**
```typescript
import { lessons } from '@/lib/lessons';

export default function LessonsPage() {
  return (
    <div>
      {lessons.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
```

**After (using database):**
```typescript
import { useLessons } from '@/hooks/use-lessons';

export default function LessonsPage() {
  const { lessons, loading } = useLessons();

  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {lessons.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
```

#### Example: Typing Practice Component

**Save progress after session:**
```typescript
import { useSaveProgress } from '@/hooks/use-lessons';
import { useAuth } from '@/hooks/use-auth';

export default function TypingPractice() {
  const { user } = useAuth();
  const { saveProgress } = useSaveProgress();

  const handleSessionComplete = async (stats: TypingStats) => {
    if (!user) return;

    const result = await saveProgress(
      user.uid,
      lessonId,
      stats.wpm,
      stats.accuracy,
      stats.errors,
      stats.timeElapsed,
      stats.erredCharacters || []
    );

    if (result) {
      showMessage('Progress saved!');
    }
  };

  return (
    // ... typing practice UI
  );
}
```

#### Example: Custom Drill Generation

```typescript
import { useCustomDrills, useWeakCharacters } from '@/hooks/use-lessons';
import { useAuth } from '@/hooks/use-auth';

export default function CustomDrillPage() {
  const { user } = useAuth();
  const { weakChars } = useWeakCharacters(user?.uid);
  const { drills, generateCustomDrill } = useCustomDrills(user?.uid);

  const handleGenerateDrill = async () => {
    const drill = await generateCustomDrill(85); // Accuracy threshold
    if (drill) {
      showMessage(`Created drill with ${drill.characters.split(',').length} weak characters`);
    }
  };

  return (
    <div>
      <h2>Your Weak Characters</h2>
      {weakChars.length > 0 ? (
        <>
          <CharacterList chars={weakChars} />
          <button onClick={handleGenerateDrill}>
            Generate Custom Drill ({weakChars.length} characters)
          </button>
        </>
      ) : (
        <p>Keep practicing! Your characters are getting stronger.</p>
      )}
    </div>
  );
}
```

### Step 5: Dashboard Statistics

```typescript
import { useUserStatistics } from '@/hooks/use-lessons';
import { useAuth } from '@/hooks/use-auth';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats } = useUserStatistics(user?.uid);

  if (!stats) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard 
        title="Average Accuracy"
        value={`${stats.average_accuracy.toFixed(1)}%`}
      />
      <StatCard 
        title="Average WPM"
        value={`${stats.average_wpm.toFixed(0)}`}
      />
      <StatCard 
        title="Best WPM"
        value={`${stats.best_wpm.toFixed(0)}`}
      />
      <StatCard 
        title="Lessons Practiced"
        value={stats.lessons_practiced}
      />
      <StatCard 
        title="Sessions"
        value={stats.total_sessions}
      />
    </div>
  );
}
```

---

## 📊 Data Flow Diagram

```
User completes typing session
           ↓
   Frontend collects stats:
   - WPM, accuracy, errors
   - Erred characters list
           ↓
POST /api/user-progress → Database
           ↓
Trigger: update_character_errors()
           ↓
character_errors table updated
(error_count, accuracy_rate)
           ↓
User views dashboard
           ↓
GET /api/user-statistics/[userId]
GET /api/weak-characters/[userId]
           ↓
Frontend displays:
- Overall stats
- Weak characters list
- Recommendations
           ↓
Optional: Generate custom drill
           ↓
POST /api/custom-drills
           ↓
Returns drill focused on weak chars
```

---

## 🔍 Key Features

### 1. Automatic Error Tracking
When a user completes a session with erred characters:
```json
{
  "erred_characters": [
    { "char": "ণ", "count": 3 },
    { "char": "শ", "count": 2 },
    { "char": "ঞ", "count": 1 }
  ]
}
```

The database trigger automatically:
- Updates `character_errors` table
- Calculates accuracy_rate = (attempts - errors) / attempts * 100
- Sorts by accuracy for weak character identification

### 2. Weak Character Detection
```sql
SELECT * FROM user_weak_characters
WHERE user_id = 'firebase_uid'
AND accuracy_rate < 95
ORDER BY accuracy_rate ASC
```

Returns characters grouped by strength level:
- **Very Weak**: < 60% accuracy
- **Weak**: 60-80% accuracy
- **Good**: 80-95% accuracy
- **Strong**: >= 95% accuracy

### 3. Dynamic Drill Generation
```typescript
const customDrill = await createWeakCharacterDrill(
  userId,
  threshold: 85,      // Only chars with < 85% accuracy
  minCharacters: 5,
  maxCharacters: 20,
  drillCount: 100
);
```

Generates 100 drills focused on user's 5-20 weakest characters.

### 4. Progress Analytics
Automatic aggregation via view:
```sql
SELECT 
  COUNT(DISTINCT lesson_id) as lessons_practiced,
  AVG(accuracy) as average_accuracy,
  MAX(wpm) as best_wpm,
  COUNT(*) as total_sessions
FROM user_progress
WHERE user_id = 'firebase_uid'
```

---

## 🔐 Security Considerations

### Row Level Security (RLS)
Enable for production:

```sql
-- Lessons: read-only for all users
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON lessons FOR SELECT USING (true);

-- User Progress: users see only their own
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self_access" ON user_progress 
  FOR SELECT USING (auth.uid()::text = user_id);

-- Custom Drills: users see only their own
ALTER TABLE custom_drills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self_access" ON custom_drills 
  FOR SELECT USING (auth.uid()::text = user_id);
```

### API Security
- Validate `userId` matches authenticated user
- Rate limit progress submissions
- Sanitize character inputs
- Never expose service key in frontend

---

## 📈 Monitoring & Optimization

### Monitor Database Performance
```sql
-- See query performance
SELECT * FROM pg_stat_statements;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;

-- Monitor slow queries
SELECT * FROM pg_stat_statements 
WHERE mean_exec_time > 100 
ORDER BY mean_exec_time DESC;
```

### Performance Tips
1. **Indexes**: Already created on frequently queried fields
2. **Pagination**: Use limit/offset for large result sets
3. **Caching**: Cache user stats for 5 minutes on frontend
4. **Batch Updates**: Aggregate character errors in bulk
5. **Connection Pooling**: Supabase handles automatically

---

## 📝 Migration Checklist

- [ ] Create Supabase project
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Seed initial lesson data
- [ ] Test API endpoints with Postman
- [ ] Update dashboard to fetch lessons
- [ ] Update typing practice to save progress
- [ ] Add weak character display
- [ ] Implement custom drill generation
- [ ] Add user statistics dashboard
- [ ] Test end-to-end flow
- [ ] Enable RLS for production
- [ ] Set up monitoring

---

## 🆘 Troubleshooting

### Issue: Lessons not loading
**Solution**: Check environment variables and Supabase connection

### Issue: Progress not saving
**Solution**: Verify `user_id` is Firebase UID, check API response

### Issue: Weak characters not showing
**Solution**: Ensure character_errors table is populated after sessions

### Issue: Custom drill generation fails
**Solution**: Check user has at least 5 weak characters

---

## 📚 References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks Best Practices](https://react.dev/reference/react/hooks)

---

**Created**: April 2026
**Status**: Ready for Implementation
