package io.github.sagimenahem.synchboard.service.board;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.User;
import io.github.sagimenahem.synchboard.exception.ResourceNotFoundException;
import io.github.sagimenahem.synchboard.repository.GroupBoardRepository;
import io.github.sagimenahem.synchboard.repository.GroupMemberRepository;
import io.github.sagimenahem.synchboard.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

/**
 * Unit tests for {@link BoardAccessService}, the authorization gate every board operation is
 * required to pass through. Repositories are mocked so the tests exercise the permission logic
 * itself rather than persistence.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BoardAccessService")
class BoardAccessServiceTest {

    private static final Long BOARD_ID = 1L;
    private static final String CREATOR = "creator@synchboard.com";
    private static final String MEMBER = "member@synchboard.com";
    private static final String ADMIN = "admin@synchboard.com";
    private static final String OUTSIDER = "outsider@synchboard.com";

    @Mock
    private GroupBoardRepository boardRepository;

    @Mock
    private GroupMemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BoardAccessService boardAccessService;

    private GroupBoard board;

    private static User user(String email) {
        return User.builder().email(email).build();
    }

    private static GroupMember membership(String email, boolean isAdmin) {
        return GroupMember.builder().userEmail(email).boardGroupId(BOARD_ID).isAdmin(isAdmin).build();
    }

    @BeforeEach
    void setUp() {
        board = GroupBoard.builder()
            .boardGroupId(BOARD_ID)
            .boardGroupName("Sprint planning")
            .createdByUser(user(CREATOR))
            .build();
    }

    /** Stubs the lookups that every access path performs. */
    private void boardAndUserExist() {
        lenient().when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.of(board));
        lenient()
            .when(userRepository.findById(anyString()))
            .thenAnswer((invocation) -> Optional.of(user(invocation.getArgument(0))));
    }

    @Nested
    @DisplayName("validateBoardAccess")
    class BoardAccess {

        @Test
        @DisplayName("lets the creator in without consulting the membership table")
        void creatorIsAlwaysAllowed() {
            boardAndUserExist();

            assertThat(boardAccessService.validateBoardAccess(BOARD_ID, CREATOR)).isSameAs(board);
            verify(memberRepository, never()).existsByUserEmailAndBoardGroupId(anyString(), any());
        }

        @Test
        @DisplayName("lets a plain member in")
        void memberIsAllowed() {
            boardAndUserExist();
            when(memberRepository.existsByUserEmailAndBoardGroupId(MEMBER, BOARD_ID)).thenReturn(true);

            assertThat(boardAccessService.validateBoardAccess(BOARD_ID, MEMBER)).isSameAs(board);
        }

        @Test
        @DisplayName("denies a user who is neither creator nor member")
        void outsiderIsDenied() {
            boardAndUserExist();
            when(memberRepository.existsByUserEmailAndBoardGroupId(OUTSIDER, BOARD_ID)).thenReturn(false);

            assertThatThrownBy(() -> boardAccessService.validateBoardAccess(BOARD_ID, OUTSIDER))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not a member");
        }

        @Test
        @DisplayName("reports a missing board rather than leaking it as a permission error")
        void missingBoard() {
            when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> boardAccessService.validateBoardAccess(BOARD_ID, CREATOR))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Board not found");
        }

        @Test
        @DisplayName("reports a missing user")
        void missingUser() {
            when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.of(board));
            when(userRepository.findById(OUTSIDER)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> boardAccessService.validateBoardAccess(BOARD_ID, OUTSIDER))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("falls back to the membership check on an orphaned board with no creator")
        void boardWithoutCreator() {
            board.setCreatedByUser(null);
            boardAndUserExist();
            when(memberRepository.existsByUserEmailAndBoardGroupId(MEMBER, BOARD_ID)).thenReturn(true);

            assertThat(boardAccessService.validateBoardAccess(BOARD_ID, MEMBER)).isSameAs(board);
        }
    }

    @Nested
    @DisplayName("validateAdminAccess")
    class AdminAccess {

        @Test
        @DisplayName("lets the creator in")
        void creatorIsAdmin() {
            boardAndUserExist();

            assertThat(boardAccessService.validateAdminAccess(BOARD_ID, CREATOR)).isSameAs(board);
        }

        @Test
        @DisplayName("lets a member flagged as admin in")
        void adminMemberIsAllowed() {
            boardAndUserExist();
            when(memberRepository.existsByUserEmailAndBoardGroupId(ADMIN, BOARD_ID)).thenReturn(true);
            when(memberRepository.findByBoardGroupIdAndUserEmail(BOARD_ID, ADMIN)).thenReturn(
                Optional.of(membership(ADMIN, true))
            );

            assertThat(boardAccessService.validateAdminAccess(BOARD_ID, ADMIN)).isSameAs(board);
        }

        @Test
        @DisplayName("denies a member without the admin flag")
        void plainMemberIsDenied() {
            boardAndUserExist();
            when(memberRepository.existsByUserEmailAndBoardGroupId(MEMBER, BOARD_ID)).thenReturn(true);
            when(memberRepository.findByBoardGroupIdAndUserEmail(BOARD_ID, MEMBER)).thenReturn(
                Optional.of(membership(MEMBER, false))
            );

            assertThatThrownBy(() -> boardAccessService.validateAdminAccess(BOARD_ID, MEMBER))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("admin privileges");
        }

        @Test
        @DisplayName("denies an outsider before it ever reaches the admin check")
        void outsiderIsDenied() {
            boardAndUserExist();
            when(memberRepository.existsByUserEmailAndBoardGroupId(OUTSIDER, BOARD_ID)).thenReturn(false);

            assertThatThrownBy(() -> boardAccessService.validateAdminAccess(BOARD_ID, OUTSIDER)).isInstanceOf(
                AccessDeniedException.class
            );
        }
    }

    @Nested
    @DisplayName("validateCreatorAccess")
    class CreatorAccess {

        @Test
        @DisplayName("lets the creator in")
        void creatorIsAllowed() {
            when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.of(board));

            assertThat(boardAccessService.validateCreatorAccess(BOARD_ID, CREATOR)).isSameAs(board);
        }

        @Test
        @DisplayName("denies an admin member — creator-only operations are not delegable")
        void adminIsNotCreator() {
            when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.of(board));

            assertThatThrownBy(() -> boardAccessService.validateCreatorAccess(BOARD_ID, ADMIN))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the board creator");
        }

        @Test
        @DisplayName("denies everyone on a board whose creator record is gone")
        void orphanedBoardHasNoCreator() {
            board.setCreatedByUser(null);
            when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.of(board));

            assertThatThrownBy(() -> boardAccessService.validateCreatorAccess(BOARD_ID, CREATOR)).isInstanceOf(
                AccessDeniedException.class
            );
        }

        @Test
        @DisplayName("reports a missing board")
        void missingBoard() {
            when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> boardAccessService.validateCreatorAccess(BOARD_ID, CREATOR)).isInstanceOf(
                ResourceNotFoundException.class
            );
        }
    }

    @Nested
    @DisplayName("non-throwing predicates")
    class Predicates {

        @Test
        @DisplayName("isBoardMember converts a denial into false")
        void isBoardMember() {
            boardAndUserExist();
            when(memberRepository.existsByUserEmailAndBoardGroupId(MEMBER, BOARD_ID)).thenReturn(true);
            when(memberRepository.existsByUserEmailAndBoardGroupId(OUTSIDER, BOARD_ID)).thenReturn(false);

            assertThat(boardAccessService.isBoardMember(BOARD_ID, MEMBER)).isTrue();
            assertThat(boardAccessService.isBoardMember(BOARD_ID, OUTSIDER)).isFalse();
        }

        @Test
        @DisplayName("isBoardMember converts a missing board into false")
        void isBoardMemberMissingBoard() {
            when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.empty());

            assertThat(boardAccessService.isBoardMember(BOARD_ID, MEMBER)).isFalse();
        }

        @Test
        @DisplayName("isBoardAdmin is true for the creator and false for a plain member")
        void isBoardAdmin() {
            boardAndUserExist();
            when(memberRepository.existsByUserEmailAndBoardGroupId(MEMBER, BOARD_ID)).thenReturn(true);
            when(memberRepository.findByBoardGroupIdAndUserEmail(BOARD_ID, MEMBER)).thenReturn(
                Optional.of(membership(MEMBER, false))
            );

            assertThat(boardAccessService.isBoardAdmin(BOARD_ID, CREATOR)).isTrue();
            assertThat(boardAccessService.isBoardAdmin(BOARD_ID, MEMBER)).isFalse();
        }

        @Test
        @DisplayName("isBoardCreator distinguishes the creator from everyone else")
        void isBoardCreator() {
            when(boardRepository.findById(BOARD_ID)).thenReturn(Optional.of(board));

            assertThat(boardAccessService.isBoardCreator(BOARD_ID, CREATOR)).isTrue();
            assertThat(boardAccessService.isBoardCreator(BOARD_ID, ADMIN)).isFalse();
        }
    }
}
