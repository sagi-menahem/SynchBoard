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
    useBoardPermissions
} from 'hooks/board/details';
import * as boardService from 'services/boardService';
import type { Member } from 'types/BoardTypes';
import type { EditingField } from 'types/CommonTypes';

export const useBoardDetailsPage = (boardId: number) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { boardDetails, isLoading, refetch } = useBoardDetails(boardId);
    const { handleUpdateName, handleUpdateDescription } = useBoardEditing(boardId, refetch);

    const { currentUserIsAdmin, userEmail } = useBoardPermissions(boardDetails);

    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<EditingField | null>(null);
    const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [isPictureModalOpen, setPictureModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const { contextMenu, handlePromote: memberPromote, handleRemove: memberRemove, handleRightClick } = 
        useBoardMemberManagement(boardId, currentUserIsAdmin, refetch);

    const handleInviteSuccess = useCallback(
        (newMember: Member) => {
            logger.debug('New member invited:', newMember);
            refetch();
            setInviteModalOpen(false);
        },
        [refetch]
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
            toast.success(t('leaveBoard.success', { boardName: boardDetails.name }));
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
                refetch();
            } catch (error) {
                logger.error('Picture upload error:', error);
                throw error;
            } finally {
                setPictureModalOpen(false);
            }
        },
        [boardId, refetch, t]
    );

    const promptPictureDelete = useCallback(() => {
        setPictureModalOpen(false);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDeletePicture = useCallback(async () => {
        try {
            await boardService.deleteBoardPicture(boardId);
            toast.success(t('success.board.pictureDelete'));
            refetch();
        } catch (error) {
            logger.error('Picture delete error:', error);
            throw error;
        } finally {
            setDeleteConfirmOpen(false);
        }
    }, [boardId, refetch, t]);

    return {
        isLoading,
        boardDetails,
        userEmail,
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
    };
};
