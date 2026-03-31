package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Account;
import kr.nextvision.web.repository.AccountRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
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

    // ✅ 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(
            @RequestBody Map<String, String> body
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            String loginId = body.get("id");
            String password = body.get("pw");
            String name = body.get("name");
            String role = body.getOrDefault("role", "user");

            // ✅ 중복 아이디 체크
            if (accountRepository.existsByLoginId(loginId)) {
                response.put("status", "fail");
                response.put("message", "이미 존재하는 아이디입니다.");
                return ResponseEntity.ok(response);
            }

            Account account = new Account();
            account.setLoginId(loginId);
            account.setPassword(password);
            account.setName(name);
            account.setRole(role);
            account.setLoginFailCount(0);
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

    // ✅ 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            String loginId = body.get("id");
            String password = body.get("pw");

            Account account = accountRepository.findByLoginIdAndPassword(loginId, password);

            if (account == null) {
                response.put("status", "fail");
                response.put("message", "아이디 또는 비밀번호가 틀렸습니다.");
                return ResponseEntity.ok(response);
            }

            // ✅ 로그인 성공 시 정보 반환
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userIdx", account.getUserIdx());
            userInfo.put("id", account.getLoginId());
            userInfo.put("name", account.getName());
            userInfo.put("role", account.getRole());

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

    // ✅ 회원정보 수정
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
            if (body.get("pw") != null) account.setPassword(body.get("pw"));

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

    // ✅ 회원 탈퇴
    @DeleteMapping("/delete/{userIdx}")
    public ResponseEntity<Map<String, Object>> delete(
            @PathVariable Integer userIdx
    ) {
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
