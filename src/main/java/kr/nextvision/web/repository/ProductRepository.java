package kr.nextvision.web.repository;

import kr.nextvision.web.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByPIdxIn(List<Integer> ids);
}