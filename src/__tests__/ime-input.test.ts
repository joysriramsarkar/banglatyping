/**
 * ime-input.test.ts — Gboard-safe IME input behaviour.
 *
 * - A composition batch that segments to one grapheme commits atomically.
 * - keydown with key 'Unidentified' (Gboard) is ignored in favour of
 *   input/composition events.
 */

import { resolveImeCommit, shouldIgnoreKeydown } from '../components/typing/ImeTypingInput';

describe('resolveImeCommit', () => {
  it('commits a single-grapheme composition batch as one grapheme', () => {
    // ক্ষ is 3 code points (ক + ্ + ষ) but one visual unit.
    expect(resolveImeCommit('ক্ষ')).toEqual(['ক্ষ']);
  });

  it('segments a multi-grapheme batch in order', () => {
    expect(resolveImeCommit('কখগ')).toEqual(['ক', 'খ', 'গ']);
  });

  it('keeps vowel signs attached to their base (no split commits)', () => {
    // কি = ক + ি sign, one grapheme — must not become two commits.
    expect(resolveImeCommit('কি')).toEqual(['কি']);
  });

  it('returns [] for empty composition data', () => {
    expect(resolveImeCommit('')).toEqual([]);
  });
});

describe('shouldIgnoreKeydown (Unidentified key fallback)', () => {
  it('ignores Gboard Unidentified keys so input events own the commit', () => {
    expect(shouldIgnoreKeydown({ key: 'Unidentified' })).toBe(true);
  });

  it('ignores IME Process keys mid-composition', () => {
    expect(shouldIgnoreKeydown({ key: 'Process' })).toBe(true);
  });

  it('does not ignore regular keys', () => {
    expect(shouldIgnoreKeydown({ key: 'a' })).toBe(false);
    expect(shouldIgnoreKeydown({ key: 'Backspace' })).toBe(false);
  });
});
