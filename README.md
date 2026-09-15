# Bangla Typing Master

A typing practice platform for Bengali learners: lesson-based drills, a virtual
keyboard for Avro / Bijoy / BanglaWord layouts, progress analytics with
weak-character recommendations, and certificate generation.

Built with Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS and
Supabase.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure credentials
cp .env.example .env.local     # then fill in your Supabase values

# 3. Run
npm run dev                    # http://localhost:3000
```

`.env.example` documents the three variables the app needs. The two
`NEXT_PUBLIC_*` values are shipped to the browser; `SUPABASE_SERVICE_KEY` is
server-side only and is used by the seed and diagnostic scripts.

## Database setup

Run the migrations in order against your Supabase project (SQL Editor, or any
Postgres client):

1. `db/migrations/001_initial_schema.sql` — tables, indexes, views, triggers
2. `db/migrations/002_rls_policies.sql` — Row Level Security policies

Migration 002 matters. Migration 001 creates the tables but never enables RLS,
which would leave every row readable and writable through the public `anon` key.
002 enables RLS on all seven tables, makes the per-user tables owner-only, and
recreates the two views with `security_invoker = true` so they cannot bypass
those policies.

Then seed the lesson content:

```bash
npm run db:seed        # imports the lessons from src/lib/lessons.ts
npm run db:check       # sanity check: prints the lesson count
npm run db:check-rls   # confirms what the anon key can and cannot read
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3000 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with autofix |
| `npm test` | Jest |
| `npm run test:coverage` | Jest with a coverage report |
| `npm run test:ci` | What CI runs: tests + coverage against the threshold |
| `npm run db:seed` | Seed lesson data |
| `npm run db:check` | Print the lesson count from the database |
| `npm run db:check-rls` | Compare what the service and anon keys can read |

## How API authentication works

Browser calls go through `apiFetch` (`src/lib/api-client.ts`), which attaches
the signed-in user's Supabase access token. Route handlers verify that token
with `authenticate` (`src/lib/api-auth.ts`) and then:

- reject the request with `401` if there is no valid token,
- reject it with `403` if it addresses somebody else's data,
- forward the token to the data layer via `createRequestClient`
  (`src/lib/db.ts`) so the Row Level Security policies from migration 002 apply.

Use `apiFetch` rather than `fetch` for any route that touches user data. The
only route that should keep using plain `fetch` is the public
`/api/lessons/[id]`.

## Quality checks

CI (`.github/workflows/ci.yml`) runs `typecheck`, `lint`, `test:ci` and `build`
on every push and pull request. Run them locally with the same commands.

Coverage is measured across every file in `src/lib` and `src/hooks`, and
`jest.config.js` fails the run below the configured floor. Raise that floor as
you add tests.

## Documentation

- `QUICK_START.md` — step-by-step Supabase setup
- `docs/DATABASE_SETUP.md` — schema and configuration details
- `docs/IMPLEMENTATION_GUIDE.md` — API and hook usage examples
- `docs/BENGALI_GRAPHEME_FIX.md` — how Bengali grapheme clusters are handled

## Deployment

The app targets Vercel, with Supabase as the data layer. Set the three
environment variables from `.env.example` in the Vercel project settings.
