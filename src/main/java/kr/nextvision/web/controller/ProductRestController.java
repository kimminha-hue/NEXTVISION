package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Product;
import kr.nextvision.web.repository.ProductRepository;
import kr.nextvision.web.service.FileUploadService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController 
@RequestMapping("/api/product") 
@RequiredArgsConstructor 
@CrossOrigin(origins = "*") 
public class ProductRestController {

    private final ProductRepository productRepository;
    private final FileUploadService fileUploadService;

    @GetMapping("/list")
    public List<Product> getProductList() {
        return productRepository.findAll();
    }
    
    /**
     * [관리자용] 새로운 상품 정보와 이미지를 등록하는 API
     * @param img1 프론트엔드에서 넘어온 메인 썸네일 이미지 파일
     * @param p_name 상품명
     * @param p_category 카테고리
     * @param p_price 가격
     * @param p_desc 상세 설명 (RAG용)
     * @return 성공 여부 및 업로드된 이미지 URL 반환
=======
     * @param sellerIdx 프론트엔드에서 넘어온 판매자 고유 번호 (추가됨!)
     * ... (생략) ...
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerProduct(
            @RequestParam("img1") MultipartFile img1,
            @RequestParam(value = "img2", required = false) MultipartFile img2,
            @RequestParam(value = "img3", required = false) MultipartFile img3,
            @RequestParam("p_name") String pName,
            @RequestParam("p_category") String pCategory,
            @RequestParam("p_price") int pPrice,
            @RequestParam("p_desc") String pDesc,
            // 🚨 핵심 수정 1: 프론트가 던진 seller_idx를 파라미터로 받습니다!
            @RequestParam("seller_idx") Integer sellerIdx 
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1. 1번 이미지(필수) 업로드
            String img1Url = fileUploadService.uploadFile(img1, "products");
            
            Product product = new Product();
            
            // 🚨 핵심 수정 2: 받은 sellerIdx를 Product 엔티티에 세팅합니다!
            product.setSellerIdx(sellerIdx); 
            product.setName(pName);       
            product.setCategory(pCategory); 
            product.setPrice(pPrice);
            product.setDescription(pDesc);
            product.setImg1(img1Url); 
            product.setCreatedAt(java.time.LocalDateTime.now());
            product.setUpdateAt(java.time.LocalDateTime.now());
            
            
            // (안전 장치) 엔티티 설계에 따라 pStock이 필수일 경우를 대비해 기본값 세팅
            product.setStock(100); 

            // 2. 2번 이미지(선택)가 들어왔다면 업로드 후 세팅
            if (img2 != null && !img2.isEmpty()) {
                String img2Url = fileUploadService.uploadFile(img2, "products");
                product.setImg2(img2Url);
            }
            // 3. 3번 이미지(선택)가 들어왔다면 업로드 후 세팅
            if (img3 != null && !img3.isEmpty()) {
                String img3Url = fileUploadService.uploadFile(img3, "products");
                product.setImg3(img3Url);
            }

            // DB에 최종 저장!
            productRepository.save(product);
            response.put("status", "success");
            response.put("message", "상품과 모든 이미지가 성공적으로 등록되었습니다.");
            response.put("imageUrl", img1Url); 
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "상품 등록 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}