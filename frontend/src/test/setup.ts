import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Unmount anything React Testing Library rendered so state cannot leak between tests.
afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.dir = '';
  vi.useRealTimers();
});

// jsdom does not implement matchMedia, which useMediaQuery relies on.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) satisfies MediaQueryList;
}
