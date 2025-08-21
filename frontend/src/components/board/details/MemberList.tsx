import React from 'react';

import type { Member } from 'types/BoardTypes';

import MemberListItem from './MemberListItem';

interface MemberListProps {
    members: Member[];
    onMemberContextMenu: (event: React.MouseEvent, member: Member) => void;
}

const MemberList: React.FC<MemberListProps> = React.memo(({ members, onMemberContextMenu }) => {
    return (
        <>
            {members.map((member) => (
                <MemberListItem key={member.email} member={member} onContextMenu={onMemberContextMenu} />
            ))}
        </>
    );
});

MemberList.displayName = 'MemberList';

export default MemberList;
