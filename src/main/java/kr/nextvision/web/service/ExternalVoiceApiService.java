package kr.nextvision.web.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ExternalVoiceApiService {

    public String requestTts(String text, String voice) {
        // TODO 실제 외부 TTS API 호출
        return "/audio/sample.mp3";
    }

    public String requestStt(MultipartFile audioFile) {
        // TODO 실제 외부 STT API 호출
        return "테스트 음성 인식 결과";
    }
}