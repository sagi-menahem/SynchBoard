// File: frontend/src/hooks/board/details/useBoardPermissions.ts
import { useAuth } from 'hooks/auth/useAuth';
import type { BoardDetails } from 'types/board.types';

interface BoardPermissions {
    currentUserIsAdmin: boolean;
    userEmail: string | null;
}

export const useBoardPermissions = (boardDetails: BoardDetails | null): BoardPermissions => {
    const { userEmail } = useAuth();

    const currentUserIsAdmin = boardDetails?.members.find((member) => member.email === userEmail)?.isAdmin || false;

    return {
        currentUserIsAdmin,
        userEmail,
    };
};
