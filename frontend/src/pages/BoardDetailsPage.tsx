// File: frontend/src/pages/BoardDetailsPage.tsx
import BoardDetailsHeader from 'components/board/details/BoardDetailsHeader';
import EditFieldForm from 'components/board/details/EditFieldForm';
import InviteMemberForm from 'components/board/details/InviteMemberForm';
import MemberList from 'components/board/details/MemberList';
import PictureManagerModal from 'components/board/details/PictureManagerModal';
import ConfirmationDialog from 'components/common/ConfirmationDialog';
import { ContextMenu } from 'components/common/ContextMenu';
import { ContextMenuItem } from 'components/common/ContextMenuItem';
import Modal from 'components/common/Modal';
import { useBoardDetailsPage } from 'hooks/useBoardDetailsPage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styles from './BoardDetailsPage.module.css';

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

    return (
        <div className={styles.container}>
            <BoardDetailsHeader
                boardDetails={boardDetails}
                currentUserIsAdmin={currentUserIsAdmin}
                numericBoardId={numericBoardId}
                onSetPictureModalOpen={setPictureModalOpen}
                onSetEditingField={setEditingField}
                onSetLeaveConfirmOpen={setLeaveConfirmOpen}
                onSetInviteModalOpen={setInviteModalOpen}
            />

            <ul className={styles.membersListContainer}>
                <MemberList members={boardDetails.members} onMemberContextMenu={handleRightClick} />
            </ul>

            {contextMenu.isOpen && contextMenu.data && (
                <ContextMenu x={contextMenu.anchorPoint.x} y={contextMenu.anchorPoint.y} onClose={contextMenu.closeMenu}>
                    {!contextMenu.data.isAdmin && (
                        <ContextMenuItem
                            onClick={handlePromote}>
                            {t('contextMenu.promoteToAdmin', { userName: contextMenu.data.firstName })}
                        </ContextMenuItem>
                    )}
                    <ContextMenuItem
                        onClick={handleRemove} destructive>
                        {t('contextMenu.removeFromBoard', { userName: contextMenu.data.firstName })}
                    </ContextMenuItem>
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