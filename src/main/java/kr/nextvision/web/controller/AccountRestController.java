package kr.nextvision.web.controller;

import kr.nextvision.web.entity.Account;
import kr.nextvision.web.repository.AccountRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
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

	private static final int MAX_LOGIN_FAIL = 5;
	private static final long LOCK_MINUTES = 10;

	@PostMapping("/signup")
	public ResponseEntity<Map<String, Object>> signup(@RequestBody Map<String, String> body) {
		Map<String, Object> response = new HashMap<>();

		try {
			String loginId = body.get("loginId");
			String password = body.get("password");
			String confirmPassword = body.get("confirmPassword");
			String name = body.get("name");
			String role = body.getOrDefault("role", "USER");

			if (isBlank(loginId) || isBlank(password) || isBlank(confirmPassword) || isBlank(name)) {
				response.put("status", "fail");
				response.put("message", "필수값이 누락되었습니다.");
				return ResponseEntity.ok(response);
			}

			if (loginId.trim().length() < 4) {
				response.put("status", "fail");
				response.put("message", "아이디는 4자 이상 입력해주세요.");
				return ResponseEntity.ok(response);
			}

			if (password.length() < 8) {
				response.put("status", "fail");
				response.put("message", "비밀번호는 8자 이상이어야 합니다.");
				return ResponseEntity.ok(response);
			}

			if (!password.matches("^(?=.*[A-Za-z])(?=.*\\d).+$")) {
				response.put("status", "fail");
				response.put("message", "비밀번호는 영문과 숫자를 모두 포함해야 합니다.");
				return ResponseEntity.ok(response);
			}

			if (!password.equals(confirmPassword)) {
				response.put("status", "fail");
				response.put("message", "비밀번호가 일치하지 않습니다.");
				return ResponseEntity.ok(response);
			}

			if (accountRepository.existsByLoginId(loginId.trim())) {
				response.put("status", "fail");
				response.put("message", "이미 존재하는 아이디입니다.");
				return ResponseEntity.ok(response);
			}

			Account account = new Account();
			account.setLoginId(loginId.trim());
			account.setPassword(passwordEncoder.encode(password));
			account.setName(name.trim());
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
			response.put("message", "회원가입 중 서버 오류가 발생했습니다.");
			return ResponseEntity.internalServerError().body(response);
		}
	}

	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
		Map<String, Object> response = new HashMap<>();

		try {
			String loginId = body.get("loginId");
			String password = body.get("password");

			if (isBlank(loginId) || isBlank(password)) {
				response.put("status", "fail");
				response.put("message", "아이디와 비밀번호를 입력해주세요.");
				return ResponseEntity.ok(response);
			}

			Account account = accountRepository.findByLoginId(loginId.trim());

			if (account == null) {
				response.put("status", "fail");
				response.put("message", "아이디 또는 비밀번호가 틀렸습니다.");
				return ResponseEntity.ok(response);
			}

			if (account.getLockUntil() != null && account.getLockUntil().isAfter(LocalDateTime.now())) {
				long remainMinutes = Duration.between(LocalDateTime.now(), account.getLockUntil()).toMinutes();
				long remainSeconds = Duration.between(LocalDateTime.now(), account.getLockUntil()).getSeconds() % 60;

				response.put("status", "fail");
				response.put("message", "계정이 잠겼습니다. " + remainMinutes + "분 " + remainSeconds + "초 후 다시 시도해주세요.");
				return ResponseEntity.ok(response);
			}

			boolean matched = passwordEncoder.matches(password, account.getPassword());

			if (!matched) {
				int failCount = account.getLoginFailCount() == null ? 0 : account.getLoginFailCount();
				failCount++;

				account.setLoginFailCount(failCount);

				if (failCount >= MAX_LOGIN_FAIL) {
					account.setLockUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
					accountRepository.save(account);

					response.put("status", "fail");
					response.put("message", "로그인 5회 실패로 계정이 10분간 잠겼습니다.");
					return ResponseEntity.ok(response);
				} else {
					accountRepository.save(account);

					response.put("status", "fail");
					response.put("message", "아이디 또는 비밀번호가 틀렸습니다. (" + failCount + "/" + MAX_LOGIN_FAIL + ")");
					return ResponseEntity.ok(response);
				}
			}

			account.setLoginFailCount(0);
			account.setLockUntil(null);
			accountRepository.save(account);

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
			response.put("message", "로그인 중 서버 오류가 발생했습니다.");
			return ResponseEntity.internalServerError().body(response);
		}
	}

	@PutMapping("/update/{userIdx}")
	public ResponseEntity<Map<String, Object>> update(@PathVariable Integer userIdx,
			@RequestBody Map<String, String> body) {
		Map<String, Object> response = new HashMap<>();

		try {
			Account account = accountRepository.findById(userIdx)
					.orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

			String name = body.get("name");
			String phone = body.get("phone");
			String address = body.get("address");

			String currentPassword = body.get("currentPassword");
			String newPassword = body.get("newPassword");
			String newPasswordConfirm = body.get("newPasswordConfirm");

			if (!isBlank(name)) {
				account.setName(name.trim());
			}
			if (phone != null) {
				account.setPhone(phone);
			}
			if (address != null) {
				account.setAddress(address);
			}

			boolean wantsPasswordChange = !isBlank(currentPassword) || !isBlank(newPassword)
					|| !isBlank(newPasswordConfirm);

			if (wantsPasswordChange) {
				if (isBlank(currentPassword)) {
					response.put("status", "fail");
					response.put("message", "현재 비밀번호를 입력해주세요.");
					return ResponseEntity.ok(response);
				}

				if (!passwordEncoder.matches(currentPassword, account.getPassword())) {
					response.put("status", "fail");
					response.put("message", "현재 비밀번호가 일치하지 않습니다.");
					return ResponseEntity.ok(response);
				}

				if (isBlank(newPassword) || isBlank(newPasswordConfirm)) {
					response.put("status", "fail");
					response.put("message", "새 비밀번호와 비밀번호 확인을 입력해주세요.");
					return ResponseEntity.ok(response);
				}

				if (newPassword.length() < 8) {
					response.put("status", "fail");
					response.put("message", "새 비밀번호는 8자 이상이어야 합니다.");
					return ResponseEntity.ok(response);
				}

				if (!newPassword.matches("^(?=.*[A-Za-z])(?=.*\\d).+$")) {
					response.put("status", "fail");
					response.put("message", "새 비밀번호는 영문과 숫자를 모두 포함해야 합니다.");
					return ResponseEntity.ok(response);
				}

				if (!newPassword.equals(newPasswordConfirm)) {
					response.put("status", "fail");
					response.put("message", "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
					return ResponseEntity.ok(response);
				}

				account.setPassword(passwordEncoder.encode(newPassword));
			}

			accountRepository.save(account);

			response.put("status", "success");
			response.put("message", "회원정보가 수정되었습니다.");
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace();
			response.put("status", "error");
			response.put("message", "회원정보 수정 중 서버 오류가 발생했습니다.");
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

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}