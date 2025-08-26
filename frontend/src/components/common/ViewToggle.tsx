import React from 'react';

import { Grid3X3, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ViewMode } from 'types/ToolbarTypes';

import styles from './ViewToggle.module.css';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange, className }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`${styles.viewToggle} ${className || ''}`}>
      <button
        type="button"
        className={`${styles.toggleButton} ${value === 'grid' ? styles.active : ''}`}
        onClick={() => onChange('grid')}
        title={t('toolbar.view.grid')}
      >
        <Grid3X3 size={16} />
      </button>
      <button
        type="button"
        className={`${styles.toggleButton} ${value === 'list' ? styles.active : ''}`}
        onClick={() => onChange('list')}
        title={t('toolbar.view.list')}
      >
        <List size={16} />
      </button>
    </div>
  );
};

export default ViewToggle;