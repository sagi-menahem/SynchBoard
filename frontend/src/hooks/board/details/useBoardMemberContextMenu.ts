// File: frontend/src/hooks/board/details/useBoardMemberContextMenu.ts
import { useContextMenu } from 'hooks/common/useContextMenu';
import { useAuth } from 'hooks/auth/useAuth';
import { useCallback } from 'react';
import type { Member } from 'types/board.types';

export const useBoardMemberContextMenu = (currentUserIsAdmin: boolean) => {
    const { userEmail } = useAuth();
    const contextMenu = useContextMenu<Member>();

    const handleRightClick = useCallback(
        (event: React.MouseEvent, member: Member) => {
            event.preventDefault();
            if (currentUserIsAdmin && member.email !== userEmail) {
                contextMenu.handleContextMenu(event, member);
            }
        },
        [currentUserIsAdmin, userEmail, contextMenu]
    );

    return {
        contextMenu,
        handleRightClick,
    };
};
