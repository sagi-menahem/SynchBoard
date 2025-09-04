import type { Member } from 'features/board/types/BoardTypes';
import React from 'react';

import MemberListItem from './MemberListItem';

/**
 * Props interface for MemberList component.
 * Defines the member data and interaction handlers for the member list display.
 */
interface MemberListProps {
  /** Array of board members to display in the list */
  members: Member[];
  /** Handler for right-click context menu events on individual members */
  onMemberContextMenu: (event: React.MouseEvent, member: Member) => void;
}

/**
 * Renders a list of board members using individual MemberListItem components.
 * This component acts as a simple container that maps over the members array
 * to provide a consistent list structure with proper key management.
 * 
 * @param members - Array of board members to display in the list
 * @param onMemberContextMenu - Handler for right-click context menu events on individual members
 */
const MemberList: React.FC<MemberListProps> = ({ members, onMemberContextMenu }) => {
  return (
    <>
      {members.map((member) => (
        <li key={member.email}>
          <MemberListItem member={member} onContextMenu={onMemberContextMenu} />
        </li>
      ))}
    </>
  );
};

export default MemberList;
