import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lucide-react to avoid ESM issues in Jest
jest.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (_target, prop) => (props: any) => <span data-testid={`lucide-${String(prop)}`} {...props} />,
  });
});

// Mock useAuth
const mockSignOut = jest.fn();
let mockAuthState = {
  user: null as any,
  loading: false,
  signOut: mockSignOut,
};

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockAuthState,
}));

import Home from '@/app/page';

describe('Home Page Header and Auth State Responsiveness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      user: null,
      loading: false,
      signOut: mockSignOut,
    };
  });

  it('renders login and signup buttons when user is not logged in', () => {
    mockAuthState = {
      user: null,
      loading: false,
      signOut: mockSignOut,
    };

    render(<Home />);

    const loginLink = screen.getByRole('link', { name: 'লগইন' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');

    const signupLink = screen.getByRole('link', { name: 'সাইন আপ' });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');

    // Hero CTA
    const heroCta = screen.getByRole('link', { name: /বিনামূল্যে টাইপিং শিখুন/i });
    expect(heroCta).toBeInTheDocument();
    expect(heroCta).toHaveAttribute('href', '/dashboard/lessons');

    // Footer
    const footerLogin = screen.getByRole('link', { name: 'লগইন ও অ্যাকাউন্ট' });
    expect(footerLogin).toBeInTheDocument();
    expect(footerLogin).toHaveAttribute('href', '/login');
  });

  it('renders dashboard, user profile, and logout buttons when user is logged in', () => {
    mockAuthState = {
      user: {
        id: 'user-123',
        email: 'joy@example.com',
        user_metadata: {
          display_name: 'জয় সরকার',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
      loading: false,
      signOut: mockSignOut,
    };

    render(<Home />);

    // Top navbar should NOT show login or signup
    expect(screen.queryByRole('link', { name: 'লগইন' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'সাইন আপ' })).not.toBeInTheDocument();

    // Top navbar should show Dashboard button
    const dashboardButtons = screen.getAllByRole('link', { name: /ড্যাশবোর্ড/i });
    expect(dashboardButtons.length).toBeGreaterThanOrEqual(1);
    expect(dashboardButtons.some(b => b.getAttribute('href') === '/dashboard')).toBe(true);

    // Profile link with display name
    const profileLink = screen.getByRole('link', { name: /জয় সরকার/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/dashboard/profile');

    // Logout button
    const logoutButton = screen.getByRole('button', { name: /লগআউট/i });
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);
    expect(mockSignOut).toHaveBeenCalledTimes(1);

    // Hero CTA updated to practice dashboard
    const heroCta = screen.getByRole('link', { name: /অনুশীলন ড্যাশবোর্ডে যান/i });
    expect(heroCta).toBeInTheDocument();
    expect(heroCta).toHaveAttribute('href', '/dashboard');

    // Bottom CTA updated
    const bottomCta = screen.getByRole('link', { name: /আপনার ড্যাশবোর্ডে যান/i });
    expect(bottomCta).toBeInTheDocument();
    expect(bottomCta).toHaveAttribute('href', '/dashboard');

    // Footer updated
    const footerProfile = screen.getByRole('link', { name: 'ড্যাশবোর্ড ও প্রোফাইল' });
    expect(footerProfile).toBeInTheDocument();
    expect(footerProfile).toHaveAttribute('href', '/dashboard');
  });

  it('renders skeleton loading placeholder without flashing login/signup when loading is true', () => {
    mockAuthState = {
      user: null,
      loading: true,
      signOut: mockSignOut,
    };

    const { container } = render(<Home />);

    expect(screen.queryByRole('link', { name: 'লগইন' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'সাইন আপ' })).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
