// File: frontend/src/hooks/useBoardDetailsPage.ts
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { useBoardDetails } from './useBoardDetails';
import { useAuth } from './useAuth';
import { useContextMenu } from './useContextMenu';
import * as boardService from '../services/boardService';
import type { Member } from '../types/board.types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APP_ROUTES } from '../constants/routes.constants';

type EditingField = 'name' | 'description';

export const useBoardDetailsPage = (boardId: number) => {
    const { boardDetails, isLoading, refetch } = useBoardDetails(boardId);
    const { userEmail } = useAuth();
    const contextMenu = useContextMenu<Member>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<EditingField | null>(null);
    const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [isPictureModalOpen, setPictureModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const currentUserIsAdmin = boardDetails?.members.find(member => member.email === userEmail)?.isAdmin || false;

    const handleInviteSuccess = useCallback((newMember: Member) => {
        console.log("New member invited:", newMember);
        refetch();
        setInviteModalOpen(false);
    }, [refetch]);

    const handlePromote = useCallback(async () => {
        if (!contextMenu.data || !boardId) return;
        try {
            await boardService.promoteMember(boardId, contextMenu.data.email);
            toast.success(`${contextMenu.data.firstName} has been promoted to admin.`);
            refetch();
        } catch (error) {
            toast.error(
                error instanceof AxiosError && error.response?.data?.message
                    ? error.response.data.message
                    : "Failed to promote member."
            );
        }
        contextMenu.closeMenu();
    }, [boardId, contextMenu, refetch]);

    const handleRemove = useCallback(async () => {
        if (!contextMenu.data || !boardId) return;
        try {
            await boardService.removeMember(boardId, contextMenu.data.email);
            toast.success(`${contextMenu.data.firstName} has been removed from the board.`);
            refetch();
        } catch (error) {
            toast.error(
                error instanceof AxiosError && error.response?.data?.message
                    ? error.response.data.message
                    : "Failed to remove member."
            );
        }
        contextMenu.closeMenu();
    }, [boardId, contextMenu, refetch]);

    const handleUpdateName = useCallback(async (newName: string) => {
        if (!boardId) return;
        try {
            await boardService.updateBoardName(boardId, newName);
            toast.success("Board name updated successfully!");
            refetch();
        } catch (error) {
            toast.error("Failed to update board name.");
            console.error("Update name error:", error);
            throw error;
        }
    }, [boardId, refetch]);

    const handleUpdateDescription = useCallback(async (newDescription: string) => {
        if (!boardId) return;
        try {
            await boardService.updateBoardDescription(boardId, newDescription);
            toast.success("Board description updated successfully!");
            refetch();
        } catch (error) {
            toast.error("Failed to update board description.");
            console.error("Update description error:", error);
            throw error;
        }
    }, [boardId, refetch]);

    const handleRightClick = useCallback((event: React.MouseEvent, member: Member) => {
        event.preventDefault();
        const isAdmin = boardDetails?.members.find(m => m.email === userEmail)?.isAdmin || false;
        if (isAdmin && member.email !== userEmail) {
            contextMenu.handleContextMenu(event, member);
        }
    }, [boardDetails, userEmail, contextMenu]);

    const handleLeaveBoard = useCallback(async () => {
        if (!boardDetails) return;
        try {
            await boardService.leaveBoard(boardId);
            toast.success(t('leaveBoard.success'));
            navigate(APP_ROUTES.BOARD_LIST);
        } catch (error) {
            console.error("Failed to leave board:", error);
            const errorMessage = error instanceof AxiosError && error.response?.data?.message
                ? error.response.data.message
                : t('leaveBoard.error');
            toast.error(errorMessage);
        } finally {
            setLeaveConfirmOpen(false);
        }
    }, [boardId, boardDetails, navigate, t]);

    const handlePictureUpload = useCallback(async (file: File) => {
        try {
            await boardService.uploadBoardPicture(boardId, file);
            toast.success("Picture updated successfully!");
            refetch();
        } catch (error) {
            toast.error("Failed to upload picture.");
            console.error(error);
        } finally {
            setPictureModalOpen(false);
        }
    }, [boardId, refetch]);

    const promptPictureDelete = useCallback(() => {
        setPictureModalOpen(false);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDeletePicture = useCallback(async () => {
        try {
            await boardService.deleteBoardPicture(boardId);
            toast.success("Picture deleted successfully.");
            refetch();
        } catch (error) {
            toast.error("Failed to delete picture.");
            console.error(error);
        }
    }, [boardId, refetch]);

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