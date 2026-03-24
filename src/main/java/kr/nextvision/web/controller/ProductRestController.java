package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Product;
import kr.nextvision.web.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController // 이 클래스가 화면(HTML)을 반환하는 게 아니라, 데이터(JSON)를 반환하는 API 컨트롤러임을 선언합니다.
@RequestMapping("/api/product") // 이 컨트롤러의 기본 URL 주소를 지정합니다.
@RequiredArgsConstructor // final이 붙은 객체(ProductRepository)를 자동으로 주입(생성)해 주는 롬복 어노테이션입니다.
@CrossOrigin(origins = "*") // 프론트엔드와 백엔드 서버 주소가 다를 때 발생하는 CORS 에러를 막아주는 아주 중요한 설정입니다.
public class ProductRestController {

    // Repository를 불러와 DB와 통신할 준비를 합니다.
    private final ProductRepository productRepository;

    // 프론트엔드에서 상품 전체 목록을 요청할 때 타게 될 메서드입니다.
    // 최종 접속 주소: /avw/api/product/list
    @GetMapping("/list")
    public List<Product> getProductList() {
        // DB에 저장된 모든 Product 데이터를 리스트 형태로 싹 긁어와서 프론트엔드로 전달합니다.
        return productRepository.findAll();
    }
}