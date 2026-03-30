package kr.nextvision.web.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tb_product")
@Getter
@Setter
public class Product{
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "p_idx")
	// 💡 민하님의 백엔드 표준 세팅(Long)을 존중하면서, 충돌을 방지합니다.
	private Integer id;
	
	// 💡 호성님이 에러를 잡기 위해 추가한 필수 외래키 방어 코드입니다!
	@Column(name = "seller_idx", nullable = false)
	private Integer sellerIdx;
	
	@Column(name = "p_name", nullable = false)
	private String name; // DB의 p_name 연결
	
	@Column(name = "p_category")
    private String category; // DB의 p_category 연결

    @Column(name = "p_price")
    private Integer price; // DB의 p_price 연결

    // RAG 성능을 위한 긴 텍스트
    @Column(name = "p_desc", nullable = false ,columnDefinition = "TEXT")
    private String description; // DB의 p_desc 연결
    
    // 호성님이 추가한 재고량 방어 코드
    @Column(name = "p_stock", nullable = false)
    private Integer stock;
    
    // 호성님이 추가한 상태 방어 코드
    @Column(name = "p_status", nullable = false)
    private String status = "COMMON";
    
    // 팀원이 만들어둔 상세 이미지 컬럼 3개 연결
    @Column(name = "img1")
    private String img1; // 메인 썸네일 역할

    @Column(name = "img2")
    private String img2; // 상세 이미지 1

    @Column(name = "img3")
    private String img3; // 상세 이미지 2

    // 생성 일자 (업데이트 시 변경되지 않도록 updatable = false 옵션 유지)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // 호성님이 추가한 업데이트 일자
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updateAt;
	
}