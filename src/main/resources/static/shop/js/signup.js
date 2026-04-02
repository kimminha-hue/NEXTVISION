document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", validateForm);
    }

    handleGoogleSignupCallback();
});

//////////////////////////////////////////////////////
// 🔐 일반 회원가입 — DB 연동
//////////////////////////////////////////////////////
async function validateForm(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const role = document.getElementById("signup-role").value;
    const errorMessage = document.getElementById("error-message");

    if (!name || !username || !password || !confirmPassword) {
        alert("모든 항목을 입력해주세요.");
        return;
    }

    if (username.length < 4) {
        alert("아이디는 4자 이상 입력해주세요.");
        return;
    }

    if (password.length < 8) {
        alert("비밀번호는 8자 이상 입력해주세요.");
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.style.display = "block";
        return;
    }

    errorMessage.style.display = "none";

    try {
        const response = await fetch("/api/account/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                loginId: username,
                password: password,
                name: name,
                role: role
            })
        });

        const data = await response.json();
        console.log("회원가입 응답:", data);

        if (data.status === "success") {
            alert("회원가입이 완료되었습니다.");
            window.location.href = "login.html";
        } else {
            alert(data.message || "회원가입에 실패했습니다.");
        }
    } catch (err) {
        console.error("회원가입 오류:", err);
        alert("서버 연결 오류가 발생했습니다.");
    }
}

//////////////////////////////////////////////////////
// 🔵 구글 회원가입
//////////////////////////////////////////////////////
function googleLogin() {
    const role = document.getElementById("signup-role").value;
    localStorage.setItem("tempRole", role);

    const clientId = "622053074582-mul8bneofj0v5d7qsd8m4o3rullbp1sp.apps.googleusercontent.com";
    const redirectUri = window.location.origin + "/audiview/signup.html";

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
async function handleGoogleSignupCallback() {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return;

    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    try {
        const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

        const email = data.email;
        const name = data.name;
        const role = localStorage.getItem("tempRole") || "USER";
        const socialPassword = "google_" + email;

        const signupRes = await fetch("/api/account/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                loginId: email,
                password: socialPassword,
                name: name,
                role: role
            })
        });

        const signupData = await signupRes.json();
        console.log("구글 회원가입 응답:", signupData);

        const loginRes = await fetch("/api/account/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                loginId: email,
                password: socialPassword
            })
        });

        const loginData = await loginRes.json();
        console.log("구글 로그인 응답:", loginData);

        if (loginData.status === "success") {
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(loginData.user));
            localStorage.removeItem("tempRole");

            history.replaceState(null, "", window.location.pathname);

            alert((loginData.user?.name || name) + "님 환영합니다!");
            window.location.href = "index.html";
        } else {
            alert(loginData.message || "로그인 처리 중 오류가 발생했습니다.");
        }
    } catch (err) {
        console.error("구글 회원가입 오류:", err);
        alert("구글 회원가입 중 오류가 발생했습니다.");
    }
}