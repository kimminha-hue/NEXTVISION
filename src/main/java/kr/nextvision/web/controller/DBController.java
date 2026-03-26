package kr.nextvision.web.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.servlet.http.HttpSession;
import kr.nextvision.web.entity.Account;
import kr.nextvision.web.repository.AccountRepository;

@Controller
public class DBController {

    @Autowired
    private AccountRepository repository;

    @PostMapping("/joinProcess")
    public String joinProcess(Account joinAcc) {
        joinAcc.setRole("USER");
        joinAcc.setCreatedAt(LocalDateTime.now());
        repository.save(joinAcc);
        return "redirect:/main";
    }

    @PostMapping("/loginProcess")
    public String loginProcess(String loginId, String password, HttpSession session) {
        Account loginAcc = repository.findByLoginIdAndPassword(loginId, password);

        if (loginAcc == null) {
            return "redirect:/login?error=true";
        }

        session.setAttribute("loginAccount", loginAcc);
        return "redirect:/main";
    }
}