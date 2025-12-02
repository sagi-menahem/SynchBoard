import { useAuth } from 'features/auth/hooks/useAuth';
import * as boardService from 'features/board/services/boardService';
import type { Member } from 'features/board/types/BoardTypes';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useContextMenu } from 'shared/hooks';
import logger from 'shared/utils/logger';
import { toastPromise } from 'shared/utils/toastUtils';

export interface UseBoardMemberActionsReturn {
  handlePromoteMember: (member: Member) => Promise<void>;
  handleRemoveMember: (member: Member) => Promise<void>;
  handleInviteMember: (email: string) => Promise<Member>;
  handleRightClick: (event: React.MouseEvent, member: Member) => void;

  contextMenu: ReturnType<typeof useContextMenu<Member>>;

  inviteForm: {
    email: string;
    setEmail: (email: string) => void;
    isSubmitting: boolean;
    handleSubmit: (
      event: React.FormEvent<HTMLFormElement>,
      onSuccess: (newMember: Member) => void,
    ) => Promise<void>;
  };
}

/**
 * Custom hook that manages board member operations including promotion, removal, and invitation.
 * This hook provides a complete interface for board member management operations with proper
 * permission handling, form state management for member invitations, and context menu functionality
 * for member actions. It handles the complex business logic of member operations while providing
 * a clean API with integrated toast notifications and error handling. The hook ensures that only
 * admin users can perform privileged operations and prevents users from acting on themselves.
 *
 * @param boardId - ID of the board for which to manage members
 * @param currentUserIsAdmin - Whether the current user has admin privileges for member operations
 * @returns Object containing member action handlers, context menu controls, and invite form state management
 */
export const useBoardMemberActions = (
  boardId: number,
  currentUserIsAdmin: boolean,
): UseBoardMemberActionsReturn => {
  const { t } = useTranslation(['board', 'common']);
  const { userEmail } = useAuth();
  const contextMenu = useContextMenu<Member>();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePromoteMember = useCallback(
    async (member: Member) => {
      await toastPromise(boardService.promoteMember(boardId, member.email), {
        loading: t('board:loading.member.promote'),
        success: t('board:success.member.promote', { userName: member.firstName }),
        error: t('board:errors.member.promote'),
      });
    },
    [boardId, t],
  );

  const handleRemoveMember = useCallback(
    async (member: Member) => {
      await toastPromise(boardService.removeMember(boardId, member.email), {
        loading: t('board:loading.member.remove'),
        success: t('board:success.member.remove', { userName: member.firstName }),
        error: t('board:errors.member.remove'),
      });
    },
    [boardId, t],
  );

  const handleInviteMember = useCallback(
    async (inviteEmail: string) => {
      const newMember = await toastPromise(boardService.inviteMember(boardId, inviteEmail), {
        loading: t('board:loading.member.invite'),
        success: t('board:success.member.invite', { email: inviteEmail }),
        error: t('board:errors.member.invite'),
      });
      return newMember;
    },
    [boardId, t],
  );

  const handleRightClick = useCallback(
    (event: React.MouseEvent, member: Member) => {
      event.preventDefault();
      if (currentUserIsAdmin && member.email !== userEmail) {
        contextMenu.handleContextMenu(event, member);
      }
    },
    [currentUserIsAdmin, userEmail, contextMenu],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>, onSuccess: (newMember: Member) => void) => {
      event.preventDefault();

      if (!email.trim()) {
        logger.warn('[useBoardMemberActions] Email validation failed - empty email');
        toast.error(t('board:inviteMemberForm.emailRequiredError'));
        return;
      }

      setIsSubmitting(true);

      try {
        const newMember = await handleInviteMember(email);
        onSuccess(newMember);
        setEmail('');
      } catch (error) {
        logger.error('[useBoardMemberActions] Failed to invite member:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, handleInviteMember, t],
  );

  return {
    handlePromoteMember,
    handleRemoveMember,
    handleInviteMember,
    handleRightClick,
    contextMenu,
    inviteForm: {
      email,
      setEmail,
      isSubmitting,
      handleSubmit,
    },
  };
};
