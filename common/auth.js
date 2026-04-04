document.addEventListener("DOMContentLoaded", () => {
    // 1. 로그인 상태 확인
    const isLogin = localStorage.getItem("isLogin");
    const userData = localStorage.getItem("loginUser");

    // 로그인 정보가 없으면 아무 작업도 하지 않음
    if (isLogin !== "true" || !userData) return;

    try {
        const user = JSON.parse(userData);
        const nav = document.querySelector(".nav-links");

        // 메뉴를 추가할 nav 요소가 없으면 중단
        if (!nav) {
            console.error("내비게이션(.nav-links) 요소를 찾을 수 없습니다.");
            return;
        }

        // 2. 기존 [로그인], [회원가입] 버튼 숨기기
        // href에 login이나 signup이 포함된 링크의 부모(li)를 찾아 숨깁니다.
        const loginBtn = document.querySelector('a[href*="login.html"]')?.parentElement;
        const signupBtn = document.querySelector('a[href*="signup.html"]')?.parentElement;

        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";

        // 3. 새 메뉴 생성 (안전하게 함수화)
        const createLi = (htmlContent) => {
            const li = document.createElement("li");
            li.innerHTML = htmlContent;
            return li;
        };

        // 4. 관리자 전용 메뉴 추가
        if (user.role === "admin") {
            nav.append(createLi(`<a href="admin_test.html">🛠 상품등록</a>`));
            nav.append(createLi(`<a href="admin_products.html">📦 상품관리</a>`));
        }

        // 5. 일반 사용자 메뉴 추가 (유저명, 마이페이지, 장바구니, 로그아웃)
        const userLi = createLi(`<span style="font-weight:bold; color:#ffcc00;">${user.name}님</span>`);
        const mypageLi = createLi(`<a href="mypage.html">👤 마이페이지</a>`);
        const cartLi = createLi(`<a href="cart.html">🛒 장바구니</a>`); // 누락되었던 장바구니 추가
        const logoutLi = createLi(`<a href="#" id="logout-btn">로그아웃</a>`);

        nav.append(userLi);
        nav.append(mypageLi);
        nav.append(cartLi);
        nav.append(logoutLi);

        // 6. 동적 메뉴 추가 후 밑줄 갱신 함수 호출
        if (typeof window.updateActiveNav === "function") {
            window.updateActiveNav();
        }

        // 7. 로그아웃 이벤트 바인딩
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault(); // 링크 기본 동작 방지
                localStorage.removeItem("isLogin");
                localStorage.removeItem("loginUser");
                alert("로그아웃 되었습니다.");
                window.location.href = "index.html"; // 메인으로 이동
            });
        }

    } catch (error) {
        console.error("로그인 정보 처리 중 오류 발생:", error);
    }
});