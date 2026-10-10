# Grapheme visual system

Implements `BanglaTyping_PixelPerfect_যুক্তবর্ণ_রূপরেখা.md` (the PixelPerfect
blueprint), Phase 0–1 + review tooling. One rule governs everything:

> **One shaping run per grapheme. Masks only when approved. Everything else
> simulates truthfully.**

## Architecture (spec §6)

| Layer | Module | Job |
|---|---|---|
| 1. Unicode/grapheme model | `src/lib/bengali-grapheme.ts` | segmentation, comparison, Tier-2 clip math — **no pixels claimed** |
| 2. Typing progression | `grapheme-visual/plan.ts` (`getTypingPlan`, `deriveVisualProgress`) | layout-aware key steps vs visual stages, kept separate |
| 3. Strategy registry | `grapheme-visual/{types,classify,registry}.ts` | classes (linguistic) vs strategy (what we may draw today) |
| 4. Renderer | `GraphemeDisplay.tsx` + `ConjunctSimulationBox.tsx` + `.bt-grapheme` CSS | intact text run; overlay only on approved geometry |
| 5. Validation | `grapheme-visual-registry.test.ts`, `50-grapheme-visual.spec.ts`, coverage script | units + real-browser contracts + corpus gate |

## The fail-closed resolver (spec §9.2)

`getRenderPlan(cluster)` → `{ strategy, showOverlayClip, showSimBox }`:

- `svg-mask` without a **reviewed**, font-matching asset → `simulation`.
- `stacked-mask` / `heuristic-kar` with family approval → overlay clip.
- Anything fused, multi-consonant, reph or otherwise unapproved → `simulation`.
- Unparseable → `safe-fallback` (whole glyph + honest note, never a cut).

No Tier-3 mask asset exists yet, so `reviewed: true` appears **nowhere** —
setting it requires real screenshot QA against the locked font profile (§17).

## Font profile (spec §11)

Grapheme cells render through the **bundled Hind Siliguri v14 Bengali
subsets** (`public/fonts`, family `"BT Grapheme"`) on every device — mask
geometry is identical everywhere, which is what makes the pixel gates
meaningful. UI typography is untouched. `ACTIVE_FONT_PROFILE =
'bt-grapheme-hind-siliguri-v14'`. Tier-3 per-glyph assets still need
individual screenshot review before `reviewed: true`.

## Review tooling

- **Lab:** `/grapheme-lab` — every curated family × typing stage through the
  production renderer, with resolved plan + per-layout key plans. Dev tool,
  intentionally unlinked from navigation.
- **Coverage:** `npm run grapheme:coverage` (also a CI step) — scans the
  curriculum, drill data and game word banks; fails on any conjunct that
  would render on the safe-fallback path. Current baseline: **430 conjuncts,
  0 fallback** (206 heuristic-clip, 208 simulation, 16 whole-glyph).
- **E2E contracts** (`e2e/50-grapheme-visual.spec.ts`): locked-webfont gate,
  intact text runs, base/overlay box alignment ≤ 1.5px, sim-box presence per
  plan, dark mode. Pixel baselines ARE committed for the seven reviewed mask
  geometries (`e2e/__snapshots__`, shared across runners): a wrong band moves
  ~7% of cell pixels against a 2% tolerance, so mask regressions fail loudly.
  Screenshots also attach as review artifacts.

## What changed vs the old engine

- 124 corpus clusters moved from the generic 52% vertical guess to
  simulation (reph family, য-ফলা, multi-consonant, non-stacked doubles).
  Their step cards now show honest typing steps + orthographic structure
  (`ক্ + ল → ক্ল`), separate headings per spec §13.
- Approved paths are pixel-identical: kar heuristic, stacked splits
  (প্ত/প্র/স্ব…), below-base splits (ক্ল/গ্ল/ট্ট…), fused simulation
  (ক্ত/ক্র/ক্ষ…).
- Normalization is purpose-split: `normalizeForComparison` (legacy),
  `normalizeForSegmentation`, `normalizeForRendering` (preserves ZWJ/ZWNJ).

## Approving a new mask (maintainers)

1. Add the cluster to `GRAPHEME_VISUALS` with `strategy: 'svg-mask'` and an
   **unreviewed** asset skeleton (resolver keeps showing simulation).
2. Author the asset per spec §17, lock it to `ACTIVE_FONT_PROFILE`.
3. Add the fixture to `/grapheme-lab` + extend `50-grapheme-visual.spec.ts`.
4. Flip `reviewed: true` + bump asset version in the same commit as the
   passing fixtures. Never flip it on geometry you did not screenshot.

## Honest limits (spec §22)

- Rendering coverage (clean intact glyph): 100% of observed corpus.
- Mask coverage (exact approved component regions): Tier-2 families only;
  Tier-3 per-glyph masks: 0%. “Pixel-perfect component highlight” is NOT
  claimed beyond the approved families.
