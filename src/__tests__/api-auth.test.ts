import { authenticate, isOwnResource } from '@/lib/api-auth';
import { SUPABASE_AUTH_HEADER } from '@/lib/auth-header';
import type { NextRequest } from 'next/server';

const mockGetUser = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ auth: { getUser: mockGetUser } })),
}));

function requestWith(token?: string): NextRequest {
  const headers = new Headers();
  if (token) headers.set(SUPABASE_AUTH_HEADER, token);
  return { headers } as unknown as NextRequest;
}

const OWNER_ID = 'user-1';

describe('authenticate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects a request that carries no token, without calling Supabase', async () => {
    await expect(authenticate(requestWith())).resolves.toBeNull();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('rejects a token Supabase does not recognise', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid jwt') });

    await expect(authenticate(requestWith('forged'))).resolves.toBeNull();
  });

  it('rejects a token that resolves to no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(authenticate(requestWith('expired'))).resolves.toBeNull();
  });

  it('returns the verified user alongside the token for the data layer', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: OWNER_ID } }, error: null });

    const auth = await authenticate(requestWith('token-abc'));

    expect(auth).toEqual({ user: { id: OWNER_ID }, accessToken: 'token-abc' });
    expect(mockGetUser).toHaveBeenCalledWith('token-abc');
  });
});

describe('isOwnResource', () => {
  const caller = { id: OWNER_ID } as never;

  it('accepts the caller\'s own id', () => {
    expect(isOwnResource(caller, OWNER_ID)).toBe(true);
  });

  it('rejects somebody else\'s id', () => {
    expect(isOwnResource(caller, 'user-2')).toBe(false);
  });

  it('rejects a missing id', () => {
    expect(isOwnResource(caller, null)).toBe(false);
    expect(isOwnResource(caller, undefined)).toBe(false);
    expect(isOwnResource(caller, '')).toBe(false);
  });
});
