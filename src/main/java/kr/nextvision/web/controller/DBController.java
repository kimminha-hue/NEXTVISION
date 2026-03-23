package kr.nextvision.web.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.servlet.http.HttpSession;
import kr.nextvision.web.entity.Account;
import kr.nextvision.web.repository.AccountRepository;

@Controller
public class DBController {

    @Autowired
    private AccountRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder; // BCrypt 사용

    // 회원가입
    @PostMapping("/joinProcess")
    public String joinProcess(Account joinAcc) {

        // 1. 간단한 입력 검증
        if (joinAcc.getPassword() == null || joinAcc.getPassword().length() < 8) {
            return "redirect:/join?error=password_too_short";
        }
        if (joinAcc.getLoginId() == null || joinAcc.getLoginId().length() < 4) {
            return "redirect:/join?error=loginid_too_short";
        }

        // 2. 비밀번호 암호화
        String encodedPw = passwordEncoder.encode(joinAcc.getPassword());
        joinAcc.setPassword(encodedPw);

        // 3. 기본 필드 세팅
        joinAcc.setRole("USER");
        joinAcc.setCreatedAt(LocalDateTime.now());

        // 4. 저장
        repository.save(joinAcc);
        return "redirect:/main";
    }

    // 로그인
    @PostMapping("/loginProcess")
    public String loginProcess(String loginId, String password, HttpSession session) {

        // 1. 아이디로 사용자 조회
        Account loginAcc = repository.findByLoginId(loginId).orElse(null);

        // 2. 로그인 검증 (계정 존재 여부 + 비밀번호 matches)
        if (loginAcc == null || !passwordEncoder.matches(password, loginAcc.getPassword())) {
            return "redirect:/login?error=true";
        }

        // 3. 세션에 로그인 정보 저장
        session.setAttribute("loginAccount", loginAcc);
        return "redirect:/main";
    }
}
