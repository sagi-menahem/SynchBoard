import React from 'react';

import RcSlider from 'rc-slider';

import 'rc-slider/assets/index.css';
import styles from './Slider.module.css';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  'aria-label'?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  onChange,
  label,
  className = '',
  'aria-label': ariaLabel,
}) => {
  return (
    <div className={`${styles.sliderContainer} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.sliderWrapper}>
        <RcSlider
          value={value}
          min={min}
          max={max}
          onChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
          className={styles.slider}
          handleStyle={{
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f6',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
            width: 16,
            height: 16,
            marginTop: -6,
          }}
          trackStyle={{
            backgroundColor: '#3b82f6',
            height: 4,
          }}
          railStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            height: 4,
          }}
          aria-label={ariaLabel ?? label}
        />
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
};