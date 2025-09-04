import React from 'react';

import clsx from 'clsx';
import type { ViewMode } from 'features/board/types/ToolbarTypes';
import { Grid3X3, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from '../forms/Button';

import styles from './ViewToggle.module.scss';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange, className }) => {
  const { t } = useTranslation(['board', 'common']);

  return (
    <div className={clsx(styles.viewToggle, className)}>
      <Button
        variant="icon"
        type="button"
        className={clsx(styles.toggleButton, value === 'grid' && styles.active)}
        onClick={() => onChange('grid')}
        title={t('board:toolbar.view.grid')}
      >
        <Grid3X3 size={16} />
      </Button>
      <Button
        variant="icon"
        type="button"
        className={clsx(styles.toggleButton, value === 'list' && styles.active)}
        onClick={() => onChange('list')}
        title={t('board:toolbar.view.list')}
      >
        <List size={16} />
      </Button>
    </div>
  );
};

export default ViewToggle;
