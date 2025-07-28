// File: frontend/src/components/board/details/MemberListItem.tsx
import defaultUserImage from 'assets/default-user-image.png';
import { API_BASE_URL } from 'constants/api.constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Member } from 'types/board.types';
import styles from './MemberListItem.module.css';

interface MemberListItemProps {
    member: Member;
    onContextMenu: (event: React.MouseEvent, member: Member) => void;
}

const MemberListItem: React.FC<MemberListItemProps> = ({ member, onContextMenu }) => {
    const { t } = useTranslation();
    const imageSource = member.profilePictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${member.profilePictureUrl}`
        : defaultUserImage;

    return (
        <div onContextMenu={(e) => onContextMenu(e, member)}>
            <li className={styles.memberItem}>
                <img src={imageSource} alt={`${member.firstName} ${member.lastName}`} className={styles.memberAvatar} />
                <div>
                    <div className={styles.memberName}>
                        {member.firstName} {member.lastName}
                    </div>
                    <div className={styles.memberEmail}>{member.email}</div>
                </div>
                {member.isAdmin && <span className={styles.adminBadge}>{t('boardDetailsPage.adminBadge')}</span>}
            </li>
        </div>
    );
};

export default MemberListItem;
