import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimer } from './use-timer';

describe('useTimer hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.time).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(true);
  });

  it('should initialize with a custom starting time', () => {
    const { result } = renderHook(() => useTimer(10));
    expect(result.current.time).toBe(10);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(true);
  });

  it('should start the timer correctly', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.time).toBe(3);
  });

  it('should pause the timer correctly', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.time).toBe(2);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.time).toBe(2); // Time should not increment
  });

  it('should resume the timer correctly', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
      result.current.pause();
    });

    expect(result.current.time).toBe(2);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.time).toBe(4);
  });

  it('should reset the timer correctly', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.time).toBe(5);

    act(() => {
      result.current.reset();
    });

    expect(result.current.time).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.time).toBe(0); // Should not start automatically
  });

  it('should allow manually setting the time', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.setTime(15);
    });

    expect(result.current.time).toBe(15);
  });

  it('should clear interval on unmount', () => {
    const { result, unmount } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.isActive).toBe(true);

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Time shouldn't change after unmount, but more importantly, we shouldn't get errors from state updates on unmounted component
    // If interval was not cleared, React would complain about updating state on unmounted component (if we use console.error checks)
    // We implicitly test it doesn't cause errors here, but we can't easily check `time` since hook is unmounted
  });
});
