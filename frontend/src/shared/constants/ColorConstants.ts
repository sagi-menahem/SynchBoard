/**
 * Color palette constants for the SynchBoard drawing application.
 * Provides a curated collection of preset colors optimized for digital drawing and design.
 * Colors are ordered to provide good visual contrast and include both neutral tones
 * and vibrant colors from Google's Material Design color palette.
 */

export const PRESET_COLORS = [
  // Row 1: Black, white, and reds/pinks
  '#FFFFFF',
  '#000000',
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#00BCD4',
  // Row 2: Greens, yellows, oranges
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  // Row 3: Grays and accent colors
  '#9E9E9E',
  '#607D8B',
  '#424242',
  '#E040FB',
  '#651FFF',
  '#00E5FF',
  '#1DE9B6',
  '#76FF03',
  '#FFD600',
] as const;

export type PresetColor = (typeof PRESET_COLORS)[number];
