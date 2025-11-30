import { useToolPreferences } from 'features/settings/ToolPreferencesProvider';
import React, { useCallback } from 'react';
import { PRESET_COLORS } from 'shared/constants/ColorConstants';

import styles from './satellites.module.scss';

/**
 * ColorPaletteSatellite component - Interactive color picker for stroke colors.
 * 
 * Features:
 * - 18 preset Material Design colors in 6×3 grid
 * - Circular color buttons with visible color swatches
 * - Visual active border for currently selected color
 * - Does NOT auto-close (allows multiple color changes)
 * - Syncs with global tool preferences
 * - Compact, centered design matching other satellites
 * 
 * Phase 3D Implementation
 */
export const ColorPaletteSatellite: React.FC = () => {
    const { preferences, updateStrokeColor } = useToolPreferences();

    // Use first 18 colors from PRESET_COLORS (Material Design palette)
    const paletteColors = PRESET_COLORS.slice(0, 18);

    const handleColorSelect = useCallback(
        async (color: string) => {
            try {
                await updateStrokeColor(color);
                // No onClose() - satellite stays open for multiple color changes
            } catch {
                // Error handling is managed by useToolPreferences
                // Errors are displayed via the preferences context error state
            }
        },
        [updateStrokeColor],
    );

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
        </div>
    );
};
