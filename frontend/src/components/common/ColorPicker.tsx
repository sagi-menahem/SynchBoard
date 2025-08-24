import React, { useState, useRef, useEffect } from 'react';

import { HexColorPicker } from 'react-colorful';

import { PRESET_COLORS } from 'constants/ColorConstants';
import { useClickOutside } from 'hooks/common/useClickOutside';

import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  disabled = false,
  className = '',
  label,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  useClickOutside(pickerRef, () => {
    // Custom logic for ColorPicker: only close if not clicking the swatch
    setShowPicker(false);
  }, showPicker);

  const handleSwatchClick = () => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  };

  const handleColorChange = (color: string) => {
    onChange(color);
    // Don't close during dragging - only close on mouse release
    if (!isDragging) {
      setShowPicker(false);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Close the picker when mouse is released after dragging
    setShowPicker(false);
  };

  // Listen for global mouse up events to handle dragging outside the picker
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setShowPicker(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={`${styles.colorPickerContainer} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <button
        ref={swatchRef}
        type="button"
        className={`${styles.swatch} ${disabled ? styles.disabled : ''}`}
        onClick={handleSwatchClick}
        disabled={disabled}
        aria-label={label || 'Choose color'}
        style={{ backgroundColor: color }}
      >
        <div className={styles.swatchInner} />
      </button>
      
      {showPicker && !disabled && (
        <div ref={pickerRef} className={styles.popover}>
          <div className={styles.colorfulWrapper}>
            <div
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              <HexColorPicker 
                color={color} 
                onChange={handleColorChange}
              />
            </div>
            <div className={styles.presetColors}>
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={styles.presetColor}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorChange(presetColor)}
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