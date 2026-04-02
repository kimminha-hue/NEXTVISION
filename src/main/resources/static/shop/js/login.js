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

        if (data.status === "success") {
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
// 🟡 카카오 로그인
//////////////////////////////////////////////////////
function kakaoLogin() {
    window.Kakao.Auth.login({
        success: function(authObj) {

            fetch("http://localhost:8081/kakao/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access_token: authObj.access_token })
            })
            .then(res => res.json())
            .then(async data => {
                const email = data.email;

                const loginRes = await fetch("/api/account/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        loginId: email,
                        password: "kakao_" + email
                    })
                });

                const loginData = await loginRes.json();

                if (loginData.status === "success") {
                    localStorage.setItem("isLogin", "true");
                    localStorage.setItem("loginUser", JSON.stringify(loginData.user));
                    alert(loginData.user.name + "님 로그인 성공!");
                    window.location.href = "../index.html";
                } else {
                    alert("가입되지 않은 계정입니다.");
                }
            })
            .catch(() => alert("카카오 로그인 실패"));
        }
    });
}

//////////////////////////////////////////////////////
// 🔵 구글 로그인 처리
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

        if (loginData.status === "success") {
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(loginData.user));

            history.replaceState(null, "", window.location.pathname);

            alert(loginData.user.name + "님 로그인 성공!");
            window.location.href = "index.html";
        } else {
            alert("가입되지 않은 계정입니다.");
            window.location.href = "signup.html";
        }

    } catch (err) {
        console.error(err);
        alert("구글 로그인 오류");
    }
};