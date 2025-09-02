import React, { useEffect, useRef, useState } from 'react';

import { HexColorPicker } from 'react-colorful';
import { useTranslation } from 'react-i18next';
import { PRESET_COLORS } from 'shared/constants/ColorConstants';
import { useClickOutside } from 'shared/hooks';
import Button from 'shared/ui/components/forms/Button';

import styles from './ColorPicker.module.scss';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

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

  useClickOutside(pickerRef, () => {
    setShowPicker(false);
  }, showPicker);

  // Calculate popover position when opening
  useEffect(() => {
    if (showPicker && swatchRef.current) {
      const swatchRect = swatchRef.current.getBoundingClientRect();
      const popoverWidth = 250; // Width from CSS
      const popoverHeight = 300; // Approximate height
      const margin = 8;
      
      // Calculate initial position
      let left = swatchRect.left;
      let top = swatchRect.bottom + margin;
      
      // Check if popover would overflow right edge of viewport
      if (left + popoverWidth > window.innerWidth) {
        left = swatchRect.right - popoverWidth; // Align to right edge of button
      }
      
      // Ensure popover doesn't go beyond left edge
      if (left < margin) {
        left = margin;
      }
      
      // Check if popover would overflow bottom edge of viewport
      if (top + popoverHeight > window.innerHeight) {
        top = swatchRect.top - popoverHeight - margin; // Position above button
      }
      
      // Ensure popover doesn't go beyond top edge
      if (top < margin) {
        top = margin;
      }
      
      setPopoverPosition({ top, left });
    }
  }, [showPicker]);

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
      <Button
        id={id}
        ref={swatchRef}
        type="button"
        variant="icon"
        className={`${styles.swatch} ${disabled ? styles.disabled : ''}`}
        onClick={handleSwatchClick}
        disabled={disabled}
        aria-label={label ?? t('common:chooseColor')}
      >
        {/* Colored square fill */}
        <div 
          className={styles.colorFill}
          style={{ backgroundColor: color ?? '#FFFFFF' }}
        />
      </Button>
      
      {showPicker && !disabled && (
        <div 
          ref={pickerRef} 
          className={styles.popover}
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
        >
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