import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lucide-react to avoid ESM issues in Jest
jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (_target, prop) => (props: any) => <span data-testid={`lucide-${String(prop)}`} {...props} />,
  });
});

// Mock html2canvas and jspdf for Certificate testing
jest.mock('html2canvas', () => jest.fn(() => Promise.resolve({
  toDataURL: () => 'data:image/png;base64,mock',
  width: 800,
  height: 600,
})));

jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      addImage: jest.fn(),
      save: jest.fn(),
    })),
  };
});

import { Logo } from '@/components/logo';
import { VirtualizedWordDisplay } from '@/components/VirtualizedWordDisplay';
import { SimplifiedKeyboard } from '@/components/common/VirtualKeyboard';
import Certificate from '@/components/certificate';

describe('Accessibility (a11y) & UI Component Tests', () => {
  describe('Logo Component', () => {
    it('renders with accessible name and points to home page', () => {
      render(<Logo />);
      const link = screen.getByRole('link', { name: /হোম পেজে যান/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
      expect(link.getAttribute('aria-label')).toContain('হোম পেজে যান');
    });

    it('marks the decorative SVG logo icon as aria-hidden', () => {
      const { container } = render(<Logo />);
      const decorativeSvg = container.querySelector('svg[aria-hidden="true"]');
      expect(decorativeSvg).toBeInTheDocument();
    });
  });

  describe('VirtualizedWordDisplay Component', () => {
    const mockWords = [
      { word: 'আমি', index: 0 },
      { word: 'বাংলায়', index: 1 },
      { word: 'গান', index: 2 },
      { word: 'গাই', index: 3 },
    ];
    const mockGetWordClass = (index: number) => {
      if (index === 0) return 'text-emerald-500';
      if (index === 1) return 'text-primary font-bold';
      return 'text-muted-foreground';
    };

    it('announces current word progress to screen readers via polite live region', () => {
      render(
        <VirtualizedWordDisplay
          visibleWords={mockWords}
          currentWordIndex={1}
          totalWords={10}
          getWordClass={mockGetWordClass}
        />
      );

      const liveRegion = screen.getByText('শব্দ 2 / 10');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('hides the visual styled word list from screen readers to prevent duplication', () => {
      const { container } = render(
        <VirtualizedWordDisplay
          visibleWords={mockWords}
          currentWordIndex={1}
          totalWords={10}
          getWordClass={mockGetWordClass}
        />
      );

      const visualPara = container.querySelector('p[aria-hidden="true"]');
      expect(visualPara).toBeInTheDocument();
      expect(visualPara).toHaveTextContent('আমি');
      expect(visualPara).toHaveTextContent('বাংলায়');
    });

    it('displays aria-hidden scroll indicators when there are words before or after', () => {
      const partialWords = [
        { word: 'বাংলায়', index: 2 },
        { word: 'গান', index: 3 },
      ];

      const { container } = render(
        <VirtualizedWordDisplay
          visibleWords={partialWords}
          currentWordIndex={2}
          totalWords={10}
          getWordClass={mockGetWordClass}
        />
      );

      const scrollIndicators = container.querySelectorAll('[aria-hidden="true"]');
      const indicatorTexts = Array.from(scrollIndicators).map(el => el.textContent);
      expect(indicatorTexts.some(t => t?.includes('↑ আরও শব্দ আছে'))).toBe(true);
      expect(indicatorTexts.some(t => t?.includes('↓ আরও শব্দ আছে'))).toBe(true);
    });
  });

  describe('SimplifiedKeyboard Component', () => {
    it('sets role="img" and descriptive aria-label on keyboard grid', () => {
      const { container } = render(
        <SimplifiedKeyboard
          layout="avro"
          highlightKeyCode="KeyK"
          resolvedKeyInfo={{
            key: 'k',
            keyCode: 'KeyK',
            char: 'ক',
            needsShift: false,
            fingerPosition: 8,
            fingerName: 'Middle',
            hand: 'right',
            bengaliFingerLabel: 'ডান মধ্যমা',
          }}
        />
      );

      const keyboardGrid = container.querySelector('[role="img"]');
      expect(keyboardGrid).toBeInTheDocument();
      expect(keyboardGrid).toHaveAttribute(
        'aria-label',
        expect.stringContaining('বাংলা কীবোর্ড লেআউট')
      );
      expect(keyboardGrid).toHaveAttribute(
        'aria-label',
        expect.stringContaining('ডান মধ্যমা')
      );
    });

    it('displays active finger guide and key instructions', () => {
      render(
        <SimplifiedKeyboard
          layout="avro"
          resolvedKeyInfo={{
            key: 'k',
            keyCode: 'KeyK',
            char: 'ক',
            needsShift: false,
            fingerPosition: 8,
            fingerName: 'Middle',
            hand: 'right',
            bengaliFingerLabel: 'ডান মধ্যমা',
          }}
        />
      );

      expect(screen.getByText('কী চাপবেন:')).toBeInTheDocument();
      const matchedChars = screen.getAllByText('ক');
      expect(matchedChars.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/ডান মধ্যমা/i)).toBeInTheDocument();
    });

    it('prompts user to press Shift when key requires shift', () => {
      render(
        <SimplifiedKeyboard
          layout="avro"
          needsShift={true}
          resolvedKeyInfo={{
            key: 'K',
            keyCode: 'KeyK',
            char: 'খ',
            needsShift: true,
            fingerPosition: 8,
            fingerName: 'Middle',
            hand: 'right',
            bengaliFingerLabel: 'ডান মধ্যমা',
          }}
        />
      );

      expect(screen.getByText(/⇧ Shift বোতাম চাপুন/i)).toBeInTheDocument();
    });
  });

  describe('Certificate Component', () => {
    it('renders candidate details, test stats and hides decorative elements from screen readers', () => {
      const { container } = render(
        <Certificate
          name="রাহিম আহমেদ"
          wpm={45}
          accuracy={98}
          verificationId="BTP-2026-123456"
          date="২২ সেপ্টেম্বর ২০২৬"
        />
      );

      // Student name and stats
      expect(screen.getByText('রাহিম আহমেদ')).toBeInTheDocument();
      expect(screen.getAllByText(/BTP-2026-123456/).length).toBeGreaterThan(0);
      expect(screen.getByText(/২২ সেপ্টেম্বর ২০২৬/)).toBeInTheDocument();

      // Verify certificate title
      expect(screen.getByRole('heading', { level: 1, name: /সাফল্যের সনদপত্র/i })).toBeInTheDocument();

      // Check decorative background pattern has aria-hidden="true"
      const decorativePattern = container.querySelector('.opacity-30[aria-hidden="true"]');
      expect(decorativePattern).toBeInTheDocument();
    });
  });
});
