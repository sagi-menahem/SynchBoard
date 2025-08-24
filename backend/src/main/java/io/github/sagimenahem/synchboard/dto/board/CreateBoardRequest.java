package io.github.sagimenahem.synchboard.dto.board;

import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_CANT_BE_EMPTY;
import static io.github.sagimenahem.synchboard.constants.MessageConstants.BOARD_NAME_LENGHT;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {

    @NotBlank(message = BOARD_NAME_CANT_BE_EMPTY)
    @Size(min = 3, max = 100, message = BOARD_NAME_LENGHT)
    private String name;

    private String description;

    private MultipartFile picture;

    private List<String> inviteEmails;
}
