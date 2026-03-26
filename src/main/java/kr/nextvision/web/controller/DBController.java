package kr.nextvision.web.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import kr.nextvision.web.entity.Account;
import kr.nextvision.web.repository.AccountRepository;

@Controller
public class DBController {

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private AccountRepository repository;

	@PostMapping("/joinProcess")
	public String joinProcess(Account joinAcc) {

		if (joinAcc.getLoginId() == null || joinAcc.getPassword() == null || joinAcc.getName() == null) {
			return "redirect:/join?error=invalid";
		}

		if (joinAcc.getLoginId().trim().isEmpty()) {
			return "redirect:/join?idError=empty";
		}

		if (joinAcc.getName().trim().isEmpty()) {
			return "redirect:/join?nameError=empty";
		}

		String pw = joinAcc.getPassword();

		if (pw.trim().isEmpty()) {
			return "redirect:/join?pwError=empty";
		}

		if (pw.length() < 8) {
			return "redirect:/join?pwError=length";
		}

		if (!pw.matches("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!@#$%^&*()_+=-]{8,}$")) {
			return "redirect:/join?pwError=format";
		}

		Account existAcc = repository.findByLoginId(joinAcc.getLoginId());
		if (existAcc != null) {
			return "redirect:/join?duplicate=true";
		}

		joinAcc.setPassword(passwordEncoder.encode(pw));
		joinAcc.setRole("USER");
		joinAcc.setLoginFailCount(0);
		joinAcc.setLockUntil(null);

		repository.save(joinAcc);
		return "redirect:/main";
	}

	@PostMapping("/loginProcess")
	public String loginProcess(String loginId, String password, HttpSession session, HttpServletRequest request) {

		if (loginId == null || loginId.trim().isEmpty()) {
			return "redirect:/login?idError=empty";
		}

		if (password == null || password.trim().isEmpty()) {
			return "redirect:/login?pwError=empty&loginId=" + loginId;
		}

		loginId = loginId.trim();

		Account loginAcc = repository.findByLoginId(loginId);

		if (loginAcc == null) {
			return "redirect:/login?error=true&loginId=" + loginId;
		}

		if (loginAcc.getLockUntil() != null && LocalDateTime.now().isBefore(loginAcc.getLockUntil())) {
			return "redirect:/login?locked=true&loginId=" + loginId;
		}

		if (loginAcc.getLockUntil() != null && !LocalDateTime.now().isBefore(loginAcc.getLockUntil())) {
			loginAcc.setLoginFailCount(0);
			loginAcc.setLockUntil(null);
			repository.save(loginAcc);
		}

		if (!passwordEncoder.matches(password, loginAcc.getPassword())) {
			int failCount = loginAcc.getLoginFailCount() + 1;
			loginAcc.setLoginFailCount(failCount);

			if (failCount >= 5) {
				loginAcc.setLockUntil(LocalDateTime.now().plusMinutes(10));
				repository.save(loginAcc);
				return "redirect:/login?locked=true&loginId=" + loginId;
			}

			repository.save(loginAcc);
			return "redirect:/login?error=true&loginId=" + loginId;
		}

		loginAcc.setLoginFailCount(0);
		loginAcc.setLockUntil(null);
		repository.save(loginAcc);

		session.invalidate();
		HttpSession newSession = request.getSession(true);
		newSession.setAttribute("loginAccount", loginAcc);
		newSession.setMaxInactiveInterval(1800);

		return "redirect:/main";
	}

	@PostMapping("/updateProcess")
	public String updateProcess(String name, String currentPassword, String newPassword, String newPasswordConfirm,
			HttpSession session) {

		Account loginAcc = (Account) session.getAttribute("loginAccount");

		if (loginAcc == null) {
			return "redirect:/login?error=need_login";
		}

		Account acc = repository.findById(loginAcc.getUserIdx()).orElse(null);
		if (acc == null) {
			return "redirect:/main";
		}

		if (name == null || name.trim().isEmpty()) {
			return "redirect:/update?error=invalid";
		}

		acc.setName(name.trim());

		boolean wantsPasswordChange = newPassword != null && !newPassword.trim().isEmpty();

		if (wantsPasswordChange) {
			if (currentPassword == null || currentPassword.trim().isEmpty()) {
				return "redirect:/update?pwError=current";
			}

			if (!passwordEncoder.matches(currentPassword, acc.getPassword())) {
				return "redirect:/update?pwError=current";
			}

			if (newPassword.length() < 8) {
				return "redirect:/update?pwError=length";
			}

			if (!newPassword.matches("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!@#$%^&*()_+=-]{8,}$")) {
				return "redirect:/update?pwError=format";
			}

			if (newPasswordConfirm == null || !newPassword.equals(newPasswordConfirm)) {
				return "redirect:/update?pwError=confirm";
			}

			acc.setPassword(passwordEncoder.encode(newPassword));
		}

		repository.save(acc);
		session.setAttribute("loginAccount", acc);

		return "redirect:/main";
	}
}
