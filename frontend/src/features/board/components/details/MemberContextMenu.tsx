import type { Member } from 'features/board/types/BoardTypes';
import { Crown, UserMinus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EnhancedContextMenu, ContextMenuItem, ContextMenuSeparator } from 'shared/ui';

/**
 * Props interface for MemberContextMenu component.
 * Defines the positioning, member data, and action handlers for the context menu.
 */
interface MemberContextMenuProps {
  /** Controls visibility of the context menu */
  isOpen: boolean;
  /** Horizontal position in pixels for menu placement */
  x: number;
  /** Vertical position in pixels for menu placement */
  y: number;
  /** Member data for the selected member, null when no member is selected */
  member: Member | null;
  /** Handler to close the context menu */
  onClose: () => void;
  /** Handler to promote the member to admin privileges */
  onPromote: () => void;
  /** Handler to remove the member from the board */
  onRemove: () => void;
}

/**
 * Context menu component for member management actions in board details.
 * This component provides admin users with quick access to promote members to admin
 * or remove them from the board through a right-click context menu interface.
 *
 * @param isOpen - Controls visibility of the context menu
 * @param x - Horizontal position in pixels for menu placement
 * @param y - Vertical position in pixels for menu placement
 * @param member - Member data for the selected member, null when no member is selected
 * @param onClose - Handler to close the context menu
 * @param onPromote - Handler to promote the member to admin privileges
 * @param onRemove - Handler to remove the member from the board
 */
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
    <EnhancedContextMenu x={x} y={y} onClose={onClose}>
      {!member.isAdmin && (
        <>
          <ContextMenuItem onClick={onPromote} variant="primary" icon={<Crown size={16} />}>
            {t('board:contextMenu.promoteToAdmin', { userName: member.email })}
          </ContextMenuItem>
          <ContextMenuSeparator />
        </>
      )}
      <ContextMenuItem onClick={onRemove} variant="destructive" icon={<UserMinus size={16} />}>
        {t('board:contextMenu.removeFromBoard', { userName: member.email })}
      </ContextMenuItem>
    </EnhancedContextMenu>
  );
};

export default MemberContextMenu;
