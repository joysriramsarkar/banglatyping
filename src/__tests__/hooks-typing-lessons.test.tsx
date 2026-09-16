/**
 * Unit Tests for Typing Session & Lesson Hooks
 */

import { renderHook, act } from '@testing-library/react';
import { useTypingSession } from '../hooks/use-typing-session';
import {
  useLessons,
  useLesson,
  useUserStatistics,
  useWeakCharacters,
  useCustomDrills,
  useSaveProgress,
} from '../hooks/use-lessons';

// Mock apiFetch
jest.mock('../lib/api-client', () => ({
  apiFetch: jest.fn((url: string) => {
    if (url.includes('user-statistics')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: { user_id: 'u1', average_wpm: 35 } }),
      });
    }
    if (url.includes('weak-characters')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ data: [{ character: 'ক্ষ', accuracy_rate: 60 }] }),
      });
    }
    if (url.includes('custom-drills')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: [{ id: 'drill-1' }] }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ success: true, data: { id: 'prog-1' } }),
    });
  }),
}));

// Mock window.fetch
global.fetch = jest.fn() as any;

describe('useTypingSession Hook', () => {
  test('manages full typing session lifecycle', () => {
    const { result } = renderHook(() => useTypingSession());

    expect(result.current.session.status).toBe('IDLE');

    act(() => {
      result.current.startSession({
        text: 'ক খ গ',
        layout: 'probhat',
      });
    });
    expect(result.current.session.expectedText).toBe('ক খ গ');

    act(() => {
      result.current.handleKeyDown({ key: 'ক' });
    });
    expect(result.current.session.status).toBe('ACTIVE');

    act(() => {
      result.current.togglePause();
    });
    expect(result.current.session.status).toBe('PAUSED');

    act(() => {
      result.current.togglePause();
    });
    expect(result.current.session.status).toBe('ACTIVE');

    act(() => {
      result.current.finishSession();
    });
    expect(result.current.session.status).toBe('COMPLETED');

    act(() => {
      result.current.resetSession();
    });
    expect(result.current.session.status).toBe('IDLE');
  });

  test('handles composition events and direct dispatch', () => {
    const { result } = renderHook(() => useTypingSession());
    act(() => {
      result.current.startSession({
        text: 'পানি',
        layout: 'probhat',
      });
      result.current.handleCompositionEnd('পা');
    });
  });
});

describe('useLessons & Related Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('useLessons fetches lessons from API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: 'lesson-1', title: 'Home Row 1' }] }),
    });

    const { result } = renderHook(() => useLessons({ category: 'home-row' }));

    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });

    expect(result.current.lessons.length).toBe(1);
    expect(result.current.lessons[0].id).toBe('lesson-1');
  });

  test('useLesson fetches single lesson details', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'l-1', title: 'Test Lesson', drills: [] } }),
    });

    const { result } = renderHook(() => useLesson('l-1'));

    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });

    expect(result.current.lesson?.id).toBe('l-1');
  });

  test('useUserStatistics, useWeakCharacters, useCustomDrills & useSaveProgress', async () => {
    const { result: statsResult } = renderHook(() => useUserStatistics('u1'));
    const { result: weakResult } = renderHook(() => useWeakCharacters('u1'));
    const { result: drillsResult } = renderHook(() => useCustomDrills('u1'));
    const { result: saveResult } = renderHook(() => useSaveProgress());

    await act(async () => {
      await new Promise(r => setTimeout(r, 20));
    });

    expect(statsResult.current.stats?.average_wpm).toBe(35);
    expect(weakResult.current.weakChars.length).toBe(1);
    expect(drillsResult.current.drills.length).toBe(1);

    await act(async () => {
      const saved = await saveResult.current.saveProgress('u1', 'l1', 40, 98, 1, 30, []);
      expect(saved).toBeDefined();
    });
  });
});
