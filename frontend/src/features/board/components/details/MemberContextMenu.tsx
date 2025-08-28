import React from 'react';

import type { Member } from 'features/board/types/BoardTypes';
import { useTranslation } from 'react-i18next';
import { ContextMenu, ContextMenuItem } from 'shared/ui';

interface MemberContextMenuProps {
    isOpen: boolean;
    x: number;
    y: number;
    member: Member | null;
    onClose: () => void;
    onPromote: () => void;
    onRemove: () => void;
}

const MemberContextMenu: React.FC<MemberContextMenuProps> = ({
  isOpen,
  x,
  y,
  member,
  onClose,
  onPromote,
  onRemove,
}) => {
  const { t } = useTranslation(['board', 'common']);

  if (!isOpen || !member) {
    return null;
  }

  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      {!member.isAdmin && (
        <ContextMenuItem onClick={onPromote}>
          {t('board:contextMenu.promoteToAdmin', { userName: member.email })}
        </ContextMenuItem>
      )}
      <ContextMenuItem onClick={onRemove} destructive>
        {t('board:contextMenu.removeFromBoard', { userName: member.email })}
      </ContextMenuItem>
    </ContextMenu>
  );
};

export default MemberContextMenu;
