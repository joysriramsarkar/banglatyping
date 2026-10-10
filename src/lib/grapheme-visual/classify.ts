/**
 * Grapheme visual system — structural parser + classifier (§14).
 *
 * The parser reports TEXT structure only (consonants, halants, marks). It
 * never claims to know glyph geometry: "Parser text structure দেয়; actual
 * visual mask registry দেয়।" Geometry approval lives in the registry.
 */

import {
  normalizeBengaliString,
  getConjunctCore,
  isComplexConjunct,
  isBelowBaseLegible,
  isVerticallyStackedConjunct,
} from '../bengali-grapheme';
import type { GraphemeShapeClass } from './types';

const HALANT = '্';
const REPH_RA = 'র';

/** Bengali consonants incl. atomic nukta letters and ৎ (relative import-safe). */
function isClusterConsonant(ch: string): boolean {
  if (ch.length !== 1) return false;
  const cp = ch.codePointAt(0) ?? 0;
  return (
    (cp >= 0x0995 && cp <= 0x09b9) ||
    cp === 0x09ce || // ৎ
    (cp >= 0x09dc && cp <= 0x09df) || // ড় ঢ় য়
    (cp >= 0x09f0 && cp <= 0x09f1) // ৰ ৱ
  );
}

function isClusterVowelSign(ch: string): boolean {
  if (ch.length !== 1) return false;
  const cp = ch.codePointAt(0) ?? 0;
  return (
    (cp >= 0x09be && cp <= 0x09cc) ||
    (cp >= 0x0981 && cp <= 0x0983) // ঁ ং ঃ
  );
}

const NASALS = new Set(['ঙ', 'ঞ', 'ণ', 'ন', 'ম']);
const SIBILANTS = new Set(['শ', 'ষ', 'স']);

export interface ClusterStructure {
  raw: string;
  normalized: string;
  core: string;
  consonants: string[];
  coreConsonants: string[];
  halantCount: number;
  vowelSigns: string[];
  /** Starts with র + hasanta (typographic reph sequence). */
  hasRephSequence: boolean;
}

/** Pure text-structure parse; no font or geometry knowledge. */
export function parseClusterStructure(cluster: string): ClusterStructure {
  const normalized = normalizeBengaliString(cluster);
  const units = Array.from(normalized);
  const core = getConjunctCore(normalized);
  const consonants = units.filter(isClusterConsonant);
  return {
    raw: cluster,
    normalized,
    core,
    consonants,
    coreConsonants: Array.from(core).filter(isClusterConsonant),
    halantCount: units.filter((u) => u === HALANT).length,
    vowelSigns: units.filter(isClusterVowelSign),
    hasRephSequence: units.length >= 2 && units[0] === REPH_RA && units[1] === HALANT,
  };
}

/**
 * Classify a grapheme cluster into shape classes (§5 taxonomy).
 * Multi-class results are normal ('ক্ষ্ম' is multi-consonant + fused-ligature).
 * Returns ['unknown'] only when nothing structural can be said.
 */
export function classifyGrapheme(cluster: string): GraphemeShapeClass[] {
  const st = parseClusterStructure(cluster);
  if (!st.normalized) return ['unknown'];

  const hasHalant = st.halantCount > 0;

  if (!hasHalant) {
    if (st.consonants.length === 0) {
      // Lone mark or anything else without a base: render whole, claim nothing.
      if (st.vowelSigns.length > 0) return ['unknown'];
      return st.normalized.trim() ? ['simple'] : ['unknown'];
    }
    if (st.vowelSigns.length > 0) return ['kar'];
    return ['simple'];
  }

  // Has halant from here on.
  if (st.consonants.length <= 1) return ['halant-prefix'];

  const classes: GraphemeShapeClass[] = [];
  if (st.hasRephSequence) classes.push('reph');

  const coreCons = st.coreConsonants;
  if (coreCons.length >= 3) {
    classes.push('multi-consonant');
  } else if (coreCons.length === 2) {
    const [c1, c2] = coreCons;
    if (c1 === c2) classes.push('doubled-consonant');
    if (c2 === 'র') classes.push('r-phala');
    else if (c2 === 'য') classes.push('y-phala');
    else if (c2 === 'ব') classes.push('b-phala');
    else if (c2 === 'ম') classes.push('m-phala');
    else if (c2 === 'ল') classes.push('l-phala');
    else if (!st.hasRephSequence && c1 !== c2) classes.push('generic-conjunct');
  } else if (coreCons.length === 1) {
    // e.g. stray C+্+C where core parsing kept one consonant — treat as prefix.
    if (classes.length === 0) return ['halant-prefix'];
  }
  if (isComplexConjunct(st.normalized)) classes.push('fused-ligature');

  if (coreCons.some((c) => NASALS.has(c))) classes.push('nasal-cluster');
  if (coreCons.some((c) => SIBILANTS.has(c))) classes.push('sibilant-cluster');
  if (st.vowelSigns.length > 0) classes.push('modifier-composite');

  if (classes.length === 0) return ['unknown'];
  return [...new Set(classes)];
}

/** Structural predicates the strategy rules build on (re-exported for tests). */
export { isComplexConjunct, isBelowBaseLegible, isVerticallyStackedConjunct };
