import React from 'react';

import { useTranslation } from 'react-i18next';

import { ContextMenu } from 'components/common/ContextMenu';
import { ContextMenuItem } from 'components/common/ContextMenuItem';
import type { Member } from 'types/BoardTypes';

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
  const { t } = useTranslation();

  if (!isOpen || !member) {
    return null;
  }

  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      {!member.isAdmin && (
        <ContextMenuItem onClick={onPromote}>
          {t('contextMenu.promoteToAdmin', { userName: member.firstName })}
        </ContextMenuItem>
      )}
      <ContextMenuItem onClick={onRemove} destructive>
        {t('contextMenu.removeFromBoard', { userName: member.firstName })}
      </ContextMenuItem>
    </ContextMenu>
  );
};

export default MemberContextMenu;
