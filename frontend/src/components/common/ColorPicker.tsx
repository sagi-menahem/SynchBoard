import React, { useState, useRef, useEffect } from 'react';

import { HexColorPicker } from 'react-colorful';

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
  const pickerRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        swatchRef.current &&
        !swatchRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
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
            <HexColorPicker 
              color={color} 
              onChange={handleColorChange}
            />
            <div className={styles.presetColors}>
              {[
                '#FFFFFF', '#000000', '#F44336', '#E91E63', '#9C27B0', '#673AB7',
                '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
                '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548',
                '#9E9E9E', '#607D8B', '#F8F8F8', '#424242', '#E040FB', '#651FFF',
                '#3D5AFE', '#2979FF', '#00E5FF', '#1DE9B6', '#76FF03', '#C6FF00',
                '#FFD600', '#FF6F00', '#DD2C00', '#6D4C41', '#757575', '#546E7A',
              ].map((presetColor) => (
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