import { ArrowLeft, ArrowRight } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { getBackArrowIcon, getNavigationArrowIcon, isRTL } from './rtlUtils';

describe('isRTL', () => {
  it.each(['he', 'ar', 'fa', 'ur'])('treats %s as RTL', (lang) => {
    expect(isRTL(lang)).toBe(true);
  });

  it.each(['en', 'fr', 'ru', ''])('treats %s as LTR', (lang) => {
    expect(isRTL(lang)).toBe(false);
  });

  it('does not match region-suffixed codes — the app stores bare codes', () => {
    expect(isRTL('he-IL')).toBe(false);
  });
});

describe('getNavigationArrowIcon', () => {
  it('points left when the document is RTL', () => {
    document.documentElement.dir = 'rtl';
    expect(getNavigationArrowIcon()).toBe(ArrowLeft);
  });

  it('points right when the document is LTR', () => {
    document.documentElement.dir = 'ltr';
    expect(getNavigationArrowIcon()).toBe(ArrowRight);
  });

  it('points right when dir is unset', () => {
    expect(getNavigationArrowIcon()).toBe(ArrowRight);
  });
});

describe('getBackArrowIcon', () => {
  it('always points left, in both directions', () => {
    document.documentElement.dir = 'rtl';
    expect(getBackArrowIcon()).toBe(ArrowLeft);

    document.documentElement.dir = 'ltr';
    expect(getBackArrowIcon()).toBe(ArrowLeft);
  });
});
