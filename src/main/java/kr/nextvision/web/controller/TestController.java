package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Product;
import kr.nextvision.web.service.ProductSearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/test")
public class TestController {

    private final ProductSearchService productSearchService;

    public TestController(ProductSearchService productSearchService) {
        this.productSearchService = productSearchService;
    }

    @GetMapping("/search")
    public List<Product> testSearch(@RequestParam String q) {
        return productSearchService.searchByNaturalLanguage(q);
    }
}