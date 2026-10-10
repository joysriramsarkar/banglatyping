/**
 * Grapheme visual system — registry (§7–§8, §15).
 *
 * Curated explicit specs for high-frequency / pedagogically special clusters,
 * plus a structural rule fallback so the long tail never renders with a
 * guessed mask. Unknown input degrades to `safe-fallback`, never to a cut.
 *
 * Tier-3 per-glyph SVG assets do not exist yet: entries that will need one
 * carry `strategy: 'svg-mask'` with an UNREVIEWED mask, which the resolver
 * downgrades to simulation (fail-closed, §9.2). `reviewed: true` must only be
 * set with real screenshot QA against the locked font profile.
 */

import {
  normalizeBengaliString,
  isBelowBaseLegible,
  isVerticallyStackedConjunct,
} from '../bengali-grapheme';
import { classifyGrapheme, parseClusterStructure } from './classify';
import type { GraphemeShapeClass, GraphemeVisualSpec } from './types';

function steps(
  labels: string[],
  explanations: string[],
): GraphemeVisualSpec['teachingSteps'] {
  return labels.map((label, i) => ({
    label,
    explanationBn: explanations[i] ?? '',
    expectedTypingStep: i + 1,
  }));
}

const lPhalaSteps = (base: string): GraphemeVisualSpec['teachingSteps'] => [
  { label: base, explanationBn: 'মূল ব্যঞ্জনটি চিনুন।', expectedTypingStep: 1 },
  {
    label: `${base}্`,
    explanationBn: 'হসন্ত ব্যঞ্জনটিকে পরের ব্যঞ্জনের সঙ্গে যুক্ত করার প্রস্তুতি দেয়।',
    expectedTypingStep: 2,
  },
  {
    label: `${base}্ল`,
    explanationBn: 'ল-ফলা যুক্ত হয়ে পূর্ণ conjunct তৈরি হয়।',
    expectedTypingStep: 3,
  },
];

function stackedMaskSpec(
  grapheme: string,
  classes: GraphemeShapeClass[],
  teachingSteps: GraphemeVisualSpec['teachingSteps'],
  notes?: string,
): GraphemeVisualSpec {
  return {
    grapheme,
    classes,
    strategy: 'stacked-mask',
    teachingSteps,
    spatialHighlightApproved: true,
    notes:
      notes ??
      'Tier-2 family approval (below-base/stacked split + representative screenshot fixtures). Per-glyph Tier-3 mask pending.',
  };
}

