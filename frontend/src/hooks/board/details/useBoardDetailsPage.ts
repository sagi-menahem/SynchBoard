// File: frontend/src/hooks/board/details/useBoardDetailsPage.ts
import { useBoardDetails } from 'hooks/board/details/useBoardDetails';
import { useBoardEditing } from 'hooks/board/details/useBoardEditing';
import { useBoardLeave } from 'hooks/board/details/useBoardLeave';
import { useBoardMemberActions } from 'hooks/board/details/useBoardMemberActions';
import { useBoardMemberContextMenu } from 'hooks/board/details/useBoardMemberContextMenu';
import { useBoardPictureManager } from 'hooks/board/details/useBoardPictureManager';
import { useAuth } from 'hooks/useAuth';
import { useCallback, useState } from 'react';
import type { Member } from 'types/board.types';

type EditingField = 'name' | 'description';

export const useBoardDetailsPage = (boardId: number) => {
    const { boardDetails, isLoading, refetch } = useBoardDetails(boardId);
    const { userEmail } = useAuth();

    // State management
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<EditingField | null>(null);
    const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [isPictureModalOpen, setPictureModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Derived state
    const currentUserIsAdmin = boardDetails?.members.find((member) => member.email === userEmail)?.isAdmin || false;

    // Custom hooks for specific functionalities
    const { handleUpdateName, handleUpdateDescription } = useBoardEditing(boardId, refetch);
    const { handleLeaveBoard } = useBoardLeave(boardId);
    const { handlePictureUpload, handlePictureDelete } = useBoardPictureManager(boardId, refetch);
    const { handlePromote, handleRemove } = useBoardMemberActions(boardId, refetch);
    const { contextMenu, handleRightClick } = useBoardMemberContextMenu(currentUserIsAdmin);

    // Local handlers
    const handleInviteSuccess = useCallback(
        (newMember: Member) => {
            console.log('New member invited:', newMember);
            refetch();
            setInviteModalOpen(false);
        },
        [refetch]
    );

    const handlePromoteWithCleanup = useCallback(async () => {
        if (!contextMenu.data) return;
        try {
            await handlePromote(contextMenu.data);
        } finally {
            contextMenu.closeMenu();
        }
    }, [contextMenu, handlePromote]);

    const handleRemoveWithCleanup = useCallback(async () => {
        if (!contextMenu.data) return;
        try {
            await handleRemove(contextMenu.data);
        } finally {
            contextMenu.closeMenu();
        }
    }, [contextMenu, handleRemove]);

    const handleLeaveWithCleanup = useCallback(async () => {
        try {
            await handleLeaveBoard(boardDetails);
        } finally {
            setLeaveConfirmOpen(false);
        }
    }, [handleLeaveBoard, boardDetails]);

    const handlePictureUploadWithCleanup = useCallback(
        async (file: File) => {
            try {
                await handlePictureUpload(file);
            } finally {
                setPictureModalOpen(false);
            }
        },
        [handlePictureUpload]
    );

    const promptPictureDelete = useCallback(() => {
        setPictureModalOpen(false);
        setDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDeletePicture = useCallback(async () => {
        try {
            await handlePictureDelete();
        } finally {
            setDeleteConfirmOpen(false);
        }
    }, [handlePictureDelete]);

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
        handlePromote: handlePromoteWithCleanup,
        handleRemove: handleRemoveWithCleanup,
        handleUpdateName,
        handleUpdateDescription,
        handleRightClick,
        handleLeaveBoard: handleLeaveWithCleanup,
        handlePictureUpload: handlePictureUploadWithCleanup,
        promptPictureDelete,
        handleConfirmDeletePicture,
    };
};
