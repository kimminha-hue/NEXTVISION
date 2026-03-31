package kr.nextvision.web.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import kr.nextvision.web.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Integer> {

    Account findByLoginIdAndPassword(String loginId, String password);

    boolean existsByLoginId(String loginId);
    
    Account findByLoginId(String loginId);
}