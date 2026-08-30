# Bangla Typing Master

Bangla Typing Master is a modern typing practice platform for Bengali learners. It combines lesson-based drills, a virtual keyboard, progress tracking, and certificate generation in a polished Next.js experience.

## Features

- Interactive Bengali typing lessons and drills
- Keyboard layout selection for Avro, Bijoy, and BanglaWord
- Progress analytics and weak-character recommendations
- Certificate generation for typing milestones

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Jest + Testing Library

## Local Development

1. Install dependencies
   - pnpm install
2. Configure environment variables
   - Add your Supabase settings to a local `.env.local` file.
3. Run the app
   - pnpm dev

## Quality Checks

- pnpm typecheck
- pnpm test
- pnpm lint

## Deployment

The app is designed for deployment on Vercel, with Supabase powering the authenticated data layer.
