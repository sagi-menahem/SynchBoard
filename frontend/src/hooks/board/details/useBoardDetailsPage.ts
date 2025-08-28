import { APP_ROUTES } from 'constants';

import { useCallback, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import {
  useBoardDetails,
  useBoardEditing,
  useBoardMemberManagement,
  useBoardPermissions,
} from 'hooks/board/details';
import * as boardService from 'services/boardService';
import type { Member, UpdateCanvasSettingsRequest } from 'types/BoardTypes';
import type { EditingField } from 'types/CommonTypes';

export const useBoardDetailsPage = (boardId: number) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { boardDetails, isLoading } = useBoardDetails(boardId);
  const { handleUpdateName, handleUpdateDescription, optimisticState } = useBoardEditing(
    boardId,
    boardDetails?.name,
    boardDetails?.description || undefined,
  );

  const { currentUserIsAdmin, userEmail } = useBoardPermissions(boardDetails);

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { contextMenu, handlePromote: memberPromote, handleRemove: memberRemove, handleRightClick } = 
        useBoardMemberManagement(boardId, currentUserIsAdmin);

  const handleInviteSuccess = useCallback(
    (_newMember: Member) => {
      setInviteModalOpen(false);
    },
    [],
  );

  const handlePromote = useCallback(async () => {
    if (!contextMenu.data) return;
    try {
      await memberPromote(contextMenu.data);
    } finally {
      contextMenu.closeMenu();
    }
  }, [contextMenu, memberPromote]);

  const handleRemove = useCallback(async () => {
    if (!contextMenu.data) return;
    try {
      await memberRemove(contextMenu.data);
    } finally {
      contextMenu.closeMenu();
    }
  }, [contextMenu, memberRemove]);

  const handleLeaveBoard = useCallback(async () => {
    if (!boardDetails) return;
    try {
      await boardService.leaveBoard(boardId);
      toast.success(t('success.board.leave', { boardName: boardDetails.name }));
      navigate(APP_ROUTES.BOARD_LIST);
    } catch (error) {
      logger.error('Failed to leave board:', error);
      throw error;
    } finally {
      setLeaveConfirmOpen(false);
    }
  }, [boardId, boardDetails, navigate, t]);

  const handlePictureUpload = useCallback(
    async (file: File) => {
      try {
        await boardService.uploadBoardPicture(boardId, file);
        toast.success(t('success.board.pictureUpdate'));
      } catch (error) {
        logger.error('Picture upload error:', error);
        throw error;
      } finally {
        // Picture uploaded successfully
      }
    },
    [boardId, t],
  );

  const promptPictureDelete = useCallback(() => {
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDeletePicture = useCallback(async () => {
    try {
      await boardService.deleteBoardPicture(boardId);
      toast.success(t('success.board.pictureDelete'));
    } catch (error) {
      logger.error('Picture delete error:', error);
      throw error;
    } finally {
      setDeleteConfirmOpen(false);
    }
  }, [boardId, t]);

  const handleCanvasSettingsUpdate = useCallback(
    async (settings: UpdateCanvasSettingsRequest) => {
      try {
        await boardService.updateCanvasSettings(boardId, settings);
        toast.success(t('success.board.canvasSettingsUpdate'));
      } catch (error) {
        logger.error('Canvas settings update error:', error);
        throw error;
      }
    },
    [boardId, t],
  );

  return {
    isLoading,
    boardDetails,
    optimisticBoardState: optimisticState,
    userEmail,
    currentUserIsAdmin,
    contextMenu,
    isInviteModalOpen,
    setInviteModalOpen,
    editingField,
    setEditingField,
    isLeaveConfirmOpen,
    setLeaveConfirmOpen,
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
    handleCanvasSettingsUpdate,
  };
};
