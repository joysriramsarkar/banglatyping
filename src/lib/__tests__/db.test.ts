import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the @supabase/supabase-js module
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      // Mock the client return value as needed
      auth: {},
      from: vi.fn(),
    })),
  };
});

describe('Database Client (src/lib/db.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure a fresh import of src/lib/db.ts in each test
    vi.resetModules();

    // Set up mock environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_KEY: 'test-service-key',
    };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('getSupabase should initialize client once with correct env vars', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { getSupabase } = await import('../db');

    // First call should initialize the client
    const client1 = getSupabase();

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith(
      'https://test-project.supabase.co',
      'test-anon-key'
    );

    // Second call should return the exact same instance (singleton)
    const client2 = getSupabase();

    expect(client1).toBe(client2);
    expect(createClient).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it('getSupabaseAdmin should initialize admin client once with correct env vars', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { getSupabaseAdmin } = await import('../db');

    // First call should initialize the admin client
    const adminClient1 = getSupabaseAdmin();

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith(
      'https://test-project.supabase.co',
      'test-service-key'
    );

    // Second call should return the same instance
    const adminClient2 = getSupabaseAdmin();

    expect(adminClient1).toBe(adminClient2);
    expect(createClient).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should initialize both clients correctly and independently', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { getSupabase, getSupabaseAdmin } = await import('../db');

    const client = getSupabase();
    const adminClient = getSupabaseAdmin();

    expect(client).not.toBe(adminClient);
    expect(createClient).toHaveBeenCalledTimes(2);

    // Check arguments of first and second call
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      'https://test-project.supabase.co',
      'test-anon-key'
    );
    expect(createClient).toHaveBeenNthCalledWith(
      2,
      'https://test-project.supabase.co',
      'test-service-key'
    );
  });
});
