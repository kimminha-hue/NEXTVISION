//////////////////////////////////////////////////////
// 🔐 일반 회원가입 — DB 연동
//////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const errorMessage = document.getElementById("error-message");

    // 8자 이상 + 영문 + 숫자 포함
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
        errorMessage.style.color = "red";
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
        errorMessage.style.color = "green";
    }

    function hideMessage() {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }

    function validatePasswordUI() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!password && !confirmPassword) {
            hideMessage();
            return;
        }

        if (password && password.length < 8) {
            showError("비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        if (password && !passwordRegex.test(password)) {
            showError("비밀번호는 영문과 숫자를 모두 포함해야 합니다. (예: abc12345)");
            return;
        }

        if (confirmPassword && password !== confirmPassword) {
            showError("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (password && confirmPassword && password === confirmPassword) {
            showSuccess("사용 가능한 비밀번호입니다.");
            return;
        }

        hideMessage();
    }

    passwordInput.addEventListener("input", validatePasswordUI);
    confirmPasswordInput.addEventListener("input", validatePasswordUI);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const role = document.getElementById("signup-role").value;

        if (!name || !username || !password || !confirmPassword) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        if (username.length < 4) {
            alert("아이디는 4자 이상 입력해주세요.");
            return;
        }

        if (password.length < 8) {
            showError("비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        if (!passwordRegex.test(password)) {
            showError("비밀번호는 영문과 숫자를 모두 포함해야 합니다. (예: abc12345)");
            return;
        }

        if (password !== confirmPassword) {
            showError("비밀번호가 일치하지 않습니다.");
            return;
        }

        hideMessage();

        try {
            const response = await fetch("/api/account/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    loginId: username,
                    password: password,
                    confirmPassword: confirmPassword,
                    name: name,
                    role: role
                })
            });

            const data = await response.json();
            console.log("회원가입 응답:", data);

            if (data.status === "success") {
                alert("회원가입이 완료되었습니다.");
                window.location.replace("login.html");
            } else {
                showError(data.message || "회원가입에 실패했습니다.");
            }

        } catch (err) {
            console.error(err);
            alert("서버 연결 오류가 발생했습니다.");
        }
    });
});

//////////////////////////////////////////////////////
// 🔵 구글 회원가입
//////////////////////////////////////////////////////
function googleLogin() {
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
// 🔥 구글 회원가입 콜백 처리
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
        const googlePassword = "google_" + email;

        // 회원가입
        await fetch("/api/account/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loginId: email,
                password: googlePassword,
                confirmPassword: googlePassword,
                name: name,
                role: "USER"
            })
        });

        // 로그인
        const loginRes = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loginId: email,
                password: googlePassword
            })
        });

        const loginData = await loginRes.json();
        console.log("구글 로그인 응답:", loginData);

        if (loginData.status === "success") {
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("loginUser", JSON.stringify(loginData.user));

            history.replaceState(null, "", window.location.pathname);

            alert(loginData.user.name + "님 환영합니다!");
            location.href = "index.html";
        } else {
            alert(loginData.message || "로그인 처리 중 오류가 발생했습니다.");
        }

    } catch (err) {
        console.error(err);
        alert("구글 회원가입 중 오류가 발생했습니다.");
    }
};