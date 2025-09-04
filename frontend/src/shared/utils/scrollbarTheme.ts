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
 * Applies scrollbar color theme by updating CSS custom properties on the document element.
 * Sets appropriate colors for scrollbar components to match the overall application theme.
 * Used when theme changes occur to maintain visual consistency.
 * 
 * @param {Theme} theme - The theme to apply ('light' or 'dark')
 */
export const applyScrollbarTheme = (theme: Theme): void => {
  const colors = SCROLLBAR_THEMES[theme];
  const documentElement = document.documentElement;

  documentElement.style.setProperty('--scrollbar-track-bg', colors.track);
  documentElement.style.setProperty('--scrollbar-thumb-bg', colors.thumb);
  documentElement.style.setProperty('--scrollbar-thumb-hover-bg', colors.thumbHover);
  documentElement.style.setProperty('--scrollbar-corner-bg', colors.corner);
};

/**
 * Initializes the scrollbar theme based on the current document theme attribute.
 * Reads the data-theme attribute from document body and applies the corresponding
 * scrollbar styling. Falls back to light theme if no valid theme is detected.
 * Called during application initialization.
 */
export const setupScrollbarThemeManager = (): void => {
  const currentTheme = document.body.getAttribute('data-theme') as Theme;
  if (currentTheme && (currentTheme === 'light' || currentTheme === 'dark')) {
    applyScrollbarTheme(currentTheme);
  } else {
    applyScrollbarTheme('light');
  }
};
