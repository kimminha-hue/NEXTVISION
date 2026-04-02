//////////////////////////////////////////////////////
// 🔐 일반 회원가입 — DB 연동
//////////////////////////////////////////////////////
async function validateForm() {
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorMessage = document.getElementById("error-message");

    if (!name || !username || !password || !confirmPassword) {
        alert("모든 항목을 입력해주세요.");
        return false;
    }

    if (username.length < 4) {
        alert("아이디는 4자 이상 입력해주세요.");
        return false;
    }

    if (password.length < 6) {
        alert("비밀번호는 6자 이상 입력해주세요.");
        return false;
    }

    if (password !== confirmPassword) {
        errorMessage.style.display = "block";
        return false;
    }

    errorMessage.style.display = "none";

    try {
        const response = await fetch("/api/account/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loginId: username,
                password: password,
                name: name
            })
        });

        const data = await response.json();
        console.log("회원가입 응답:", data);

        if (data.success) {
            alert("회원가입 성공!");
            window.location.replace("login.html");
        } else {
            alert(data.message || "회원가입 실패");
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

        const signupRes = await fetch("/api/account/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loginId: email,
                password: "google_" + email,
                name: name
            })
        });

        const signupData = await signupRes.json();
        console.log("구글 회원가입 응답:", signupData);

        if (signupData.success) {
            alert("회원가입 완료!");
        } else {
            alert(signupData.message || "이미 가입된 계정입니다. 로그인됩니다!");
        }

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

            alert(loginData.name + "님 환영합니다!");
            location.href = "index.html";
        } else {
            alert(loginData.message || "로그인 처리 중 오류가 발생했습니다.");
        }

    } catch (err) {
        console.error(err);
        alert("구글 회원가입 중 오류가 발생했습니다.");
    }
};