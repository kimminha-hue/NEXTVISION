package kr.nextvision.web.repository;

import kr.nextvision.web.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// JpaRepository<관리할 엔티티 클래스, 그 엔티티의 기본키(PK) 타입> 을 상속받습니다.
// 이렇게만 적어두면 Spring Data JPA가 알아서 findAll(), save(), findById() 같은 기본 SQL 쿼리 로직을 자동으로 만들어줍니다.
public interface ProductRepository extends JpaRepository<Product, Integer> {

}