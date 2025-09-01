/**
 * Scrollbar Theme Utility
 * 
 * Provides programmatic control over scrollbar theming to ensure
 * theme changes are immediately applied across all elements.
 * This serves as a backup/enhancement to the CSS-based approach.
 */

export type Theme = 'light' | 'dark';

interface ScrollbarColors {
  track: string;
  thumb: string;
  thumbHover: string;
  corner: string;
}

const SCROLLBAR_THEMES: Record<Theme, ScrollbarColors> = {
  light: {
    track: '#f1f5f9',
    thumb: '#94a3b8',
    thumbHover: '#64748b',
    corner: '#f1f5f9',
  },
  dark: {
    track: '#1a1a1a',
    thumb: '#404040',
    thumbHover: '#525252',
    corner: '#1a1a1a',
  },
};

/**
 * Apply scrollbar theme by updating CSS custom properties
 * This ensures immediate theme application without waiting for CSS cascade
 */
export const applyScrollbarTheme = (theme: Theme): void => {
  const colors = SCROLLBAR_THEMES[theme];
  const documentElement = document.documentElement;
  
  // Update CSS custom properties on :root
  documentElement.style.setProperty('--scrollbar-track-bg', colors.track);
  documentElement.style.setProperty('--scrollbar-thumb-bg', colors.thumb);
  documentElement.style.setProperty('--scrollbar-thumb-hover-bg', colors.thumbHover);
  documentElement.style.setProperty('--scrollbar-corner-bg', colors.corner);
  
  // Force style recalculation to ensure immediate application
  // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
  document.body.offsetHeight;
};

/**
 * Initialize scrollbar theming on page load
 * Reads the current theme from body data-theme attribute
 */
export const initializeScrollbarTheme = (): void => {
  const currentTheme = document.body.getAttribute('data-theme') as Theme;
  if (currentTheme && (currentTheme === 'light' || currentTheme === 'dark')) {
    applyScrollbarTheme(currentTheme);
  } else {
    // Default to light theme if no theme is set
    applyScrollbarTheme('light');
  }
};

/**
 * Create a MutationObserver to watch for theme changes on the body element
 * This ensures scrollbar theme stays in sync with app theme
 */
export const createScrollbarThemeObserver = (): MutationObserver => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = (mutation.target as HTMLElement).getAttribute('data-theme') as Theme;
        if (newTheme && (newTheme === 'light' || newTheme === 'dark')) {
          applyScrollbarTheme(newTheme);
        }
      }
    });
  });
  
  // Start observing body element for data-theme changes
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  
  return observer;
};

/**
 * Comprehensive scrollbar theme manager
 * Call this once in your app initialization to set up automatic theme sync
 */
export const setupScrollbarThemeManager = (): () => void => {
  // Apply initial theme
  initializeScrollbarTheme();
  
  // Set up automatic theme change detection
  const observer = createScrollbarThemeObserver();
  
  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};