package kr.nextvision.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpSession;
import kr.nextvision.web.entity.Account;

@Controller
public class MemberController {

	@GetMapping("/update")
	public String goUpdate(HttpSession session, org.springframework.ui.Model model) {
		Account loginAcc = (Account) session.getAttribute("loginAccount");

		if (loginAcc == null) {
			return "redirect:/login?error=need_login";
		}

		model.addAttribute("account", loginAcc);
		return "update";
	}

	@GetMapping("/logout")
	public String logout(HttpSession session) {
		session.invalidate();
		return "redirect:/main";
	}
}
