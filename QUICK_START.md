# Quick Start Guide: Database Setup

Follow these steps to get the database-backed Banglatyping running:

## 1️⃣ Create Supabase Project (5 minutes)

1. Go to https://supabase.com
2. Click "New Project"
3. Sign up or login
4. Create new project with PostgreSQL
5. Wait for project to initialize
6. Go to **Project Settings → API**
7. Copy and save:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_KEY`

## 2️⃣ Configure Environment Variables (2 minutes)

1. Copy `.env.local.example` to `.env.local`
2. Fill in Supabase credentials
3. Keep your existing Firebase credentials

```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

## 3️⃣ Create Database Schema (3 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste entire contents of `db/migrations/001_initial_schema.sql`
4. Click **Run**
5. Wait for success message

✅ Database schema complete!

## 4️⃣ Install Supabase Library (1 minute)

```bash
npm install @supabase/supabase-js
```

## 5️⃣ Seed Lesson Data (2 minutes)

```bash
# This imports all 43 lessons from lessons.ts into database
npx ts-node db/seeds/seed-lessons.ts
```

✅ Lessons now in database!

## 6️⃣ Test API Endpoints (5 minutes)

Option A: Using Postman
```
GET http://localhost:3000/api/lessons
```

Option B: Using curl
```bash
curl http://localhost:3000/api/lessons
```

Should return JSON with all lessons.

## 7️⃣ Next: Update Frontend Components

See `docs/IMPLEMENTATION_GUIDE.md` for detailed examples:
- How to fetch lessons in components
- How to save user progress
- How to display weak characters
- How to generate custom drills

---

## 🚀 Quick Commands

```bash
# Start development server
npm run dev

# Run database migration
# (Go to Supabase SQL Editor and paste from db/migrations/001_initial_schema.sql)

# Seed initial lessons
npx ts-node db/seeds/seed-lessons.ts

# Run TypeScript check
npm run typecheck
```

## 📊 Verify Setup

Check Supabase Dashboard:
- **Lessons**: Should have 43 records
- **Lesson Drills**: Should have 4000+ records
- **Character Errors**: Empty (populated after user sessions)
- **User Progress**: Empty (populated after user sessions)

## ⚠️ Common Issues

**Issue**: "No Supabase credentials found"
- **Fix**: Check `.env.local` has NEXT_PUBLIC_SUPABASE_URL and key

**Issue**: "relation 'lessons' does not exist"
- **Fix**: Run SQL migration in Supabase SQL Editor

**Issue**: Seed script fails
- **Fix**: Make sure database schema is created first (Step 3)

## 📚 Next Steps

1. Read `docs/IMPLEMENTATION_GUIDE.md` for detailed backend info
2. Update dashboard components to use new hooks
3. Integrate progress saving in typing practice
4. Add statistics display
5. Implement custom drill generation UI

## 🎯 You're All Set!

Your database is now configured. Next is frontend integration - see IMPLEMENTATION_GUIDE.md for code examples.

Questions? Check docs/ folder or review the API endpoints in src/app/api/
