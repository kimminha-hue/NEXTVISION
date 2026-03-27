package kr.nextvision.web.service;

import kr.nextvision.web.dto.QueryResponse;
import kr.nextvision.web.entity.Product;
import kr.nextvision.web.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductSearchService {

    private final PythonApiService pythonApiService;
    private final ProductRepository productRepository;

    public ProductSearchService(PythonApiService pythonApiService, ProductRepository productRepository) {
        this.pythonApiService = pythonApiService;
        this.productRepository = productRepository;
    }

    public List<Product> searchByNaturalLanguage(String question) {
        QueryResponse response = pythonApiService.queryProducts(question);

        if (response == null || response.getProduct_ids() == null || response.getProduct_ids().isEmpty()) {
            return new ArrayList<>();
        }

        List<Integer> ids = response.getProduct_ids().stream()
                .map(Integer::valueOf)
                .toList();

        return productRepository.findByPIdxIn(ids);
    }
}