// File: frontend/src/pages/BoardDetailsPage.tsx
import React from 'react'; // Removed useState as it's no longer needed here
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBoardDetailsPage } from '../hooks/useBoardDetailsPage';
import styles from './BoardDetailsPage.module.css';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import InviteMemberForm from '../components/board/InviteMemberForm';
import { APP_ROUTES } from '../constants/routes.constants';
import { ContextMenu } from '../components/common/ContextMenu';
import { ContextMenuItem } from '../components/common/ContextMenuItem';

const BoardDetailsPage: React.FC = () => {
    const { t } = useTranslation();
    const { boardId } = useParams<{ boardId: string }>();
    const numericBoardId = parseInt(boardId || '0', 10);

    const {
        isLoading,
        boardDetails,
        currentUserIsAdmin,
        contextMenu,
        isInviteModalOpen,
        setInviteModalOpen,
        handleInviteSuccess,
        handlePromote,
        handleRemove,
        handleRightClick // <-- Get the correct handler from the hook
    } = useBoardDetailsPage(numericBoardId);

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
                <Link to={APP_ROUTES.getBoardDetailRoute(numericBoardId)}>
                    <Button variant="secondary">
                        &larr; {t('boardDetailsPage.backToBoardButton')}
                    </Button>
                </Link>
            </div>

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
                    <div 
                        key={member.email} 
                        onContextMenu={(e) => handleRightClick(e, member)}
                    >
                        <li className={styles.memberItem}>
                            <div>
                                <div className={styles.memberName}>{member.firstName} {member.lastName}</div>
                                <div className={styles.memberEmail}>{member.email}</div>
                            </div>
                            {member.isAdmin && (
                                <span className={styles.adminBadge}>{t('boardDetailsPage.adminBadge')}</span>
                            )}
                        </li>
                    </div>
                ))}
            </ul>
            
            {contextMenu.isOpen && contextMenu.data && (
                <ContextMenu x={contextMenu.anchorPoint.x} y={contextMenu.anchorPoint.y} onClose={contextMenu.closeMenu}>
                    {!contextMenu.data.isAdmin && (
                        <ContextMenuItem onClick={handlePromote}>Promote to Admin</ContextMenuItem>
                    )}
                    <ContextMenuItem onClick={handleRemove} destructive>Remove from Board</ContextMenuItem>
                </ContextMenu>
            )}

            <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)}>
                <InviteMemberForm boardId={numericBoardId} onInviteSuccess={handleInviteSuccess} />
            </Modal>
        </div>
    );
};

export default BoardDetailsPage;