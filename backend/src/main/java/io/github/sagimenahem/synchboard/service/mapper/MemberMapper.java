package io.github.sagimenahem.synchboard.service.mapper;

import io.github.sagimenahem.synchboard.dto.board.MemberDTO;
import io.github.sagimenahem.synchboard.entity.GroupMember;

public final class MemberMapper {

    private MemberMapper() {
        // Utility class
    }

    public static MemberDTO toMemberDTO(GroupMember membership) {
        return MemberDTO.builder()
                .email(membership.getUser().getEmail())
                .firstName(membership.getUser().getFirstName())
                .lastName(membership.getUser().getLastName())
                .profilePictureUrl(membership.getUser().getProfilePictureUrl())
                .isAdmin(membership.getIsAdmin())
                .build();
    }
}