import clsx from 'clsx';
import type { ViewMode } from 'features/board/types/ToolbarTypes';
import { Grid3X3, List } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '../forms/Button';

import styles from './ViewToggle.module.scss';

/**
 * Props for the ViewToggle component.
 */
interface ViewToggleProps {
  value: ViewMode; // Currently selected view mode
  onChange: (mode: ViewMode) => void; // Callback when view mode changes
  className?: string;
}

/**
 * View mode toggle component for switching between grid and list layouts.
 * Provides a segmented control interface with visual feedback for the active selection.
 * Supports keyboard navigation and accessibility features for view mode switching.
 * 
 * @param {ViewMode} value - Currently selected view mode ('grid' or 'list')
 * @param {function} onChange - Callback function called when view mode changes
 * @param {string} className - Optional CSS class to apply to the toggle container
 */
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
