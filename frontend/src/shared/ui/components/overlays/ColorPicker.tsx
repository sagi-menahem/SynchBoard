import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { HexColorPicker } from 'react-colorful';
import { useTranslation } from 'react-i18next';
import { PRESET_COLORS } from 'shared/constants/ColorConstants';
import { useClickOutside } from 'shared/hooks';
import Button from 'shared/ui/components/forms/Button';

import styles from './ColorPicker.module.scss';

/**
 * Props for the ColorPicker component.
 */
interface ColorPickerProps {
  color: string; // Current selected color in hex format
  onChange: (color: string) => void; // Callback when color selection changes
  disabled?: boolean; // Whether the color picker is disabled
  className?: string;
  label?: string; // Optional label text for accessibility
  id?: string; // HTML id attribute for the color picker
}

/**
 * Advanced color picker component with popover interface and preset colors.
 * Provides both a visual color wheel picker and quick-select preset colors for efficient color selection.
 * Features intelligent positioning to avoid viewport overflow and supports keyboard navigation.
 * 
 * @param {string} color - Current selected color in hex format
 * @param {function} onChange - Callback function called when color selection changes
 * @param {boolean} disabled - Whether the color picker is disabled and non-interactive
 * @param {string} className - Additional CSS classes to apply to the component
 * @param {string} label - Optional label text for accessibility and display
 * @param {string} id - HTML id attribute for the color picker button
 */
const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  disabled = false,
  className = '',
  label,
  id,
}) => {
  const { t } = useTranslation(['common']);
  const [showPicker, setShowPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  useClickOutside(
    pickerRef,
    () => {
      setShowPicker(false);
    },
    showPicker,
  );

  // Calculate optimal popover position to avoid viewport overflow - runs when popover opens
  useEffect(() => {
    if (showPicker && swatchRef.current) {
      const swatchRect = swatchRef.current.getBoundingClientRect();
      const popoverWidth = 250;
      const popoverHeight = 300;
      const margin = 8;

      let left = swatchRect.left;
      let top = swatchRect.bottom + margin;

      if (left + popoverWidth > window.innerWidth) {
        left = swatchRect.right - popoverWidth;
      }

      if (left < margin) {
        left = margin;
      }

      if (top + popoverHeight > window.innerHeight) {
        top = swatchRect.top - popoverHeight - margin;
      }

      if (top < margin) {
        top = margin;
      }

      setPopoverPosition({ top, left });
    }
  }, [showPicker]);

  const handleSwatchClick = useCallback(() => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  }, [disabled, showPicker]);

  const handleColorChange = useCallback(
    (color: string) => {
      onChange(color);
    },
    [onChange],
  );

  const handlePaletteColorClick = useCallback(
    (color: string) => {
      onChange(color);
    },
    [onChange],
  );

  // Track dragging state to close picker when color selection is complete
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Close picker when user finishes selecting from color wheel
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isSaturationArea = target.closest('.react-colorful__saturation');

    setIsDragging(false);
    if (isSaturationArea) {
      setShowPicker(false);
    }
  }, []);

  // Handle global mouse events to close picker after drag operations - manages drag state cleanup
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const target = e.target as HTMLElement;
        const isSaturationArea = target.closest('.react-colorful__saturation');

        setIsDragging(false);
        if (isSaturationArea) {
          setShowPicker(false);
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  // Memoized to avoid recalculating CSS classes when className prop hasn't changed
  const containerClasses = useMemo(
    () => `${styles.colorPickerContainer} ${className}`,
    [className],
  );

  // Memoized to avoid recalculating disabled state CSS classes on every render
  const swatchClasses = useMemo(
    () => `${styles.swatch} ${disabled ? styles.disabled : ''}`,
    [disabled],
  );

  // Memoized to avoid recalculating popover position styles when coordinates haven't changed
  const popoverStyle = useMemo(
    () => ({
      top: `${popoverPosition.top}px`,
      left: `${popoverPosition.left}px`,
    }),
    [popoverPosition.top, popoverPosition.left],
  );

  return (
    <div className={containerClasses}>
      {label && <label className={styles.label}>{label}</label>}
      <Button
        id={id}
        ref={swatchRef}
        type="button"
        variant="icon"
        className={swatchClasses}
        onClick={handleSwatchClick}
        disabled={disabled}
        aria-label={label ?? t('common:chooseColor')}
      >
        <div className={styles.colorFill} style={{ backgroundColor: color ?? '#FFFFFF' }} />
      </Button>

      {showPicker && !disabled && (
        <div ref={pickerRef} className={styles.popover} style={popoverStyle}>
          <div className={styles.colorfulWrapper}>
            <div onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} role="presentation">
              <HexColorPicker color={color} onChange={handleColorChange} />
            </div>
            <div className={styles.presetColors}>
              {PRESET_COLORS.map((presetColor) => (
                <Button
                  key={presetColor}
                  type="button"
                  variant="icon"
                  className={styles.presetColor}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handlePaletteColorClick(presetColor)}
                  title={presetColor}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
