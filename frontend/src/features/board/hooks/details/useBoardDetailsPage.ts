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

export const useBoardDetailsPage = (boardId: number) => {
  const { t } = useTranslation(['board', 'common']);
  const navigate = useNavigate();

  // Consolidated data and editing logic
  const {
    boardDetails,
    isLoading,
    permissions,
    optimisticState,
    handleUpdateName,
    handleUpdateDescription,
  } = useBoardDetailsData(boardId);

  // Consolidated member actions logic
  const { handlePromoteMember, handleRemoveMember, handleRightClick, contextMenu, inviteForm } =
    useBoardMemberActions(boardId, permissions.currentUserIsAdmin);

  // Local UI state
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Member action handlers with context menu integration
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

  // Board management handlers
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
    // Board data state
    isLoading,
    boardDetails,
    optimisticBoardState: optimisticState,

    // User permissions
    userEmail: permissions.userEmail,
    currentUserIsAdmin: permissions.currentUserIsAdmin,

    // Member actions
    contextMenu,
    handlePromote,
    handleRemove,
    handleRightClick,

    // Invite form
    inviteForm,
    handleInviteSuccess,

    // Board editing
    handleUpdateName,
    handleUpdateDescription,

    // UI state
    isInviteModalOpen,
    setInviteModalOpen,
    editingField,
    setEditingField,
    isLeaveConfirmOpen,
    setLeaveConfirmOpen,
    isDeleteConfirmOpen,
    setDeleteConfirmOpen,

    // Board management
    handleLeaveBoard,
    handlePictureUpload,
    promptPictureDelete,
    handleConfirmDeletePicture,
    handleCanvasSettingsUpdate,
  };
};
