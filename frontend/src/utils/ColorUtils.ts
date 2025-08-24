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

export const getColorName = (hexColor: string): string | null => {
  const colorMap: Record<string, string> = {
    // Whites and Grays
    '#FFFFFF': 'white',
    '#F8F8F8': 'lightGray',
    '#E0E0E0': 'gray',
    '#BDBDBD': 'mediumGray',
    '#9E9E9E': 'darkGray',
    '#757575': 'charcoal',
    '#616161': 'darkCharcoal',
    '#424242': 'veryDarkGray',
    '#2F2F2F': 'almostBlack',
    '#000000': 'black',
    
    // Reds
    '#D32F2F': 'darkRed',
    '#F44336': 'red',
    '#FF5252': 'lightRed',
    '#E91E63': 'pink',
    '#FF4081': 'lightPink',
    '#F50057': 'magenta',
    
    // Purples
    '#9C27B0': 'purple',
    '#BA68C8': 'lightPurple',
    '#E040FB': 'brightPurple',
    '#7B1FA2': 'darkPurple',
    '#AA00FF': 'violet',
    '#D500F9': 'brightViolet',
    
    // Deep Purples
    '#673AB7': 'deepPurple',
    '#7E57C2': 'lightDeepPurple',
    '#B388FF': 'paleDeepPurple',
    '#512DA8': 'darkDeepPurple',
    '#651FFF': 'brightDeepPurple',
    '#7C4DFF': 'lightBrightDeepPurple',
    
    // Blues
    '#3F51B5': 'indigo',
    '#5C6BC0': 'lightIndigo',
    '#536DFE': 'brightIndigo',
    '#303F9F': 'darkIndigo',
    '#3D5AFE': 'brightBlue',
    '#448AFF': 'lightBrightBlue',
    '#2196F3': 'blue',
    '#42A5F5': 'lightBlue',
    '#2979FF': 'mediumBlue',
    '#1976D2': 'darkBlue',
    '#2962FF': 'royalBlue',
    '#0091EA': 'deepBlue',
    
    // Cyans
    '#00BCD4': 'cyan',
    '#26C6DA': 'lightCyan',
    '#00E5FF': 'brightCyan',
    '#0097A7': 'darkCyan',
    '#00B8D4': 'mediumCyan',
    
    // Teals
    '#009688': 'teal',
    '#26A69A': 'lightTeal',
    '#1DE9B6': 'brightTeal',
    '#00897B': 'darkTeal',
    '#00BFA5': 'mediumTeal',
    '#00E676': 'brightGreen',
    
    // Greens
    '#4CAF50': 'green',
    '#66BB6A': 'lightGreen',
    '#69F0AE': 'paleGreen',
    '#388E3C': 'darkGreen',
    '#00C853': 'brightGreen2',
    
    // Light Greens
    '#8BC34A': 'limeGreen',
    '#9CCC65': 'lightLimeGreen',
    '#B2FF59': 'brightLimeGreen',
    '#689F38': 'darkLimeGreen',
    '#76FF03': 'neonGreen',
    '#C6FF00': 'brightNeonGreen',
    
    // Lime
    '#CDDC39': 'lime',
    '#D4E157': 'lightLime',
    '#EEFF41': 'brightLime',
    '#AFB42B': 'darkLime',
    '#AEEA00': 'neonLime',
    
    // Yellows
    '#FFEB3B': 'yellow',
    '#FFF176': 'lightYellow',
    '#FFFF00': 'brightYellow',
    '#FBC02D': 'darkYellow',
    '#FFD600': 'gold',
    
    // Ambers
    '#FFC107': 'amber',
    '#FFD54F': 'lightAmber',
    '#FFC400': 'brightAmber',
    '#FFA000': 'darkAmber',
    '#FFAB00': 'deepAmber',
    
    // Oranges
    '#FF9800': 'orange',
    '#FFB74D': 'lightOrange',
    '#FF9100': 'brightOrange',
    '#F57C00': 'darkOrange',
    '#FF6D00': 'deepOrange',
    '#FF6F00': 'redOrange',
    
    // Deep Oranges / Reds
    '#FF5722': 'deepOrange2',
    '#FF8A65': 'lightDeepOrange',
    '#FF3D00': 'brightDeepOrange',
    '#E64A19': 'darkDeepOrange',
    '#DD2C00': 'veryDarkOrange',
    '#BF360C': 'brownOrange',
  };

  const upperHex = hexColor.toUpperCase();
  return colorMap[upperHex] || null;
};