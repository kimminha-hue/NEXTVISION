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

@RestController // 이 클래스가 화면(HTML)을 반환하는 게 아니라, 데이터(JSON)를 반환하는 API 컨트롤러임을 선언합니다.
@RequestMapping("/api/product") // 이 컨트롤러의 기본 URL 주소를 지정합니다.
@RequiredArgsConstructor // final이 붙은 객체들을 자동으로 주입(생성)해 주는 롬복 어노테이션입니다.
@CrossOrigin(origins = "*") // 프론트엔드와 백엔드 서버 주소가 다를 때 발생하는 CORS 에러를 막아주는 아주 중요한 설정입니다.
public class ProductRestController {

    // Repository를 불러와 DB와 통신할 준비를 합니다.
    private final ProductRepository productRepository;
    
    // FileUploadService를 주입받아 파일 업로드를 처리합니다.
    private final FileUploadService fileUploadService;

    // 프론트엔드에서 상품 전체 목록을 요청할 때 타게 될 메서드입니다.
    @GetMapping("/list")
    public List<Product> getProductList() {
        // DB에 저장된 모든 Product 데이터를 리스트 형태로 긁어와서 프론트엔드로 전달합니다.
        return productRepository.findAll();
    }
    
    /**
     * [관리자용] 새로운 상품 정보와 이미지를 등록하는 API
     * @param img1 프론트엔드에서 넘어온 메인 썸네일 이미지 파일
     * @param img2 상세 이미지 1 (선택)
     * @param img3 상세 이미지 2 (선택)
     * @param img4 상세 이미지 3 (선택)
     * @param pName 상품명
     * @param pCategory 카테고리
     * @param pPrice 가격
     * @param pDesc 상세 설명 (RAG용)
     * @param sellerIdx 프론트엔드에서 넘어온 판매자 고유 번호
     * @return 성공 여부 및 업로드된 이미지 URL 반환
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerProduct(
            @RequestParam("img1") MultipartFile img1,
            @RequestParam(value = "img2", required = false) MultipartFile img2,
            @RequestParam(value = "img3", required = false) MultipartFile img3,
            @RequestParam(value = "img4", required = false) MultipartFile img4,
            @RequestParam("p_name") String pName,
            @RequestParam("p_category") String pCategory,
            @RequestParam("p_price") int pPrice,
            @RequestParam("p_desc") String pDesc,
            // 🚨 호성님이 추가한 핵심 수정: 프론트가 던진 seller_idx를 파라미터로 받습니다!
            @RequestParam("seller_idx") Integer sellerIdx 
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            // 1. 1번 이미지(필수) 업로드
            String img1Url = fileUploadService.uploadFile(img1, "products");
            
            Product product = new Product();
            
            // 프론트에서 넘어온 파라미터 세팅
            product.setName(pName);       
            product.setCategory(pCategory); 
            product.setPrice(pPrice);
            product.setDescription(pDesc);
            product.setImg1(img1Url); 
            
            // 🚨 핵심 수정: 하드코딩된 값을 지우고, 프론트에서 받은 sellerIdx를 엔티티에 세팅합니다.
            product.setSellerIdx(sellerIdx); 
            
            // 상태 및 재고량 기본값 세팅 (중복 로직 하나로 통합)
            product.setStock(100);
            product.setStatus("판매중");
            
            // 날짜 세팅 (엔티티 수정본에 맞춰 updatedAt으로 통일)
            product.setCreatedAt(java.time.LocalDateTime.now());
            product.setUpdatedAt(java.time.LocalDateTime.now());

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
            
            // 4. 4번 이미지(선택)가 들어왔다면 업로드 후 세팅
            if (img4 != null && !img4.isEmpty()) {
                String img4Url = fileUploadService.uploadFile(img4, "products");
                product.setImg4(img4Url);
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