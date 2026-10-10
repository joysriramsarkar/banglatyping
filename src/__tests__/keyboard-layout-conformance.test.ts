/**
 * Keyboard layout × curriculum grapheme conformance matrix.
 *
 * For every unique grapheme the curriculum asks a learner to type, check each of
 * the six layouts:
 *   1. Soundness — any sequence the resolver returns must actually rebuild the
 *      grapheme, otherwise the hint teaches the wrong keys.
 *   2. Coverage  — how much of the curriculum each layout can hint at all. An
 *      empty hint is allowed (see getKeySequenceForGrapheme docs) but a layout
 *      that resolves almost nothing would be silently useless.
 */

import { getAllCurriculumLessons } from '@/lib/curriculum/curriculum-data';
import { bengaliSegmenter, normalizeBengaliString } from '@/lib/bengali-grapheme';
import {
  getKeySequenceForGrapheme,
  type KeyboardLayoutKey,
} from '@/lib/keyboard-layouts';

const LAYOUTS: KeyboardLayoutKey[] = [
  'banglaword',
  'khipro',
  'probhat',
  'bijoy',
  'avro',
  'unijoy',
];

function collectCurriculumGraphemes(): string[] {
  const graphemes = new Set<string>();
  for (const lesson of getAllCurriculumLessons()) {
    for (const section of lesson.sections) {
      for (const item of section.items ?? []) {
        for (const g of bengaliSegmenter.segmentString(item)) {
          // Spaces carry no key hint of interest here.
          if (g.trim() === '') continue;
          graphemes.add(g);
        }
      }
    }
  }
  return [...graphemes];
}

describe('keyboard layout conformance matrix', () => {
  const graphemes = collectCurriculumGraphemes();

  it('has a meaningful set of curriculum graphemes to check', () => {
    expect(graphemes.length).toBeGreaterThan(40);
  });

  it.each(LAYOUTS)(
    '%s resolves sequences that actually reproduce the grapheme',
    (layout) => {
      const broken: Array<{ grapheme: string; produced: string }> = [];

      for (const grapheme of graphemes) {
        const steps = getKeySequenceForGrapheme(grapheme, layout);
        if (steps.length === 0) continue; // intentional gap, not a wrong hint

        const produced = normalizeBengaliString(steps.map((s) => s.produces).join(''));
        if (produced !== normalizeBengaliString(grapheme)) {
          broken.push({ grapheme, produced });
        }
      }

      expect(broken).toEqual([]);
    }
  );

  it('documents how much of the curriculum each layout can hint at', () => {
    const coverage = LAYOUTS.map((layout) => {
      const resolved = graphemes.filter(
        (g) => getKeySequenceForGrapheme(g, layout).length > 0
      ).length;
      return { layout, resolved, total: graphemes.length };
    });

    // The default layout must cover essentially the whole curriculum.
    const banglaword = coverage.find((c) => c.layout === 'banglaword')!;
    expect(banglaword.resolved / banglaword.total).toBeGreaterThan(0.9);

    // No layout may be so broken that it silently resolves almost nothing.
    for (const entry of coverage) {
      expect(entry.resolved / entry.total).toBeGreaterThan(0.55);
    }
  });

  it('treats unsupported characters as intentional gaps, not guesses', () => {
    // These must stay empty rather than returning a made-up key (see the
    // known-gaps list on getKeySequenceForGrapheme).
    expect(getKeySequenceForGrapheme('ঞ', 'probhat')).toEqual([]);
    expect(getKeySequenceForGrapheme('শ', 'bijoy')).toEqual([]);
    expect(getKeySequenceForGrapheme('ঞ', 'avro')).toEqual([]);
    expect(getKeySequenceForGrapheme('ঁ', 'unijoy')).toEqual([]);
  });
});
