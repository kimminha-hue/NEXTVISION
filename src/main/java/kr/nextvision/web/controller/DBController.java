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
    private PasswordEncoder passwordEncoder;

    // 회원가입
    @PostMapping("/joinProcess")
    public String joinProcess(Account joinAcc) {

        // 1. 입력값 검증
        if (joinAcc.getLoginId() == null || joinAcc.getLoginId().length() < 4) {
            return "redirect:/join?error=loginid_too_short";
        }

        if (joinAcc.getPassword() == null || joinAcc.getPassword().length() < 8) {
            return "redirect:/join?error=password_too_short";
        }

        // 2. 비밀번호 정책 (영문+숫자+특수문자)
        if (!joinAcc.getPassword().matches("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&]).{8,}$")) {
            return "redirect:/join?error=weak_password";
        }

        // 3. 아이디 중복 체크
        if (repository.findByLoginId(joinAcc.getLoginId()).isPresent()) {
            return "redirect:/join?error=duplicate_id";
        }

        // 4. XSS 방지
        joinAcc.setLoginId(HtmlUtils.htmlEscape(joinAcc.getLoginId()));
        joinAcc.setName(HtmlUtils.htmlEscape(joinAcc.getName()));

        // 5. 비밀번호 암호화
        String encodedPw = passwordEncoder.encode(joinAcc.getPassword());
        joinAcc.setPassword(encodedPw);

        // 6. 기본값 설정
        joinAcc.setRole("USER");
        joinAcc.setCreatedAt(LocalDateTime.now());
        joinAcc.setLoginFailCount(0);
        joinAcc.setLockUntil(null);

        // 7. 저장
        repository.save(joinAcc);

        return "redirect:/main";
    }

    // 로그인
    @PostMapping("/loginProcess")
    public String loginProcess(String loginId, String password,
                               HttpServletRequest request,
                               HttpSession session) {

        // 0. 입력값 검증
        if (loginId == null || loginId.trim().isEmpty()) {
            return "redirect:/login?error=invalid";
        }

        // 1. 사용자 조회
        Account loginAcc = repository.findByLoginId(loginId).orElse(null);

        // 2. 계정 잠금 체크
        if (loginAcc != null && loginAcc.getLockUntil() != null &&
            loginAcc.getLockUntil().isAfter(LocalDateTime.now())) {

            return "redirect:/login?error=locked";
        }

        // 3. 로그인 검증
        if (loginAcc == null || !passwordEncoder.matches(password, loginAcc.getPassword())) {

            if (loginAcc != null) {
                loginAcc.setLoginFailCount(loginAcc.getLoginFailCount() + 1);

                // 5회 실패 시 10분 잠금
                if (loginAcc.getLoginFailCount() >= 5) {
                    loginAcc.setLockUntil(LocalDateTime.now().plusMinutes(10));
                }

                repository.save(loginAcc);
            }

            System.out.println("로그인 실패: " + loginId);
            return "redirect:/login?error=true";
        }

        // 4. 로그인 성공 시 초기화
        loginAcc.setLoginFailCount(0);
        loginAcc.setLockUntil(null);
        repository.save(loginAcc);

        // 5. 세션 고정 공격 방지
        session.invalidate();
        HttpSession newSession = request.getSession(true);

        // 6. 세션 저장
        newSession.setAttribute("loginAccount", loginAcc);

        // 7. 세션 타임아웃 설정 (30분)
        newSession.setMaxInactiveInterval(1800);

        return "redirect:/main";
    }
}
