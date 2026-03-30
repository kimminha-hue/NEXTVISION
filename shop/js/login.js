//////////////////////////////////////////////////////
// 🔐 일반 로그인
//////////////////////////////////////////////////////
function handleLogin() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    // 입력값 검증
    if (!username || !password) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
    }

    // user_아이디로 가져오기
    const savedUser = localStorage.getItem("user_" + username);

    if (!savedUser) {
        alert("존재하지 않는 계정입니다.");
        return;
    }

    let user = JSON.parse(savedUser);

    // 🔥 비밀번호 비교
    if (user.password !== password) {
        alert("비밀번호가 틀렸습니다.");
        return;
    }

    // 🔥 name 없을 경우 보정 (⭐ 핵심)
    if (!user.name) {
        user.name = user.username || username;
    }

    // 🔥 로그인 성공
    alert("로그인 되었습니다.");

    localStorage.setItem("isLogin", "true");
    localStorage.setItem("loginUser", JSON.stringify(user));

    window.location.href = "index.html";
}

//////////////////////////////////////////////////////
// 🔵 구글 로그인
//////////////////////////////////////////////////////
function googleLogin() {
    const clientId = "622053074582-mul8bneofj0v5d7qsd8m4o3rullbp1sp.apps.googleusercontent.com";

    const redirectUri = "http://127.0.0.1:5500/shop/html/login.html";

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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    access_token: authObj.access_token
                })
            })
            .then(res => res.json())
            .then(data => {

                const email = data.email;
                const name = data.name;

                let savedUser = localStorage.getItem("user_" + email);
                let user;

                if (savedUser) {
                    user = JSON.parse(savedUser);
                } else {
                    // 자동 회원가입
                    user = {
                        name: name,
                        username: email,
                        password: null,
                        role: "user"
                    };

                    localStorage.setItem("user_" + email, JSON.stringify(user));
                }

                // 🔥 name 보정
                if (!user.name) {
                    user.name = name || email;
                }

                localStorage.setItem("loginUser", JSON.stringify(user));
                localStorage.setItem("isLogin", "true");

                alert(user.name + "님 로그인 성공!");
                window.location.href = "../index.html";
            })
            .catch(() => {
                alert("카카오 로그인 실패");
            });
        },
        fail: function(err) {
            console.error(err);
        }
    });
}

//////////////////////////////////////////////////////
// 🔥 구글 로그인 처리
//////////////////////////////////////////////////////
window.onload = () => {

    const hash = window.location.hash;

    if(hash.includes("access_token")){

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

            let savedUser = localStorage.getItem("user_" + email);
            let user;

            if (savedUser) {
                user = JSON.parse(savedUser);
            } else {
                alert("가입되지 않은 계정입니다. 회원가입을 먼저 해주세요.");
                return;
            }

            // 🔥 name 보정
            if (!user.name) {
                user.name = name || email;
            }

            localStorage.setItem("loginUser", JSON.stringify(user));
            localStorage.setItem("isLogin", "true");

            alert(user.name + "님 로그인 성공!");

            window.location.href = "../html/index.html";
        });
    }
};