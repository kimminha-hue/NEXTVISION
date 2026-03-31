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
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_idx")
    private Integer id;

    @Column(name = "seller_idx", nullable = false)
    private Integer sellerIdx;

    @Column(name = "p_name", nullable = false)
    private String name;

    @Column(name = "p_category")
    private String category;

    @Column(name = "p_price")
    private Integer price;

    // RAG용 설명 텍스트
    @Column(name = "p_desc", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "p_stock", nullable = false)
    private Integer stock;

    @Column(name = "p_status", nullable = false)
    private String status = "COMMON";

    // 이미지들
    @Column(name = "img1")
    private String img1;

    @Column(name = "img2")
    private String img2;

    @Column(name = "img3")
    private String img3;

    // 👉 추가된 부분
    @Column(name = "img4")
    private String img4;

    // 생성일
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 👉 오타 수정 (updateAt → updatedAt)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}