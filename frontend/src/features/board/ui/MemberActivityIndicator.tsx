import React from 'react';

import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import styles from './MemberActivityIndicator.module.css';

interface MemberActivityIndicatorProps {
  memberCount: number;
  onlineCount: number;
  onClick?: () => void;
  className?: string;
}

export const MemberActivityIndicator: React.FC<MemberActivityIndicatorProps> = ({
  memberCount,
  onlineCount,
  onClick,
  className,
}) => {
  const { t } = useTranslation(['common']);

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`${styles.activityIndicator} ${onClick ? styles.clickable : ''} ${className || ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      title={t('common:toolbar.activity.membersOnline', { count: onlineCount })}
    >
      <Users size={16} className={styles.icon} />
      <span className={styles.counts}>
        <span className={styles.onlineCount}>{onlineCount}</span>
        <span className={styles.separator}>/</span>
        <span className={styles.totalCount}>{memberCount}</span>
      </span>
      {onlineCount > 0 && <div className={styles.onlineIndicator} />}
    </Component>
  );
};

export default MemberActivityIndicator;