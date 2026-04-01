package kr.nextvision.web.controller;

import kr.nextvision.web.dto.TtsRequest;
import kr.nextvision.web.service.TtsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tts")
public class TtsController {

    private final TtsService ttsService;

    public TtsController(TtsService ttsService) {
        this.ttsService = ttsService;
    }

    @PostMapping
    public ResponseEntity<byte[]> generateTts(@RequestBody TtsRequest request) {
        byte[] audioBytes = ttsService.generateSpeech(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=tts-output.mp3")
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(audioBytes);
    }
}