import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  decodeToken,
  getToken,
  getTokenExpiry,
  getUserEmailFromToken,
  isTokenValid,
  removeToken,
  setToken,
  shouldRefreshToken,
} from './authUtils';

// Fixed clock so expiry maths is deterministic rather than relative to wall time.
const NOW_SECONDS = 1_800_000_000;

/**
 * Builds a structurally valid JWT. Only the payload matters here — jwt-decode
 * does not verify signatures, which is exactly why the backend must.
 */
const makeToken = (payload: Record<string, unknown>): string => {
  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
};

const validToken = makeToken({
  sub: 'user@synchboard.com',
  exp: NOW_SECONDS + 3600,
  iat: NOW_SECONDS,
});

const expiredToken = makeToken({
  sub: 'user@synchboard.com',
  exp: NOW_SECONDS - 60,
  iat: NOW_SECONDS - 3660,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW_SECONDS * 1000);
  // decodeToken logs on malformed input; keep the test output readable.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('token storage', () => {
  it('round-trips a token through localStorage', () => {
    expect(getToken()).toBeNull();

    setToken(validToken);
    expect(getToken()).toBe(validToken);

    removeToken();
    expect(getToken()).toBeNull();
  });
});

describe('decodeToken', () => {
  it('decodes the payload of a well-formed token', () => {
    expect(decodeToken(validToken)).toEqual({
      sub: 'user@synchboard.com',
      exp: NOW_SECONDS + 3600,
      iat: NOW_SECONDS,
    });
  });

  it('falls back to the stored token when no argument is given', () => {
    setToken(validToken);
    expect(decodeToken()?.sub).toBe('user@synchboard.com');
  });

  it('returns null for a malformed token instead of throwing', () => {
    expect(decodeToken('not-a-jwt')).toBeNull();
  });

  it('returns null when there is no token at all', () => {
    expect(decodeToken()).toBeNull();
  });
});

describe('isTokenValid', () => {
  it('accepts a token whose exp is in the future', () => {
    expect(isTokenValid(validToken)).toBe(true);
  });

  it('rejects a token whose exp has passed', () => {
    expect(isTokenValid(expiredToken)).toBe(false);
  });

  it('rejects a token expiring exactly now — exp must be strictly ahead', () => {
    expect(isTokenValid(makeToken({ sub: 'a@b.com', exp: NOW_SECONDS, iat: 0 }))).toBe(false);
  });

  it('rejects a malformed token', () => {
    expect(isTokenValid('garbage')).toBe(false);
  });

  it('rejects when nothing is stored', () => {
    expect(isTokenValid()).toBe(false);
  });

  it('validates the stored token when called with no argument', () => {
    setToken(expiredToken);
    expect(isTokenValid()).toBe(false);

    setToken(validToken);
    expect(isTokenValid()).toBe(true);
  });
});

describe('claim extraction', () => {
  it('reads the expiry timestamp', () => {
    expect(getTokenExpiry(validToken)).toBe(NOW_SECONDS + 3600);
  });

  it('reads the user email from the sub claim', () => {
    expect(getUserEmailFromToken(validToken)).toBe('user@synchboard.com');
  });

  it('returns null for both when the token cannot be decoded', () => {
    expect(getTokenExpiry('garbage')).toBeNull();
    expect(getUserEmailFromToken('garbage')).toBeNull();
  });
});

describe('shouldRefreshToken', () => {
  it('does not refresh a token with plenty of life left', () => {
    expect(shouldRefreshToken(validToken)).toBe(false);
  });

  it('refreshes inside the 5 minute window', () => {
    const soon = makeToken({ sub: 'a@b.com', exp: NOW_SECONDS + 120, iat: 0 });
    expect(shouldRefreshToken(soon)).toBe(true);
  });

  it('does not refresh at exactly 300 seconds out — the window is exclusive', () => {
    const boundary = makeToken({ sub: 'a@b.com', exp: NOW_SECONDS + 300, iat: 0 });
    expect(shouldRefreshToken(boundary)).toBe(false);
  });

  it('refreshes one second inside the boundary', () => {
    const boundary = makeToken({ sub: 'a@b.com', exp: NOW_SECONDS + 299, iat: 0 });
    expect(shouldRefreshToken(boundary)).toBe(true);
  });

  it('does not refresh an already-expired token — that is a re-login, not a refresh', () => {
    expect(shouldRefreshToken(expiredToken)).toBe(false);
  });

  it('does not refresh when there is no token', () => {
    expect(shouldRefreshToken()).toBe(false);
  });
});
