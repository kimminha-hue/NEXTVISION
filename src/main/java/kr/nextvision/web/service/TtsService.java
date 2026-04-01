package kr.nextvision.web.service;

import kr.nextvision.web.dto.TtsRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TtsService {

    @Value("${tts.api.key}")
    private String ttsApiKey;

    private final RestTemplate restTemplate;

    public TtsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public byte[] generateSpeech(TtsRequest request) {
        validateRequest(request);

        String actualVoiceId = mapVoiceId(request.getVoiceId());
        String url = "https://api.elevenlabs.io/v1/text-to-speech/" + actualVoiceId;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("xi-api-key", ttsApiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_OCTET_STREAM));

        Map<String, Object> body = new HashMap<>();
        body.put("text", request.getText());

        Map<String, Object> voiceSettings = new HashMap<>();
        voiceSettings.put("stability", 0.5);
        voiceSettings.put("similarity_boost", 0.75);
        body.put("voice_settings", voiceSettings);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                byte[].class
        );

        return response.getBody();
    }

    private void validateRequest(TtsRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("요청값이 없습니다.");
        }
        if (request.getText() == null || request.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("text를 입력해주세요.");
        }
        if (request.getVoiceId() == null || request.getVoiceId().trim().isEmpty()) {
            throw new IllegalArgumentException("voiceId를 입력해주세요.");
        }
    }

    private String mapVoiceId(String voiceId) {
        return switch (voiceId) {
            case "voice_01" -> "Mx48CWClvl522or3Frvp"; // 젊은 남성
            case "voice_02" -> "3MTvEr8xCMCC2mL9ujrI"; // 중년 남성
            case "voice_03" -> "KlstlYt9VVf3zgie2Oht"; // 젊은 여성
            case "voice_04" -> "6yp5xWNuHEXOVkwW5Ghz"; // 중년 여성
            case "voice_05" -> "PDoCXqBQFGsvfO0hNkEs"; // 설명 목소리 남
            case "voice_06" -> "uyVNoMrnUku1dZyVEXwD"; // 설명 목소리 여
            default -> throw new IllegalArgumentException("유효하지 않은 voiceId입니다.");
        };
    }
}