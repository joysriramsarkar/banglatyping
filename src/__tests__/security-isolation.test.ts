/**
 * Security, Authentication & Multi-User Isolation Tests
 *
 * Verifies that:
 * 1. Database client creation strictly enforces privilege boundaries (never leaks admin client).
 * 2. Route authentication accurately validates bearer tokens.
 * 3. Resource ownership checks prevent cross-user data access (User A vs User B).
 * 4. Token presence / absence behaves predictably for RLS.
 */

import {
  createRequestClient,
  getSupabaseAdmin,
  resetSupabaseClientsForTesting,
} from '../lib/db';
import { authenticate, isOwnResource } from '../lib/api-auth';
import { SUPABASE_AUTH_HEADER } from '../lib/auth-header';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const mockGetUser = jest.fn();

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn((url: string, key: string, options?: any) => ({
      auth: {
        getUser: mockGetUser,
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      _url: url,
      _key: key,
      _options: options,
    })),
  };
});

function createMockRequest(url: string, headersRecord: Record<string, string> = {}): NextRequest {
  const headers = new Headers();
  for (const [k, v] of Object.entries(headersRecord)) {
    headers.set(k, v);
  }
  return {
    headers,
    nextUrl: new URL(url),
    json: async () => ({}),
  } as unknown as NextRequest;
}

describe('Database Client Security Boundaries', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    resetSupabaseClientsForTesting();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-123',
      SUPABASE_SERVICE_KEY: 'service-role-secret-key',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('createRequestClient(userToken) creates user-scoped client with Authorization header and does NOT use service role', () => {
    const userToken = 'user-a-access-token';
    const client = createRequestClient(userToken) as any;

    expect(client).toBeDefined();
    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'anon-key-123',
      expect.objectContaining({
        global: {
          headers: { Authorization: `Bearer ${userToken}` },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    );

    // Verify it used the anon key, not the privileged service key
    expect(client._key).toBe('anon-key-123');
    expect(client._key).not.toBe('service-role-secret-key');
  });

  test('createRequestClient(null) returns the public anonymous client, NOT the admin client', () => {
    const anonClient = createRequestClient(null) as any;
    expect(anonClient).toBeDefined();
    // Anon client must use anon key, not service key
    expect(anonClient._key).toBe('anon-key-123');
  });

  test('createRequestClient(undefined) returns the public anonymous client, NOT the admin client', () => {
    const anonClient = createRequestClient(undefined) as any;
    expect(anonClient).toBeDefined();
    expect(anonClient._key).toBe('anon-key-123');
  });

  test('getSupabaseAdmin explicitly uses the service role key for maintenance', () => {
    const admin = getSupabaseAdmin() as any;
    expect(admin).toBeDefined();
    expect(admin._key).toBe('service-role-secret-key');
  });
});

describe('API Authentication & Authorization Isolation (User A vs User B)', () => {
  const userA = { id: 'user-a-uuid-1111', email: 'usera@example.com' } as any;
  const userB = { id: 'user-b-uuid-2222', email: 'userb@example.com' } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('authenticate returns null when auth header is missing', async () => {
    const req = createMockRequest('http://localhost:3000/api/user-progress/stats');
    const result = await authenticate(req);
    expect(result).toBeNull();
  });

  test('authenticate returns null when token is invalid or user not found', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'JWT expired' },
    });

    const req = createMockRequest('http://localhost:3000/api/user-progress/stats', {
      [SUPABASE_AUTH_HEADER]: 'invalid-expired-token',
    });

    const result = await authenticate(req);
    expect(result).toBeNull();
  });

  test('authenticate returns user and accessToken when token is valid', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: userA },
      error: null,
    });

    const req = createMockRequest('http://localhost:3000/api/user-progress/stats', {
      [SUPABASE_AUTH_HEADER]: 'valid-user-token',
    });

    const result = await authenticate(req);
    expect(result).not.toBeNull();
    expect(result?.user.id).toBe(userA.id);
    expect(result?.accessToken).toBe('valid-user-token');
  });

  test('isOwnResource grants access only when user ID matches requested resource ID', () => {
    // User A accessing User A's data -> allowed
    expect(isOwnResource(userA, userA.id)).toBe(true);

    // User A accessing User B's data -> forbidden
    expect(isOwnResource(userA, userB.id)).toBe(false);

    // User A accessing undefined or null resource ID -> forbidden
    expect(isOwnResource(userA, null)).toBe(false);
    expect(isOwnResource(userA, undefined)).toBe(false);
    expect(isOwnResource(userA, '')).toBe(false);
  });
});
