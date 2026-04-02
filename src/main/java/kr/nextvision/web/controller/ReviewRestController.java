package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Review;
import kr.nextvision.web.repository.ReviewRepository;
import kr.nextvision.web.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 파이썬과 프론트엔드의 접근을 허용!
public class ReviewRestController {

    private final ReviewRepository reviewRepository;
    
    // 🌟 상품 등록할 때 쓰셨던 마법의 파일 업로드 서비스 재사용!
    private final FileUploadService fileUploadService;

    // 1. 리뷰 조회 API (아까 만든 부분)
    @GetMapping("/list")
    public ResponseEntity<List<Review>> getReviewList(@RequestParam("p_idx") Integer pIdx) {
        List<Review> reviews = reviewRepository.findByPIdx(pIdx);
        return ResponseEntity.ok(reviews);
    }

    // 🌟 2. 리뷰 등록 API (새로 추가된 부분!)
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerReview(
            @RequestParam("p_idx") Integer pIdx,
            @RequestParam("rating") Integer rating,
            @RequestParam("rev_content") String revContent,
            @RequestParam(value = "user_idx", required = false) Integer userIdx,  
            @RequestParam(value = "user_name", required = false) String userName,  
            @RequestParam(value = "img1", required = false) MultipartFile img1,
            @RequestParam(value = "img2", required = false) MultipartFile img2,
            @RequestParam(value = "img3", required = false) MultipartFile img3
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            Review review = new Review();
            review.setPIdx(pIdx);
            review.setUserIdx(userIdx != null ? userIdx : 0);  
            review.setUserName(userName != null ? userName : "알 수 없음");  
            review.setRating(rating);
            review.setRevContent(revContent);
            review.setCreatedAt(java.time.LocalDateTime.now());

            // 첨부된 이미지가 있다면 서버에 업로드 후 URL 저장 (최대 3장)
            if (img1 != null && !img1.isEmpty()) {
                review.setRevImg1(fileUploadService.uploadFile(img1, "reviews"));
            }
            if (img2 != null && !img2.isEmpty()) {
                review.setRevImg2(fileUploadService.uploadFile(img2, "reviews"));
            }
            if (img3 != null && !img3.isEmpty()) {
                review.setRevImg3(fileUploadService.uploadFile(img3, "reviews"));
            }

            // DB에 진짜로 저장!
            reviewRepository.save(review);

            response.put("status", "success");
            response.put("message", "리뷰가 성공적으로 등록되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "리뷰 등록 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}