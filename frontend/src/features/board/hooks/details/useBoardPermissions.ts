import { useAuth } from 'features/auth/hooks/useAuth';
import type { BoardDetails } from 'features/board/types/BoardTypes';

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
