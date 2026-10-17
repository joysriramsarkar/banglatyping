# Contributing to BanglaTyping

বাংলা টাইপিং-এ অবদান রাখতে আগ্রহী হওয়ায় ধন্যবাদ! Thank you for your interest
in contributing to BanglaTyping.

## Good First Issues

- Look for issues labelled `good-first-issue` — these are small, well-scoped
  tasks ideal for first-time contributors.
- Comment on the issue to claim it before opening a pull request.
- Keep pull requests focused: one issue per PR.

## Lesson Contribution Guide

1. Lessons live under `db/seeds/` and `src/lib/curriculum/`.
2. Each lesson needs: a title, a level (`Beginner` / `Intermediate` /
   `Advanced`), and prompt text in correct Bengali spelling.
3. Run the seed locally (`npm run db:seed`) and complete the lesson once in
   the UI to confirm the prompts render correctly.
4. Include the lesson level and target characters in your PR description.

## Grapheme Test Guide

Bengali conjuncts (যুক্তবর্ণ) must be treated as single grapheme clusters.

1. Add or update cases in the grapheme tests covering the new conjunct.
2. Run the coverage check before pushing:

   ```sh
   npm run grapheme:coverage
   ```

3. All new conjuncts must be segmented as one cluster (e.g. `ক্ষ`, `জ্ঞ`,
   `ক্ত`) — never split into individual code points.
4. If coverage reports a gap, extend `src/lib/bengali-grapheme.ts` first,
   then re-run the check.

## Pull Request Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run grapheme:coverage` passes for lesson/grapheme changes
- [ ] No secrets (`.env*`, service keys, tokens) are included in the diff
