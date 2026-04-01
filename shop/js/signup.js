//////////////////////////////////////////////////////
// 🔐 일반 회원가입 — DB 연동
//////////////////////////////////////////////////////
async function validateForm() {
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const role = document.getElementById("signup-role").value;
    const errorMessage = document.getElementById("error-message");

    // 1. 빈값 체크
    if (!name || !username || !password || !confirmPassword) {
        alert("모든 항목을 입력해주세요.");
        return false;
    }

    // 2. 아이디 길이 체크
    if (username.length < 4) {
        alert("아이디는 4자 이상 입력해주세요.");
        return false;
    }

    // 3. 비밀번호 길이 체크
    if (password.length < 6) {
        alert("비밀번호는 6자 이상 입력해주세요.");
        return false;
    }

    // 4. 비밀번호 확인
    if (password !== confirmPassword) {
        errorMessage.style.display = "block";
        return false;
    }
    errorMessage.style.display = "none";

    try {
        // ✅ localStorage 대신 DB API 호출
        const response = await fetch("/api/account/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: username,
                pw: password,
                name: name,
                role: role
            })
        });
        const data = await response.json();
        console.log("응답 데이터:", data);

        if (data.status === "success") {
            window.location.replace("login.html");
        } else {
        }

    } catch (err) {
        console.error(err);
        alert("서버 연결 오류가 발생했습니다.");
    }

    return false;
}

//////////////////////////////////////////////////////
// 🔵 구글 회원가입
//////////////////////////////////////////////////////
function googleLogin() {
    const role = document.getElementById("signup-role").value;
    localStorage.setItem("tempRole", role);

    const clientId = "622053074582-mul8bneofj0v5d7qsd8m4o3rullbp1sp.apps.googleusercontent.com";
    const redirectUri = "http://223.130.161.162/shop/html/signup.html";

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
// 🔥 구글 회원가입 콜백 처리 — DB 연동
//////////////////////////////////////////////////////
window.onload = async () => {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return;

    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    try {
        const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
            headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();

        const email = data.email;
        const name = data.name;
        const role = localStorage.getItem("tempRole") || "user";

        // ✅ DB API로 회원가입 시도
        const signupRes = await fetch("/api/account/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: email,
                pw: "google_" + email,  // ✅ 구글 계정 비밀번호 고정
                name: name,
                role: role
            })
        });
        const signupData = await signupRes.json();

        if (signupData.status === "success") {
            alert("회원가입 완료!");
        } else {
            // 이미 가입된 계정이면 로그인 처리
            alert("이미 가입된 계정입니다. 로그인됩니다!");
        }

        // ✅ 바로 로그인 처리
        const loginRes = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: email,
                pw: "google_" + email
            })
        });
        const loginData = await loginRes.json();

        if (loginData.status === "success") {
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(loginData.user));
            localStorage.removeItem("tempRole");

            // ✅ URL 해시 제거 (보안)
            history.replaceState(null, "", window.location.pathname);

            alert(loginData.user.name + "님 환영합니다!");
            location.href = "index.html";
        } else {
            alert("로그인 처리 중 오류가 발생했습니다.");
        }

    } catch (err) {
        console.error(err);
        alert("구글 회원가입 중 오류가 발생했습니다.");
    }
};