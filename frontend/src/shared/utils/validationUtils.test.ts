import { describe, expect, it } from 'vitest';

import { validateEmail } from './validationUtils';

describe('validateEmail', () => {
  it.each([
    'user@synchboard.com',
    'first.last@example.co.il',
    'user+tag@example.com',
    'UPPER@EXAMPLE.COM',
  ])('accepts %s', (email) => {
    expect(validateEmail(email)).toBe(true);
  });

  it.each([
    ['empty string', ''],
    ['no @', 'userexample.com'],
    ['no domain dot', 'user@example'],
    ['nothing before @', '@example.com'],
    ['nothing after @', 'user@'],
    ['two @', 'a@b@example.com'],
    ['internal whitespace', 'user name@example.com'],
  ])('rejects %s', (_label, email) => {
    expect(validateEmail(email)).toBe(false);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(validateEmail('  user@synchboard.com  ')).toBe(true);
  });

  it('rejects null and undefined arriving from untyped call sites', () => {
    expect(validateEmail(null as unknown as string)).toBe(false);
    expect(validateEmail(undefined as unknown as string)).toBe(false);
  });
});
