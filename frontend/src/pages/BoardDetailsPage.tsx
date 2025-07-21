// File: frontend/src/pages/BoardDetailsPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBoardDetailsPage } from '../hooks/useBoardDetailsPage';
import styles from './BoardDetailsPage.module.css';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import InviteMemberForm from '../components/board/InviteMemberForm';
import EditFieldForm from '../components/board/EditFieldForm';
import { APP_ROUTES } from '../constants/routes.constants';
import { API_BASE_URL } from '../constants/api.constants';
import { ContextMenu } from '../components/common/ContextMenu';
import { ContextMenuItem } from '../components/common/ContextMenuItem';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import PictureManagerModal from '../components/board/PictureManagerModal';
import defaultBoardImage from '../assets/default-board-image.png';
import defaultUserImage from '../assets/default-user-image.png';


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
        editingField,
        setEditingField,
        isLeaveConfirmOpen,
        setLeaveConfirmOpen,
        isPictureModalOpen,
        setPictureModalOpen,
        isDeleteConfirmOpen,
        setDeleteConfirmOpen,
        handleInviteSuccess,
        handlePromote,
        handleRemove,
        handleUpdateName,
        handleUpdateDescription,
        handleRightClick,
        handleLeaveBoard,
        handlePictureUpload,
        promptPictureDelete,
        handleConfirmDeletePicture,
    } = useBoardDetailsPage(numericBoardId);

    if (isLoading) {
        return <div>{t('boardDetailsPage.loading')}</div>;
    }

    if (!boardDetails) {
        return <div>{t('boardDetailsPage.notFound')}</div>;
    }

    const imageSource = boardDetails.pictureUrl
        ? `${API_BASE_URL.replace('/api', '')}${boardDetails.pictureUrl}`
        : defaultBoardImage;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <img
                        src={imageSource}
                        alt={`${boardDetails.name} picture`}
                        className={styles.boardImage}
                        onClick={() => setPictureModalOpen(true)}
                    />
                    <div>
                        <h1 className={styles.editableText} onClick={() => setEditingField('name')}>
                            {boardDetails.name}
                        </h1>
                        <p
                            className={`${styles.description} ${styles.editableText}`}
                            onClick={() => setEditingField('description')}
                        >
                            {boardDetails.description || t('boardDetailsPage.noDescription')}
                        </p>
                    </div>
                </div>
                <Link to={APP_ROUTES.getBoardDetailRoute(numericBoardId)}>
                    <Button variant="secondary">&larr; {t('boardDetailsPage.backToBoardButton')}</Button>
                </Link>
            </div>

            <div className={styles.header}>
                <h2>{t('boardDetailsPage.membersHeader')}</h2>
                <div className={styles.headerActions}>
                    <Button onClick={() => setLeaveConfirmOpen(true)} className={styles.destructiveButton}>
                        {t('leaveBoard.button')}
                    </Button>
                    {currentUserIsAdmin && (
                        <Button onClick={() => setInviteModalOpen(true)}>{t('boardDetailsPage.inviteButton')}</Button>
                    )}
                </div>
            </div>

            <ul className={styles.membersList}>
                {boardDetails.members.map(member => (
                    <div
                        key={member.email}
                        onContextMenu={(e) => handleRightClick(e, member)}
                    >
                        <li className={styles.memberItem}>
                            {/* 2. Add the image element */}
                            <img
                                src={member.profilePictureUrl
                                    ? `${API_BASE_URL.replace('/api', '')}${member.profilePictureUrl}`
                                    : defaultUserImage
                                }
                                alt={`${member.firstName} ${member.lastName}`}
                                className={styles.memberAvatar}
                            />
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
                        <ContextMenuItem onClick={handlePromote}>{t('contextMenu.promoteToAdmin')}</ContextMenuItem>
                    )}
                    <ContextMenuItem onClick={handleRemove} destructive>{t('contextMenu.removeFromBoard')}</ContextMenuItem>
                </ContextMenu>
            )}

            <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)}>
                <InviteMemberForm boardId={numericBoardId} onInviteSuccess={handleInviteSuccess} />
            </Modal>

            <Modal isOpen={editingField !== null} onClose={() => setEditingField(null)}>
                {editingField === 'name' && (
                    <EditFieldForm
                        title={t('editBoardNameForm.title')}
                        label={t('editBoardNameForm.label')}
                        initialValue={boardDetails.name}
                        onSave={handleUpdateName}
                        onClose={() => setEditingField(null)}
                    />
                )}
                {editingField === 'description' && (
                    <EditFieldForm
                        title={t('editBoardDescriptionForm.title')}
                        label={t('editBoardDescriptionForm.label')}
                        initialValue={boardDetails.description || ''}
                        inputType="textarea"
                        onSave={handleUpdateDescription}
                        onClose={() => setEditingField(null)}
                    />
                )}
            </Modal>

            <ConfirmationDialog
                isOpen={isLeaveConfirmOpen}
                onClose={() => setLeaveConfirmOpen(false)}
                onConfirm={handleLeaveBoard}
                title={t('leaveBoard.confirmTitle')}
                message={t('leaveBoard.confirmText', { boardName: boardDetails.name })}
            />

            <PictureManagerModal
                isOpen={isPictureModalOpen}
                onClose={() => setPictureModalOpen(false)}
                boardName={boardDetails.name}
                pictureUrl={boardDetails.pictureUrl}
                onPictureUpload={handlePictureUpload}
                onPictureDelete={promptPictureDelete}
            />

            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDeletePicture}
                title={t('pictureManager.deleteButton')}
                message={t('leaveBoard.confirmText', { boardName: boardDetails.name })}
            />
        </div>
    );
};

export default BoardDetailsPage;