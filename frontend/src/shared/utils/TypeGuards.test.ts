import { describe, expect, it } from 'vitest';

import { isBackendError } from './TypeGuards';

describe('isBackendError', () => {
  it('accepts a well-formed backend error body', () => {
    expect(isBackendError({ message: 'Board not found' })).toBe(true);
  });

  it('accepts an error body carrying extra fields', () => {
    expect(isBackendError({ message: 'Forbidden', status: 403 })).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a bare string', 'Board not found'],
    ['a number', 500],
    ['an array', ['Board not found']],
    ['an object with no message', { error: 'oops' }],
    ['a non-string message', { message: 42 }],
    ['an empty message', { message: '' }],
    ['a whitespace-only message', { message: '   ' }],
  ])('rejects %s', (_label, value) => {
    expect(isBackendError(value)).toBe(false);
  });

  it('accepts a message at the 500 character limit', () => {
    expect(isBackendError({ message: 'x'.repeat(500) })).toBe(true);
  });

  it('rejects a message over the 500 character limit', () => {
    expect(isBackendError({ message: 'x'.repeat(501) })).toBe(false);
  });
});
