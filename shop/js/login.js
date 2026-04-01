//////////////////////////////////////////////////////
// 🔐 일반 로그인
//////////////////////////////////////////////////////
async function handleLogin() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
    }

    try {
        const response = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loginId: username,
                password: password
            })
        });

        const data = await response.json();
        console.log("로그인 응답:", data);

        if (data.success) {
            const loginUser = {
                userIdx: data.userIdx,
                id: data.loginId,
                loginId: data.loginId,
                name: data.name,
                role: data.role
            };

            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(loginUser));

            alert(`${data.name}님 로그인 성공!`);
            window.location.href = "index.html";
        } else {
            alert(data.message || "로그인 실패");
        }

    } catch (err) {
        console.error(err);
        alert("서버 연결 오류가 발생했습니다.");
    }
}

//////////////////////////////////////////////////////
// 🔵 구글 로그인
//////////////////////////////////////////////////////
function googleLogin() {
    const clientId = "622053074582-mul8bneofj0v5d7qsd8m4o3rullbp1sp.apps.googleusercontent.com";
    const redirectUri = "http://223.130.161.162/shop/html/login.html";

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
// 🟡 카카오 로그인
//////////////////////////////////////////////////////
function kakaoLogin() {
    alert("카카오 로그인은 아직 배포용 백엔드 연동이 필요합니다.");
}

//////////////////////////////////////////////////////
// 🔥 구글 로그인 처리
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

        const loginRes = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loginId: email,
                password: "google_" + email
            })
        });

        const loginData = await loginRes.json();
        console.log("구글 로그인 응답:", loginData);

        if (loginData.success) {
            const loginUser = {
                userIdx: loginData.userIdx,
                id: loginData.loginId,
                loginId: loginData.loginId,
                name: loginData.name,
                role: loginData.role
            };

            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(loginUser));

            history.replaceState(null, "", window.location.pathname);

            alert(loginData.name + "님 로그인 성공!");
            window.location.href = "index.html";
        } else {
            alert(loginData.message || "가입되지 않은 계정입니다. 회원가입을 먼저 해주세요.");
            history.replaceState(null, "", window.location.pathname);
            window.location.href = "signup.html";
        }

    } catch (err) {
        console.error(err);
        alert("구글 로그인 중 오류가 발생했습니다.");
    }
};