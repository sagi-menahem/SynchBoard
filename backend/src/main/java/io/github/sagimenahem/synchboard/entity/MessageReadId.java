// File: backend/src/main/java/io/github/sagimenahem/synchboard/entity/MessageReadId.java
package io.github.sagimenahem.synchboard.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MessageReadId implements Serializable {
    private Long message;
    private String userEmail;
}
