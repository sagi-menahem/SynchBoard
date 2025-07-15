// File: frontend/src/pages/BoardDetailsPage.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { useTranslation } from 'react-i18next';
import { useBoardDetails } from '../hooks/useBoardDetails';
import { useAuth } from '../hooks/useAuth';
import styles from './BoardDetailsPage.module.css';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import InviteMemberForm from '../components/board/InviteMemberForm';
import type { Member } from '../types/board.types';
import { APP_ROUTES } from '../constants/routes.constants'; // Import routes

const BoardDetailsPage: React.FC = () => {
    const { t } = useTranslation();
    const { boardId } = useParams<{ boardId: string }>();
    const numericBoardId = parseInt(boardId || '0', 10);

    const { userEmail } = useAuth();
    const { boardDetails, isLoading } = useBoardDetails(numericBoardId);
    
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    const currentUserIsAdmin = boardDetails?.members.find(member => member.email === userEmail)?.isAdmin || false;

    const handleInviteSuccess = (newMember: Member) => {
        console.log("Successfully invited:", newMember);
        setInviteModalOpen(false);
    };

    if (isLoading) {
        return <div>{t('boardDetailsPage.loading')}</div>;
    }

    if (!boardDetails) {
        return <div>{t('boardDetailsPage.notFound')}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>{boardDetails.name}</h1>
                    <p className={styles.description}>
                        {boardDetails.description || t('boardDetailsPage.noDescription')}
                    </p>
                </div>
                {/* Back Button */}
                <Link to={APP_ROUTES.getBoardDetailRoute(numericBoardId)}>
                    <Button variant="secondary">
                        &larr; {t('boardDetailsPage.backToBoardButton')}
                    </Button>
                </Link>
            </div>

            {/* The Invite button is now inside the members section */}
            <div className={styles.header}>
                <h2>{t('boardDetailsPage.membersHeader')}</h2>
                {currentUserIsAdmin && (
                    <Button onClick={() => setInviteModalOpen(true)}>
                        {t('boardDetailsPage.inviteButton')}
                    </Button>
                )}
            </div>

            <ul className={styles.membersList}>
                {boardDetails.members.map(member => (
                    <li key={member.email} className={styles.memberItem}>
                        <div>
                            <div className={styles.memberName}>{member.firstName} {member.lastName}</div>
                            <div className={styles.memberEmail}>{member.email}</div>
                        </div>
                        {member.isAdmin && (
                            <span className={styles.adminBadge}>{t('boardDetailsPage.adminBadge')}</span>
                        )}
                    </li>
                ))}
            </ul>

            <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)}>
                <InviteMemberForm boardId={numericBoardId} onInviteSuccess={handleInviteSuccess} />
            </Modal>
        </div>
    );
};

export default BoardDetailsPage;