/** Curated entries: family-approved highlights + Tier-3 skeletons. */
export const GRAPHEME_VISUALS: Record<string, GraphemeVisualSpec> = {
  'ক্ল': {
    grapheme: 'ক্ল',
    classes: ['l-phala'],
    strategy: 'stacked-mask',
    spatialHighlightApproved: true,
    teachingSteps: [
      { label: 'ক', explanationBn: 'মূল ব্যঞ্জনটি চিনুন।', expectedTypingStep: 1 },
      { label: 'ক্', explanationBn: 'হসন্ত ব্যঞ্জনটিকে পরের ব্যঞ্জনের সঙ্গে যুক্ত করার প্রস্তুতি দেয়।', expectedTypingStep: 2 },
      { label: 'ক্ল', explanationBn: 'ল-ফলা যুক্ত হয়ে পূর্ণ conjunct তৈরি হয়।', expectedTypingStep: 3 },
    ],
  },
  'ট্ট': {
    grapheme: 'ট্ট',
    classes: ['doubled-consonant', 'fused-ligature'],
    strategy: 'stacked-mask',
    spatialHighlightApproved: true,
    teachingSteps: steps(
      ['ট', 'ট্', 'ট্ট'],
      [
        'উপরের ট চিনুন।',
        'হসন্ত নিচের ট-এর সঙ্গে যুক্ত করার প্রস্তুতি দেয়।',
        'নিচের ট যুক্ত হয়ে পূর্ণ conjunct তৈরি হয়।',
      ],
    ),
    notes: 'Below-base legible double: upper/lower split approved by screenshot fixture.',
  },
  'ক্ষ্ম': {
    grapheme: 'ক্ষ্ম',
    classes: ['multi-consonant', 'fused-ligature'],
    strategy: 'simulation',
    spatialHighlightApproved: false,
    teachingSteps: [
      { label: 'ক', explanationBn: 'প্রথম ব্যঞ্জন টাইপ করুন।', expectedTypingStep: 1 },
      { label: 'ক্', explanationBn: 'প্রথম ব্যঞ্জনের সঙ্গে হসন্ত যুক্ত করুন।', expectedTypingStep: 2 },
      { label: 'ক্ষ', explanationBn: 'ষ যুক্ত হয়ে ক্ষ-রূপ তৈরি হয়।', expectedTypingStep: 3 },
      { label: 'ক্ষ্ম', explanationBn: 'শেষে ম যুক্ত হয়ে পুরো যুক্তবর্ণ তৈরি হয়।', expectedTypingStep: 5 },
    ],
    notes: 'প্রথম release-এ exact region-mask QA না হওয়া পর্যন্ত whole glyph + simulation ব্যবহার করবে।',
  },
  'ক্ষ': {
    grapheme: 'ক্ষ',
    classes: ['fused-ligature', 'sibilant-cluster'],
    strategy: 'svg-mask',
    spatialHighlightApproved: false,
    teachingSteps: steps(
      ['ক', 'ক্', 'ক্ষ'],
      [
        'প্রথম ব্যঞ্জন টাইপ করুন।',
        'হসন্ত যুক্ত করুন।',
        'ষ যুক্ত হয়ে ক্ষ-রূপ তৈরি হয়।',
      ],
    ),
    mask: {
      id: 'noto-stack-v1-ksa',
      version: 1,
      fontProfile: 'noto-sans-bengali-stack-v1',
      viewBox: [0, 0, 1000, 1000],
      maskUrl: '/grapheme-masks/noto-sans-bengali-stack-v1/ksa.svg',
      stages: [
        { id: 'base', labelBn: 'মূল বর্ণ', completedThroughTypingStep: 1, regionIds: ['base'] },
        { id: 'full', labelBn: 'পূর্ণ যুক্তবর্ণ', completedThroughTypingStep: 3, regionIds: ['base', 'ssa'] },
      ],
      reviewed: false,
    },
    notes: 'Tier-3 skeleton: asset not authored/reviewed yet — resolver downgrades to simulation.',
  },
  'জ্ঞ': {
    grapheme: 'জ্ঞ',
    classes: ['fused-ligature', 'nasal-cluster'],
    strategy: 'svg-mask',
    spatialHighlightApproved: false,
    teachingSteps: steps(
      ['জ', 'জ্', 'জ্ঞ'],
      ['প্রথম ব্যঞ্জন টাইপ করুন।', 'হসন্ত যুক্ত করুন।', 'ঞ যুক্ত হয়ে জ্ঞ-রূপ তৈরি হয়।'],
    ),
    mask: {
      id: 'noto-stack-v1-jna',
      version: 1,
      fontProfile: 'noto-sans-bengali-stack-v1',
      viewBox: [0, 0, 1000, 1000],
      maskUrl: '/grapheme-masks/noto-sans-bengali-stack-v1/jna.svg',
      stages: [
        { id: 'base', labelBn: 'মূল বর্ণ', completedThroughTypingStep: 1, regionIds: ['base'] },
        { id: 'full', labelBn: 'পূর্ণ যুক্তবর্ণ', completedThroughTypingStep: 3, regionIds: ['base', 'nya'] },
      ],
      reviewed: false,
    },
    notes: 'Tier-3 skeleton: asset not authored/reviewed yet — resolver downgrades to simulation.',
  },
  'ক্ত': {
    grapheme: 'ক্ত',
    classes: ['fused-ligature'],
    strategy: 'svg-mask',
    spatialHighlightApproved: false,
    teachingSteps: steps(
      ['ক', 'ক্', 'ক্ত'],
      ['প্রথম ব্যঞ্জন টাইপ করুন।', 'হসন্ত যুক্ত করুন।', 'ত যুক্ত হয়ে ক্ত-রূপ তৈরি হয়।'],
    ),
    mask: {
      id: 'noto-stack-v1-kta',
      version: 1,
      fontProfile: 'noto-sans-bengali-stack-v1',
      viewBox: [0, 0, 1000, 1000],
      maskUrl: '/grapheme-masks/noto-sans-bengali-stack-v1/kta.svg',
      stages: [
        { id: 'base', labelBn: 'মূল বর্ণ', completedThroughTypingStep: 1, regionIds: ['base'] },
        { id: 'full', labelBn: 'পূর্ণ যুক্তবর্ণ', completedThroughTypingStep: 3, regionIds: ['base', 'ta'] },
      ],
      reviewed: false,
    },
    notes: 'Tier-3 skeleton: asset not authored/reviewed yet — resolver downgrades to simulation.',
  },
  'র্ম': {
    grapheme: 'র্ম',
    classes: ['reph', 'nasal-cluster'],
    strategy: 'simulation',
    spatialHighlightApproved: false,
    teachingSteps: steps(
      ['র', 'র্', 'র্ম'],
      [
        'র টাইপ করুন।',
        'হসন্ত দিন — রেফ পরের ব্যঞ্জনের উপরে বসার প্রস্তুতি নেয়।',
        'ম টাইপ করুন — রেফ উপরে বসে পূর্ণ রূপ তৈরি হয়।',
      ],
    ),
    notes: 'Reph sits above: no left-to-right clip; stages live in the step card.',
  },
};

