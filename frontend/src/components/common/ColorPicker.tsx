import React, { useEffect, useRef, useState } from 'react';

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
    // Don't close the picker while interacting with it
    // The picker will close on mouse up via handleMouseUp
  };

  const handlePaletteColorClick = (color: string) => {
    onChange(color);
    // Keep the picker open to allow trying multiple colors
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Check if the mouse up is on the main saturation area (not the hue slider)
    const target = e.target as HTMLElement;
    const isSaturationArea = target.closest('.react-colorful__saturation');
    
    setIsDragging(false);
    // Only close if releasing on the saturation area (main color selection)
    // Don't close when adjusting the hue slider
    if (isSaturationArea) {
      setShowPicker(false);
    }
  };

  // Listen for global mouse up events to handle dragging outside the picker
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const target = e.target as HTMLElement;
        const isSaturationArea = target.closest('.react-colorful__saturation');
        
        setIsDragging(false);
        // Only close if releasing on the saturation area
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
              role="presentation"
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