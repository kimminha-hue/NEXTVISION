package kr.nextvision.web.controller;

import org.springframework.stereotype.Controller;
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
    public String goUpdate() {
        return "update";
    }

    @GetMapping("/chart")
    public String goChart() {
        return "chart";
    }
}