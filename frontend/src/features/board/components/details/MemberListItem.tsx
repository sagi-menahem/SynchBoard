import React from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import type { Member } from 'features/board/types/BoardTypes';
import { Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'shared/constants/ApiConstants';
import { Card } from 'shared/ui';

import styles from './MemberListItem.module.scss';

interface MemberListItemProps {
    member: Member;
    onContextMenu: (event: React.MouseEvent, member: Member) => void;
}

const MemberListItem: React.FC<MemberListItemProps> = React.memo(({ member, onContextMenu }) => {
  const { t } = useTranslation(['board', 'common']);
  const imageSource = member.profilePictureUrl
    ? `${API_BASE_URL.replace('/api', '')}${member.profilePictureUrl}`
    : defaultUserImage;

  return (
    <div onContextMenu={(e) => onContextMenu(e, member)}>
      <Card 
        variant="default" 
        padding="sm"
        className={styles.memberItem}
      >
        <img src={imageSource} alt={t('common:accessibility.memberAvatar', { email: member.email })} className={styles.memberAvatar} />
        <div>
          <div className={styles.memberName}>
            {member.email}
          </div>
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
