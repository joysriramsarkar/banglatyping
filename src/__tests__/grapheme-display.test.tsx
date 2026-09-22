import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GraphemeDisplay } from '@/components/lessons/GraphemeDisplay';
import { buildGraphemeRenderModel } from '@/lib/bengali-grapheme';

describe('GraphemeDisplay', () => {
  it('renders kar cluster (টি) as unbroken glyph without splitting into broken spans', () => {
    const model = buildGraphemeRenderModel('টি', 'ট');
    const { container } = render(<GraphemeDisplay model={model} />);

    // Text content should contain intact "টি"
    expect(container.textContent).toContain('টি');

    // Should NOT have split spans with bare 'ি'
    const spans = container.querySelectorAll('span');
    const bareIKarSpans = Array.from(spans).filter(s => s.textContent === 'ি');
    expect(bareIKarSpans.length).toBe(0);

    // Should contain layered overlay with clipPath
    const clippedSpan = Array.from(spans).find(s => (s as HTMLElement).style.clipPath);
    expect(clippedSpan).toBeDefined();
  });

  it('renders transparent conjunct (প্ত) with halant indicator dot when halant is entered', () => {
    // Stage 1: 'প' entered
    const model1 = buildGraphemeRenderModel('প্ত', 'প');
    const { rerender } = render(<GraphemeDisplay model={model1} />);
    expect(screen.queryByTitle('হসন্ত (্) সক্রিয়')).toBeNull();

    // Stage 2: 'প্' entered (halant entered) -> dot indicator appears!
    const model2 = buildGraphemeRenderModel('প্ত', 'প্');
    rerender(<GraphemeDisplay model={model2} />);
    expect(screen.getByTitle('হসন্ত (্) সক্রিয়')).toBeInTheDocument();
    expect(screen.getByTitle('হসন্ত (্) সক্রিয়').textContent).toBe('●');

    // Stage 3: 'প্ত' completed -> dot indicator disappears!
    const model3 = buildGraphemeRenderModel('প্ত', 'প্ত');
    rerender(<GraphemeDisplay model={model3} />);
    expect(screen.queryByTitle('হসন্ত (্) সক্রিয়')).toBeNull();
  });

  it('renders complex conjunct (ক্র) with formula decomposition (ক + ক্ + র = ক্র)', () => {
    const model = buildGraphemeRenderModel('ক্র', 'ক');
    render(<GraphemeDisplay model={model} showSimulationBox />);

    // Shows the simulation screen aria label
    const simScreen = screen.getByLabelText('যুক্তাক্ষর সিমুলেশন স্ক্রিন');
    expect(simScreen).toBeInTheDocument();

    // Displays breakdown steps: 'ক', 'ক্', 'র' and target 'ক্র'
    expect(simScreen.textContent).toContain('ক');
    expect(simScreen.textContent).toContain('ক্');
    expect(simScreen.textContent).toContain('র');
    expect(simScreen.textContent).toContain('ক্র');
  });

  it('renders complex conjunct (ক্ষ) with BanglaWord hint badge for "q" or "ক+্+ষ"', () => {
    const model = buildGraphemeRenderModel('ক্ষ', '');
    render(<GraphemeDisplay model={model} showSimulationBox />);

    expect(screen.getByText(/বাংলাওয়ার্ড: সরাসরি 'q' অথবা ক \+ ্ \+ ষ/)).toBeInTheDocument();
  });

  it('progressively renders conjunct with Aa-kar (স্বা) stage-by-stage without prematurely coloring ব or া', () => {
    // Stage 1: 'স' typed -> only 'স' clipped in green
    const model1 = buildGraphemeRenderModel('স্বা', 'স');
    const { container, rerender } = render(<GraphemeDisplay model={model1} />);
    const spans = container.querySelectorAll('span');
    const clippedSpan1 = Array.from(spans).find(s => (s as HTMLElement).style.clipPath);
    expect(clippedSpan1).toBeDefined();
    expect((clippedSpan1 as HTMLElement).style.clipPath).toBe('polygon(0 0, 70% 0, 70% 54%, 0 54%)');

    // Stage 2: 'স্' typed -> halant dot active
    const model2 = buildGraphemeRenderModel('স্বা', 'স্');
    rerender(<GraphemeDisplay model={model2} />);
    expect(screen.getByTitle('হসন্ত (্) সক্রিয়')).toBeInTheDocument();

    // Stage 3: 'স্ব' typed -> 'স্ব' revealed, 'া' still cut off
    const model3 = buildGraphemeRenderModel('স্বা', 'স্ব');
    rerender(<GraphemeDisplay model={model3} />);
    const clippedSpan3 = Array.from(container.querySelectorAll('span')).find(s => (s as HTMLElement).style.clipPath);
    expect((clippedSpan3 as HTMLElement).style.clipPath).toBe('polygon(0 0, 70% 0, 70% 100%, 0 100%)');

    // Stage 4: 'স্বা' typed -> fully revealed
    const model4 = buildGraphemeRenderModel('স্বা', 'স্বা');
    rerender(<GraphemeDisplay model={model4} />);
    const clippedSpan4 = Array.from(container.querySelectorAll('span')).find(s => (s as HTMLElement).style.clipPath);
    expect((clippedSpan4 as HTMLElement).style.clipPath).toBe('inset(0)');
  });
});
