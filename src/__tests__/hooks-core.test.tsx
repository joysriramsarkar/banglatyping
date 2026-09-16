/**
 * Unit Tests for Core React Hooks (use-mobile, use-typing-sound, use-toast, use-auth)
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../hooks/use-mobile';
import { useTypingSound } from '../hooks/use-typing-sound';
import { useToast, toast, reducer } from '../hooks/use-toast';
import { useAuth, AuthProvider } from '../hooks/use-auth';

// Mock matchMedia for use-mobile
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock supabase auth
jest.mock('../lib/db', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-1', email: 'test@example.com' },
          },
        },
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signOut: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe('useIsMobile Hook', () => {
  test('detects desktop vs mobile correctly', () => {
    mockMatchMedia(false);
    window.innerWidth = 1024;
    const { result: desktopResult } = renderHook(() => useIsMobile());
    expect(desktopResult.current).toBe(false);

    window.innerWidth = 500;
    const { result: mobileResult } = renderHook(() => useIsMobile());
    expect(mobileResult.current).toBe(true);
  });
});

describe('useTypingSound Hook', () => {
  test('toggles sound, sets volume, and triggers sound plays', () => {
    const { result } = renderHook(() => useTypingSound());

    act(() => {
      result.current.toggleSound();
    });
    expect(typeof result.current.soundEnabled).toBe('boolean');

    act(() => {
      result.current.setVolume(0.5);
    });
    expect(result.current.volume).toBe(0.5);

    expect(() => {
      act(() => {
        result.current.playClick();
        result.current.playError();
        result.current.playSuccess();
      });
    }).not.toThrow();
  });
});

describe('useToast Hook & Reducer', () => {
  test('adds and dismisses toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({
        title: 'অভিনন্দন!',
        description: 'লেসন সফলভাবে সম্পন্ন হয়েছে।',
      });
    });

    expect(result.current.toasts.length).toBeGreaterThan(0);
    expect(result.current.toasts[0].title).toBe('অভিনন্দন!');

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });
  });

  test('reducer handles ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, and REMOVE_TOAST', () => {
    let state = { toasts: [] };
    const newToast = { id: '1', title: 'Test Toast', open: true };

    state = reducer(state, { type: 'ADD_TOAST', toast: newToast as any });
    expect(state.toasts.length).toBe(1);

    state = reducer(state, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated' },
    });
    expect(state.toasts[0].title).toBe('Updated');

    state = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' });
    state = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' });
    expect(state.toasts.length).toBe(0);
  });
});

describe('useAuth Hook & AuthProvider', () => {
  test('provides auth user and supports signOut', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      // Let promises resolve
      await new Promise(r => setTimeout(r, 10));
    });

    expect(result.current.user?.id).toBe('user-1');
    expect(typeof result.current.signOut).toBe('function');

    await act(async () => {
      await result.current.signOut();
    });
  });

  test('throws error when useAuth is used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
