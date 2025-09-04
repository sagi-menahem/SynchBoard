/**
 * Color palette constants for the SynchBoard drawing application.
 * Provides a curated collection of preset colors optimized for digital drawing and design.
 * Colors are ordered to provide good visual contrast and include both neutral tones
 * and vibrant colors from Google's Material Design color palette.
 */

export const PRESET_COLORS = [
  '#FFFFFF',
  '#000000',
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#9E9E9E',
  '#607D8B',
  '#F8F8F8',
  '#424242',
  '#E040FB',
  '#651FFF',
  '#3D5AFE',
  '#2979FF',
  '#00E5FF',
  '#1DE9B6',
  '#76FF03',
  '#C6FF00',
  '#FFD600',
  '#FF6F00',
  '#DD2C00',
  '#6D4C41',
  '#757575',
  '#546E7A',
] as const;

export type PresetColor = (typeof PRESET_COLORS)[number];
