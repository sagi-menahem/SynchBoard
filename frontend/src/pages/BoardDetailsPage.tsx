import React from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import BoardConfirmDialogs from 'components/board/details/BoardConfirmDialogs';
import BoardDetailsHeader from 'components/board/details/BoardDetailsHeader';
import BoardEditModals from 'components/board/details/BoardEditModals';
import MemberContextMenu from 'components/board/details/MemberContextMenu';
import MemberList from 'components/board/details/MemberList';
import PictureManagerModal from 'components/board/details/PictureManagerModal';
import { useBoardDetailsPage } from 'hooks/board/details/useBoardDetailsPage';

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

            <MemberContextMenu
                isOpen={contextMenu.isOpen}
                x={contextMenu.anchorPoint.x}
                y={contextMenu.anchorPoint.y}
                member={contextMenu.data}
                onClose={contextMenu.closeMenu}
                onPromote={handlePromote}
                onRemove={handleRemove}
            />

            <BoardEditModals
                isInviteModalOpen={isInviteModalOpen}
                editingField={editingField}
                boardId={numericBoardId}
                boardName={boardDetails.name}
                boardDescription={boardDetails.description || ''}
                onCloseInvite={() => setInviteModalOpen(false)}
                onCloseEdit={() => setEditingField(null)}
                onInviteSuccess={handleInviteSuccess}
                onUpdateName={handleUpdateName}
                onUpdateDescription={handleUpdateDescription}
            />

            <BoardConfirmDialogs
                isLeaveConfirmOpen={isLeaveConfirmOpen}
                isDeleteConfirmOpen={isDeleteConfirmOpen}
                boardName={boardDetails.name}
                onCloseLeave={() => setLeaveConfirmOpen(false)}
                onCloseDelete={() => setDeleteConfirmOpen(false)}
                onConfirmLeave={handleLeaveBoard}
                onConfirmDelete={handleConfirmDeletePicture}
            />

            <PictureManagerModal
                isOpen={isPictureModalOpen}
                onClose={() => setPictureModalOpen(false)}
                boardName={boardDetails.name}
                pictureUrl={boardDetails.pictureUrl}
                onPictureUpload={handlePictureUpload}
                onPictureDelete={promptPictureDelete}
            />
        </div>
    );
};

export default BoardDetailsPage;
