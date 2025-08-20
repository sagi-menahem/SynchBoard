import React, { useMemo, useCallback } from 'react';

import defaultUserImage from 'assets/default-user-image.png';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from 'constants/ApiConstants';
import type { Member } from 'types/BoardTypes';

import styles from './MemberListItem.module.css';

interface MemberListItemProps {
    member: Member;
    onContextMenu: (event: React.MouseEvent, member: Member) => void;
}

const MemberListItem: React.FC<MemberListItemProps> = ({ member, onContextMenu }) => {
    const { t } = useTranslation();
    
    // Memoize image source calculation
    const imageSource = useMemo(() => {
        return member.profilePictureUrl
            ? `${API_BASE_URL.replace('/api', '')}${member.profilePictureUrl}`
            : defaultUserImage;
    }, [member.profilePictureUrl]);

    // Memoize context menu handler
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        onContextMenu(e, member);
    }, [onContextMenu, member]);

    return (
        <div onContextMenu={handleContextMenu}>
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

export default React.memo(MemberListItem);
