/**
 * Converts a hexadecimal color string to RGB values.
 * Supports both 3-digit shorthand (#FFF) and 6-digit full format (#FFFFFF).
 *
 * @param {string} hex - Hex color string with or without # prefix
 * @returns {{ r: number; g: number; b: number } | null} RGB object or null if invalid
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
  if (!result) {
    return null;
  }

  let r, g, b;
  // Handle 3-digit hex shorthand by duplicating each digit (#ABC -> #AABBCC)
  if (hex.length === 4) {
    // Length 4 includes the # prefix for 3-digit hex
    r = parseInt(result[1] + result[1], 16); // A -> AA
    g = parseInt(result[2] + result[2], 16); // B -> BB
    b = parseInt(result[3] + result[3], 16); // C -> CC
  } else {
    // 6-digit format like #AABBCC
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
  }

  return { r, g, b };
};

/**
 * Calculates the Euclidean distance between two RGB colors in color space.
 * Used to find the closest matching color from a predefined palette.
 *
 * @param {Object} color1 - First RGB color object
 * @param {Object} color2 - Second RGB color object
 * @returns {number} Distance value (lower means more similar colors)
 */
const getColorDistance = (
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
): number => {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2),
  );
};

/**
 * Maps a hexadecimal color to a semantic color name for internationalization and accessibility.
 * First attempts exact match, then finds the closest color from a predefined palette using
 * Euclidean distance in RGB space. Used for screen readers and UI color descriptions.
 *
 * @param {string} hexColor - Hex color string to identify
 * @returns {string | null} Semantic color name or null if unable to determine
 */
export const getColorName = (hexColor: string): string | null => {
  const colorMap: Record<string, string> = {
    '#FFFFFF': 'white',
    '#000000': 'black',
    '#F44336': 'red',
    '#E91E63': 'pink',
    '#9C27B0': 'purple',
    '#673AB7': 'deepPurple',
    '#3F51B5': 'indigo',
    '#2196F3': 'blue',
    '#00BCD4': 'cyan',
    '#009688': 'teal',
    '#4CAF50': 'green',
    '#8BC34A': 'limeGreen',
    '#CDDC39': 'lime',
    '#FFEB3B': 'yellow',
    '#FFC107': 'amber',
    '#FF9800': 'orange',
    '#FF5722': 'deepOrange2',
    '#795548': 'brownOrange',
    '#9E9E9E': 'darkGray',
    '#607D8B': 'charcoal',
    '#F8F8F8': 'lightGray',
    '#424242': 'veryDarkGray',
    '#E040FB': 'brightPurple',
    '#651FFF': 'brightDeepPurple',
    '#3D5AFE': 'brightBlue',
    '#2979FF': 'mediumBlue',
    '#00E5FF': 'brightCyan',
    '#1DE9B6': 'brightTeal',
    '#76FF03': 'neonGreen',
    '#C6FF00': 'brightNeonGreen',
    '#FFD600': 'gold',
    '#FF6F00': 'redOrange',
    '#DD2C00': 'veryDarkOrange',
    '#6D4C41': 'brownOrange',
    '#757575': 'charcoal',
    '#546E7A': 'charcoal',

    '#222222': 'almostBlack',
    '#222': 'almostBlack',
  };

  const upperHex = hexColor.toUpperCase();

  // Try exact match first
  if (colorMap[upperHex]) {
    return colorMap[upperHex];
  }

  // Fall back to closest color match using distance calculation
  const inputRgb = hexToRgb(hexColor);
  if (!inputRgb) {
    return null;
  }

  let closestColor = null;
  let minDistance = Infinity;

  for (const [hex, colorName] of Object.entries(colorMap)) {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      continue;
    }

    const distance = getColorDistance(inputRgb, rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }

  return closestColor;
};

/**
 * Converts a hex color to RGB values for CSS custom properties.
 * Supports both 3-digit (#FFF) and 6-digit (#FFFFFF) hex formats.
 *
 * @param hex - Hex color string (e.g., '#FFFFFF' or '#FFF')
 * @returns RGB values as comma-separated string (e.g., '255, 255, 255')
 *
 * @example
 * ```typescript
 * hexToRgbString('#FFFFFF') // Returns '255, 255, 255'
 * hexToRgbString('#FFF')    // Returns '255, 255, 255'
 * hexToRgbString('#282828') // Returns '40, 40, 40'
 * ```
 */
export const hexToRgbString = (hex: string): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Handle 3-digit hex by expanding to 6-digit format
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
};

/**
 * Calculates the relative luminance of a color according to WCAG 2.0 specification.
 * Used to determine appropriate text color (light/dark) for contrast requirements.
 *
 * @param hex - Hex color string (e.g., '#FFFFFF' or '#FFF')
 * @returns Relative luminance value between 0 (darkest) and 1 (lightest)
 *
 * @example
 * ```typescript
 * calculateLuminance('#FFFFFF') // Returns ~1.0 (very light)
 * calculateLuminance('#000000') // Returns 0.0 (very dark)
 * calculateLuminance('#282828') // Returns ~0.02 (dark)
 * ```
 */
export const calculateLuminance = (hex: string): number => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Handle 3-digit hex by expanding to 6-digit format
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16) / 255;
  const g = parseInt(fullHex.substring(2, 4), 16) / 255;
  const b = parseInt(fullHex.substring(4, 6), 16) / 255;

  // Apply sRGB gamma correction
  const sRGB = [r, g, b].map((channel) => {
    if (channel <= 0.03928) {
      return channel / 12.92;
    }
    return Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance using WCAG formula
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};
