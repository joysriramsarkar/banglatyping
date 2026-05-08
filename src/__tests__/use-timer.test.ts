import { renderHook, act } from '@testing-library/react';
import { useTimer } from '@/hooks/use-timer';

jest.useFakeTimers();

describe('useTimer', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('starts at 0', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.time).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(true);
  });

  it('increments time when started', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); });
    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.time).toBe(3);
    expect(result.current.isActive).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('stops incrementing when paused', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); });
    act(() => { jest.advanceTimersByTime(2000); });
    act(() => { result.current.pause(); });
    act(() => { jest.advanceTimersByTime(2000); });
    expect(result.current.time).toBe(2);
    expect(result.current.isPaused).toBe(true);
  });

  it('resumes from paused state', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); });
    act(() => { jest.advanceTimersByTime(2000); });
    act(() => { result.current.pause(); });
    act(() => { result.current.resume(); });
    act(() => { jest.advanceTimersByTime(1000); });
    expect(result.current.time).toBe(3);
    expect(result.current.isPaused).toBe(false);
  });

  it('resets to 0', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); });
    act(() => { jest.advanceTimersByTime(5000); });
    act(() => { result.current.reset(); });
    expect(result.current.time).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(true);
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { result, unmount } = renderHook(() => useTimer());
    act(() => { result.current.start(); });
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
