import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { PRESET_COLORS } from 'shared/constants/ColorConstants';

import styles from './satellites.module.scss';

/**
 * Props for ColorPaletteSatellite component.
 */
interface ColorPaletteSatelliteProps {
  /** Whether device is mobile */
  isMobile: boolean;
  /** Handler to collapse the toolbar (mobile only) */
  onCollapse: () => void;
}

/**
 * ColorPaletteSatellite component - Interactive color picker for stroke colors.
 *
 * Features:
 * - 18 preset Material Design colors in 6×3 grid
 * - Expandable custom color picker section
 * - Circular color buttons with visible color swatches
 * - Visual active border for currently selected color
 * - Auto-collapses toolbar on mobile after selection
 * - Syncs with global tool preferences
 * - Compact, centered design matching other satellites
 *
 * Phase 3D Implementation
 */
export const ColorPaletteSatellite: React.FC<ColorPaletteSatelliteProps> = ({
  isMobile,
  onCollapse,
}) => {
  const { preferences, updateStrokeColor } = useToolPreferences();
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Use first 18 colors from PRESET_COLORS (Material Design palette)
  const paletteColors = PRESET_COLORS.slice(0, 18);

  // Check if current color is a preset color
  const isPresetColor = paletteColors.includes(preferences.defaultStrokeColor as typeof paletteColors[number]);

  const handleColorSelect = useCallback(
    async (color: string) => {
      try {
        await updateStrokeColor(color);
        // Auto-collapse toolbar on mobile after preset color selection
        if (isMobile) {
          onCollapse();
        }
      } catch {
        // Error handling is managed by useToolPreferences
      }
    },
    [updateStrokeColor, isMobile, onCollapse],
  );

  const handleCustomColorChange = useCallback(
    async (color: string) => {
      try {
        await updateStrokeColor(color);
      } catch {
        // Error handling is managed by useToolPreferences
      }
    },
    [updateStrokeColor],
  );

  const toggleCustomPicker = useCallback(() => {
    setShowCustomPicker((prev) => !prev);
  }, []);

  return (
    <div className={styles.satelliteContent}>
      <div className={styles.satelliteHeader}>Color Palette</div>

      <div className={styles.colorGrid}>
        {paletteColors.map((color, index) => {
          const isActive = preferences.defaultStrokeColor === color;
          return (
            <button
              key={`${color}-${index}`}
              className={`${styles.colorButton} ${isActive ? styles.active : ''}`}
              onClick={() => handleColorSelect(color)}
              style={{ backgroundColor: color }}
              title={color}
              aria-label={`Select color ${color}`}
              aria-pressed={isActive}
            >
              <span className={styles.srOnly}>{color}</span>
            </button>
          );
        })}
      </div>

      {/* Custom color toggle button */}
      <button
        className={`${styles.customColorToggle} ${showCustomPicker ? styles.expanded : ''} ${!isPresetColor ? styles.hasCustomColor : ''}`}
        onClick={toggleCustomPicker}
        aria-expanded={showCustomPicker}
        aria-label={showCustomPicker ? 'Hide custom color picker' : 'Show custom color picker'}
      >
        <span
          className={styles.customColorPreview}
          style={{ backgroundColor: !isPresetColor ? preferences.defaultStrokeColor : 'transparent' }}
        />
        <span className={styles.customColorLabel}>Custom</span>
        {showCustomPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expandable custom color picker */}
      {showCustomPicker && (
        <div className={styles.customPickerSection}>
          <div className={styles.customPickerWrapper}>
            <HexColorPicker
              color={preferences.defaultStrokeColor}
              onChange={handleCustomColorChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
