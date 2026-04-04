package kr.nextvision.web.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tb_account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_idx")
    private Integer userIdx;

    @Column(name = "id", nullable = false, length = 50)
    private String loginId;

    @Column(name = "pw", nullable = false, length = 255)
    private String password;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "role", nullable = false, length = 30)
    private String role;

    @Column(name = "login_fail_count")
    private Integer loginFailCount = 0;

    @Column(name = "lock_until")
    private LocalDateTime lockUntil;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;
    
    @Column(name = "postcode")
    private String postcode;
    
    @Column(name = "detail_address")
    private String detailAddress;
}