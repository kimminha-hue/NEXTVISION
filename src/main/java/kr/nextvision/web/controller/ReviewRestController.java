package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Review;
import kr.nextvision.web.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 파이썬과 프론트엔드의 접근을 허용!
public class ReviewRestController {

    private final ReviewRepository reviewRepository;

    // 🌟 파이썬 챗봇이 호출할 주소: /avw/api/review/list?p_idx=2
    @GetMapping("/list")
    public ResponseEntity<List<Review>> getReviewList(@RequestParam("p_idx") Integer pIdx) {
        
        // p_idx(상품 번호)가 일치하는 리뷰만 DB에서 싹 긁어옵니다.
        List<Review> reviews = reviewRepository.findByPIdx(pIdx); // 엔티티 설정에 따라 findBypIdx 일 수도 있음
        
        // 긁어온 리뷰 리스트를 JSON 형태로 예쁘게 포장해서 파이썬으로 던져줍니다.
        return ResponseEntity.ok(reviews);
    }
}