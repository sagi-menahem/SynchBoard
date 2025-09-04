import { useCallback, useState } from 'react';

import { useAuth } from 'features/auth/hooks/useAuth';
import * as boardService from 'features/board/services/boardService';
import type { Member } from 'features/board/types/BoardTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useContextMenu } from 'shared/hooks';
import logger from 'shared/utils/logger';
import { toastPromise } from 'shared/utils/toastUtils';

export interface UseBoardMemberActionsReturn {
  // Member management actions
  handlePromoteMember: (member: Member) => Promise<void>;
  handleRemoveMember: (member: Member) => Promise<void>;
  handleInviteMember: (email: string) => Promise<Member>;
  handleRightClick: (event: React.MouseEvent, member: Member) => void;

  // Context menu state
  contextMenu: ReturnType<typeof useContextMenu<Member>>;

  // Invite form state
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

export const useBoardMemberActions = (
  boardId: number,
  currentUserIsAdmin: boolean,
): UseBoardMemberActionsReturn => {
  const { t } = useTranslation(['board', 'common']);
  const { userEmail } = useAuth();
  const contextMenu = useContextMenu<Member>();

  // Invite form state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Member management actions
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

  // Invite form submit handler
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
