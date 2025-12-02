import defaultUserImage from 'assets/default-user-image.png';
import type { Member } from 'features/board/types/BoardTypes';
import { Crown } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'shared/constants/ApiConstants';
import { Card } from 'shared/ui';

import styles from './MemberListItem.module.scss';

/**
 * Props interface for MemberListItem component.
 * Defines the member data and interaction handler for individual member display.
 */
interface MemberListItemProps {
  /** Member data including email, admin status, and profile picture */
  member: Member;
  /** Handler for right-click context menu events on this specific member */
  onContextMenu: (event: React.MouseEvent, member: Member) => void;
}

/**
 * Displays individual board member information with avatar, email, and admin badge.
 * This memoized component renders a single member item with profile picture support,
 * admin status indication, and context menu integration for member management actions.
 *
 * @param member - Member data including email, admin status, and profile picture
 * @param onContextMenu - Handler for right-click context menu events on this specific member
 */
const MemberListItem: React.FC<MemberListItemProps> = React.memo(({ member, onContextMenu }) => {
  const { t } = useTranslation(['board', 'common']);
  const imageSource = member.profilePictureUrl
    ? `${API_BASE_URL.replace('/api', '')}${member.profilePictureUrl}`
    : defaultUserImage;

  return (
    <div onContextMenu={(e) => onContextMenu(e, member)} role="button" tabIndex={0}>
      <Card variant="default" padding="sm" className={styles.memberItem}>
        <img
          src={imageSource}
          alt={t('common:accessibility.memberAvatar', { email: member.email })}
          className={styles.memberAvatar}
        />
        <div>
          <div className={styles.memberName}>{member.email}</div>
        </div>
        {member.isAdmin && (
          <div className={styles.adminBadge} title={t('board:detailsPage.adminBadge')}>
            <Crown size={20} />
          </div>
        )}
      </Card>
    </div>
  );
});

MemberListItem.displayName = 'MemberListItem';

export default MemberListItem;
