import * as boardService from 'features/board/services/boardService';
import type { Member, UpdateCanvasSettingsRequest } from 'features/board/types/BoardTypes';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';
import type { EditingField } from 'shared/types/CommonTypes';
import logger from 'shared/utils/logger';

import { useBoardDetailsData } from './useBoardDetailsData';
import { useBoardMemberActions } from './useBoardMemberActions';

/**
 * Custom hook that orchestrates all board details page functionality and state management.
 * This hook combines board data management, member actions, modal states, file operations,
 * and canvas settings to provide a complete interface for the board details page component.
 * It handles complex interactions between different aspects of board management including
 * member promotion/removal, board leaving, picture upload/deletion, and canvas configuration.
 * The hook serves as the primary controller for the board details page, coordinating between
 * multiple sub-hooks and providing a unified interface for component interaction.
 *
 * @param {number} boardId - ID of the board to manage and orchestrate all page operations for
 * @returns Complete board details page management interface containing board state, user permissions,
 *   member management handlers, modal controls, file operations, and canvas settings functionality
 */
export const useBoardDetailsPage = (boardId: number) => {
  const { t } = useTranslation(['board', 'common']);
  const navigate = useNavigate();

  const {
    boardDetails,
    isLoading,
    permissions,
    optimisticState,
    handleUpdateName,
    handleUpdateDescription,
  } = useBoardDetailsData(boardId);

  const { handlePromoteMember, handleRemoveMember, handleRightClick, contextMenu, inviteForm } =
    useBoardMemberActions(boardId, permissions.currentUserIsAdmin);

  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleInviteSuccess = useCallback((_newMember: Member) => {
    setInviteModalOpen(false);
  }, []);

  const handlePromote = useCallback(async () => {
    if (!contextMenu.data) {
      return;
    }
    try {
      await handlePromoteMember(contextMenu.data);
    } finally {
      contextMenu.closeMenu();
    }
  }, [contextMenu, handlePromoteMember]);

  const handleRemove = useCallback(async () => {
    if (!contextMenu.data) {
      return;
    }
    try {
      await handleRemoveMember(contextMenu.data);
    } finally {
      contextMenu.closeMenu();
    }
  }, [contextMenu, handleRemoveMember]);

  const handleLeaveBoard = useCallback(async () => {
    if (!boardDetails) {
      return;
    }
    try {
      await boardService.leaveBoard(boardId);
      toast.success(t('board:success.leave', { boardName: boardDetails.name }));
      void navigate(APP_ROUTES.BOARD_LIST);
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
        toast.success(t('board:success.pictureUpdate'));
      } catch (error) {
        logger.error('Picture upload error:', error);
        throw error;
      }
    },
    [boardId, t],
  );

  const promptPictureDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeletePicture = useCallback(async () => {
    try {
      await boardService.deleteBoardPicture(boardId);
      toast.success(t('board:success.pictureDelete'));
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
        toast.success(t('board:success.canvasSettingsUpdate'));
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

    userEmail: permissions.userEmail,
    currentUserIsAdmin: permissions.currentUserIsAdmin,

    contextMenu,
    handlePromote,
    handleRemove,
    handleRightClick,

    inviteForm,
    handleInviteSuccess,

    handleUpdateName,
    handleUpdateDescription,

    isInviteModalOpen,
    setInviteModalOpen,
    editingField,
    setEditingField,
    isLeaveConfirmOpen,
    setLeaveConfirmOpen,
    isDeleteConfirmOpen,
    setDeleteConfirmOpen,

    handleLeaveBoard,
    handlePictureUpload,
    promptPictureDelete,
    handleConfirmDeletePicture,
    handleCanvasSettingsUpdate,
  };
};
