package io.github.sagimenahem.synchboard.dto.board;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDetailsDTO {
    private Long id;
    private String name;
    private String description;
    private String pictureUrl;
    private List<MemberDTO> members;
    private String canvasBackgroundColor;
    private Integer canvasWidth;
    private Integer canvasHeight;
}
