import { toBengaliNumber, cn } from '@/lib/utils';

describe('toBengaliNumber', () => {
  it('converts single digit', () => {
    expect(toBengaliNumber(0)).toBe('০');
    expect(toBengaliNumber(1)).toBe('১');
    expect(toBengaliNumber(9)).toBe('৯');
  });

  it('converts multi-digit number', () => {
    expect(toBengaliNumber(123)).toBe('১২৩');
    expect(toBengaliNumber(1000)).toBe('১০০০');
  });

  it('converts string number', () => {
    expect(toBengaliNumber('42')).toBe('৪২');
  });

  it('converts time string', () => {
    expect(toBengaliNumber('05:30')).toBe('০৫:৩০');
  });

  it('handles null/undefined gracefully', () => {
    expect(toBengaliNumber(null as any)).toBe('০');
    expect(toBengaliNumber(undefined as any)).toBe('০');
  });

  it('handles percentage string', () => {
    expect(toBengaliNumber('95%')).toBe('৯৫%');
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('deduplicates tailwind classes', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
  });

  it('handles undefined/null', () => {
    expect(cn('foo', undefined, null as any)).toBe('foo');
  });
});
