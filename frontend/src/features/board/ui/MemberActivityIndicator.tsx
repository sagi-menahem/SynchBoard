import { Users } from 'lucide-react';
import React from 'react';

import { useTranslation } from 'react-i18next';

import styles from './MemberActivityIndicator.module.scss';

interface MemberActivityIndicatorProps {
  memberCount: number;
  onlineCount: number;
  onClick?: () => void;
  className?: string;
}

/**
 * Member activity indicator component that displays member presence information.
 * This component shows the count of online members versus total members for a board,
 * providing visual feedback about collaborative activity. It can optionally be made
 * interactive with a click handler and includes a pulsing indicator when members are online.
 * The component dynamically switches between div and button elements based on interactivity.
 *
 * @param memberCount - Total number of members in the board
 * @param onlineCount - Number of currently online/active members
 * @param onClick - Optional click handler to make the indicator interactive
 * @param className - Optional CSS class for custom styling
 */
export const MemberActivityIndicator: React.FC<MemberActivityIndicatorProps> = ({
  memberCount,
  onlineCount,
  onClick,
  className,
}) => {
  const { t } = useTranslation(['common']);

  // Use appropriate HTML element based on interactivity
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={`${styles.activityIndicator} ${onClick ? styles.clickable : ''} ${className ?? ''}`}
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
      {/* Show pulsing indicator when members are online */}
      {onlineCount > 0 && <div className={styles.onlineIndicator} />}
    </Component>
  );
};

export default MemberActivityIndicator;
