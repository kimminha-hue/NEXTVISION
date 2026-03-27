package kr.nextvision.web.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/board")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BoardRestController {

    @GetMapping("/list")
    public List<Map<String, Object>> getBoardList() {
        List<Map<String, Object>> list = new ArrayList<>();

        Map<String, Object> item1 = new HashMap<>();
        item1.put("b_idx", 1);
        item1.put("b_title", "테스트 게시글 1");
        item1.put("b_writer", "admin");
        item1.put("b_datetime", "2026-03-24");
        item1.put("b_count", 10);

        Map<String, Object> item2 = new HashMap<>();
        item2.put("b_idx", 2);
        item2.put("b_title", "테스트 게시글 2");
        item2.put("b_writer", "nextvision");
        item2.put("b_datetime", "2026-03-24");
        item2.put("b_count", 25);

        list.add(item1);
        list.add(item2);

        return list;
    }
}