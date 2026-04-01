package kr.nextvision.web.controller;

import kr.nextvision.web.dto.SttResponse;
import kr.nextvision.web.service.SttService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/stt")
public class SttController {

    private final SttService sttService;

    public SttController(SttService sttService) {
        this.sttService = sttService;
    }

    @PostMapping
    public SttResponse transcribe(@RequestParam("file") MultipartFile file) {
        return sttService.transcribe(file);
    }
}