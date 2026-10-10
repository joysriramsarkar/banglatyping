/**
 * Grapheme visual system — corpus inventory (§15).
 *
 * Single source of truth for "every cluster the lessons can show": the
 * registry coverage script AND the registry unit tests both read from here,
 * so "full coverage" always means the same thing.
 *
 * NOTE: relative imports only — this module is also loaded by tsx scripts
 * outside the bundler, where the `@/` alias may not resolve.
 */

import { CURRICULUM_LEVELS } from '../curriculum/curriculum-data';
import {
  GAME_WORDS_EASY,
  GAME_WORDS_MEDIUM,
  GAME_WORDS_HARD,
  GAME_WORDS_CONJUNCTS,
  RACING_SENTENCES,
} from '../game/game-words';
import { bengaliSegmenter } from '../bengali-grapheme';
import * as lessonsModule from '../lessons';

function collectStrings(value: unknown, out: Set<string>, depth = 0): void {
  if (value == null || depth > 6) return;
  if (typeof value === 'string') {
    if (value && value.length < 200) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 600)) collectStrings(item, out, depth + 1);
    return;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value).slice(0, 300)) collectStrings(item, out, depth + 1);
  }
}

/** Every short string the curriculum, drills and games can display. */
export function collectCorpusStrings(): string[] {
  const strings = new Set<string>();
  // Explicit curriculum walk (no depth caps): items, titles, instructions,
  // explanations and demonstrations are all displayable text.
  for (const level of CURRICULUM_LEVELS as unknown as Array<{
    title?: string;
    modules?: Array<{
      title?: string;
      description?: string;
      lessons?: Array<{
        title?: string;
        subtitle?: string;
        description?: string;
        sections?: Array<{
          title?: string;
          instruction?: string;
          explanationText?: string;
          items?: string[];
          demonstration?: {
            target?: string;
            description?: string;
            steps?: Array<{ label?: string }>;
          };
        }>;
      }>;
    }>;
  }>) {
    if (level.title) strings.add(level.title);
    for (const mod of level.modules ?? []) {
      if (mod.title) strings.add(mod.title);
      if (mod.description) strings.add(mod.description);
      for (const les of mod.lessons ?? []) {
        if (les.title) strings.add(les.title);
        if (les.subtitle) strings.add(les.subtitle);
        if (les.description) strings.add(les.description);
        for (const sec of les.sections ?? []) {
          if (sec.title) strings.add(sec.title);
          if (sec.instruction) strings.add(sec.instruction);
          if (sec.explanationText) strings.add(sec.explanationText);
          for (const it of sec.items ?? []) if (it) strings.add(it);
          const d = sec.demonstration;
          if (d) {
            if (d.target) strings.add(d.target);
            if (d.description) strings.add(d.description);
            for (const s of d.steps ?? []) if (s?.label) strings.add(s.label);
          }
        }
      }
    }
  }
  collectStrings(lessonsModule, strings);
  for (const w of [
    ...GAME_WORDS_EASY,
    ...GAME_WORDS_MEDIUM,
    ...GAME_WORDS_HARD,
    ...GAME_WORDS_CONJUNCTS,
  ]) {
    strings.add(w);
  }
  for (const r of RACING_SENTENCES as Array<{ text?: string }>) {
    if (r?.text) strings.add(r.text);
  }
  return [...strings];
}

export interface ClusterCount {
  cluster: string;
  count: number;
}

/** Unique conjunct (hasanta-bearing) clusters + occurrence counts. */
export function collectCorpusConjuncts(): ClusterCount[] {
  const counts = new Map<string, number>();
  for (const s of collectCorpusStrings()) {
    for (const c of bengaliSegmenter.segmentString(s)) {
      if (c.includes('্')) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([cluster, count]) => ({ cluster, count }))
    .sort((a, b) => b.count - a.count);
}

/** Unique kar-bearing (non-conjunct) clusters + occurrence counts. */
export function collectCorpusKarClusters(): ClusterCount[] {
  const counts = new Map<string, number>();
  for (const s of collectCorpusStrings()) {
    for (const c of bengaliSegmenter.segmentString(s)) {
      if (!c.includes('\u09CD') && /[\u0981-\u0983\u09BC\u09BE-\u09CC]/.test(c) && c.trim()) {
        counts.set(c, (counts.get(c) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .map(([cluster, count]) => ({ cluster, count }))
    .sort((a, b) => b.count - a.count);
}
