import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useAuth } from 'hooks/auth/useAuth';
import { useContextMenu } from 'hooks/common/useContextMenu';
import * as boardService from 'services/boardService';
import type { Member } from 'types/BoardTypes';

export const useBoardMemberManagement = (boardId: number, currentUserIsAdmin: boolean) => {
  const { t } = useTranslation();
  const { userEmail } = useAuth();
  const contextMenu = useContextMenu<Member>();

  const handlePromote = useCallback(
    async (member: Member) => {
      await toast.promise(
        boardService.promoteMember(boardId, member.email),
        {
          loading: t('loading.member.promote'),
          success: t('promoteSuccess', { userName: member.firstName }),
          error: t('errors.member.promote'),
        },
      );
    },
    [boardId, t],
  );

  const handleRemove = useCallback(
    async (member: Member) => {
      await toast.promise(
        boardService.removeMember(boardId, member.email),
        {
          loading: t('loading.member.remove'),
          success: t('removeSuccess', { userName: member.firstName }),
          error: t('errors.member.remove'),
        },
      );
    },
    [boardId, t],
  );

  const handleInvite = useCallback(
    async (email: string) => {
      const newMember = await toast.promise(
        boardService.inviteMember(boardId, email),
        {
          loading: t('loading.member.invite'),
          success: t('inviteMemberForm.inviteSuccess', { email }),
          error: t('errors.member.invite'),
        },
      );
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

  return {
    contextMenu,
    handlePromote,
    handleRemove,
    handleInvite,
    handleRightClick,
  };
};