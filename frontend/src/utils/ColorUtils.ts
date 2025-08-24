const CHAT_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#34495e',
  '#27ae60',
  '#8e44ad',
  '#16a085',
  '#2980b9',
  '#c0392b',
  '#d35400',
  '#7f8c8d',
  '#e91e63',
  '#ff5722',
  '#795548',
  '#607d8b',
  '#4caf50',
  '#00bcd4',
  '#ff9800',
  '#9c27b0',
  '#3f51b5',
  '#2196f3',
  '#009688',
  '#8bc34a',
  '#cddc39',
  '#ffc107',
  '#ff6f00',
] as const;

export type UserColorMap = Map<string, string>;

export const generateRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * CHAT_COLORS.length);
  return CHAT_COLORS[randomIndex];
};

export const getUserColor = (userEmail: string, colorMap: UserColorMap): string => {
  const existingColor = colorMap.get(userEmail);
  if (existingColor) {
    return existingColor;
  }
  
  const newColor = generateRandomColor();
  colorMap.set(userEmail, newColor);
  return newColor;
};

export const createUserColorMap = (): UserColorMap => {
  return new Map<string, string>();
};

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // Handle both 3-digit and 6-digit hex
  const result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(hex);
  if (!result) return null;
  
  let r, g, b;
  if (hex.length === 4) {
    // 3-digit hex
    r = parseInt(result[1] + result[1], 16);
    g = parseInt(result[2] + result[2], 16);
    b = parseInt(result[3] + result[3], 16);
  } else {
    // 6-digit hex
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
  }
  
  return { r, g, b };
};

// Helper function to calculate color distance
const getColorDistance = (color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number => {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
};

export const getColorName = (hexColor: string): string | null => {
  const colorMap: Record<string, string> = {
    // Preset colors from ColorPicker component
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
    
    // Additional common colors
    '#222222': 'almostBlack',
    '#222': 'almostBlack',
  };

  const upperHex = hexColor.toUpperCase();
  
  // Try exact match first
  if (colorMap[upperHex]) {
    return colorMap[upperHex];
  }
  
  // If no exact match, find the closest color
  const inputRgb = hexToRgb(hexColor);
  if (!inputRgb) return null;
  
  let closestColor = null;
  let minDistance = Infinity;
  
  for (const [hex, colorName] of Object.entries(colorMap)) {
    const rgb = hexToRgb(hex);
    if (!rgb) continue;
    
    const distance = getColorDistance(inputRgb, rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }
  
  return closestColor;
};