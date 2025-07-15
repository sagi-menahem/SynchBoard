// File: frontend/src/hooks/useBoardDetailsPage.ts
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { useBoardDetails } from './useBoardDetails';
import { useAuth } from './useAuth';
import { useContextMenu } from './useContextMenu';
import * as boardService from '../services/boardService';
import type { Member } from '../types/board.types';

export const useBoardDetailsPage = (boardId: number) => {
    const { boardDetails, isLoading, refetch } = useBoardDetails(boardId);
    const { userEmail } = useAuth();
    const contextMenu = useContextMenu<Member>();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    const currentUserIsAdmin = boardDetails?.members.find(member => member.email === userEmail)?.isAdmin || false;

    const handleInviteSuccess = useCallback((newMember: Member) => {
        console.log("Successfully invited:", newMember);
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

    const handleRightClick = useCallback((event: React.MouseEvent, member: Member) => {
        event.preventDefault();
        
        // --- DEBUGGING CONSOLE LOGS ---
        console.log("--- Right Click Debug ---");
        const isAdmin = boardDetails?.members.find(m => m.email === userEmail)?.isAdmin || false;
        console.log("Current user email:", userEmail);
        console.log("Right-clicked member email:", member.email);
        console.log("Is current user supposed to be admin?", isAdmin);
        console.log("Condition to show menu:", `isAdmin (${isAdmin}) && member.email (${member.email}) !== userEmail (${userEmail})`);
        // --- END DEBUGGING ---

        if (isAdmin && member.email !== userEmail) {
            contextMenu.handleContextMenu(event, member);
        }
    }, [boardDetails, userEmail, contextMenu]);

    return {
        isLoading,
        boardDetails,
        userEmail,
        currentUserIsAdmin,
        contextMenu,
        isInviteModalOpen,
        setInviteModalOpen,
        handleInviteSuccess,
        handlePromote,
        handleRemove,
        handleRightClick
    };
};