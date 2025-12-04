import { Search, X } from 'lucide-react';
import React, { useCallback, useState, type KeyboardEvent } from 'react';

import { useTranslation } from 'react-i18next';

import Button from '../forms/Button';

import styles from './SearchBar.module.scss';

/**
 * Props for the SearchBar component.
 */
interface SearchBarProps {
  placeholder: string; // Placeholder text for the search input
  value?: string; // Initial value for the search input (optional when disabled)
  onSearch?: (query: string) => void; // Callback when search is performed (optional when disabled)
  onClear?: () => void; // Optional callback when search is cleared
  className?: string;
  disabled?: boolean; // Whether the search bar is disabled (for skeleton states)
}

/**
 * Search input component with clear functionality and keyboard navigation support.
 * Provides a styled search interface with icon, input field, and optional clear button.
 * Supports both form submission and Enter key for search execution.
 *
 * @param {string} placeholder - Placeholder text to display in the search input
 * @param {string} value - Initial value for the search input field
 * @param {function} onSearch - Callback function called when search is performed with query string
 * @param {function} onClear - Optional callback function called when search is cleared
 * @param {string} className - Optional CSS class to apply to the search form
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value = '',
  onSearch,
  onClear,
  className,
  disabled = false,
}) => {
  const { t } = useTranslation(['board', 'common']);
  const [inputValue, setInputValue] = useState(value);

  // Handle form submission and prevent default browser behavior
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!disabled && onSearch) {
        onSearch(inputValue.trim());
      }
    },
    [inputValue, onSearch, disabled],
  );

  // Handle Enter key down for immediate search
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!disabled && onSearch) {
          onSearch(inputValue.trim());
        }
      }
    },
    [inputValue, onSearch, disabled],
  );

  // Clear input and trigger appropriate callback
  const handleClear = useCallback(() => {
    if (disabled) return;
    setInputValue('');
    if (onClear) {
      onClear();
    } else if (onSearch) {
      onSearch('');
    }
  }, [onClear, onSearch, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`${styles.searchForm} ${className ?? ''}`}>
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input
          id="search-input"
          name="search"
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.searchInput}
          autoComplete="off"
          aria-label={placeholder}
          disabled={disabled}
        />
        {inputValue && (
          <Button
            type="button"
            variant="icon"
            onClick={handleClear}
            className={styles.clearButton}
            title={t('board:toolbar.search.clear')}
            aria-label={t('board:toolbar.search.clear')}
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
