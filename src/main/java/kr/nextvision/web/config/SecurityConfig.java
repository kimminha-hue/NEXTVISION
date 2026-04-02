package kr.nextvision.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				// 지금 구조는 fetch + 커스텀 로그인 API라서 우선 비활성화
				.csrf(csrf -> csrf.disable())

				// 스프링 기본 로그인 페이지 끄기
				.formLogin(form -> form.disable())

				// 브라우저 기본 인증창 끄기
				.httpBasic(basic -> basic.disable())

				// 지금은 localStorage 기반이라 서버 세션 강제 사용 안 함
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

				.authorizeHttpRequests(auth -> auth
						// 정적 리소스
						.requestMatchers("/", "/index.html", "/html/**", "/css/**", "/js/**", "/images/**").permitAll()

						// 계정 관련 공개 API
						.requestMatchers("/api/account/signup", "/api/account/login").permitAll()

						// 소셜 로그인/콜백 있으면 공개
						.requestMatchers("/kakao/**", "/oauth2/**").permitAll()

						// 관리자 API 예시
						.requestMatchers("/api/admin/**").hasRole("ADMIN")

						// 나중에 보호할 API들
						.requestMatchers(HttpMethod.PUT, "/api/account/update/**").permitAll()
						.requestMatchers(HttpMethod.DELETE, "/api/account/delete/**").permitAll()

						.anyRequest().permitAll());

		return http.build();
	}
}