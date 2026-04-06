function showLoginError(message) {
    const errorBox = document.getElementById("error-message");
    if (!errorBox) {
        alert(message);
        return;
    }
    errorBox.textContent = message;
    errorBox.style.display = "block";
}

function hideLoginError() {
    const errorBox = document.getElementById("error-message");
    if (errorBox) {
        errorBox.textContent = "";
        errorBox.style.display = "none";
    }
}

//////////////////////////////////////////////////////
// 🔐 일반 로그인
//////////////////////////////////////////////////////
async function handleLogin() {
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");

    if (!usernameInput || !passwordInput) {
        alert("로그인 입력창을 찾을 수 없습니다.");
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    hideLoginError();

    if (!username || !password) {
        showLoginError("아이디와 비밀번호를 입력해주세요.");
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
        console.log("login response:", data);

        if (data.status === "success") {
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(data.user));
            alert(data.user.name + "님 로그인 성공!");
            window.location.href = "index.html";
        } else {
            showLoginError(data.message || "로그인에 실패했습니다.");
        }
    } catch (err) {
        console.error("login error:", err);
        showLoginError("서버 연결 오류가 발생했습니다.");
    }
}

//////////////////////////////////////////////////////
// 🟡 카카오 로그인
//////////////////////////////////////////////////////
function kakaoLogin() {
    hideLoginError();

    if (!window.Kakao) {
        showLoginError("카카오 SDK가 로드되지 않았습니다.");
        return;
    }

    window.Kakao.Auth.login({
        success: function (authObj) {
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
                        window.location.href = "index.html";
                    } else {
                        showLoginError(loginData.message || "가입되지 않은 계정입니다.");
                    }
                })
                .catch((err) => {
                    console.error(err);
                    showLoginError("카카오 로그인 실패");
                });
        },
        fail: function (err) {
            console.error(err);
            showLoginError("카카오 로그인 실패");
        }
    });
}

//////////////////////////////////////////////////////
// 🔵 구글 로그인 버튼 클릭용
//////////////////////////////////////////////////////
function googleLogin() {
    hideLoginError();
    showLoginError("구글 로그인 기능 연결 상태를 확인해주세요.");
}

//////////////////////////////////////////////////////
// 🔵 구글 access_token 처리
//////////////////////////////////////////////////////
window.onload = async () => {
    hideLoginError();

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
            showLoginError(loginData.message || "가입되지 않은 계정입니다.");
            setTimeout(() => {
                window.location.href = "signup.html";
            }, 1500);
        }
    } catch (err) {
        console.error(err);
        showLoginError("구글 로그인 오류");
    }
};