import { useCallback } from 'react';

import { useAuth } from 'features/auth/hooks/useAuth';
import * as boardService from 'features/board/services/boardService';
import type { Member } from 'features/board/types/BoardTypes';
import { useTranslation } from 'react-i18next';
import { useContextMenu } from 'shared/hooks';
import { toastPromise } from 'shared/utils/toastUtils';


export const useBoardMemberManagement = (boardId: number, currentUserIsAdmin: boolean) => {
  const { t } = useTranslation(['board', 'common']);
  const { userEmail } = useAuth();
  const contextMenu = useContextMenu<Member>();

  const handlePromote = useCallback(
    async (member: Member) => {
      await toastPromise(
        boardService.promoteMember(boardId, member.email),
        {
          loading: t('board:loading.member.promote'),
          success: t('board:success.member.promote', { userName: member.firstName }),
          error: t('board:errors.member.promote'),
        },
      );
    },
    [boardId, t],
  );

  const handleRemove = useCallback(
    async (member: Member) => {
      await toastPromise(
        boardService.removeMember(boardId, member.email),
        {
          loading: t('board:loading.member.remove'),
          success: t('board:success.member.remove', { userName: member.firstName }),
          error: t('board:errors.member.remove'),
        },
      );
    },
    [boardId, t],
  );

  const handleInvite = useCallback(
    async (email: string) => {
      const newMember = await toastPromise(
        boardService.inviteMember(boardId, email),
        {
          loading: t('board:loading.member.invite'),
          success: t('board:success.member.invite', { email }),
          error: t('board:errors.member.invite'),
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