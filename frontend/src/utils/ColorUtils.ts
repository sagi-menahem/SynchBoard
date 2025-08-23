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