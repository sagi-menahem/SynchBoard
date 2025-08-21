import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  BoardConfirmDialogs,
  BoardDetailsHeader,
  BoardEditModals,
  MemberContextMenu,
  MemberList,
  PictureManagerModal,
} from 'components/board/details';
import { useBoardDetailsPage } from 'hooks/board/details';

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

  const handleSetPictureModalOpen = useCallback((isOpen: boolean) => {
    setPictureModalOpen(isOpen);
  }, [setPictureModalOpen]);

  const handleSetEditingField = useCallback((field: 'name' | 'description' | null) => {
    setEditingField(field);
  }, [setEditingField]);

  const handleSetLeaveConfirmOpen = useCallback((isOpen: boolean) => {
    setLeaveConfirmOpen(isOpen);
  }, [setLeaveConfirmOpen]);

  const handleSetInviteModalOpen = useCallback((isOpen: boolean) => {
    setInviteModalOpen(isOpen);
  }, [setInviteModalOpen]);

  const handleCloseInvite = useCallback(() => {
    setInviteModalOpen(false);
  }, [setInviteModalOpen]);

  const handleCloseEdit = useCallback(() => {
    setEditingField(null);
  }, [setEditingField]);

  const handleCloseLeave = useCallback(() => {
    setLeaveConfirmOpen(false);
  }, [setLeaveConfirmOpen]);

  const handleCloseDelete = useCallback(() => {
    setDeleteConfirmOpen(false);
  }, [setDeleteConfirmOpen]);

  const handleClosePicture = useCallback(() => {
    setPictureModalOpen(false);
  }, [setPictureModalOpen]);

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
        onSetPictureModalOpen={handleSetPictureModalOpen}
        onSetEditingField={handleSetEditingField}
        onSetLeaveConfirmOpen={handleSetLeaveConfirmOpen}
        onSetInviteModalOpen={handleSetInviteModalOpen}
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
        onCloseInvite={handleCloseInvite}
        onCloseEdit={handleCloseEdit}
        onInviteSuccess={handleInviteSuccess}
        onUpdateName={handleUpdateName}
        onUpdateDescription={handleUpdateDescription}
      />

      <BoardConfirmDialogs
        isLeaveConfirmOpen={isLeaveConfirmOpen}
        isDeleteConfirmOpen={isDeleteConfirmOpen}
        boardName={boardDetails.name}
        onCloseLeave={handleCloseLeave}
        onCloseDelete={handleCloseDelete}
        onConfirmLeave={handleLeaveBoard}
        onConfirmDelete={handleConfirmDeletePicture}
      />

      <PictureManagerModal
        isOpen={isPictureModalOpen}
        onClose={handleClosePicture}
        boardName={boardDetails.name}
        pictureUrl={boardDetails.pictureUrl}
        onPictureUpload={handlePictureUpload}
        onPictureDelete={promptPictureDelete}
      />
    </div>
  );
};

export default BoardDetailsPage;
