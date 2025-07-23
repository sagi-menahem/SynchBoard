// File: frontend/src/hooks/useBoardDetailsPage.ts
import { APP_ROUTES } from 'constants/routes.constants';
import { useAuth } from 'hooks/useAuth';
import { useBoardDetails } from 'hooks/useBoardDetails';
import { useContextMenu } from 'hooks/useContextMenu';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as boardService from 'services/boardService';
import type { Member } from 'types/board.types';

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

    const handlePromote = useCallback(() => {
        if (!contextMenu.data || !boardId) return;

        const memberToPromote = contextMenu.data;

        boardService.promoteMember(boardId, memberToPromote.email)
            .then(() => {
                toast.success(t('promoteSuccess', { userName: memberToPromote.firstName }));
                refetch();
            })
            .catch(error => console.error("Failed to promote member:", error))
            .finally(() => contextMenu.closeMenu());

    }, [boardId, contextMenu, refetch, t]);

    const handleRemove = useCallback(() => {
        if (!contextMenu.data || !boardId) return;

        const memberToRemove = contextMenu.data;

        boardService.removeMember(boardId, memberToRemove.email)
            .then(() => {
                toast.success(t('removeSuccess', { userName: memberToRemove.firstName }));
                refetch();
            })
            .catch(error => console.error("Failed to remove member:", error))
            .finally(() => contextMenu.closeMenu());

    }, [boardId, contextMenu, refetch, t]);

    const handleUpdateName = async (newName: string) => {
        if (!boardId) return;
        try {
            await boardService.updateBoardName(boardId, newName);
            toast.success("Board name updated successfully!");
            refetch();
        } catch (error) {
            console.error("Update name error:", error);
            throw error;
        }
    };

    const handleUpdateDescription = async (newDescription: string) => {
        if (!boardId) return;
        try {
            await boardService.updateBoardDescription(boardId, newDescription);
            toast.success("Board description updated successfully!");
            refetch();
        } catch (error) {
            console.error("Update description error:", error);
            throw error;
        }
    };

    const handleRightClick = useCallback((event: React.MouseEvent, member: Member) => {
        event.preventDefault();
        const isAdmin = boardDetails?.members.find(m => m.email === userEmail)?.isAdmin || false;
        if (isAdmin && member.email !== userEmail) {
            contextMenu.handleContextMenu(event, member);
        }
    }, [boardDetails, userEmail, contextMenu]);

    const handleLeaveBoard = useCallback(() => {
        if (!boardDetails) return;

        boardService.leaveBoard(boardId)
            .then(() => {
                toast.success(t('leaveBoard.success', { boardName: boardDetails.name }));
                navigate(APP_ROUTES.BOARD_LIST);
            })
            .catch(error => console.error("Failed to leave board:", error))
            .finally(() => setLeaveConfirmOpen(false));

    }, [boardId, boardDetails, navigate, t]);

    const handlePictureUpload = useCallback(async (file: File) => {
        try {
            await boardService.uploadBoardPicture(boardId, file);
            toast.success("Picture updated successfully!");
            refetch();
        } catch (error) {
            console.error(error);
        } finally {
            setPictureModalOpen(false);
        }
    }, [boardId, refetch]);

    const promptPictureDelete = useCallback(() => {
        setPictureModalOpen(false);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDeletePicture = useCallback(() => {
        boardService.deleteBoardPicture(boardId)
            .then(() => {
                toast.success("Picture deleted successfully.");
                refetch();
            })
            .catch(error => console.error(error));
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