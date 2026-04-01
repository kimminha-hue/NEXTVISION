package kr.nextvision.web.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TtsResponse {
    private boolean success;
    private String audioUrl;
    private String message;
}