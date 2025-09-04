package io.github.sagimenahem.synchboard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity representing the many-to-many relationship between users and boards. Stores membership
 * information including admin status and join date. Uses composite primary key consisting of user
 * email and board ID.
 * 
 * @author Sagi Menahem
 */
@Entity
@Table(name = "group_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(GroupMemberId.class)
public class GroupMember {

    @Id
    @Column(name = "user_email")
    private String userEmail;

    @Id
    @Column(name = "board_group_id")
    private Long boardGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", referencedColumnName = "email", insertable = false,
            updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", referencedColumnName = "board_group_id",
            insertable = false, updatable = false)
    private GroupBoard groupBoard;

    @Column(name = "is_admin", nullable = false)
    private Boolean isAdmin;

    @Column(name = "join_date", nullable = false, updatable = false)
    private LocalDateTime joinDate;

    @PrePersist
    protected void onCreate() {
        this.joinDate = LocalDateTime.now();
    }
}