// Observed ল-ফলা family members share the approved below-base split.
for (const g of ['গ্ল', 'প্ল', 'ফ্ল', 'ব্ল', 'স্ল', 'শ্ল', 'হ্ল', 'ম্ল']) {
  GRAPHEME_VISUALS[g] = stackedMaskSpec(g, ['l-phala'], lPhalaSteps(g[0]));
}
for (const g of ['ক্লা', 'ক্লি', 'গ্লা', 'প্লা', 'গ্লো']) {
  GRAPHEME_VISUALS[g] = stackedMaskSpec(g, ['l-phala', 'modifier-composite'], lPhalaSteps(g[0]), 'কার variant: core below-base split applies; kar-aware clip branch.');
}

/**
 * Rule-based fallback for the long tail: structural classes in, honest
 * strategy out. Never produces a guessed mask for fused/unknown geometry.
 */
function ruleBasedSpec(cluster: string, classes: GraphemeShapeClass[]): GraphemeVisualSpec {
  const st = parseClusterStructure(cluster);
  if (classes.includes('unknown') || classes.length === 0) {
    return {
      grapheme: cluster,
      classes: ['unknown'],
      strategy: 'safe-fallback',
      spatialHighlightApproved: false,
      teachingSteps: [
        {
          label: cluster,
          explanationBn:
            'এই যুক্তবর্ণের আলাদা visual mask এখনও যাচাই করা হয়নি; পুরো glyph অক্ষত রেখে ধাপগুলো দেখানো হচ্ছে।',
          expectedTypingStep: Math.max(1, Array.from(cluster).length),
        },
      ],
    };
  }
  if (classes.includes('simple') || classes.includes('halant-prefix')) {
    return {
      grapheme: cluster,
      classes,
      strategy: 'whole-glyph',
      spatialHighlightApproved: false,
      teachingSteps: [
        { label: cluster, explanationBn: 'এই বর্ণটি একবারে টাইপ করুন।', expectedTypingStep: 1 },
      ],
    };
  }
  if (classes.includes('kar')) {
    return {
      grapheme: cluster,
      classes,
      strategy: 'heuristic-kar',
      spatialHighlightApproved: true,
      teachingSteps: [
        { label: cluster, explanationBn: 'ব্যঞ্জন ও কার একসঙ্গে শিখুন।', expectedTypingStep: st.normalized.length },
      ],
      notes: 'Tier-2: tested kar heuristic with fixtures.',
    };
  }
  // Conjunct territory from here on.
  if (classes.includes('multi-consonant')) {
    return simSpec(cluster, classes, 'তিন বা ততোধিক ব্যঞ্জন: ধাপগুলো কার্ডে দেখুন, glyph অক্ষত থাকবে।');
  }
  if (classes.includes('fused-ligature') && !isBelowBaseLegible(st.normalized)) {
    return simSpec(cluster, classes, 'যুক্ত রূপটি একীভূত: ধাপগুলো কার্ডে দেখুন, glyph অক্ষত থাকবে।');
  }
  if (isBelowBaseLegible(st.normalized) || isVerticallyStackedConjunct(st.core || st.normalized)) {
    return stackedMaskSpec(
      cluster,
      classes,
      steps(
        [cluster],
        ['ধাপে ধাপে টাইপ করুন; উপরের অংশ আগে, নিচের অংশ পরে সবুজ হবে।'],
      ),
    );
  }
  // Fail-closed: non-stacked transparent geometry is NOT guessed (was the
  // generic 52% vertical cut). Whole glyph + step card instead.
  return simSpec(cluster, classes, 'এই যুক্তবর্ণের mask এখনও যাচাই হয়নি; পুরো glyph অক্ষত রেখে ধাপগুলো দেখানো হচ্ছে।');
}

function simSpec(
  cluster: string,
  classes: GraphemeShapeClass[],
  note: string,
): GraphemeVisualSpec {
  return {
    grapheme: cluster,
    classes,
    strategy: 'simulation',
    spatialHighlightApproved: false,
    teachingSteps: [
      {
        label: cluster,
        explanationBn: note,
        expectedTypingStep: Math.max(1, Array.from(cluster).length),
      },
    ],
    notes: note,
  };
}

export function getGraphemeVisualSpec(cluster: string): GraphemeVisualSpec {
  const norm = normalizeBengaliString(cluster);
  const hit = GRAPHEME_VISUALS[norm];
  if (hit) return hit;
  return ruleBasedSpec(norm || cluster, classifyGrapheme(norm || cluster));
}
