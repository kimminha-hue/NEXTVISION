package kr.nextvision.web.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.util.HtmlUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import kr.nextvision.web.entity.Account;
import kr.nextvision.web.repository.AccountRepository;

@Controller
public class DBController {

    @Autowired
    private AccountRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder; // BCrypt

    // 회원가입
    @PostMapping("/joinProcess")
    public String joinProcess(Account joinAcc) {

        // 1. 입력값 검증
        if (joinAcc.getPassword() == null || joinAcc.getPassword().length() < 8) {
            return "redirect:/join?error=password_too_short";
        }
        if (joinAcc.getLoginId() == null || joinAcc.getLoginId().length() < 4) {
            return "redirect:/join?error=loginid_too_short";
        }

        // 2. 아이디 중복 체크
        if (repository.findByLoginId(joinAcc.getLoginId()).isPresent()) {
            return "redirect:/join?error=duplicate_id";
        }

        // 3. XSS 방지 (입력값 escape)
        joinAcc.setLoginId(HtmlUtils.htmlEscape(joinAcc.getLoginId()));
        joinAcc.setName(HtmlUtils.htmlEscape(joinAcc.getName()));

        // 4. 비밀번호 암호화
        String encodedPw = passwordEncoder.encode(joinAcc.getPassword());
        joinAcc.setPassword(encodedPw);

        // 5. 기본 값 설정
        joinAcc.setRole("USER");
        joinAcc.setCreatedAt(LocalDateTime.now());

        // 6. 저장
        repository.save(joinAcc);

        return "redirect:/main";
    }

    // 로그인
    @PostMapping("/loginProcess")
    public String loginProcess(String loginId, String password,
                               HttpServletRequest request,
                               HttpSession session) {

        // 1. 사용자 조회
        Account loginAcc = repository.findByLoginId(loginId).orElse(null);

        // 2. 로그인 검증
        if (loginAcc == null || !passwordEncoder.matches(password, loginAcc.getPassword())) {
            System.out.println("로그인 실패: " + loginId); // 로그 기록
            return "redirect:/login?error=true";
        }

        // 3. 세션 고정 공격 방지 (중요)
        session.invalidate(); // 기존 세션 제거
        HttpSession newSession = request.getSession(true);

        // 4. 로그인 정보 저장
        newSession.setAttribute("loginAccount", loginAcc);

        return "redirect:/main";
    }
}
