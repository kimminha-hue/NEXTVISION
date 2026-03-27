package kr.nextvision.web.controller;

import jakarta.servlet.http.HttpSession;
import kr.nextvision.web.entity.Account;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MemberController {

    @GetMapping("/main")
    public String goMain() {
        return "main";
    }

    @GetMapping("/login")
    public String goLogin() {
        return "login";
    }

    @GetMapping("/join")
    public String goJoin() {
        return "join";
    }

    @GetMapping("/update")
    public String goUpdate(HttpSession session, Model model) {
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