package kr.nextvision.web.service;

import kr.nextvision.web.dto.TtsRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
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

        System.out.println("===== TTS 요청 시작 =====");
        System.out.println("text = " + request.getText());
        System.out.println("voiceId = " + request.getVoiceId());
        System.out.println("ttsApiKey 존재 여부 = " + (ttsApiKey != null && !ttsApiKey.isBlank()));

        String actualVoiceId = mapVoiceId(request.getVoiceId());
        System.out.println("actualVoiceId = " + actualVoiceId);

        String url = "https://api.elevenlabs.io/v1/text-to-speech/" + actualVoiceId;
        System.out.println("url = " + url);

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

        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    byte[].class
            );

            System.out.println("TTS 응답 status = " + response.getStatusCode());
            System.out.println("TTS 응답 body null 여부 = " + (response.getBody() == null));

            return response.getBody();

        } catch (HttpStatusCodeException e) {
            System.out.println("===== ElevenLabs 호출 실패 =====");
            System.out.println("status = " + e.getStatusCode());
            System.out.println("response body = " + e.getResponseBodyAsString(StandardCharsets.UTF_8));
            throw new RuntimeException("외부 TTS API 호출 실패: " + e.getStatusCode(), e);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("TTS 생성 중 서버 오류", e);
        }
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
            case "voice_01" -> "Mx48CWClvl522or3Frvp";
            case "voice_02" -> "3MTvEr8xCMCC2mL9ujrI";
            case "voice_03" -> "KlstlYt9VVf3zgie2Oht";
            case "voice_04" -> "6yp5xWNuHEXOVkwW5Ghz";
            case "voice_05" -> "PDoCXqBQFGsvfO0hNkEs";
            case "voice_06" -> "uyVNoMrnUku1dZyVEXwD";
            default -> throw new IllegalArgumentException("유효하지 않은 voiceId입니다.");
        };
    }
}