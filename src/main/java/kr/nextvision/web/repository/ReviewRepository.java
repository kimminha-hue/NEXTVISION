package kr.nextvision.web.repository;

import kr.nextvision.web.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    // 🔥 자바 문법 무시! 호성님의 DB 테이블(tb_review)과 컬럼(p_idx)을 직접 타격하는 무적의 네이티브 쿼리입니다.
    @Query(value = "SELECT * FROM tb_review WHERE p_idx = :pIdx", nativeQuery = true)
    List<Review> findByPIdx(@Param("pIdx") Integer pIdx); 
}