package kr.nextvision.web.entity; // 본인 프로젝트의 실제 패키지 경로로 맞춰주세요.

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Product {

    @Id // 이 필드를 기본키(PK)로 지정합니다.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // MySQL의 AUTO_INCREMENT 속성을 사용해 번호를 1씩 자동 증가시킵니다.
    private Long id;

    @Column(nullable = false) // 필수 입력값 (NOT NULL)
    private String name; // 상품명

    private int price; // 상품 가격

    // AI 챗봇(RAG)의 성능을 결정지을 핵심 필드입니다.
    // 시각장애인 분들을 위해 색상, 재질, 촉감 등 텍스트가 매우 길어질 수 있으므로, 일반 String(Varchar)이 아닌 TEXT 타입으로 데이터베이스에 생성되도록 강제합니다.
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // 나중에 클라우드 Object Storage에 이미지를 올리고 나면, 그 이미지에 접근할 수 있는 URL 주소만 이곳에 저장합니다.
    private String imageUrl;
}