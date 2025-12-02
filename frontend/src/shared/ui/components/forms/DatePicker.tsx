import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { enUS, he } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import styles from './DatePicker.module.scss';

interface DatePickerProps {
  /** Current date value in YYYY-MM-DD format */
  value?: string;
  /** Callback when date changes, receives YYYY-MM-DD format string */
  onChange?: (value: string) => void;
  /** Input name attribute */
  name?: string;
  /** Input id attribute */
  id?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional class name for the input */
  className?: string;
  /** Variant for different contexts */
  variant?: 'default' | 'settings' | 'auth';
}

/**
 * Custom DatePicker component with glass design support.
 * Provides a fully customizable calendar popup that matches the site's design system.
 *
 * - 'settings' variant: Uses glass design with user-chosen colors
 * - 'auth' variant: Uses light/dark theme without user colors
 * - 'default' variant: Standard glass design
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  name,
  id,
  disabled = false,
  className,
  variant = 'default',
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (value) {
      const parsed = parse(value, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : undefined;
    }
    return undefined;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get locale based on current language
  const locale = i18n.language === 'he' ? he : enUS;
  const isRTL = i18n.language === 'he';

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      const parsed = parse(value, 'yyyy-MM-dd', new Date());
      if (isValid(parsed)) {
        setSelectedDate(parsed);
      }
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date);
      if (date && onChange) {
        onChange(format(date, 'yyyy-MM-dd'));
      } else if (!date && onChange) {
        onChange('');
      }
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onChange],
  );

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    }
  };

  // Format the display value
  const displayValue = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '';

  // Determine the variant class
  const variantClass = variant === 'settings' ? styles.settings : variant === 'auth' ? styles.auth : '';

  // Custom chevron component for navigation
  const CustomChevron = ({
    orientation,
  }: {
    className?: string;
    size?: number;
    disabled?: boolean;
    orientation?: 'left' | 'right' | 'up' | 'down';
  }) => {
    // In RTL, swap left/right chevrons
    if (isRTL) {
      if (orientation === 'left') return <ChevronRight size={16} />;
      if (orientation === 'right') return <ChevronLeft size={16} />;
    }
    if (orientation === 'left') return <ChevronLeft size={16} />;
    if (orientation === 'right') return <ChevronRight size={16} />;
    // Default fallback for up/down orientations
    return <ChevronLeft size={16} />;
  };

  return (
    <div className={`${styles.container} ${variantClass}`} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={displayValue}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          readOnly
          disabled={disabled}
          className={`${styles.input} ${className ?? ''}`}
          placeholder="DD/MM/YYYY"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        />
        <button
          type="button"
          className={styles.calendarButton}
          onClick={handleInputClick}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Open calendar"
        >
          <Calendar size={18} />
        </button>
      </div>

      {isOpen && (
        <div className={styles.popover} dir={isRTL ? 'rtl' : 'ltr'} role="dialog" aria-modal="true">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={locale}
            dir={isRTL ? 'rtl' : 'ltr'}
            showOutsideDays
            fixedWeeks
            captionLayout="dropdown"
            startMonth={new Date(1920, 0)}
            endMonth={new Date(new Date().getFullYear(), 11)}
            classNames={{
              root: styles.calendar,
              months: styles.months,
              month: styles.month,
              month_caption: styles.monthCaption,
              caption_label: styles.captionLabel,
              nav: styles.nav,
              button_previous: styles.navButton,
              button_next: styles.navButton,
              month_grid: styles.monthGrid,
              weekdays: styles.weekdays,
              weekday: styles.weekday,
              week: styles.week,
              day: styles.day,
              day_button: styles.dayButton,
              selected: styles.selected,
              today: styles.today,
              outside: styles.outside,
              disabled: styles.disabled,
              dropdowns: styles.dropdowns,
              dropdown: styles.dropdown,
              months_dropdown: styles.monthsDropdown,
              years_dropdown: styles.yearsDropdown,
            }}
            components={{
              Chevron: CustomChevron,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
