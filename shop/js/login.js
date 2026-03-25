function handleLogin() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    // 입력값 검증
    if (!username || !password) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
    }

    // localStorage에서 회원가입 시 저장된 값 불러오기
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");

    // 아이디/비밀번호 비교
   if (username === savedUsername && password === savedPassword) {
    alert("로그인 되었습니다.");

    // 🔥 로그인 상태 저장
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("username", username);

    window.location.href = "index.html";
} else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
}


// 구글 로그인 콜백 함수
function onGoogleLogin(response) {
    console.log("구글 로그인 성공:", response.credential);

    fetch("http://localhost:8081/google/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id_token: response.credential
        })
    })
    .then(res => {
        if (res.ok) {
            alert("구글 로그인 성공!");
            window.location.href = "../index.html";
        } else {
            alert("구글 로그인 실패");
        }
    });
}
// 카카오 로그인 함수
function kakaoLogin() {
    window.Kakao.Auth.login({
        success: function(authObj) {
            console.log("카카오 로그인 성공", authObj);

            fetch("http://localhost:8081/kakao/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    access_token: authObj.access_token
                })
            })
            .then(res => {
                if (res.ok) {
                    alert("카카오 로그인 성공!");
                    window.location.href = "../index.html";
                } else {
                    alert("카카오 로그인 실패");
                }
            });
        },
        fail: function(err) {
            console.error(err);
        }
    });
}