import React, { useEffect, useRef, useState } from 'react';

import { HexColorPicker } from 'react-colorful';
import { useTranslation } from 'react-i18next';
import { PRESET_COLORS } from 'shared/constants/ColorConstants';
import { useClickOutside } from 'shared/hooks/useClickOutside';

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
  const { t } = useTranslation(['common']);
  const [showPicker, setShowPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  useClickOutside(pickerRef, () => {
    setShowPicker(false);
  }, showPicker);

  const handleSwatchClick = () => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  };


  const handleColorChange = (color: string) => {
    onChange(color);
  };

  const handlePaletteColorClick = (color: string) => {
    onChange(color);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isSaturationArea = target.closest('.react-colorful__saturation');
    
    setIsDragging(false);
    if (isSaturationArea) {
      setShowPicker(false);
    }
  };

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

  return (
    <div className={`${styles.colorPickerContainer} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <button
        ref={swatchRef}
        type="button"
        className={`${styles.swatch} ${disabled ? styles.disabled : ''}`}
        onClick={handleSwatchClick}
        disabled={disabled}
        aria-label={label || t('common:chooseColor')}
        style={{ backgroundColor: color || '#FFFFFF' }}
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