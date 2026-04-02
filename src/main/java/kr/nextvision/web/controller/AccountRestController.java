package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Account;
import kr.nextvision.web.repository.AccountRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountRestController {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(
            @RequestBody Map<String, String> body
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            String loginId = body.get("loginId");
            String password = body.get("password");
            String name = body.get("name");
            String role = body.getOrDefault("role", "USER");

            if (loginId == null || loginId.trim().isEmpty()
                    || password == null || password.trim().isEmpty()
                    || name == null || name.trim().isEmpty()) {
                response.put("status", "fail");
                response.put("message", "필수값이 누락되었습니다.");
                return ResponseEntity.ok(response);
            }

            if (accountRepository.existsByLoginId(loginId)) {
                response.put("status", "fail");
                response.put("message", "이미 존재하는 아이디입니다.");
                return ResponseEntity.ok(response);
            }

            Account account = new Account();
            account.setLoginId(loginId);
            account.setPassword(passwordEncoder.encode(password));
            account.setName(name);
            account.setRole(role);
            account.setLoginFailCount(0);
            account.setLockUntil(null);
            account.setCreatedAt(LocalDateTime.now());

            accountRepository.save(account);

            response.put("status", "success");
            response.put("message", "회원가입이 완료되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body
    ) {
        System.out.println("🔥 로그인 API 진입");

        Map<String, Object> response = new HashMap<>();

        try {
            String loginId = body.get("loginId");
            String password = body.get("password");

            System.out.println("입력 loginId = [" + loginId + "]");
            System.out.println("입력 password = [" + password + "]");

            Account account = accountRepository.findByLoginId(loginId);

            System.out.println("account found = " + (account != null));

            if (account == null) {
                response.put("status", "fail");
                response.put("message", "아이디가 없습니다.");
                return ResponseEntity.ok(response);
            }

            System.out.println("DB id = [" + account.getLoginId() + "]");
            System.out.println("DB pw = [" + account.getPassword() + "]");
            System.out.println("DB pw length = " + account.getPassword().length());

            boolean matched = passwordEncoder.matches(password, account.getPassword());
            System.out.println("matches = " + matched);

            if (!matched) {
                response.put("status", "fail");
                response.put("message", "비밀번호가 틀렸습니다.");
                return ResponseEntity.ok(response);
            }

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userIdx", account.getUserIdx());
            userInfo.put("id", account.getLoginId());
            userInfo.put("name", account.getName());
            userInfo.put("role", account.getRole());
            userInfo.put("phone", account.getPhone());
            userInfo.put("address", account.getAddress());

            response.put("status", "success");
            response.put("message", "로그인 성공!");
            response.put("user", userInfo);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/update/{userIdx}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Integer userIdx,
            @RequestBody Map<String, String> body
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            Account account = accountRepository.findById(userIdx)
                    .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

            if (body.get("name") != null) account.setName(body.get("name"));
            if (body.get("password") != null && !body.get("password").trim().isEmpty()) {
                account.setPassword(passwordEncoder.encode(body.get("password")));
            }
            if (body.get("phone") != null) account.setPhone(body.get("phone"));
            if (body.get("address") != null) account.setAddress(body.get("address"));

            accountRepository.save(account);

            response.put("status", "success");
            response.put("message", "회원정보가 수정되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/delete/{userIdx}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Integer userIdx) {
        Map<String, Object> response = new HashMap<>();

        try {
            accountRepository.deleteById(userIdx);
            response.put("status", "success");
            response.put("message", "회원 탈퇴가 완료되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}