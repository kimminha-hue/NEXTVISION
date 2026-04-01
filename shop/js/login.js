//////////////////////////////////////////////////////
// 🔐 일반 로그인
//////////////////////////////////////////////////////
async function handleLogin() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    // 입력값 검증
    if (!username || !password) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
    }

    try {
        // ✅ localStorage 대신 DB API 호출
        const response = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: username, pw: password })
        });

        const data = await response.json();

        if (data.status === "success") {
            // ✅ DB에서 받은 정보 localStorage에 저장
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(data.user));
            alert(data.user.name + "님 로그인 성공!");
            window.location.href = "index.html";
        } else {
            alert(data.message);
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
    window.Kakao.Auth.login({
        success: function(authObj) {
            console.log("카카오 로그인 성공", authObj);

            fetch("http://localhost:8081/kakao/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access_token: authObj.access_token })
            })
            .then(res => res.json())
            .then(async data => {
                const email = data.email;
                const name = data.name;

                // ✅ DB에서 카카오 계정 확인
                const loginRes = await fetch("/api/account/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: email, pw: "kakao_" + email })
                });
                const loginData = await loginRes.json();

                if (loginData.status === "success") {
                    localStorage.setItem("isLogin", "true");
                    localStorage.setItem("loginUser", JSON.stringify(loginData.user));
                    alert(loginData.user.name + "님 로그인 성공!");
                    window.location.href = "../index.html";
                } else {
                    alert("가입되지 않은 계정입니다. 회원가입을 먼저 해주세요.");
                }
            })
            .catch(() => alert("카카오 로그인 실패"));
        },
        fail: function(err) {
            console.error(err);
        }
    });
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
        const name = data.name;

        // ✅ DB에서 구글 계정 확인
        const loginRes = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: email, pw: "google_" + email })
        });
        const loginData = await loginRes.json();

        if (loginData.status === "success") {
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(loginData.user));

            // ✅ URL 해시 제거 (보안)
            history.replaceState(null, "", window.location.pathname);

            alert(loginData.user.name + "님 로그인 성공!");
            window.location.href = "index.html";
        } else {
            alert("가입되지 않은 계정입니다. 회원가입을 먼저 해주세요.");
            window.location.href = "signup.html";
        }

    } catch (err) {
        console.error(err);
        alert("구글 로그인 중 오류가 발생했습니다.");
    }
};