package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Product;
import kr.nextvision.web.repository.ProductRepository;
import kr.nextvision.web.service.FileUploadService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
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

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerProduct(
            @RequestParam("img1") MultipartFile img1,
            @RequestParam(value = "img2", required = false) MultipartFile img2,
            @RequestParam(value = "img3", required = false) MultipartFile img3,
            @RequestParam(value = "img4", required = false) MultipartFile img4,
            @RequestParam("p_name") String pName,
            @RequestParam("p_category") String pCategory,
            @RequestParam("p_price") int pPrice,
            @RequestParam("p_desc") String pDesc
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            String img1Url = fileUploadService.uploadFile(img1, "products");

            Product product = new Product();
            product.setName(pName);
            product.setCategory(pCategory);
            product.setPrice(pPrice);
            product.setDescription(pDesc);
            product.setImg1(img1Url);

            product.setSellerIdx(1);
            product.setStock(100);
            product.setStatus("판매중");
            product.setCreatedAt(LocalDateTime.now());
            product.setUpdatedAt(LocalDateTime.now());

            if (img2 != null && !img2.isEmpty()) {
                String img2Url = fileUploadService.uploadFile(img2, "products");
                product.setImg2(img2Url);
            }

            if (img3 != null && !img3.isEmpty()) {
                String img3Url = fileUploadService.uploadFile(img3, "products");
                product.setImg3(img3Url);
            }

            if (img4 != null && !img4.isEmpty()) {
                String img4Url = fileUploadService.uploadFile(img4, "products");
                product.setImg4(img4Url);
            }

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

    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Integer id,
            @RequestParam(value = "img1", required = false) MultipartFile img1,
            @RequestParam(value = "img2", required = false) MultipartFile img2,
            @RequestParam(value = "img3", required = false) MultipartFile img3,
            @RequestParam(value = "img4", required = false) MultipartFile img4,
            @RequestParam(value = "p_name", required = false) String pName,
            @RequestParam(value = "p_category", required = false) String pCategory,
            @RequestParam(value = "p_price", required = false) Integer pPrice,
            @RequestParam(value = "p_desc", required = false) String pDesc
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new Exception("상품을 찾을 수 없습니다."));

            if (pName != null) product.setName(pName);
            if (pCategory != null) product.setCategory(pCategory);
            if (pPrice != null) product.setPrice(pPrice);
            if (pDesc != null) product.setDescription(pDesc);

            if (img1 != null && !img1.isEmpty()) {
                String img1Url = fileUploadService.uploadFile(img1, "products");
                product.setImg1(img1Url);
            }

            if (img2 != null && !img2.isEmpty()) {
                String img2Url = fileUploadService.uploadFile(img2, "products");
                product.setImg2(img2Url);
            }

            if (img3 != null && !img3.isEmpty()) {
                String img3Url = fileUploadService.uploadFile(img3, "products");
                product.setImg3(img3Url);
            }

            if (img4 != null && !img4.isEmpty()) {
                String img4Url = fileUploadService.uploadFile(img4, "products");
                product.setImg4(img4Url);
            }

            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);

            response.put("status", "success");
            response.put("message", "상품이 수정되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        try {
            productRepository.deleteById(id);
            response.put("status", "success");
            response.put("message", "상품이 삭제되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}