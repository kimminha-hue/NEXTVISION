package kr.nextvision.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.nextvision.web.dto.SttResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class SttService {

    @Value("${tts.api.key}")
    private String elevenApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SttService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public SttResponse transcribe(MultipartFile file) {
        validateFile(file);

        String url = "https://api.elevenlabs.io/v1/speech-to-text";

        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", elevenApiKey);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("model_id", "scribe_v2");
        body.add("file", toByteArrayResource(file));

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            String extractedText = extractText(response.getBody());
            return new SttResponse(extractedText);

        } catch (HttpStatusCodeException e) {
            String errorBody = e.getResponseBodyAsString(StandardCharsets.UTF_8);
            throw new RuntimeException(
                    "STT 호출 실패 - 상태코드: " + e.getStatusCode() + ", 응답: " + errorBody
            );
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("음성 파일을 업로드해주세요.");
        }
    }

    private ByteArrayResource toByteArrayResource(MultipartFile file) {
        try {
            return new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
        } catch (IOException e) {
            throw new RuntimeException("파일 변환 중 오류가 발생했습니다.", e);
        }
    }

    private String extractText(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);

            if (root.has("text")) {
                return root.get("text").asText();
            }

            return json;
        } catch (Exception e) {
            throw new RuntimeException("STT 응답 파싱 실패: " + json, e);
        }
    }
}