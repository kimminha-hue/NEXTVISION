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

// =========================
// 🔥 구글 로그인 성공 처리
// =========================

window.onload = () => {

  const hash = window.location.hash;

  // 👉 access_token 있으면 = 구글 로그인 성공
  if(hash.includes("access_token")){

    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    // 👉 구글 사용자 정보 가져오기
    fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(res => res.json())
    .then(data => {

      const email = data.email;
      const name = data.name;

      // 👉 로그인 상태 저장
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("username", name);

      alert(name + "님 로그인 성공!");

      // 👉 메인으로 이동
      window.location.href = "../html/index.html";
    });

  }
};