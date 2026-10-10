# Metrics Contract

Single source of truth for how BanglaTyping turns raw typing activity into the
numbers shown to learners. Every surface (curriculum `LessonPlayer`, the
`useTypingPractice` word drill, and the `session.ts` event engine) must derive
its numbers from `src/lib/typing/metric-formulas.ts` so that the same
performance is reported the same way everywhere.

The formulas in that module are covered by
`src/__tests__/metric-contract.test.ts`.

## Why Bengali needs its own metrics

A single visible Bengali grapheme can take several keystrokes and several
Unicode code points. `ক্ষ্ম` is one thing on screen but is typed as
`ক` `্` `ষ` `্` `ম`. A keystroke-based word metric therefore does not describe
what the learner actually sees themselves producing. GPM is the primary
headline number; WPM is kept only because government job exams quote it.

## Definitions

| Metric | Formula | Unit | Notes |
| --- | --- | --- | --- |
| **GPM** | `correct graphemes / minutes` | grapheme/min | Primary Bengali speed. "Correct" = first-try correct graphemes. |
| **Accuracy** | `correct attempts / total attempts × 100` | % | The *same function* everywhere; see "attempt" below. |
| **CPM** | `correct Unicode code points / minutes` | char/min | Lower than GPM for conjuncts. |
| **SPM** | `recorded strokes / minutes` | stroke/min | Only meaningful where real keystroke events exist (session engine). |
| **standardWpm** | `(keystrokes / 5) / minutes` | word/min | English 5-keystroke convention. Never labelled plain "WPM". |
| **Bengali WPM (estimate)** | `round(GPM / 4)` | word/min | Practical display estimate (≈4 graphemes/word). Labelled "WPM (আনুমানিক)". |
| **Consistency** | `100 - coefficient_of_variation × 100` over 5s windows | 0–100 | Rhythm score; **not** accuracy. |
| **Pause count** | gaps `> 2000 ms` between events | count | `PAUSE_THRESHOLD_MS`. |
| **Longest streak** | max consecutive `correct && !corrected` graphemes | count | Motivation metric. |
| **Burst GPM** | max GPM in any `5000 ms` window | grapheme/min | O(n) two-pointer sliding window (`BURST_WINDOW_MS`). |

### What counts as an "attempt"

Accuracy uses one formula, but each surface feeds it a different counting unit:

- **`LessonPlayer`** — one attempt per `handleCharInput` call (a keystroke,
  including rejected ones). `accuracy = computeAccuracy(attempts - errors, attempts)`.
- **`useTypingPractice`** — one attempt per grapheme produced (spaces included).
  `accuracy = computeAccuracy(typedGraphemes - errors, typedGraphemes)`.
- **`session.ts` / `metrics.ts`** — one attempt per recorded event.
  `accuracy = computeAccuracy(correctGraphemes, correctGraphemes + uncorrectedErrors)`.
  Corrected mistakes are excluded from the denominator, so repairing a slip is
  not punished, but it is still recorded in the event log.

The **formula is identical**; the denominator choice (counting unit) is
documented per surface so the numbers are interpretable rather than accidental.

### Rounding and empty sessions

- GPM/CPM/SPM/WPM: rounded to the nearest integer.
- `metrics.ts` accuracy keeps one decimal (e.g. `94.5`); the lesson player and
  practice hook round to the nearest integer.
- Empty session (no events) → GPM 0, accuracy 100, consistency 100, everything
  else 0. Non-positive duration never divides by zero.

## Which screen uses what

| Screen | Source | Notes |
| --- | --- | --- |
| Curriculum lesson stats + completion | `LessonPlayer` via `metric-formulas.ts` | Lesson completion records an **aggregate** across passed sections, not just the last section. |
| Word/visual drill | `useTypingPractice` + `metric-formulas.ts` | WPM = finished words/min (a word-based metric, clearly labelled). |
| Practice results / session summary | `computeMetrics()` | Richest event-based metrics (burst, consistency, error breakdown). |

## Governance rules

1. Add a new metric by adding a pure function to `metric-formulas.ts` and a case
   to `metric-contract.test.ts` — never by inlining arithmetic in a component.
2. Never show a number labelled "WPM" that was not produced by one of the two
   documented WPM definitions.
3. If a formula changes, update this document and the contract test in the same
   change.
