import React, { useCallback, useState, type KeyboardEvent } from 'react';

import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onSearch,
  onClear,
  className,
}) => {
  const { t } = useTranslation(['board', 'common']);
  const [inputValue, setInputValue] = useState(value);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  }, [inputValue, onSearch]);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(inputValue.trim());
    }
  }, [inputValue, onSearch]);

  const handleClear = useCallback(() => {
    setInputValue('');
    if (onClear) {
      onClear();
    } else {
      onSearch('');
    }
  }, [onClear, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`${styles.searchForm} ${className || ''}`}>
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={styles.searchInput}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            title={t('board:toolbar.search.clear')}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;