import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { PRESET_COLORS } from 'shared/constants/ColorConstants';

import styles from './satellites.module.scss';

/**
 * Props for ColorPaletteSatellite component.
 */
type ColorPaletteSatelliteProps = Record<string, never>;

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
export const ColorPaletteSatellite: React.FC<ColorPaletteSatelliteProps> = () => {
  const { preferences, updateStrokeColor } = useToolPreferences();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Use first 18 colors from PRESET_COLORS (Material Design palette)
  const paletteColors = PRESET_COLORS.slice(0, 18);

  // Check if current color is a preset color
  const isPresetColor = paletteColors.includes(
    preferences.defaultStrokeColor as (typeof paletteColors)[number],
  );

  const handleColorSelect = useCallback(
    async (color: string) => {
      try {
        await updateStrokeColor(color);
      } catch {
        // Error handling is managed by useToolPreferences
      }
    },
    [updateStrokeColor],
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

  // Track when user starts dragging in the color picker
  const handlePointerDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Close custom picker section when user finishes selecting from saturation area
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const target = e.target as HTMLElement;
      const isSaturationArea = target.closest('.react-colorful__saturation');

      setIsDragging(false);
      if (isSaturationArea) {
        setShowCustomPicker(false);
      }
    },
    [isDragging],
  );

  // Handle global pointer up for when drag ends outside the picker (works for both mouse and touch)
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalPointerUp = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const isSaturationArea = target.closest('.react-colorful__saturation');

      setIsDragging(false);
      if (isSaturationArea) {
        setShowCustomPicker(false);
      }
    };

    document.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      document.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging]);

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
          style={{
            backgroundColor: !isPresetColor ? preferences.defaultStrokeColor : 'transparent',
          }}
        />
        <span className={styles.customColorLabel}>Custom</span>
        {showCustomPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expandable custom color picker */}
      {showCustomPicker && (
        <div className={styles.customPickerSection}>
          <div
            ref={pickerRef}
            className={styles.customPickerWrapper}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            role="group"
            aria-label="Custom color picker"
          >
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
