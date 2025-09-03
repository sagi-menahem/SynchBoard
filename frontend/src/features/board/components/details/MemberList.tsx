import React from 'react';

import type { Member } from 'features/board/types/BoardTypes';

import MemberListItem from './MemberListItem';

interface MemberListProps {
    members: Member[];
    onMemberContextMenu: (event: React.MouseEvent, member: Member) => void;
}

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
