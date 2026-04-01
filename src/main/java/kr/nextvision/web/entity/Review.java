package kr.nextvision.web.entity;

import lombok.Data;
import java.time.LocalDateTime;

// 💡 스프링부트 버전에 따라 아래 import 문이 다를 수 있습니다.
// 만약 jakarta에서 빨간 줄이 난다면 jakarta를 javax로 바꿔주세요! (예: import javax.persistence.Entity;)
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Data // Getter, Setter, toString 등을 자동으로 만들어주는 마법의 어노테이션입니다.
@Entity // 이 클래스가 데이터베이스의 테이블과 1:1로 매칭되는 '엔티티'임을 선언합니다.
@Table(name = "tb_review") // 🌟 실제 MySQL에 있는 테이블 이름(tb_review)과 정확히 연결해 줍니다.
public class Review {

    @Id // 이 테이블의 기본키(PK - Primary Key)임을 나타냅니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT (자동 증가) 설정입니다.
    @Column(name = "rev_idx")
    private Integer revIdx;

    @Column(name = "p_idx")
    private Integer pIdx; // 상품 번호 (Controller에서 검색 조건으로 쓸 변수입니다)

    @Column(name = "user_idx")
    private Integer userIdx; // 리뷰 작성자 번호
    
    @Column(name = "user_name")
    private String userName;

    @Column(name = "rating")
    private Integer rating; // 별점 (1~5)

    // 🔥 파이썬 챗봇이 가장 애타게 찾고 있는 바로 그 내용 변수입니다!
    @Column(name = "rev_content")
    private String revContent; 

    @Column(name = "rev_img1")
    private String revImg1;

    @Column(name = "rev_img2")
    private String revImg2;

    @Column(name = "rev_img3")
    private String revImg3;

    @Column(name = "created_at")
    private LocalDateTime createdAt; // 작성 날짜
}