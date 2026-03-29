function validateForm() {
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const role = document.getElementById("signup-role").value;
    const errorMessage = document.getElementById("error-message");

    // 🔥 1. 빈값 체크
    if (!name || !username || !password || !confirmPassword) {
        alert("모든 항목을 입력해주세요.");
        return false;
    }

    // 🔥 2. 비밀번호 체크
    if (password !== confirmPassword) {
        errorMessage.style.display = "block";
        return false;
    }

    errorMessage.style.display = "none";

    // 🔥 3. 중복 아이디 체크
    const existingUser = localStorage.getItem("user_" + username);
    if (existingUser) {
        alert("이미 존재하는 아이디입니다.");
        return false;
    }

    // 🔥 4. user 객체 생성
    const user = {
        name: name,
        username: username,
        password: password,
        role: role
    };

    // 🔥 5. 저장 (핵심 구조)
    localStorage.setItem("user_" + username, JSON.stringify(user));

    alert("회원가입이 완료되었습니다!");

    // 👉 로그인 페이지 이동
    window.location.href = "login.html";

    return false;
}

//////////////////////////////////////////////////////
// 🔵 구글 회원가입 시작
//////////////////////////////////////////////////////
function googleLogin() {

    const role = document.getElementById("signup-role").value;
    localStorage.setItem("tempRole", role); // ⭐ role 임시 저장

    const clientId = "622053074582-mul8bneofj0v5d7qsd8m4o3rullbp1sp.apps.googleusercontent.com";

    const redirectUri = "http://127.0.0.1:5500/shop/html/signup.html";

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "token",
        scope: "profile email",
        prompt: "select_account"
    });

    window.location.href =
        "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}

//////////////////////////////////////////////////////
// 🔥 구글 회원가입 / 로그인 처리
//////////////////////////////////////////////////////
window.onload = () => {

    const hash = window.location.hash;

    if (hash.includes("access_token")) {

        const token = new URLSearchParams(hash.substring(1)).get("access_token");

        fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => res.json())
        .then(data => {

            const email = data.email;
            const name = data.name;

            // 🔥 role 가져오기
            const role = localStorage.getItem("tempRole") || "user";

            // 🔥 기존 회원 확인
            let savedUser = localStorage.getItem("user_" + email);

            let user;

            if (savedUser) {
                // 👉 기존 회원
                user = JSON.parse(savedUser);
                alert("이미 가입된 계정입니다. 로그인됩니다!");
            } else {
                // 👉 신규 회원가입
                user = {
                    name: name,
                    username: email,
                    password: null,
                    role: role
                };

                localStorage.setItem("user_" + email, JSON.stringify(user));
                alert("회원가입 완료!");
            }

            // 🔥 로그인 상태 저장
            localStorage.setItem("loginUser", JSON.stringify(user));
            localStorage.setItem("isLogin", "true");

            // 🔥 임시 role 제거
            localStorage.removeItem("tempRole");

            alert(user.name + "님 환영합니다!");

            location.href = "index.html";
        });
    }
};