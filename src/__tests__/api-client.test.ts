import { apiFetch, authHeaders } from '@/lib/api-client';
import { supabase } from '@/lib/db';
import { SUPABASE_AUTH_HEADER } from '@/lib/auth-header';

jest.mock('@/lib/db', () => ({
  supabase: { auth: { getSession: jest.fn() } },
}));

const getSession = supabase.auth.getSession as jest.Mock;

describe('authHeaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the session access token under the agreed header name', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'abc123' } } });

    await expect(authHeaders()).resolves.toEqual({ [SUPABASE_AUTH_HEADER]: 'abc123' });
  });

  it('returns an empty token when there is no session', async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    await expect(authHeaders()).resolves.toEqual({ [SUPABASE_AUTH_HEADER]: '' });
  });
});

describe('apiFetch', () => {
  // jsdom ships no fetch, so install a stub for the duration of the suite
  let fetchSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    (globalThis as unknown as { fetch: jest.Mock }).fetch = fetchSpy;
  });

  afterEach(() => {
    delete (globalThis as unknown as { fetch?: jest.Mock }).fetch;
  });

  it('attaches the token to a plain GET', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'abc123' } } });

    await apiFetch('/api/user-statistics/user-1');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/user-statistics/user-1');
    expect((init.headers as Headers).get(SUPABASE_AUTH_HEADER)).toBe('abc123');
  });

  it('preserves headers the caller passed in', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'abc123' } } });

    await apiFetch('/api/user-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = init.headers as Headers;

    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get(SUPABASE_AUTH_HEADER)).toBe('abc123');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{}');
  });

  it('accepts an existing Headers instance', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'abc123' } } });

    await apiFetch('/api/custom-drills', { headers: new Headers({ Accept: 'application/json' }) });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = init.headers as Headers;

    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get(SUPABASE_AUTH_HEADER)).toBe('abc123');
  });
});
