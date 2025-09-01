package io.github.sagimenahem.synchboard.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "group_boards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupBoard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_group_id")
    private Long boardGroupId;

    @Column(name = "board_group_name", nullable = false)
    private String boardGroupName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_email", referencedColumnName = "email", nullable = true)
    private User createdByUser;

    @Column(name = "invite_code", unique = true)
    private String inviteCode;

    @Column(name = "group_picture_url")
    private String groupPictureUrl;

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate;

    @Column(name = "group_description")
    private String groupDescription;

    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;

    @Column(name = "canvas_background_color")
    @Builder.Default
    private String canvasBackgroundColor = "#222";

    @Column(name = "canvas_width")
    @Builder.Default
    private Integer canvasWidth = 1920;

    @Column(name = "canvas_height")
    @Builder.Default
    private Integer canvasHeight = 1080;

    @PrePersist
    protected void onCreate() {
        this.creationDate = LocalDateTime.now();
        this.lastModifiedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastModifiedDate = LocalDateTime.now();
    }
}
