package kr.nextvision.web.service;

import kr.nextvision.web.dto.QueryResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PythonApiService {

    @Value("${python.api.base-url}")
    private String pythonApiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public QueryResponse queryProducts(String question) {
        String url = pythonApiBaseUrl + "/query";

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("question", question);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> requestEntity =
                new HttpEntity<>(requestBody, headers);

        ResponseEntity<QueryResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                QueryResponse.class
        );

        return response.getBody();
    }
}