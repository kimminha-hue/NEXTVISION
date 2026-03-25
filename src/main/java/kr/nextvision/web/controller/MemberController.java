package kr.nextvision.web.controller;

import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import kr.nextvision.web.entity.Account;

@Controller
public class MemberController {

    // 모든 사용자 접근 가능
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

    // 로그인 필요
    @GetMapping("/update")
    public String goUpdate(HttpSession session) {
        Account loginAcc = (Account) session.getAttribute("loginAccount");
        if (loginAcc == null) {
            // 로그인 안 되어 있으면 로그인 페이지로 이동
            return "redirect:/login?error=need_login";
        }
        return "update";
    }

    // 관리자 권한 필요
    @GetMapping("/chart")
    public String goChart(HttpSession session) {
        Account loginAcc = (Account) session.getAttribute("loginAccount");
        if (loginAcc == null) {
            return "redirect:/login?error=need_login";
        }
        if (!"ADMIN".equals(loginAcc.getRole())) {
            // 일반 사용자는 접근 불가
            return "redirect:/main?error=no_permission";
        }
        return "chart";
    }
}
