import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { PRESET_COLORS } from 'shared/constants/ColorConstants';
import Button from 'shared/ui/components/forms/Button';

import styles from './ColorPicker.module.scss';

// Animation variants for the popover
const popoverVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeIn' as const },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: 'easeOut' as const },
  },
};

// Animation variants for backdrop
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
};

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
  'aria-labelledby'?: string; // ID of element that labels this color picker
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
  'aria-labelledby': ariaLabelledBy,
}) => {
  const { t } = useTranslation(['common']);
  const [showPicker, setShowPicker] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  // Track if we're closing to prevent label click from reopening
  const isClosingRef = useRef(false);

  // Handle clicks on labels associated with our swatch button
  // The backdrop handles most click-outside cases, but labels can trigger
  // the swatch button via htmlFor, so we need special handling
  useEffect(() => {
    if (!showPicker || !id) {
      return;
    }

    const handleLabelClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Only handle labels that are associated with our swatch button
      if (target.tagName === 'LABEL') {
        const labelFor = target.getAttribute('for');
        if (labelFor === id) {
          // Prevent label from triggering the swatch button
          event.stopPropagation();
          event.preventDefault();
          isClosingRef.current = true;
          setShowPicker(false);
          setTimeout(() => {
            isClosingRef.current = false;
          }, 100);
        }
      }
    };

    document.addEventListener('mousedown', handleLabelClick, true);
    document.addEventListener('click', handleLabelClick, true);
    return () => {
      document.removeEventListener('mousedown', handleLabelClick, true);
      document.removeEventListener('click', handleLabelClick, true);
    };
  }, [showPicker, id]);

  const handleSwatchClick = useCallback(() => {
    // Don't reopen if we just closed via label click
    if (isClosingRef.current) {
      return;
    }
    if (!disabled) {
      setShowPicker((prev) => !prev);
    }
  }, [disabled]);

  // Close picker when scrolling
  useEffect(() => {
    if (!showPicker) return;

    const handleScroll = () => {
      setShowPicker(false);
    };

    // Listen to scroll on window and any scrollable parent
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showPicker]);

  // Calculate optimal popover position to avoid viewport overflow - runs when popover opens
  useEffect(() => {
    if (showPicker && swatchRef.current) {
      const swatchRect = swatchRef.current.getBoundingClientRect();
      const popoverWidth = 260;
      const popoverHeight = 310;
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

  const handleColorChange = useCallback(
    (newColor: string) => {
      onChange(newColor);
    },
    [onChange],
  );

  const handlePaletteColorClick = useCallback(
    (presetColor: string) => {
      onChange(presetColor);
      setShowPicker(false);
    },
    [onChange],
  );

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
    <>
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
          aria-labelledby={ariaLabelledBy}
        >
          <div className={styles.colorFill} style={{ backgroundColor: color ?? '#FFFFFF' }} />
        </Button>
      </div>

      {createPortal(
        <AnimatePresence>
          {showPicker && !disabled && (
            <>
              {/* Invisible backdrop to catch all clicks outside the picker */}
              <motion.div
                className={styles.backdrop}
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowPicker(false);
                }}
              />
              <motion.div
                ref={pickerRef}
                className={styles.popover}
                style={popoverStyle}
                variants={popoverVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className={styles.colorfulWrapper}>
                  {/* Color picker area */}
                  <div className={styles.pickerArea}>
                    <HexColorPicker color={color} onChange={handleColorChange} />
                  </div>

                  {/* Divider */}
                  <div className={styles.divider} />

                  {/* Preset colors section */}
                  <div className={styles.presetsSection}>
                    <span className={styles.presetsLabel}>{t('common:presets')}</span>
                    <div className={styles.presetColors}>
                      {PRESET_COLORS.map((presetColor) => (
                        <button
                          key={presetColor}
                          type="button"
                          className={`${styles.presetColor} ${presetColor === color ? styles.active : ''}`}
                          style={{ backgroundColor: presetColor }}
                          onClick={() => handlePaletteColorClick(presetColor)}
                          title={presetColor}
                          aria-label={`Select ${presetColor}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default ColorPicker;
