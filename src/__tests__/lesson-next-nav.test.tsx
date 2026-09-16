/**
 * Unit & Integration Tests for Next Lesson Navigation & Enter Key Handling
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TestResults from '../components/test-results';
import { getNextCurriculumLesson, getCurriculumLessonById, getAllCurriculumLessons } from '../lib/curriculum/curriculum-data';

const mockPush = jest.fn();

jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: () => () => <span data-testid="mock-icon" />,
  });
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('../lib/api-client', () => ({
  apiFetch: jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
  }),
}));

describe('Next Lesson Navigation and Enter Key Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test('getNextCurriculumLesson returns consecutive lessons across modules and levels', () => {
    const next01 = getNextCurriculumLesson('lesson-0-1');
    expect(next01).toBeDefined();
    expect(next01?.id).toBe('lesson-1-1');

    const next11 = getNextCurriculumLesson('lesson-1-1');
    expect(next11).toBeDefined();
    expect(next11?.id).toBe('lesson-1-2');

    const next17 = getNextCurriculumLesson('lesson-1-7');
    expect(next17).toBeDefined();
    expect(next17?.id).toBe('lesson-1-8');

    const next18 = getNextCurriculumLesson('lesson-1-8');
    expect(next18).toBeDefined();
    expect(next18?.id).toBe('lesson-1-9');

    const all = getAllCurriculumLessons();
    const lastLesson = all[all.length - 1];
    expect(getNextCurriculumLesson(lastLesson.id)).toBeUndefined();
  });

  test('TestResults renders "পরবর্তী পাঠ" button with Enter badge on passed drill and navigates on Enter key', () => {
    const mockStats = {
      wpm: 32,
      accuracy: 96,
      errors: 2,
      timeElapsed: 45,
      cpm: 160,
    };

    render(
      <TestResults
        stats={mockStats}
        onRestart={jest.fn()}
        lessonId="lesson-1-1"
        isDrill={true}
        accuracyGoal={90}
      />
    );

    // Button should be visible
    const nextButton = screen.getByText(/পরবর্তী পাঠ/i);
    expect(nextButton).toBeInTheDocument();
    expect(screen.getByText(/Enter ↵/i)).toBeInTheDocument();

    // Trigger Enter key
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    // Should navigate to lesson-1-2
    expect(mockPush).toHaveBeenCalledWith('/dashboard/practice/lesson-1-2');
  });

  test('All curriculum drill sections have expanded items (minimum 30 items for patterns/words, 12 for sentences)', () => {
    const allLessons = getAllCurriculumLessons();
    expect(allLessons.length).toBeGreaterThan(30);

    let totalDrillSections = 0;
    for (const les of allLessons) {
      for (const sec of les.sections) {
        if (sec.items && sec.items.length > 0) {
          totalDrillSections++;
          const avgLen = sec.items.reduce((acc, it) => acc + it.length, 0) / sec.items.length;
          const minExpected = avgLen > 20 ? 12 : 30;
          expect(sec.items.length).toBeGreaterThanOrEqual(minExpected);
        }
      }
    }

    expect(totalDrillSections).toBeGreaterThanOrEqual(100);
  });
});
